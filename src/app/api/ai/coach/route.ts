import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getTopicById } from '@/lib/curriculum';
import {
  buildCoachSystemPrompt,
  getDeterministicCoachResponse,
  CoachRequest
} from '@/lib/ai-coach';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('lp_session')?.value;
    let userId: string | null = null;
    let preferredLanguage = 'english';
    let experienceLevel = 'absolute-zero';
    let mathComfort = 'basic';

    if (token) {
      const session = await verifySessionToken(token);
      if (session) {
        userId = session.id;
        const profile = await prisma.userProfile.findUnique({ where: { userId: session.id } });
        if (profile) {
          preferredLanguage = profile.preferredLanguage;
          experienceLevel = profile.experienceLevel;
          mathComfort = profile.mathComfort;
        }
      }
    }

    const body = await req.json();
    const { topicId, userQuery, language, hintLevel } = body;
    const finalLanguage = language || preferredLanguage;

    const topic = topicId ? getTopicById(topicId) : undefined;
    const coachReq: CoachRequest = {
      topicTitle: topic ? topic.title : undefined,
      language: finalLanguage,
      experienceLevel,
      mathComfort,
      userQuery: userQuery || '',
      hintLevel: Number(hintLevel) || undefined
    };

    // If an external LLM API key is configured, we could invoke it;
    // otherwise our pedagogical coach engine provides grounded, multi-lingual
    // analogies, progressive hints, and debugging guidance.
    let replyText = '';
    const apiKey = process.env.AI_COACH_API_KEY;

    if (apiKey && apiKey.trim() !== '') {
      try {
        const sysPrompt = buildCoachSystemPrompt({
          topicTitle: topic?.title,
          language: finalLanguage,
          experienceLevel,
          mathComfort
        });

        // Call Gemini or compatible endpoint
        const apiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                { role: 'user', parts: [{ text: `${sysPrompt}\n\nLearner Query: ${userQuery}` }] }
              ]
            })
          }
        );

        if (apiRes.ok) {
          const data = await apiRes.json();
          replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } catch (err) {
        console.warn('External AI call failed, using deterministic coach engine:', err);
      }
    }

    if (!replyText) {
      replyText = getDeterministicCoachResponse(coachReq);
    }

    // Save message to database if user is logged in
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
      language: finalLanguage
    });
  } catch (error) {
    console.error('AI Coach API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
