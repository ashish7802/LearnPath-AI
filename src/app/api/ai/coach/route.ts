import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getTopicById } from '@/lib/curriculum';
import {
  buildCoachSystemPrompt,
  getDeterministicCoachResponse,
  CoachRequest
} from '@/lib/ai-coach';
import { aiCoachSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('lp_session')?.value;
    let userId: string | null = null;
    let preferredLanguage: 'english' | 'hindi' | 'hinglish' = 'english';
    let experienceLevel = 'absolute-zero';
    let mathComfort = 'basic';

    if (token) {
      const session = await verifySessionToken(token);
      if (session) {
        userId = session.id;
        const profile = await prisma.userProfile.findUnique({ where: { userId: session.id } });
        if (profile) {
          preferredLanguage = (profile.preferredLanguage as any) || 'english';
          experienceLevel = profile.experienceLevel;
          mathComfort = profile.mathComfort;
        }
      }
    }

    // Rate limiting per user / IP
    const rateLimitKey = userId ? `coach_${userId}` : `coach_${req.headers.get('x-forwarded-for') || '127.0.0.1'}`;
    const rateCheck = checkRateLimit(rateLimitKey, 15, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `You are sending queries too quickly. Please pause for ${rateCheck.resetInSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

    const validation = aiCoachSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { topicId, userQuery, language, hintLevel } = validation.data;
    const finalLanguage = language || preferredLanguage;

    // Ground coach in verified curriculum topic
    const topic = topicId ? getTopicById(topicId) : undefined;
    const coachReq: CoachRequest = {
      topicTitle: topic ? topic.title : undefined,
      language: finalLanguage,
      experienceLevel,
      mathComfort,
      userQuery,
      hintLevel
    };

    let replyText = '';
    let responseSource: 'live_model' | 'curriculum_grounded_fallback' = 'curriculum_grounded_fallback';
    const configuredModel = process.env.AI_COACH_MODEL || 'gemini-1.5-flash';
    const apiKey = process.env.AI_COACH_API_KEY;

    if (apiKey && apiKey.trim() !== '') {
      try {
        const sysPrompt = buildCoachSystemPrompt({
          topicTitle: topic?.title,
          language: finalLanguage,
          experienceLevel,
          mathComfort,
        });

        // Fetch recent conversation history (capped at last 4 messages to preserve context window)
        let conversationContext = '';
        if (userId) {
          const recentMessages = await prisma.aiCoachMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 4
          });
          conversationContext = recentMessages
            .reverse()
            .map((m) => `${m.role === 'user' ? 'Learner' : 'Coach'}: ${m.content}`)
            .join('\n');
        }

        const fullPrompt = `${sysPrompt}\n\n${
          topic
            ? `GROUNDING CURRICULUM CONTEXT:
Topic: ${topic.title}
Explanation: ${topic.plainExplanation}
Objectives: ${topic.learningObjectives.join(', ')}
Common Pitfalls: ${topic.commonMistakes.join(', ')}`
            : ''
        }\n\n${conversationContext ? `RECENT CONVERSATION:\n${conversationContext}\n\n` : ''}Learner Query: ${userQuery}`;

        // 8-second timeout for serverless resilience
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const apiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${configuredModel}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: fullPrompt }] }]
            }),
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (apiRes.ok) {
          const data = await apiRes.json();
          const generated = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generated && generated.trim().length > 0) {
            replyText = generated.trim();
            responseSource = 'live_model';
          }
        }
      } catch (err) {
        console.warn('External AI call failed or timed out, using deterministic curriculum coach engine:', err);
      }
    }

    if (!replyText) {
      replyText = getDeterministicCoachResponse(coachReq);
      responseSource = 'curriculum_grounded_fallback';
    }

    // Persist conversation history safely
    if (userId) {
      await prisma.aiCoachMessage.create({
        data: {
          userId,
          topicId: topicId || null,
          role: 'user',
          language: finalLanguage,
          content: userQuery
        }
      });

      await prisma.aiCoachMessage.create({
        data: {
          userId,
          topicId: topicId || null,
          role: 'assistant',
          language: finalLanguage,
          content: replyText
        }
      });
    }

    return NextResponse.json({
      success: true,
      reply: replyText,
      language: finalLanguage,
      source: responseSource,
      model: responseSource === 'live_model' ? configuredModel : 'grounded-curriculum-tutor'
    });
  } catch (error) {
    console.error('AI Coach API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
