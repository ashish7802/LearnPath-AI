import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getAllTopics, getAllSubjects } from '@/lib/curriculum';
import { learningProgressStore } from '@/lib/local-store';
import {
  calculateTotalXp,
  computeAchievements,
  computeLevelFromXp,
} from '@/lib/gamification';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('lp_session')?.value;
    let userId: string | null = null;
    if (token) {
      const session = await verifySessionToken(token);
      if (session) userId = session.id;
    }

    const allTopics = getAllTopics();
    const subjects = getAllSubjects();

    if (!userId) {
      const level = computeLevelFromXp(0);
      const achievements = computeAchievements({
        microLessonsCompleted: 0,
        topicsStudied: 0,
        topicsMastered: 0,
        masteredSubjectsCount: 0,
        codingChallengesPassed: 0,
        practiceChallengesPassed: 0,
        projectsSubmitted: 0,
        revisionsCompleted: 0,
        streakDays: 0,
      });

      return NextResponse.json({
        authenticated: false,
        xp: 0,
        level,
        streakDays: 0,
        achievements,
        stats: {
          microLessonsCompleted: 0,
          topicsStudied: 0,
          topicsMastered: 0,
          totalTopics: allTopics.length,
          codingChallengesPassed: 0,
          practiceChallengesPassed: 0,
          projectsSubmitted: 0,
          revisionsCompleted: 0,
        },
        subjectMastery: subjects.map((s) => {
          const subjectTopics = allTopics.filter((t) => t.subjectId === s.id);
          return {
            subjectId: s.id,
            title: s.shortTitle,
            totalTopics: subjectTopics.length,
            masteredTopics: 0,
            percent: 0,
          };
        }),
      });
    }

    const [topicProgress, codeSubs, projSubs] = await Promise.all([
      prisma.userTopicProgress.findMany({ where: { userId } }),
      prisma.codeSubmission.findMany({ where: { userId, passed: true } }),
      prisma.projectSubmission.findMany({ where: { userId } }),
    ]);

    const microLessons = learningProgressStore.getMicroLessons(userId);
    const practiceCompletions = learningProgressStore.getChallengeCompletions(userId);
    const revisionCompletions = learningProgressStore.getRevisionCompletions(userId);

    const masteredIds = new Set(
      topicProgress.filter((p: any) => p.status === 'MASTERED').map((p: any) => p.topicId)
    );
    const studiedCount = topicProgress.filter(
      (p: any) => p.status === 'STUDIED' || p.status === 'MASTERED'
    ).length;

    // Distinct coding challenges passed
    const uniqueCodeChallenges = new Set(codeSubs.map((s: any) => s.challengeId));
    const uniqueProjects = new Set(projSubs.map((s: any) => s.projectId));

    const subjectMastery = subjects.map((s) => {
      const subjectTopics = allTopics.filter((t) => t.subjectId === s.id);
      const masteredInSubj = subjectTopics.filter((t) => masteredIds.has(t.id)).length;
      return {
        subjectId: s.id,
        title: s.shortTitle,
        totalTopics: subjectTopics.length,
        masteredTopics: masteredInSubj,
        percent:
          subjectTopics.length > 0
            ? Math.round((masteredInSubj / subjectTopics.length) * 100)
            : 0,
      };
    });

    const masteredSubjectsCount = subjectMastery.filter((s) => s.masteredTopics > 0).length;

    const activityCount =
      microLessons.length +
      topicProgress.length +
      practiceCompletions.length +
      revisionCompletions.length;
    const streakDays = activityCount > 0 ? Math.min(30, Math.max(1, Math.ceil(activityCount / 2))) : 0;

    const snapshot = {
      microLessonsCompleted: microLessons.length,
      topicsStudied: studiedCount,
      topicsMastered: masteredIds.size,
      masteredSubjectsCount,
      codingChallengesPassed: uniqueCodeChallenges.size,
      practiceChallengesPassed: practiceCompletions.length,
      projectsSubmitted: uniqueProjects.size,
      revisionsCompleted: revisionCompletions.length,
      streakDays,
    };

    const totalXp = calculateTotalXp(snapshot);
    const level = computeLevelFromXp(totalXp);
    const achievements = computeAchievements(snapshot);

    return NextResponse.json({
      authenticated: true,
      xp: totalXp,
      level,
      streakDays,
      achievements,
      stats: {
        ...snapshot,
        totalTopics: allTopics.length,
      },
      subjectMastery,
    });
  } catch (error) {
    console.error('Progress summary API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
