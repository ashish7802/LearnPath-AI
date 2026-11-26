/**
 * Pure Gamification, XP, Levels, Streaks & Achievements Engine.
 * Deterministically derives learner progression from verified progress records.
 */

export interface LevelInfo {
  level: number;
  title: string;
  currentXp: number;
  levelMinXp: number;
  nextLevelXp: number;
  progressPercent: number;
  xpToNext: number;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  category: 'foundation' | 'mastery' | 'coding' | 'consistency' | 'portfolio';
  unlocked: boolean;
  xpBonus: number;
  requirementText: string;
}

export interface ProgressSnapshotInput {
  microLessonsCompleted: number;
  topicsStudied: number;
  topicsMastered: number;
  masteredSubjectsCount: number;
  codingChallengesPassed: number;
  practiceChallengesPassed: number;
  projectsSubmitted: number;
  revisionsCompleted: number;
  streakDays: number;
}

export const XP_REWARDS = {
  MICRO_LESSON: 15,
  TOPIC_STUDIED: 25,
  TOPIC_MASTERED: 100,
  CODING_CHALLENGE: 50,
  PRACTICE_CHALLENGE: 40,
  PROJECT_SUBMITTED: 150,
  REVISION_COMPLETED: 20,
} as const;

const LEVEL_TIERS = [
  { level: 1, minXp: 0, title: 'First Spark' },
  { level: 2, minXp: 120, title: 'Digital Explorer' },
  { level: 3, minXp: 300, title: 'Logic Builder' },
  { level: 4, minXp: 550, title: 'Code Practitioner' },
  { level: 5, minXp: 900, title: 'Systems Apprentice' },
  { level: 6, minXp: 1350, title: 'Full-Stack Craftsman' },
  { level: 7, minXp: 1900, title: 'Engineering Architect' },
  { level: 8, minXp: 2600, title: 'Principal Technologist' },
];

export function computeAchievements(input: ProgressSnapshotInput): AchievementBadge[] {
  return [
    {
      id: 'ach-first-step',
      title: 'First Micro-Lesson',
      description: 'Completed your first structured micro-lesson from scratch.',
      category: 'foundation',
      unlocked: input.microLessonsCompleted >= 1 || input.topicsStudied >= 1 || input.topicsMastered >= 1,
      xpBonus: 25,
      requirementText: 'Complete 1 micro-lesson',
    },
    {
      id: 'ach-verified-mastery',
      title: 'Verified Mastery',
      description: 'Proved real skill by passing a topic verification assessment at 80% or higher.',
      category: 'mastery',
      unlocked: input.topicsMastered >= 1,
      xpBonus: 50,
      requirementText: 'Master 1 topic assessment',
    },
    {
      id: 'ach-code-runner',
      title: 'Sandbox Solver',
      description: 'Wrote working code that passed all visible and hidden test cases.',
      category: 'coding',
      unlocked: input.codingChallengesPassed + input.practiceChallengesPassed >= 1,
      xpBonus: 50,
      requirementText: 'Pass 1 coding challenge',
    },
    {
      id: 'ach-polymath',
      title: 'Cross-Domain Builder',
      description: 'Demonstrated verified mastery across 3 or more core topics.',
      category: 'mastery',
      unlocked: input.topicsMastered >= 3,
      xpBonus: 100,
      requirementText: 'Master 3 curriculum topics',
    },
    {
      id: 'ach-memory-keeper',
      title: 'Spaced Recall Keeper',
      description: 'Completed an active recall spaced-repetition review session.',
      category: 'consistency',
      unlocked: input.revisionsCompleted >= 1,
      xpBonus: 30,
      requirementText: 'Complete 1 revision session',
    },
    {
      id: 'ach-portfolio-shipper',
      title: 'Portfolio Shipper',
      description: 'Submitted a real engineering project with reflection and rubric review.',
      category: 'portfolio',
      unlocked: input.projectsSubmitted >= 1,
      xpBonus: 100,
      requirementText: 'Submit 1 milestone project',
    },
    {
      id: 'ach-multi-subject',
      title: 'Multi-Disciplinary Technologist',
      description: 'Mastered concepts across at least 2 distinct technology subjects.',
      category: 'mastery',
      unlocked: input.masteredSubjectsCount >= 2,
      xpBonus: 75,
      requirementText: 'Master topics in 2+ subjects',
    },
    {
      id: 'ach-challenge-ace',
      title: 'Challenge Ace',
      description: 'Solved at least 3 hands-on coding or practice challenges.',
      category: 'coding',
      unlocked: input.codingChallengesPassed + input.practiceChallengesPassed >= 3,
      xpBonus: 75,
      requirementText: 'Solve 3 coding challenges',
    },
  ];
}

export function calculateTotalXp(input: ProgressSnapshotInput): number {
  const baseXp =
    input.microLessonsCompleted * XP_REWARDS.MICRO_LESSON +
    input.topicsStudied * XP_REWARDS.TOPIC_STUDIED +
    input.topicsMastered * XP_REWARDS.TOPIC_MASTERED +
    input.codingChallengesPassed * XP_REWARDS.CODING_CHALLENGE +
    input.practiceChallengesPassed * XP_REWARDS.PRACTICE_CHALLENGE +
    input.projectsSubmitted * XP_REWARDS.PROJECT_SUBMITTED +
    input.revisionsCompleted * XP_REWARDS.REVISION_COMPLETED;

  const achievements = computeAchievements(input);
  const bonusXp = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.xpBonus, 0);

  return baseXp + bonusXp;
}

export function computeLevelFromXp(xp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(xp));
  let activeTier = LEVEL_TIERS[0];
  let nextTier = LEVEL_TIERS[1];

  for (let i = 0; i < LEVEL_TIERS.length; i++) {
    if (safeXp >= LEVEL_TIERS[i].minXp) {
      activeTier = LEVEL_TIERS[i];
      nextTier = LEVEL_TIERS[i + 1] || {
        level: LEVEL_TIERS[i].level + 1,
        minXp: LEVEL_TIERS[i].minXp + 1000,
        title: 'Master Technologist',
      };
    }
  }

  const span = Math.max(1, nextTier.minXp - activeTier.minXp);
  const gainedInLevel = safeXp - activeTier.minXp;
  const progressPercent = Math.min(100, Math.round((gainedInLevel / span) * 100));

  return {
    level: activeTier.level,
    title: activeTier.title,
    currentXp: safeXp,
    levelMinXp: activeTier.minXp,
    nextLevelXp: nextTier.minXp,
    progressPercent,
    xpToNext: Math.max(0, nextTier.minXp - safeXp),
  };
}

/**
 * Deterministic rubric evaluation for submitted portfolio projects
 * based on checked requirements + reflection substance + valid GitHub URL.
 */
export function evaluateProjectRubric(params: {
  checkedRequirementsCount: number;
  totalRequirementsCount: number;
  reflection: string;
  hasDemoUrl: boolean;
}): { score: number; status: 'APPROVED' | 'REVIEWED'; feedback: string } {
  const reqRatio =
    params.totalRequirementsCount > 0
      ? Math.min(1, params.checkedRequirementsCount / params.totalRequirementsCount)
      : 0.7;

  const reflectionWords = params.reflection.trim().split(/\s+/).filter(Boolean).length;
  const reflectionScore = Math.min(1, reflectionWords / 35);
  const demoBonus = params.hasDemoUrl ? 5 : 0;

  const rawScore = Math.round(reqRatio * 65 + reflectionScore * 30 + demoBonus);
  const score = Math.max(40, Math.min(100, rawScore));
  const status = score >= 80 ? 'APPROVED' : 'REVIEWED';

  const feedbackParts: string[] = [];
  if (reqRatio >= 0.9) {
    feedbackParts.push('All core engineering requirements were verified on your checklist.');
  } else {
    feedbackParts.push(`Completed ${params.checkedRequirementsCount} of ${params.totalRequirementsCount} checklist requirements — revisit the unchecked items to strengthen your deliverable.`);
  }
  if (reflectionWords >= 25) {
    feedbackParts.push('Clear engineering reflection explaining trade-offs and lessons learned.');
  } else {
    feedbackParts.push('Consider expanding your reflection with specific bugs solved and architecture choices.');
  }
  if (params.hasDemoUrl) {
    feedbackParts.push('Live demo link verified for portfolio showcase.');
  }

  return {
    score,
    status,
    feedback: feedbackParts.join(' '),
  };
}
