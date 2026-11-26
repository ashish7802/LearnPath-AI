import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { LANGUAGE_GUIDES, PRACTICE_CHALLENGES } from '@/lib/curriculum-layers';
import { executeCodeChallengeSafely, runPlaygroundSnippet } from '@/lib/code-sandbox';
import { learningProgressStore } from '@/lib/local-store';
import { practiceExecuteSchema, playgroundRunSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('lp_session')?.value;
    let completedIds: string[] = [];
    let authenticated = false;

    if (token) {
      const session = await verifySessionToken(token);
      if (session) {
        authenticated = true;
        completedIds = learningProgressStore
          .getChallengeCompletions(session.id)
          .map((c) => c.challengeId);
      }
    }

    return NextResponse.json({
      authenticated,
      languages: LANGUAGE_GUIDES,
      challenges: PRACTICE_CHALLENGES.map((ch) => ({
        ...ch,
        completed: completedIds.includes(ch.id),
      })),
      completedCount: completedIds.length,
    });
  } catch (error) {
    console.error('Practice GET error:', error);
    return NextResponse.json({ error: 'Failed to load practice arena' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`practice_${ip}`, 30, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many runs. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

    // Mode 1: Interactive Playground snippet execution (works even for learners exploring before sign-in)
    if (body.mode === 'playground') {
      const validation = playgroundRunSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.errors.map((e) => e.message).join(', ') },
          { status: 400 }
        );
      }
      const runResult = runPlaygroundSnippet(validation.data.language, validation.data.code);
      return NextResponse.json({ success: true, playground: runResult });
    }

    // Mode 2: Practice Challenge execution & persistence
    const validation = practiceExecuteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }

    const challenge = PRACTICE_CHALLENGES.find((c) => c.id === validation.data.challengeId);
    if (!challenge) {
      return NextResponse.json({ error: 'Practice challenge not found' }, { status: 404 });
    }

    const result = executeCodeChallengeSafely(
      {
        title: challenge.title,
        instructions: challenge.instructions,
        starterCode: challenge.starterCode,
        language: challenge.language,
        visibleTests: challenge.visibleTests,
        hiddenTests: challenge.hiddenTests,
        solutionHint: challenge.solutionHint,
      },
      validation.data.code
    );

    let saved = false;
    const token = req.cookies.get('lp_session')?.value;
    if (token && result.passed) {
      const session = await verifySessionToken(token);
      if (session) {
        learningProgressStore.recordChallengeCompletion(
          session.id,
          challenge.id,
          validation.data.code
        );
        saved = true;
      }
    }

    return NextResponse.json({
      success: true,
      result,
      saved,
      xpAwarded: saved && result.passed ? challenge.xpReward : 0,
    });
  } catch (error) {
    console.error('Practice POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
