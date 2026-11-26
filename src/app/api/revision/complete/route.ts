import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getTopicById } from '@/lib/curriculum';
import { calculateNextReview } from '@/lib/scheduler';
import { revisionCompleteSchema } from '@/lib/validations';
import { learningProgressStore } from '@/lib/local-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('lp_session')?.value;
    if (!token) return NextResponse.json({ error: 'Please sign in to record revision recall.' }, { status: 401 });

    const session = await verifySessionToken(token);
    if (!session) return NextResponse.json({ error: 'Please sign in to record revision recall.' }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

    const validation = revisionCompleteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid revision rating payload' }, { status: 400 });
    }

    const { topicId, quality } = validation.data;
    const topic = getTopicById(topicId);
    if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });

    const existingRev = await prisma.revisionItem.findUnique({
      where: {
        userId_topicId: {
          userId: session.id,
          topicId,
        },
      },
    });

    const nextRev = calculateNextReview(
      quality,
      existingRev
        ? {
            repetitionCount: existingRev.repetitionCount,
            intervalDays: existingRev.intervalDays,
            easeFactor: existingRev.easeFactor,
          }
        : undefined
    );

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + nextRev.intervalDays);

    const updated = await prisma.revisionItem.upsert({
      where: {
        userId_topicId: {
          userId: session.id,
          topicId,
        },
      },
      update: {
        nextReviewDate: nextDate,
        intervalDays: nextRev.intervalDays,
        repetitionCount: nextRev.repetitionCount,
        easeFactor: nextRev.easeFactor,
        lastReviewedAt: new Date(),
      },
      create: {
        userId: session.id,
        topicId,
        nextReviewDate: nextDate,
        intervalDays: nextRev.intervalDays,
        repetitionCount: nextRev.repetitionCount,
        easeFactor: nextRev.easeFactor,
        lastReviewedAt: new Date(),
      },
    });

    learningProgressStore.recordRevisionCompletion(session.id, topicId, quality);

    return NextResponse.json({
      success: true,
      revision: updated,
      nextIntervalDays: nextRev.intervalDays,
      xpAwarded: 20,
      message:
        quality >= 3
          ? `Great recall! Next spaced review scheduled in ${nextRev.intervalDays} day${nextRev.intervalDays === 1 ? '' : 's'}.`
          : 'No worries — active recall strengthens memory. Scheduled again for tomorrow.',
    });
  } catch (error) {
    console.error('Revision complete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
