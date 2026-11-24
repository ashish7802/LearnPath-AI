import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getTopicById } from '@/lib/curriculum';
import { evaluatePythonChallenge } from '@/lib/assessment-engine';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('lp_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await verifySessionToken(token);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { topicId, code } = await req.json();
    const topic = getTopicById(topicId);
    if (!topic || !topic.codingChallenge) {
      return NextResponse.json({ error: 'Topic has no coding challenge' }, { status: 404 });
    }

    // Evaluate challenge test cases
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
