import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateDailyPlan } from '@/lib/scheduler';
import { getCareerTopics } from '@/lib/curriculum';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('lp_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await verifySessionToken(token);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        profile: true,
        topicProgress: true,
        revisionItems: {
          include: { topic: true }
        }
      }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const profile = user.profile;
    const dailyMins = profile?.dailyStudyMinutes || 60;
    const availableDays = profile?.availableDays ? profile.availableDays.split(',') : ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    // Find due revision topics (nextReviewDate <= now)
    const now = new Date();
    const dueRevisions = (user.revisionItems || [])
      .filter((rev) => new Date(rev.nextReviewDate) <= now)
      .map((rev) => ({
        id: rev.topicId,
        title: rev.topic.title,
        intervalDays: rev.intervalDays
      }));

    // Find next eligible unmastered topic
    const career = profile?.careerGoal || 'software-engineer';
    const allCareerTopics = getCareerTopics(career);
    const masteredIds = new Set(
      user.topicProgress.filter((p) => p.status === 'MASTERED').map((p) => p.topicId)
    );

    let nextTopic: any = null;
    for (const t of allCareerTopics) {
      if (!masteredIds.has(t.id)) {
        const canUnlock = t.prerequisites.every((pr) => masteredIds.has(pr));
        if (canUnlock) {
          nextTopic = {
            id: t.id,
            title: t.title,
            estimatedLessonMins: t.estimatedLessonMins,
            estimatedPracticeMins: t.estimatedPracticeMins
          };
          break;
        }
      }
    }

    const schedule = generateDailyPlan({
      dailyMinutes: dailyMins,
      availableDays,
      dueRevisionTopics: dueRevisions,
      nextEligibleTopic: nextTopic,
      activeProject: { id: 'proj-foundation-cli', title: 'Personal Budget & Expense Tracking CLI' }
    });

    return NextResponse.json({
      success: true,
      schedule,
      dueRevisionsCount: dueRevisions.length,
      nextTopic
    });
  } catch (error) {
    console.error('Planner API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
