import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  getAllCareers,
  getAllSubjects,
  getCareerTopics,
  computeTopicLockStatus,
} from '@/lib/curriculum';
import { LANGUAGE_GUIDES } from '@/lib/curriculum-layers';
import { learningProgressStore } from '@/lib/local-store';

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

    const userProgressMap = new Map<string, any>();
    const masteredTopicIds = new Set<string>();
    const completedMicroLessonIds = new Set<string>();

    if (userId) {
      const progressList = await prisma.userTopicProgress.findMany({
        where: { userId },
      });
      for (const p of progressList) {
        userProgressMap.set(p.topicId, p);
        if (p.status === 'MASTERED') {
          masteredTopicIds.add(p.topicId);
        }
      }

      const microProgress = learningProgressStore.getMicroLessons(userId);
      for (const mp of microProgress) {
        completedMicroLessonIds.add(mp.microLessonId);
      }
    }

    const topics = getCareerTopics(careerId);
    const careers = getAllCareers();
    const subjects = getAllSubjects();

    const annotatedTopics = topics.map((t) => {
      const progress = userProgressMap.get(t.id);
      const { isLocked, missingPrereqs } = computeTopicLockStatus(t, masteredTopicIds);
      const subtopics = (t.subtopics || []).map((st) => ({
        id: st.id,
        title: st.title,
        summary: st.summary,
        microLessons: st.microLessons.map((ml) => ({
          id: ml.id,
          title: ml.title,
          estimatedMins: ml.estimatedMins,
          xpReward: ml.xpReward,
          completed: completedMicroLessonIds.has(ml.id),
        })),
      }));

      const totalMicroLessons = subtopics.reduce((acc, st) => acc + st.microLessons.length, 0);
      const completedMicroLessons = subtopics.reduce(
        (acc, st) => acc + st.microLessons.filter((ml) => ml.completed).length,
        0
      );

      return {
        id: t.id,
        track: t.track,
        subjectId: t.subjectId,
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
        subtopics,
        totalMicroLessons,
        completedMicroLessons,
        isLocked,
        missingPrereqs,
        status: progress ? progress.status : 'NOT_STARTED',
        bestScore: progress ? progress.bestScore : null,
        masteredAt: progress ? progress.masteredAt : null,
      };
    });

    return NextResponse.json({
      careerId,
      authenticated: !!userId,
      totalTopics: annotatedTopics.length,
      masteredCount: annotatedTopics.filter((t) => t.status === 'MASTERED').length,
      careers,
      subjects,
      languages: LANGUAGE_GUIDES,
      topics: annotatedTopics,
    });
  } catch (error) {
    console.error('Curriculum API error:', error);
    return NextResponse.json({ error: 'Failed to fetch curriculum' }, { status: 500 });
  }
}
