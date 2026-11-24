import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getTopicById } from '@/lib/curriculum';
import { evaluatePythonChallenge } from '@/lib/assessment-engine';
import { codingExecuteSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('lp_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await verifySessionToken(token);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rateCheck = checkRateLimit(`code_exec_${session.id}`, 20, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Please wait ${rateCheck.resetInSeconds} seconds before running more tests.` },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

    const validation = codingExecuteSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { topicId, code } = validation.data;
    const topic = getTopicById(topicId);
    if (!topic || !topic.codingChallenge) {
      return NextResponse.json({ error: 'Topic has no coding challenge' }, { status: 404 });
    }

    // Safely evaluate challenge test cases in an isolated deterministic test runner
    const challengeResult = evaluatePythonChallenge(topic.codingChallenge, code);

    // Record submission
    const dbChallenge = await prisma.codingChallenge.findFirst({
      where: { topicId }
    });

    if (dbChallenge) {
      await prisma.codeSubmission.create({
        data: {
          userId: session.id,
          challengeId: dbChallenge.id,
          submittedCode: code,
          passed: challengeResult.passed,
          testsPassed: challengeResult.testsPassed,
          testsTotal: challengeResult.testsTotal,
          outputLog: challengeResult.outputLog
        }
      });
    }

    return NextResponse.json({
      success: true,
      result: challengeResult
    });
  } catch (error) {
    console.error('Coding execute API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
