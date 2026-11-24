import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getTopicById, computeTopicLockStatus } from '@/lib/curriculum';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('lp_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await verifySessionToken(token);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { topicId } = await req.json();
    const topic = getTopicById(topicId);
    if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });

    // Verify prerequisites before allowing study
    const masteredList = await prisma.userTopicProgress.findMany({
      where: { userId: session.id, status: 'MASTERED' }
    });
    const masteredIds = new Set(masteredList.map((p) => p.topicId));
    const { isLocked, missingPrereqs } = computeTopicLockStatus(topic, masteredIds);

    if (isLocked) {
      return NextResponse.json({
        error: `Cannot study locked topic. Missing prerequisites: ${missingPrereqs.join(', ')}`
      }, { status: 403 });
    }

    // State transition rule:
    // Marking as studied changes NOT_STARTED / IN_PROGRESS -> STUDIED.
    // It DOES NOT mark as MASTERED!
    const existing = await prisma.userTopicProgress.findUnique({
      where: {
        userId_topicId: {
          userId: session.id,
          topicId
        }
      }
    });

    const newStatus = existing?.status === 'MASTERED' ? 'MASTERED' : 'STUDIED';

    const updated = await prisma.userTopicProgress.upsert({
      where: {
        userId_topicId: {
          userId: session.id,
          topicId
        }
      },
      update: {
        status: newStatus,
        firstStudiedAt: existing?.firstStudiedAt || new Date()
      },
      create: {
        userId: session.id,
        topicId,
        status: 'STUDIED',
        firstStudiedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Topic marked as STUDIED. Take the assessment to verify mastery.',
      status: updated.status
    });
  } catch (error) {
    console.error('Study progress error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
