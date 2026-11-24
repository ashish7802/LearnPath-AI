import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAssessment, evaluatePythonChallenge } from '../src/lib/assessment-engine.ts';
import { calculateNextReview, generateDailyPlan } from '../src/lib/scheduler.ts';
import { getDeterministicCoachResponse, buildCoachSystemPrompt } from '../src/lib/ai-coach.ts';
import { getAllTopics, computeTopicLockStatus } from '../src/lib/curriculum.ts';

test('1. Curriculum Engine: All topics load and contain valid metadata', () => {
  const topics = getAllTopics();
  assert.ok(topics.length >= 10, 'Should load at least 10 core topics');
  
  for (const t of topics) {
    assert.ok(t.id, 'Topic has id');
    assert.ok(t.title, 'Topic has title');
    assert.ok(t.plainExplanation, 'Topic has plainExplanation');
    assert.ok(t.resources.length > 0, 'Topic has resources');
    assert.ok(t.assessment.questions.length > 0, 'Topic has assessment questions');
  }
});

test('2. Dependency Graph: computeTopicLockStatus locks topics if prerequisites are missing', () => {
  const all = getAllTopics();
  const dependentTopic = all.find(t => t.prerequisites.length > 0);
  assert.ok(dependentTopic, 'Found dependent topic');

  // With empty mastered set, it must be locked
  const emptyMastered = new Set();
  const lockStatus = computeTopicLockStatus(dependentTopic, emptyMastered);
  assert.equal(lockStatus.isLocked, true, 'Topic should be locked when prereqs are missing');
  assert.ok(lockStatus.missingPrereqs.length > 0, 'Missing prereqs reported');

  // When all prerequisites are fulfilled
  const fulfilledSet = new Set(dependentTopic.prerequisites);
  const unlockedStatus = computeTopicLockStatus(dependentTopic, fulfilledSet);
  assert.equal(unlockedStatus.isLocked, false, 'Topic unlocks when prereqs are fulfilled');
});

test('3. Assessment Engine: Deterministic grading and passing threshold calculation', () => {
  const sampleQuestions = [
    {
      order: 1,
      questionType: 'mcq',
      prompt: 'Is RAM volatile?',
      correctAnswer: 'Yes',
      explanation: 'RAM requires electrical current to maintain data.'
    },
    {
      order: 2,
      questionType: 'mcq',
      prompt: 'What does CPU stand for?',
      correctAnswer: 'Central Processing Unit',
      explanation: 'CPU is the central processor.'
    }
  ];

  // Perfect submission
  const perfectResult = evaluateAssessment(sampleQuestions, [
    { order: 1, userAnswer: 'Yes' },
    { order: 2, userAnswer: 'Central Processing Unit' }
  ], 80);

  assert.equal(perfectResult.score, 100);
  assert.equal(perfectResult.passed, true);
  assert.equal(perfectResult.correctCount, 2);

  // Failed submission
  const failedResult = evaluateAssessment(sampleQuestions, [
    { order: 1, userAnswer: 'No' },
    { order: 2, userAnswer: 'Central Processing Unit' }
  ], 80);

  assert.equal(failedResult.score, 50);
  assert.equal(failedResult.passed, false);
  assert.equal(failedResult.correctCount, 1);
});

test('4. Assessment Engine: Coding Challenge execution simulator', () => {
  const challenge = {
    title: 'Sum function',
    instructions: 'Return a + b',
    starterCode: 'def add(a, b):\n    return a + b',
    language: 'python',
    visibleTests: [{ input: '1, 2', expected: '3', description: '1+2' }],
    hiddenTests: [{ input: '5, 5', expected: '10', description: '5+5' }],
    solutionHint: 'Use return a + b'
  };

  const passResult = evaluatePythonChallenge(challenge, 'def add(a, b):\n    return a + b');
  assert.equal(passResult.passed, true);
  assert.equal(passResult.testsPassed, 2);

  const failResult = evaluatePythonChallenge(challenge, 'def add(a, b):\n    pass');
  assert.equal(failResult.passed, false);
});

test('5. Spaced Repetition (SuperMemo-2): Quality recall increases interval and adapts ease factor', () => {
  // First correct review
  const first = calculateNextReview(5);
  assert.equal(first.repetitionCount, 1);
  assert.equal(first.intervalDays, 1);

  // Second correct review
  const second = calculateNextReview(5, first);
  assert.equal(second.repetitionCount, 2);
  assert.equal(second.intervalDays, 6);

  // Third correct review
  const third = calculateNextReview(5, second);
  assert.ok(third.intervalDays > 6, 'Interval expands on repeated recall');

  // Failed recall resets repetition count
  const failed = calculateNextReview(1, third);
  assert.equal(failed.repetitionCount, 0, 'Failed recall resets repetition count');
  assert.equal(failed.intervalDays, 1, 'Failed recall resets interval to 1 day');
});

test('6. Adaptive Scheduler: Allocates daily minutes across revision, lesson, and practice', () => {
  const plan = generateDailyPlan({
    dailyMinutes: 60,
    availableDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    dueRevisionTopics: [{ id: 'comp-101', title: 'Hardware', intervalDays: 1 }],
    nextEligibleTopic: { id: 'terminal-101', title: 'Terminal', estimatedLessonMins: 20, estimatedPracticeMins: 20 },
    activeProject: { id: 'proj-1', title: 'CLI Project' }
  });

  assert.ok(plan.blocks.length >= 2, 'Should create at least revision and lesson blocks');
  assert.ok(plan.totalAllocatedMins <= 60, 'Total minutes must respect daily budget');
  assert.equal(plan.isAvailableDay, true);
});

test('7. AI Learning Coach: Hinglish and English real-world analogies', () => {
  const hinglishReply = getDeterministicCoachResponse({
    topicTitle: 'Python Variables',
    language: 'hinglish',
    experienceLevel: 'absolute-zero',
    mathComfort: 'basic',
    userQuery: 'variable kya hota hai?'
  });

  assert.ok(hinglishReply.includes('dabbe') || hinglishReply.includes('kitchen'), 'Hinglish coach uses intuitive kitchen box analogy');

  const englishReply = getDeterministicCoachResponse({
    topicTitle: 'Python Variables',
    language: 'english',
    experienceLevel: 'absolute-zero',
    mathComfort: 'basic',
    userQuery: 'what is a variable'
  });

  assert.ok(englishReply.includes('jar') || englishReply.includes('storage'), 'English coach uses storage jar analogy');
});
