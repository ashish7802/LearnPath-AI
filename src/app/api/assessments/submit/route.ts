import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getTopicById } from '@/lib/curriculum';
import { evaluateAssessment } from '@/lib/assessment-engine';
import { calculateNextReview } from '@/lib/scheduler';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('lp_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await verifySessionToken(token);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { topicId, answers } = await req.json();
    const topic = getTopicById(topicId);
    if (!topic || !topic.assessment) {
      return NextResponse.json({ error: 'Topic or assessment not found' }, { status: 404 });
    }

    // Evaluate answers server-side
    const evaluation = evaluateAssessment(
      topic.assessment.questions,
      answers,
      topic.masteryThreshold || 80
    );

    // Record assessment attempt history
    const dbAssessment = await prisma.assessment.findFirst({
      where: { topicId }
    });

    if (dbAssessment) {
      await prisma.assessmentAttempt.create({
        data: {
          userId: session.id,
          assessmentId: dbAssessment.id,
          score: evaluation.score,
          passed: evaluation.passed,
          answersJson: JSON.stringify(answers),
          feedbackJson: JSON.stringify(evaluation.feedback)
        }
      });
    }

    // State transition logic
    const existing = await prisma.userTopicProgress.findUnique({
      where: {
        userId_topicId: {
          userId: session.id,
          topicId
        }
      }
    });

    const isPassed = evaluation.passed;
    const newStatus = isPassed ? 'MASTERED' : 'NEEDS_REVISION';
    const bestScore = Math.max(existing?.bestScore || 0, evaluation.score);

    const updatedProgress = await prisma.userTopicProgress.upsert({
      where: {
        userId_topicId: {
          userId: session.id,
          topicId
        }
      },
      update: {
        status: newStatus,
        bestScore,
        attemptsCount: { increment: 1 },
        masteredAt: isPassed ? (existing?.masteredAt || new Date()) : existing?.masteredAt,
        lastAttemptAt: new Date()
      },
      create: {
        userId: session.id,
        topicId,
        status: newStatus,
        bestScore,
        attemptsCount: 1,
        masteredAt: isPassed ? new Date() : null,
        lastAttemptAt: new Date()
      }
    });

    // Schedule or update Spaced Repetition queue
    if (isPassed) {
      const existingRev = await prisma.revisionItem.findUnique({
        where: {
          userId_topicId: {
            userId: session.id,
            topicId
          }
        }
      });

      const quality = evaluation.score >= 95 ? 5 : (evaluation.score >= 85 ? 4 : 3);
      const nextRevData = calculateNextReview(quality, existingRev ? {
        repetitionCount: existingRev.repetitionCount,
        intervalDays: existingRev.intervalDays,
        easeFactor: existingRev.easeFactor
      } : undefined);

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + nextRevData.intervalDays);

      await prisma.revisionItem.upsert({
        where: {
          userId_topicId: {
            userId: session.id,
            topicId
          }
        },
        update: {
          nextReviewDate: nextDate,
          intervalDays: nextRevData.intervalDays,
          repetitionCount: nextRevData.repetitionCount,
          easeFactor: nextRevData.easeFactor,
          lastReviewedAt: new Date()
        },
        create: {
          userId: session.id,
          topicId,
          nextReviewDate: nextDate,
          intervalDays: nextRevData.intervalDays,
          repetitionCount: nextRevData.repetitionCount,
          easeFactor: nextRevData.easeFactor,
          lastReviewedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      evaluation,
      status: updatedProgress.status,
      mastered: isPassed,
      message: isPassed
        ? '🎉 Congratulations! You have proven mastery and unlocked the next topic!'
        : 'Assessment not passed yet. Review the weak concepts and retest.'
    });
  } catch (error) {
    console.error('Assessment submit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
