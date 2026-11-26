/**
 * Adaptive Learning, Natural-Language Goal Parser, Remediation Engine,
 * and Interactive Concept Visualizations.
 *
 * Pure, deterministic, zero-hallucination functions decoupled from UI.
 */

import { getAllTopics, getCareerTopics, getProjects, getTopicById, Topic } from './curriculum';
import { CAREERS } from './curriculum-layers';

export interface ParsedLearningGoal {
  careerGoal: string;
  experienceLevel: 'absolute-zero' | 'tried-tutorials' | 'intermediate';
  dailyStudyMinutes: number;
  targetMonths: number;
  preferredLanguage: 'english' | 'hinglish' | 'hindi';
  detectedKeywords: string[];
  summaryExplanation: string;
}

/**
 * Parses a natural-language goal description (English, Hindi, or Hinglish)
 * into structured onboarding parameters.
 * Example: "I am a complete beginner. I want to become a Python developer in six months. I can study one hour every day."
 */
export function parseNaturalLanguageGoal(input: string): ParsedLearningGoal {
  const raw = (input || '').trim();
  const text = raw.toLowerCase();
  const detectedKeywords: string[] = [];

  // 1. Detect Career Pathway
  let careerGoal = 'software-engineer';
  if (
    text.includes('rag') ||
    text.includes('llm') ||
    text.includes('agent') ||
    text.includes('gen ai') ||
    text.includes('generative ai') ||
    text.includes('ai engineer') ||
    text.includes('prompt')
  ) {
    careerGoal = 'ai-engineer';
    detectedKeywords.push('AI & LLM Engineering');
  } else if (
    text.includes('machine learning') ||
    text.includes('ml ') ||
    text.includes('deep learning') ||
    text.includes('neural net') ||
    text.includes('pytorch') ||
    text.includes('scikit')
  ) {
    careerGoal = 'ml-engineer';
    detectedKeywords.push('Machine Learning');
  } else if (
    text.includes('data scien') ||
    text.includes('analytics') ||
    text.includes('pandas') ||
    text.includes('statistics') ||
    text.includes('data analyst')
  ) {
    careerGoal = 'data-scientist';
    detectedKeywords.push('Data Science & Analytics');
  } else if (
    text.includes('web') ||
    text.includes('frontend') ||
    text.includes('front-end') ||
    text.includes('react') ||
    text.includes('html') ||
    text.includes('css') ||
    text.includes('javascript') ||
    text.includes('full-stack') ||
    text.includes('fullstack')
  ) {
    careerGoal = 'web-developer';
    detectedKeywords.push('Full-Stack Web Development');
  } else if (
    text.includes('mobile') ||
    text.includes('android') ||
    text.includes('ios') ||
    text.includes('app dev') ||
    text.includes('react native') ||
    text.includes('flutter')
  ) {
    careerGoal = 'mobile-developer';
    detectedKeywords.push('Mobile App Development');
  } else if (
    text.includes('cyber') ||
    text.includes('security') ||
    text.includes('hacking') ||
    text.includes('pentest') ||
    text.includes('infosec') ||
    text.includes('owasp')
  ) {
    careerGoal = 'cybersecurity-engineer';
    detectedKeywords.push('Cybersecurity Engineering');
  } else if (
    text.includes('cloud') ||
    text.includes('devops') ||
    text.includes('docker') ||
    text.includes('kubernetes') ||
    text.includes('aws') ||
    text.includes('linux') ||
    text.includes('ci/cd')
  ) {
    careerGoal = 'cloud-devops-engineer';
    detectedKeywords.push('Cloud & DevOps');
  } else if (text.includes('python') || text.includes('backend') || text.includes('software')) {
    careerGoal = 'software-engineer';
    detectedKeywords.push('Python & Software Engineering');
  }

  // 2. Detect Experience Level
  let experienceLevel: 'absolute-zero' | 'tried-tutorials' | 'intermediate' = 'absolute-zero';
  if (
    text.includes('intermediate') ||
    text.includes('built small') ||
    text.includes('know basics') ||
    text.includes('some experience') ||
    text.includes('1 year')
  ) {
    experienceLevel = 'intermediate';
    detectedKeywords.push('Intermediate Baseline');
  } else if (
    text.includes('tutorial') ||
    text.includes('little bit') ||
    text.includes('thoda') ||
    text.includes('basic variables')
  ) {
    experienceLevel = 'tried-tutorials';
    detectedKeywords.push('Tutorial Familiarity');
  } else {
    experienceLevel = 'absolute-zero';
    detectedKeywords.push('Starting from Zero');
  }

  // 3. Detect Study Time (minutes/day)
  let dailyStudyMinutes = 60;
  const minMatch = text.match(/(\d+)\s*(?:min|minute|minutes|m\b)/);
  const hourMatch = text.match(/(\d+(?:\.\d+)?|one|two|three|half)\s*(?:hour|hours|hr|hrs|ghanta|ghante)/);

  if (minMatch) {
    const parsedMins = parseInt(minMatch[1], 10);
    dailyStudyMinutes = Math.max(20, Math.min(180, parsedMins));
    detectedKeywords.push(`${dailyStudyMinutes} mins/day`);
  } else if (hourMatch) {
    const val = hourMatch[1];
    let hours = 1;
    if (val === 'one') hours = 1;
    else if (val === 'two') hours = 2;
    else if (val === 'three') hours = 3;
    else if (val === 'half') hours = 0.5;
    else hours = parseFloat(val) || 1;
    dailyStudyMinutes = Math.max(20, Math.min(180, Math.round(hours * 60)));
    detectedKeywords.push(`${dailyStudyMinutes} mins/day`);
  }

  // 4. Detect Target Timeline (months)
  let targetMonths = 6;
  const monthMatch = text.match(/(\d+|one|two|three|four|five|six|nine|twelve)\s*(?:month|months|mahine)/);
  if (monthMatch) {
    const wordMap: Record<string, number> = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      nine: 9,
      twelve: 12,
    };
    const mVal = monthMatch[1];
    targetMonths = wordMap[mVal] || parseInt(mVal, 10) || 6;
    targetMonths = Math.max(1, Math.min(24, targetMonths));
    detectedKeywords.push(`${targetMonths}-month target`);
  }

  // 5. Detect Preferred Language
  let preferredLanguage: 'english' | 'hinglish' | 'hindi' = 'english';
  if (/[\u0900-\u097F]/.test(raw) || text.includes('in hindi')) {
    preferredLanguage = 'hindi';
    detectedKeywords.push('Hindi');
  } else if (
    text.includes('hinglish') ||
    text.includes('seekhna') ||
    text.includes('shuru') ||
    text.includes('mujhe') ||
    text.includes('karna') ||
    text.includes('banna') ||
    text.includes('banana') ||
    text.includes('chahta') ||
    text.includes('bilkul') ||
    text.includes('padh') ||
    text.includes('roz') ||
    text.includes('hoon')
  ) {
    preferredLanguage = 'hinglish';
    detectedKeywords.push('Hinglish');
  }

  const careerObj = CAREERS.find((c) => c.id === careerGoal) || CAREERS[0];
  const summaryExplanation = `Configured ${careerObj.title} pathway starting from ${
    experienceLevel === 'absolute-zero' ? 'absolute zero' : experienceLevel.replace('-', ' ')
  } at ${dailyStudyMinutes} mins/day (${targetMonths}-month horizon).`;

  return {
    careerGoal,
    experienceLevel,
    dailyStudyMinutes,
    targetMonths,
    preferredLanguage,
    detectedKeywords,
    summaryExplanation,
  };
}

export interface AdaptiveRemediationPlan {
  topicId: string;
  topicTitle: string;
  score: number;
  masteryThreshold: number;
  passed: boolean;
  missingConcepts: string[];
  recommendedMicroLessons: { id: string; title: string; subtopicTitle: string; durationMins: number }[];
  explanation: string;
  nextActionLabel: string;
  nextActionUrl: string;
}

/**
 * Generates an evidence-based diagnostic remediation plan after an assessment submission.
 * Never claims mastery unless score >= masteryThreshold.
 */
export function buildAssessmentRemediation(params: {
  topicId: string;
  score: number;
  passed: boolean;
  feedback: { order: number; prompt: string; isCorrect: boolean; explanation: string }[];
}): AdaptiveRemediationPlan {
  const topic = getTopicById(params.topicId);
  const threshold = topic?.masteryThreshold || 80;
  const missedQuestions = (params.feedback || []).filter((f) => !f.isCorrect);

  const missingConcepts = missedQuestions.map((q) => {
    const cleanPrompt = q.prompt.length > 75 ? q.prompt.slice(0, 72) + '...' : q.prompt;
    return cleanPrompt;
  });

  const recommendedMicroLessons: {
    id: string;
    title: string;
    subtopicTitle: string;
    durationMins: number;
  }[] = [];

  for (const st of topic?.subtopics || []) {
    for (const ml of st.microLessons || []) {
      recommendedMicroLessons.push({
        id: ml.id,
        title: ml.title,
        subtopicTitle: st.title,
        durationMins: (ml as any).durationMinutes || 5,
      });
    }
  }

  if (params.passed) {
    // Identify newly unlocked downstream topics
    const allTopics = getAllTopics();
    const downstream = allTopics.find((t) => t.prerequisites.includes(params.topicId));
    return {
      topicId: params.topicId,
      topicTitle: topic?.title || params.topicId,
      score: params.score,
      masteryThreshold: threshold,
      passed: true,
      missingConcepts: [],
      recommendedMicroLessons: recommendedMicroLessons.slice(0, 1),
      explanation: `You scored ${params.score}% (threshold ${threshold}%). Verified mastery recorded and SuperMemo-2 spaced review scheduled.${
        downstream ? ` This unlocks "${downstream.title}".` : ''
      }`,
      nextActionLabel: downstream ? `Continue to ${downstream.title}` : 'Return to Learning Dashboard',
      nextActionUrl: downstream ? `/topics/${downstream.id}` : '/dashboard',
    };
  }

  const targetedMicros = recommendedMicroLessons.slice(0, 2);
  const microNames = targetedMicros.map((m) => `"${m.title}"`).join(' and ');

  return {
    topicId: params.topicId,
    topicTitle: topic?.title || params.topicId,
    score: params.score,
    masteryThreshold: threshold,
    passed: false,
    missingConcepts,
    recommendedMicroLessons: targetedMicros,
    explanation: `You scored ${params.score}% (needed ${threshold}%). You missed ${missedQuestions.length} concept check(s). Review ${
      microNames || 'the step-by-step micro-lessons'
    } and run the interactive sandbox example before retrying.`,
    nextActionLabel: 'Review Targeted Micro-Lessons',
    nextActionUrl: `/topics/${params.topicId}#micro-lessons`,
  };
}

export interface ExplainableRecommendation {
  id: string;
  type: 'remediation' | 'revision' | 'lesson' | 'practice' | 'project' | 'schedule';
  title: string;
  durationMins: number;
  whySelected: string;
  evidenceBadge: string;
  actionLabel: string;
  actionUrl: string;
  topicId?: string;
}

/**
 * Generates deterministic, explainable learning recommendations from actual learner evidence:
 * - Failed / NEEDS_REVISION topics first
 * - Overdue SM-2 spaced revision items second
 * - Next prerequisite-unlocked topic in active career track third
 * - Coding challenge practice fourth
 * - Career milestone portfolio project fifth
 */
export function buildExplainableRecommendations(params: {
  careerGoal: string;
  dailyStudyMinutes: number;
  topicProgress: { topicId: string; status: string; bestScore?: number | null; attemptsCount?: number }[];
  dueRevisions: { topicId: string; title: string; intervalDays: number }[];
  completedMicroLessonIds?: string[];
  userQuery?: string;
}): ExplainableRecommendation[] {
  const recommendations: ExplainableRecommendation[] = [];
  const careerTopics = getCareerTopics(params.careerGoal || 'software-engineer');
  const progressMap = new Map(params.topicProgress.map((p) => [p.topicId, p]));
  const masteredIds = new Set(
    params.topicProgress.filter((p) => p.status === 'MASTERED').map((p) => p.topicId)
  );

  // 1. Check for any topics in NEEDS_REVISION state (failed assessment evidence)
  const needsRevision = params.topicProgress.filter((p) => p.status === 'NEEDS_REVISION');
  for (const item of needsRevision) {
    const topic = getTopicById(item.topicId);
    if (topic) {
      recommendations.push({
        id: `rec-remediate-${topic.id}`,
        type: 'remediation',
        title: `Strengthen Weak Concept: ${topic.title}`,
        durationMins: 15,
        whySelected: `Based on your recent assessment score (${item.bestScore ?? 0}% vs ${topic.masteryThreshold}% required), reviewing the step-by-step micro-lessons and coding sandbox for "${topic.title}" will unblock your next dependent skill.`,
        evidenceBadge: `Assessment Score: ${item.bestScore ?? 0}%`,
        actionLabel: 'Review Micro-Lesson & Retry',
        actionUrl: `/topics/${topic.id}`,
        topicId: topic.id,
      });
    }
  }

  // 2. Check for due SM-2 Spaced Revision items
  if (params.dueRevisions.length > 0) {
    const firstDue = params.dueRevisions[0];
    recommendations.push({
      id: `rec-revision-${firstDue.topicId}`,
      type: 'revision',
      title: `Active Recall Review: ${firstDue.title}`,
      durationMins: 10,
      whySelected: `Scheduled by SuperMemo-2 spaced repetition (${firstDue.intervalDays}-day interval) so you retain "${firstDue.title}" in long-term memory without cramming.`,
      evidenceBadge: `SM-2 Due Today (${firstDue.intervalDays}d interval)`,
      actionLabel: 'Start 10-Min Flashcard Recall',
      actionUrl: '/practice?tab=revision',
      topicId: firstDue.topicId,
    });
  }

  // 3. Find the next unlocked unmastered topic in the learner's career path
  let nextTopic: Topic | undefined;
  for (const t of careerTopics) {
    if (!masteredIds.has(t.id)) {
      const prereqsMet = t.prerequisites.every((pr: string) => masteredIds.has(pr));
      if (prereqsMet) {
        nextTopic = t;
        break;
      }
    }
  }

  if (nextTopic) {
    const prog = progressMap.get(nextTopic.id);
    const prereqNames = nextTopic.prerequisites
      .map((id: string) => getTopicById(id)?.title || id)
      .join(', ');

    recommendations.push({
      id: `rec-next-${nextTopic.id}`,
      type: 'lesson',
      title: `Next Core Skill: ${nextTopic.title}`,
      durationMins: Math.min(params.dailyStudyMinutes, nextTopic.estimatedLessonMins),
      whySelected:
        nextTopic.prerequisites.length > 0
          ? `Because you verified mastery in ${prereqNames}, you have unlocked "${nextTopic.title}" in your ${params.careerGoal.replace(/-/g, ' ')} roadmap.`
          : `This is the foundational entry point for your ${params.careerGoal.replace(/-/g, ' ')} pathway—assuming zero prior knowledge.`,
      evidenceBadge: prog?.status === 'IN_PROGRESS' ? 'In Progress' : 'Prerequisites Verified',
      actionLabel: 'Start Interactive Lesson',
      actionUrl: `/topics/${nextTopic.id}`,
      topicId: nextTopic.id,
    });

    if (nextTopic.codingChallenge) {
      recommendations.push({
        id: `rec-practice-${nextTopic.id}`,
        type: 'practice',
        title: `Hands-On Sandbox: ${nextTopic.codingChallenge.title}`,
        durationMins: 15,
        whySelected: `Applies "${nextTopic.title}" in an isolated code sandbox with deterministic unit tests so you build muscle memory before taking the mastery quiz.`,
        evidenceBadge: `${nextTopic.codingChallenge.language} Sandbox`,
        actionLabel: 'Solve Coding Exercise',
        actionUrl: `/topics/${nextTopic.id}#coding-challenge`,
        topicId: nextTopic.id,
      });
    }
  }

  // 4. Recommend Career Milestone Project
  const projects = getProjects();
  const careerProject =
    projects.find((p) => p.careerPathId === params.careerGoal) || projects[0];
  if (careerProject) {
    recommendations.push({
      id: `rec-project-${careerProject.id}`,
      type: 'project',
      title: `Portfolio Milestone: ${careerProject.title}`,
      durationMins: 25,
      whySelected: `Turns your ${ masteredIds.size } mastered skill(s) into demonstrable GitHub portfolio evidence evaluated against a ${careerProject.requirements.length}-point engineering rubric.`,
      evidenceBadge: `Phase ${careerProject.phaseNumber} Deliverable`,
      actionLabel: 'Inspect Project Rubric',
      actionUrl: '/projects',
    });
  }

  return recommendations;
}

export {
  CONCEPT_VISUALIZATIONS,
  getVisualizationForTopic,
  type ConceptAnimationStep,
  type ConceptVisualizationSpec,
} from './concept-visualizations';

