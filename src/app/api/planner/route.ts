import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateDailyPlan } from '@/lib/scheduler';
import { getCareerTopics, getProjects, getTopicById } from '@/lib/curriculum';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('lp_session')?.value;
    let session = null;
    if (token) {
      session = await verifySessionToken(token);
    }

    const requestedCareer = req.nextUrl.searchParams.get('career');

    // If unauthenticated, return a clear non-mutating starter plan for absolute beginners
    if (!session) {
      const career = requestedCareer || 'software-engineer';
      const topics = getCareerTopics(career);
      const firstTopic = topics[0];
      const careerProject =
        getProjects().find((p) => p.careerPathId === career) || getProjects()[0];

      const schedule = generateDailyPlan({
        dailyMinutes: 60,
        availableDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
        dueRevisionTopics: [],
        nextEligibleTopic: firstTopic
          ? {
              id: firstTopic.id,
              title: firstTopic.title,
              estimatedLessonMins: firstTopic.estimatedLessonMins,
              estimatedPracticeMins: firstTopic.estimatedPracticeMins,
            }
          : undefined,
        activeProject: careerProject
          ? { id: careerProject.id, title: careerProject.title }
          : undefined,
      });

      return NextResponse.json({
        success: true,
        authenticated: false,
        schedule,
        dueRevisionsCount: 0,
        revisionQueue: [],
        nextTopic: firstTopic
          ? {
              id: firstTopic.id,
              title: firstTopic.title,
              estimatedLessonMins: firstTopic.estimatedLessonMins,
              estimatedPracticeMins: firstTopic.estimatedPracticeMins,
            }
          : null,
        activeProject: careerProject || null,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        profile: true,
        topicProgress: true,
        revisionItems: {
          include: { topic: true },
        },
      },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const profile = user.profile;
    const dailyMins = profile?.dailyStudyMinutes || 60;
    const availableDays = profile?.availableDays
      ? profile.availableDays.split(',')
      : ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    const now = new Date();
    const revisionQueue = (user.revisionItems || []).map((rev: any) => {
      const fullTopic = getTopicById(rev.topicId);
      const isDue = new Date(rev.nextReviewDate) <= now;
      return {
        id: rev.id,
        topicId: rev.topicId,
        title: fullTopic?.title || rev.topic?.title || rev.topicId,
        plainExplanation: fullTopic?.plainExplanation || '',
        commonMistakes: fullTopic?.commonMistakes || [],
        nextReviewDate: rev.nextReviewDate,
        intervalDays: rev.intervalDays,
        repetitionCount: rev.repetitionCount,
        easeFactor: rev.easeFactor,
        isDue,
      };
    });

    const dueRevisions = revisionQueue
      .filter((r: any) => r.isDue)
      .map((r: any) => ({
        id: r.topicId,
        title: r.title,
        intervalDays: r.intervalDays,
      }));

    const career = requestedCareer || profile?.careerGoal || 'software-engineer';
    const allCareerTopics = getCareerTopics(career);
    const masteredIds = new Set(
      (user.topicProgress || [])
        .filter((p: any) => p.status === 'MASTERED')
        .map((p: any) => p.topicId)
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
            estimatedPracticeMins: t.estimatedPracticeMins,
          };
          break;
        }
      }
    }

    const projects = getProjects();
    const activeProject =
      projects.find((p) => p.careerPathId === career) || projects[0];

    const schedule = generateDailyPlan({
      dailyMinutes: dailyMins,
      availableDays,
      dueRevisionTopics: dueRevisions,
      nextEligibleTopic: nextTopic || undefined,
      activeProject: activeProject
        ? { id: activeProject.id, title: activeProject.title }
        : undefined,
    });

    return NextResponse.json({
      success: true,
      authenticated: true,
      schedule,
      dueRevisionsCount: dueRevisions.length,
      revisionQueue,
      nextTopic,
      activeProject: activeProject || null,
    });
  } catch (error) {
    console.error('Planner API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
