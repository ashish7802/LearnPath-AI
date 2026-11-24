import { NextRequest, NextResponse } from 'next/server';
import { getTopicById, computeTopicLockStatus } from '@/lib/curriculum';
import { verifySessionToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const topic = getTopicById(params.id);
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const token = req.cookies.get('lp_session')?.value;
    let userId: string | null = null;
    let progress: any = null;
    const masteredTopicIds = new Set<string>();

    if (token) {
      const session = await verifySessionToken(token);
      if (session) {
        userId = session.id;
        const allProgress = await prisma.userTopicProgress.findMany({ where: { userId } });
        for (const p of allProgress) {
          if (p.status === 'MASTERED') masteredTopicIds.add(p.topicId);
          if (p.topicId === topic.id) progress = p;
        }
      }
    }

    const { isLocked, missingPrereqs } = computeTopicLockStatus(topic, masteredTopicIds);

    // Sanitize assessment to not leak correct answers to the client before submission
    const sanitizedQuestions = topic.assessment.questions.map((q) => ({
      id: q.id,
      order: q.order,
      questionType: q.questionType,
      prompt: q.prompt,
      codeSnippet: q.codeSnippet,
      options: q.options
    }));

    return NextResponse.json({
      ...topic,
      isLocked,
      missingPrereqs,
      userProgress: progress
        ? {
            status: progress.status,
            bestScore: progress.bestScore,
            attemptsCount: progress.attemptsCount,
            masteredAt: progress.masteredAt
          }
        : { status: 'NOT_STARTED', bestScore: null, attemptsCount: 0 },
      assessment: {
        title: topic.assessment.title,
        passingScore: topic.assessment.passingScore,
        questionsCount: topic.assessment.questions.length,
        questions: sanitizedQuestions
      }
    });
  } catch (error) {
    console.error('Topic detail API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
