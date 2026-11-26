import test from 'node:test';
import assert from 'node:assert/strict';
import { getAllTopics, getAllCareers, getAllSubjects, getCareerTopics, computeTopicLockStatus } from '../src/lib/curriculum';
import { executeCodeChallengeSafely, runPlaygroundSnippet } from '../src/lib/code-sandbox';
import { calculateTotalXp, computeLevelFromXp, computeAchievements, evaluateProjectRubric } from '../src/lib/gamification';
import { evaluateAssessment } from '../src/lib/assessment-engine';
import { calculateNextReview } from '../src/lib/scheduler';

test('Curriculum 6-Layer Hierarchy: all careers, subjects, topics, subtopics, and micro-lessons load cleanly', () => {
  const careers = getAllCareers();
  const subjects = getAllSubjects();
  const topics = getAllTopics();

  assert.ok(careers.length >= 8, 'Must include at least 8 technology career paths');
  assert.ok(subjects.length >= 10, 'Must include at least 10 core subjects');
  assert.ok(topics.length >= 25, 'Must include expanded multi-domain topics');

  const topicIds = new Set(topics.map((t) => t.id));
  for (const t of topics) {
    assert.ok(t.subjectId, `Topic ${t.id} has subjectId`);
    assert.ok(t.subtopics && t.subtopics.length > 0, `Topic ${t.id} has subtopics`);
    for (const st of t.subtopics!) {
      assert.ok(st.microLessons.length > 0, `Subtopic ${st.id} has micro-lessons`);
      for (const ml of st.microLessons) {
        assert.ok(ml.meaning.length > 15, `Micro-lesson ${ml.id} explains meaning simply`);
        assert.ok(ml.quickCheck.options.length >= 2, `Micro-lesson ${ml.id} has quick check`);
      }
    }
    for (const prereq of t.prerequisites) {
      assert.ok(topicIds.has(prereq), `Prerequisite ${prereq} of ${t.id} exists`);
    }
  }
});

test('Career topic closure guarantees all prerequisites are included in each career roadmap', () => {
  for (const career of getAllCareers()) {
    const careerTopics = getCareerTopics(career.id);
    const idSet = new Set(careerTopics.map((t) => t.id));
    assert.ok(idSet.has('comp-101'), `${career.id} starts from absolute zero (comp-101)`);
    for (const t of careerTopics) {
      for (const p of t.prerequisites) {
        assert.ok(idSet.has(p), `Career ${career.id} includes prerequisite ${p} for ${t.id}`);
      }
    }
  }
});

test('Code Sandbox genuinely fails wrong logic and passes correct JS and Python implementations', () => {
  const jsChallenge = {
    title: 'Double',
    instructions: 'Return n * 2',
    starterCode: 'function dbl(n) { return 0; }',
    language: 'javascript' as const,
    visibleTests: [{ input: 'dbl(4)', expected: '8', description: '4*2=8' }],
    hiddenTests: [{ input: 'dbl(7)', expected: '14', description: '7*2=14' }],
    solutionHint: 'Multiply by 2',
  };

  const wrongJs = executeCodeChallengeSafely(jsChallenge, 'function dbl(n) { return n + 1; }');
  assert.equal(wrongJs.passed, false, 'Wrong JS logic must fail');

  const rightJs = executeCodeChallengeSafely(jsChallenge, 'function dbl(n) { return n * 2; }');
  assert.equal(rightJs.passed, true, 'Correct JS logic must pass');
  assert.equal(rightJs.testsPassed, 2);

  const pyChallenge = {
    title: 'Celsius to Fahrenheit',
    instructions: 'Convert C to F',
    starterCode: 'def to_f(c):\n    return 0',
    language: 'python' as const,
    visibleTests: [{ input: '0', expected: '32', description: '0->32' }],
    hiddenTests: [{ input: '100', expected: '212', description: '100->212' }],
    solutionHint: 'return (c * 9 / 5) + 32',
  };

  const wrongPy = executeCodeChallengeSafely(pyChallenge, 'def to_f(c):\n    return c + 10');
  assert.equal(wrongPy.passed, false, 'Wrong Python logic must fail');

  const rightPy = executeCodeChallengeSafely(pyChallenge, 'def to_f(c):\n    return (c * 9 / 5) + 32');
  assert.equal(rightPy.passed, true, 'Correct Python logic must pass');

  const blocked = runPlaygroundSnippet('javascript', 'process.exit(1)');
  assert.equal(blocked.ok, false, 'Forbidden runtime globals must be blocked');
});

test('Gamification Engine computes deterministic XP, Levels, Achievements, and Project Rubrics', () => {
  const zeroSnap = {
    microLessonsCompleted: 0,
    topicsStudied: 0,
    topicsMastered: 0,
    masteredSubjectsCount: 0,
    codingChallengesPassed: 0,
    practiceChallengesPassed: 0,
    projectsSubmitted: 0,
    revisionsCompleted: 0,
    streakDays: 0,
  };
  assert.equal(calculateTotalXp(zeroSnap), 0);
  assert.equal(computeLevelFromXp(0).level, 1);

  const activeSnap = {
    microLessonsCompleted: 4,
    topicsStudied: 2,
    topicsMastered: 2,
    masteredSubjectsCount: 2,
    codingChallengesPassed: 1,
    practiceChallengesPassed: 1,
    projectsSubmitted: 1,
    revisionsCompleted: 1,
    streakDays: 5,
  };
  const xp = calculateTotalXp(activeSnap);
  assert.ok(xp > 500, 'Active learner accumulates XP + achievement bonuses');
  const lvl = computeLevelFromXp(xp);
  assert.ok(lvl.level >= 4, 'XP maps to expected higher level');

  const badges = computeAchievements(activeSnap);
  assert.ok(badges.some((b) => b.id === 'ach-portfolio-shipper' && b.unlocked));
  assert.ok(badges.some((b) => b.id === 'ach-multi-subject' && b.unlocked));

  const rubricHigh = evaluateProjectRubric({
    checkedRequirementsCount: 4,
    totalRequirementsCount: 4,
    reflection: 'We designed a relational SQLite schema with foreign keys, handled invalid user amounts safely, wrote automated unit tests for monthly summaries, and refactored file saving into a pure helper module.',
    hasDemoUrl: true,
  });
  assert.ok(rubricHigh.score >= 85 && rubricHigh.status === 'APPROVED');

  const rubricLow = evaluateProjectRubric({
    checkedRequirementsCount: 1,
    totalRequirementsCount: 4,
    reflection: 'Short reflection text here.',
    hasDemoUrl: false,
  });
  assert.ok(rubricLow.score < 70 && rubricLow.status === 'REVIEWED');
});

test('Assessment, Prerequisite Locking, and SM-2 Revision integration', () => {
  const topics = getAllTopics();
  const webJs = topics.find((t) => t.id === 'web-js-01')!;
  assert.equal(computeTopicLockStatus(webJs, new Set()).isLocked, true);
  assert.equal(computeTopicLockStatus(webJs, new Set(['web-css-01'])).isLocked, false);

  const evalRes = evaluateAssessment(
    webJs.assessment.questions,
    webJs.assessment.questions.map((q) => ({ order: q.order, userAnswer: q.correctAnswer })),
    80
  );
  assert.equal(evalRes.passed, true);
  assert.equal(evalRes.score, 100);

  const rev = calculateNextReview(4, { repetitionCount: 1, intervalDays: 1, easeFactor: 2.5 });
  assert.equal(rev.intervalDays, 6);
});
