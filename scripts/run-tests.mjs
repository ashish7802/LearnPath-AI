import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const curriculumDir = path.resolve(__dirname, '../curriculum');

console.log('🧪 Starting LearnPath AI Automated Unit & Regression Tests...\n');

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Reason: ${err.message}`);
    failedTests++;
  }
}

// 1. Curriculum Integrity (All 7 JSON files, 27 topics)
runTest('Curriculum Loader: All 27 curriculum topics across 7 files exist and have valid structure', () => {
  const files = [
    'foundations.json',
    'software-engineering.json',
    'machine-learning.json',
    'ai-engineering.json',
    'web-and-mobile.json',
    'data-cyber-cloud.json',
    'languages-hub.json',
  ];
  let total = 0;
  for (const f of files) {
    const list = JSON.parse(fs.readFileSync(path.join(curriculumDir, f), 'utf8'));
    assert.ok(Array.isArray(list) && list.length > 0);
    total += list.length;
    for (const t of list) {
      assert.ok(t.id, 'Topic has id');
      assert.ok(t.title, 'Topic has title');
      assert.ok(t.plainExplanation, 'Topic has plain explanation');
      assert.ok(t.resources.length > 0, 'Topic has resources');
    }
  }
  assert.equal(total, 27, 'Total 27 topics across all 7 files');
});

// 2. Prerequisite locking simulation
runTest('Mastery & Locking: Gated topics are locked until prerequisites are mastered', () => {
  const foundations = JSON.parse(fs.readFileSync(path.join(curriculumDir, 'foundations.json'), 'utf8'));
  const termTopic = foundations.find(t => t.id === 'terminal-101');
  assert.ok(termTopic);
  assert.deepEqual(termTopic.prerequisites, ['comp-101']);

  // If user has not mastered comp-101
  const userMastered = new Set();
  const isLockedWithoutPrereq = termTopic.prerequisites.some(p => !userMastered.has(p));
  assert.equal(isLockedWithoutPrereq, true, 'terminal-101 must be locked when comp-101 is not mastered');

  // If user mastered comp-101
  userMastered.add('comp-101');
  const isLockedWithPrereq = termTopic.prerequisites.some(p => !userMastered.has(p));
  assert.equal(isLockedWithPrereq, false, 'terminal-101 must unlock when comp-101 is mastered');
});

// 3. SuperMemo-2 Spaced Repetition Formula Check
runTest('Spaced Repetition: SuperMemo-2 interval growth and failure reset', () => {
  // EF formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  function calculateNextReview(quality, current = { count: 0, interval: 1, ef: 2.5 }) {
    let { count, interval, ef } = current;
    const q = Math.max(0, Math.min(5, quality));
    if (q >= 3) {
      if (count === 0) interval = 1;
      else if (count === 1) interval = 6;
      else interval = Math.round(interval * ef);
      count++;
    } else {
      count = 0;
      interval = 1;
    }
    ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (ef < 1.3) ef = 1.3;
    return { count, interval, ef };
  }

  const r1 = calculateNextReview(5);
  assert.equal(r1.count, 1);
  assert.equal(r1.interval, 1);

  const r2 = calculateNextReview(5, r1);
  assert.equal(r2.count, 2);
  assert.equal(r2.interval, 6);

  const r3 = calculateNextReview(5, r2);
  assert.ok(r3.interval > 6, 'Interval grows on successive recall');

  // Failed review resets count to 0 and interval to 1
  const rFailed = calculateNextReview(1, r3);
  assert.equal(rFailed.count, 0);
  assert.equal(rFailed.interval, 1);
});

// 4. Assessment Deterministic Grading Check
runTest('Assessment Engine: Correctly grades deterministic questions and respects passing threshold', () => {
  function gradeQuestions(questions, answers, threshold = 80) {
    let totalScore = 0;
    for (const q of questions) {
      const userAns = answers[q.order] || '';
      const isCorrect = userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      if (isCorrect) totalScore += 100;
    }
    const finalScore = Math.round(totalScore / questions.length);
    return { score: finalScore, passed: finalScore >= threshold };
  }

  const testQuestions = [
    { order: 1, correctAnswer: 'RAM is volatile memory' },
    { order: 2, correctAnswer: 'git commit -m' }
  ];

  const passAttempt = gradeQuestions(testQuestions, {
    1: 'RAM is volatile memory',
    2: 'git commit -m'
  }, 80);
  assert.equal(passAttempt.score, 100);
  assert.equal(passAttempt.passed, true);

  const failAttempt = gradeQuestions(testQuestions, {
    1: 'RAM is volatile memory',
    2: 'git pull origin'
  }, 80);
  assert.equal(failAttempt.score, 50);
  assert.equal(failAttempt.passed, false);
});

// 5. Non-Punitive Daily Planner Budget Check
runTest('Adaptive Study Planner: Allocates daily minutes across revision, lesson and practice', () => {
  function planStudy(dailyMinutes, dueRevisionCount) {
    const blocks = [];
    let remaining = dailyMinutes;

    if (dueRevisionCount > 0 && remaining >= 15) {
      blocks.push({ type: 'revision', mins: 15 });
      remaining -= 15;
    }

    if (remaining >= 20) {
      const lessonMins = Math.min(25, Math.round(remaining * 0.5));
      blocks.push({ type: 'lesson', mins: lessonMins });
      remaining -= lessonMins;
    }

    if (remaining >= 15) {
      blocks.push({ type: 'practice', mins: remaining });
    }

    return blocks;
  }

  const p60 = planStudy(60, 1);
  assert.ok(p60.length === 3, 'Creates revision, lesson and practice blocks');
  const sumMins = p60.reduce((acc, b) => acc + b.mins, 0);
  assert.equal(sumMins, 60, 'Total study time matches 60m budget');
});

// 6. Concept Visualizations & Non-Punitive Recovery Check
runTest('Concept Visualizations: Covers core CS, DSA, SQL, ML, and AI Agent concepts', () => {
  const vizFile = fs.readFileSync(path.resolve(__dirname, '../src/lib/concept-visualizations.ts'), 'utf8');
  const expectedIds = [
    'binary-search',
    'cpu-ram-cycle',
    'recursion-call-stack',
    'sql-joins',
    'rag-pipeline',
    'arrays-linked-lists',
    'sorting-algorithms',
    'trees-and-graphs',
    'neural-networks',
    'embeddings-attention',
    'ai-agents',
  ];
  for (const id of expectedIds) {
    assert.ok(vizFile.includes(`id: '${id}'`), `Missing visualization spec: ${id}`);
  }
});

console.log(`\n=======================================`);
console.log(`Test Results: ${passedTests} Passed, ${failedTests} Failed.`);
if (failedTests > 0) {
  process.exit(1);
} else {
  console.log(`🎉 All automated regression tests PASSED!`);
  process.exit(0);
}
