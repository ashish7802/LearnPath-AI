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
    const missedDaysCount = Math.max(0, Math.min(14, Number(req.nextUrl.searchParams.get('missedDays') || 0)));

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
        missedDaysCount,
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
      missedDaysCount,
    });

    return NextResponse.json({
      success: true,
      authenticated: true,
      dailyStudyMinutes: dailyMins,
      availableDays,
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

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('lp_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await verifySessionToken(token);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => null);
    const dailyMinutes = Number(body?.dailyStudyMinutes);
    if (Number.isNaN(dailyMinutes) || dailyMinutes < 15 || dailyMinutes > 240) {
      return NextResponse.json({ error: 'dailyStudyMinutes must be between 15 and 240' }, { status: 400 });
    }

    const availableDays = Array.isArray(body?.availableDays)
      ? body.availableDays.join(',')
      : typeof body?.availableDays === 'string' && body.availableDays.trim().length > 0
        ? body.availableDays.trim()
        : undefined;

    const profile = await prisma.userProfile.upsert({
      where: { userId: session.id },
      update: {
        dailyStudyMinutes: Math.round(dailyMinutes),
        ...(availableDays ? { availableDays } : {}),
      },
      create: {
        userId: session.id,
        dailyStudyMinutes: Math.round(dailyMinutes),
        availableDays: availableDays || 'mon,tue,wed,thu,fri,sat,sun',
      },
    });

    return NextResponse.json({
      success: true,
      dailyStudyMinutes: profile.dailyStudyMinutes,
      availableDays: profile.availableDays.split(','),
    });
  } catch (error) {
    console.error('Planner PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
