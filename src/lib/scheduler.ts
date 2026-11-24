/**
 * Smart Adaptive Study Planner & Spaced Repetition Engine
 * Implements SuperMemo-2 (SM-2) algorithm for optimal memory retention
 * with adaptive workload distribution and no-shame rescheduling.
 */

export interface SpacedRepetitionData {
  repetitionCount: number;
  intervalDays: number;
  easeFactor: number; // Initial 2.5
}

export function calculateNextReview(
  quality: number, // 0 to 5 (0: complete blackout, 3: correct with effort, 5: perfect recall)
  currentData: SpacedRepetitionData = { repetitionCount: 0, intervalDays: 1, easeFactor: 2.5 }
): SpacedRepetitionData {
  let { repetitionCount, intervalDays, easeFactor } = currentData;

  // Constrain quality 0 - 5
  const q = Math.max(0, Math.min(5, quality));

  if (q >= 3) {
    if (repetitionCount === 0) {
      intervalDays = 1; // 1 day
    } else if (repetitionCount === 1) {
      intervalDays = 6; // 1 week approx
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitionCount++;
  } else {
    // Failed recall: reset repetition count but keep ease factor adjusted
    repetitionCount = 0;
    intervalDays = 1;
  }

  // Calculate new Ease Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  return { repetitionCount, intervalDays, easeFactor };
}

export interface StudyBlock {
  id: string;
  type: 'revision' | 'lesson' | 'practice' | 'assessment' | 'project';
  title: string;
  topicId?: string;
  durationMins: number;
  description: string;
  priority: 'high' | 'medium' | 'normal';
}

export interface DailySchedule {
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  totalAllocatedMins: number;
  isAvailableDay: boolean;
  blocks: StudyBlock[];
}

export function generateDailyPlan(params: {
  dailyMinutes: number;
  availableDays: string[]; // e.g. ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  dueRevisionTopics: { id: string; title: string; intervalDays: number }[];
  nextEligibleTopic?: { id: string; title: string; estimatedLessonMins: number; estimatedPracticeMins: number };
  activeProject?: { id: string; title: string };
  missedDaysCount?: number;
}): DailySchedule {
  const { dailyMinutes, availableDays, dueRevisionTopics, nextEligibleTopic, activeProject } = params;

  const today = new Date();
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const currentDay = dayNames[today.getDay()];
  const isAvailableDay = availableDays.includes(currentDay);

  const blocks: StudyBlock[] = [];
  let remainingMins = isAvailableDay ? dailyMinutes : 0;

  // 1. Spaced Repetition Reviews First (Max 25% of daily budget)
  const maxRevisionMins = Math.round(remainingMins * 0.3);
  let revisionUsed = 0;

  for (const rev of dueRevisionTopics) {
    if (revisionUsed + 15 <= maxRevisionMins && remainingMins >= 15) {
      blocks.push({
        id: `rev-${rev.id}`,
        type: 'revision',
        title: `Spaced Revision: ${rev.title}`,
        topicId: rev.id,
        durationMins: 15,
        description: `Active recall quiz to cement concept in long-term memory (due interval: ${rev.intervalDays}d)`,
        priority: 'high'
      });
      revisionUsed += 15;
      remainingMins -= 15;
    }
  }

  // 2. Core New Topic Lesson & Practice
  if (nextEligibleTopic && remainingMins >= 20) {
    const lessonTime = Math.min(nextEligibleTopic.estimatedLessonMins || 25, Math.round(remainingMins * 0.45));
    blocks.push({
      id: `lesson-${nextEligibleTopic.id}`,
      type: 'lesson',
      title: `Study: ${nextEligibleTopic.title}`,
      topicId: nextEligibleTopic.id,
      durationMins: lessonTime,
      description: 'Read the plain-English explanation, study primary resources, and understand core objectives.',
      priority: 'high'
    });
    remainingMins -= lessonTime;

    if (remainingMins >= 15) {
      const practiceTime = Math.min(nextEligibleTopic.estimatedPracticeMins || 25, remainingMins);
      blocks.push({
        id: `practice-${nextEligibleTopic.id}`,
        type: 'practice',
        title: `Hands-on Practice & Assessment`,
        topicId: nextEligibleTopic.id,
        durationMins: practiceTime,
        description: 'Complete coding challenge test cases and pass verification quiz.',
        priority: 'high'
      });
      remainingMins -= practiceTime;
    }
  }

  // 3. Milestone Project Work (if time remains)
  if (activeProject && remainingMins >= 20) {
    blocks.push({
      id: `proj-${activeProject.id}`,
      type: 'project',
      title: `Milestone Project: ${activeProject.title}`,
      durationMins: remainingMins,
      description: 'Work on portfolio deliverables and test your code locally.',
      priority: 'normal'
    });
    remainingMins = 0;
  }

  return {
    date: today.toISOString().split('T')[0],
    dayOfWeek: currentDay.toUpperCase(),
    totalAllocatedMins: dailyMinutes - remainingMins,
    isAvailableDay,
    blocks
  };
}
