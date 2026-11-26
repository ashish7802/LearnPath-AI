import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { verifySessionToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getTopicById } from '@/lib/curriculum';
import {
  buildCoachSystemPrompt,
  getDeterministicCoachResponse,
  CoachRequest,
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

    const rateLimitKey = userId
      ? `coach_${userId}`
      : `coach_${req.headers.get('x-forwarded-for') || '127.0.0.1'}`;
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

    const topic = topicId ? getTopicById(topicId) : undefined;
    const coachReq: CoachRequest = {
      topicTitle: topic ? topic.title : undefined,
      language: finalLanguage,
      experienceLevel,
      mathComfort,
      userQuery,
      hintLevel,
    };

    let replyText = '';
    let responseSource: 'live_model' | 'curriculum_grounded_fallback' = 'curriculum_grounded_fallback';
    const configuredModel = 'gemini-4-hydrogen';
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_COACH_API_KEY;

    if (apiKey && apiKey.trim() !== '') {
      try {
        const ai = new GoogleGenAI({
          apiKey: apiKey.trim(),
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const sysPrompt = buildCoachSystemPrompt({
          topicTitle: topic?.title,
          language: finalLanguage,
          experienceLevel,
          mathComfort,
        });

        let conversationContext = '';
        if (userId) {
          const recentMessages = await prisma.aiCoachMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 4,
          });
          conversationContext = recentMessages
            .reverse()
            .map((m: any) => `${m.role === 'user' ? 'Learner' : 'Coach'}: ${m.content}`)
            .join('\n');
        }

        const groundingSection = topic
          ? `GROUNDING CURRICULUM CONTEXT:
Topic: ${topic.title}
Explanation: ${topic.plainExplanation}
Objectives: ${topic.learningObjectives.join(', ')}
Common Pitfalls: ${topic.commonMistakes.join(', ')}`
          : '';

        const userPrompt = `${groundingSection ? groundingSection + '\n\n' : ''}${
          conversationContext ? `RECENT CONVERSATION:\n${conversationContext}\n\n` : ''
        }Learner Query: ${userQuery}`;

        const response = await ai.models.generateContent({
          model: configuredModel,
          contents: userPrompt,
          config: {
            systemInstruction: sysPrompt,
          },
        });

        const generated = response.text;
        if (generated && generated.trim().length > 0) {
          replyText = generated.trim();
          responseSource = 'live_model';
        }
      } catch (err) {
        console.warn('Optional AI model unavailable, using built-in curriculum tutor engine:', err);
      }
    }

    if (!replyText) {
      replyText = getDeterministicCoachResponse(coachReq);
      responseSource = 'curriculum_grounded_fallback';
    }

    if (userId) {
      await prisma.aiCoachMessage.create({
        data: {
          userId,
          topicId: topicId || null,
          role: 'user',
          language: finalLanguage,
          content: userQuery,
        },
      });

      await prisma.aiCoachMessage.create({
        data: {
          userId,
          topicId: topicId || null,
          role: 'assistant',
          language: finalLanguage,
          content: replyText,
        },
      });
    }

    return NextResponse.json({
      success: true,
      reply: replyText,
      language: finalLanguage,
      source: responseSource,
      model: responseSource === 'live_model' ? configuredModel : 'built-in-curriculum-tutor',
    });
  } catch (error) {
    console.error('AI Coach API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
