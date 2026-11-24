import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getCareerTopics, computeTopicLockStatus } from '@/lib/curriculum';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const careerId = req.nextUrl.searchParams.get('career') || 'software-engineer';
    const token = req.cookies.get('lp_session')?.value;

    let userId: string | null = null;
    if (token) {
      const session = await verifySessionToken(token);
      if (session) userId = session.id;
    }

    // Fetch user topic progress if authenticated
    const userProgressMap = new Map<string, any>();
    const masteredTopicIds = new Set<string>();

    if (userId) {
      const progressList = await prisma.userTopicProgress.findMany({
        where: { userId }
      });
      for (const p of progressList) {
        userProgressMap.set(p.topicId, p);
        if (p.status === 'MASTERED') {
          masteredTopicIds.add(p.topicId);
        }
      }
    }

    const topics = getCareerTopics(careerId);

    // Compute lock and completion status
    const annotatedTopics = topics.map((t) => {
      const progress = userProgressMap.get(t.id);
      const { isLocked, missingPrereqs } = computeTopicLockStatus(t, masteredTopicIds);

      return {
        id: t.id,
        track: t.track,
        moduleId: t.moduleId,
        moduleTitle: t.moduleTitle,
        title: t.title,
        slug: t.slug,
        difficulty: t.difficulty,
        order: t.order,
        prerequisites: t.prerequisites,
        plainExplanation: t.plainExplanation,
        whyItMatters: t.whyItMatters,
        learningObjectives: t.learningObjectives,
        estimatedLessonMins: t.estimatedLessonMins,
        estimatedPracticeMins: t.estimatedPracticeMins,
        resourcesCount: t.resources.length,
        hasCodingChallenge: !!t.codingChallenge,
        isLocked,
        missingPrereqs,
        status: progress ? progress.status : 'NOT_STARTED',
        bestScore: progress ? progress.bestScore : null,
        masteredAt: progress ? progress.masteredAt : null
      };
    });

    return NextResponse.json({
      careerId,
      totalTopics: annotatedTopics.length,
      masteredCount: masteredTopicIds.size,
      topics: annotatedTopics
    });
  } catch (error) {
    console.error('Curriculum API error:', error);
    return NextResponse.json({ error: 'Failed to fetch curriculum' }, { status: 500 });
  }
}
