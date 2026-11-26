import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getTopicById, computeTopicLockStatus } from '@/lib/curriculum';
import { learningProgressStore } from '@/lib/local-store';
import { microLessonProgressSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('lp_session')?.value;
    if (!token) return NextResponse.json({ error: 'Please sign in to save your lesson progress.' }, { status: 401 });

    const session = await verifySessionToken(token);
    if (!session) return NextResponse.json({ error: 'Please sign in to save your lesson progress.' }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

    const validation = microLessonProgressSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid micro-lesson payload' }, { status: 400 });
    }

    const { topicId, microLessonId, completed } = validation.data;
    const topic = getTopicById(topicId);
    if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });

    const validMl = (topic.subtopics || []).some((st) =>
      st.microLessons.some((ml) => ml.id === microLessonId)
    );
    if (!validMl) {
      return NextResponse.json({ error: 'Micro-lesson not found in topic' }, { status: 404 });
    }

    const masteredList = await prisma.userTopicProgress.findMany({
      where: { userId: session.id, status: 'MASTERED' },
    });
    const masteredIds = new Set(masteredList.map((p: any) => p.topicId));
    const { isLocked, missingPrereqs } = computeTopicLockStatus(topic, masteredIds);
    if (isLocked) {
      return NextResponse.json(
        { error: `Complete prerequisite topics first: ${missingPrereqs.join(', ')}` },
        { status: 403 }
      );
    }

    const allMicro = learningProgressStore.setMicroLesson(
      session.id,
      topicId,
      microLessonId,
      completed
    );

    // Move topic from NOT_STARTED to IN_PROGRESS automatically when first micro-lesson completes
    if (completed) {
      const existing = await prisma.userTopicProgress.findUnique({
        where: { userId_topicId: { userId: session.id, topicId } },
      });
      if (!existing) {
        await prisma.userTopicProgress.upsert({
          where: { userId_topicId: { userId: session.id, topicId } },
          update: {},
          create: {
            userId: session.id,
            topicId,
            status: 'IN_PROGRESS',
            firstStudiedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      completedMicroLessonIds: allMicro
        .filter((m) => m.topicId === topicId)
        .map((m) => m.microLessonId),
      xpAwarded: completed ? 15 : 0,
    });
  } catch (error) {
    console.error('Micro-lesson progress error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
