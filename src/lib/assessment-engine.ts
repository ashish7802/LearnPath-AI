import { Question, CodingChallenge, CodingTestCase } from './curriculum';

export interface QuestionSubmission {
  questionId?: string;
  order: number;
  userAnswer: string;
}

export interface QuestionFeedback {
  order: number;
  questionType: string;
  prompt: string;
  isCorrect: boolean;
  score: number;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  rubricNotes?: string;
}

export interface AssessmentResult {
  passed: boolean;
  score: number; // 0 - 100
  totalQuestions: number;
  correctCount: number;
  passingScore: number;
  feedback: QuestionFeedback[];
}

export function evaluateAssessment(
  questions: Question[],
  submissions: QuestionSubmission[],
  passingScore: number = 80
): AssessmentResult {
  let totalPoints = 0;
  let earnedPoints = 0;
  let correctCount = 0;
  const feedback: QuestionFeedback[] = [];

  for (const q of questions) {
    totalPoints += 100;
    const sub = submissions.find(
      s => (s.order !== undefined && q.order !== undefined && s.order === q.order) ||
           (s.questionId && q.id && s.questionId === q.id)
    );
    const userAns = sub ? (sub.userAnswer || '').trim() : '';

    let isCorrect = false;
    let earned = 0;
    let rubricNotes = '';

    if (q.questionType === 'explain_rubric') {
      // Natural language rubric evaluator
      const criteriaList: string[] = q.rubricCriteria ? JSON.parse(q.rubricCriteria) : [];
      let criteriaMatched = 0;
      const lowerAns = userAns.toLowerCase();

      // Check keywords and conceptual markers
      for (const crit of criteriaList) {
        const keywords = crit.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.length > 3);
        const match = keywords.some(k => lowerAns.includes(k));
        if (match) criteriaMatched++;
      }

      const ratio = criteriaList.length > 0 ? (criteriaMatched / criteriaList.length) : (userAns.length > 30 ? 1 : 0.5);
      earned = Math.round(100 * Math.max(0.4, Math.min(1.0, ratio)));
      isCorrect = earned >= 70;
      rubricNotes = `Matched ${criteriaMatched} of ${criteriaList.length} rubric criteria.`;
    } else {
      // Deterministic check
      const normalizedUser = userAns.toLowerCase().replace(/\s+/g, ' ').trim();
      const normalizedCorrect = (q.correctAnswer || '').toLowerCase().replace(/\s+/g, ' ').trim();
      isCorrect = normalizedUser === normalizedCorrect;
      earned = isCorrect ? 100 : 0;
    }

    if (isCorrect) correctCount++;
    earnedPoints += earned;

    feedback.push({
      order: q.order,
      questionType: q.questionType,
      prompt: q.prompt,
      isCorrect,
      score: earned,
      userAnswer: userAns || '(No answer provided)',
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      rubricNotes
    });
  }

  const finalScore = questions.length > 0 ? Math.round(earnedPoints / questions.length) : 0;

  return {
    passed: finalScore >= passingScore,
    score: finalScore,
    totalQuestions: questions.length,
    correctCount,
    passingScore,
    feedback
  };
}

export interface CodeExecutionTestCaseResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  description: string;
  error?: string;
}

export interface CodeChallengeResult {
  passed: boolean;
  testsPassed: number;
  testsTotal: number;
  visibleResults: CodeExecutionTestCaseResult[];
  hiddenResults: CodeExecutionTestCaseResult[];
  outputLog: string;
}

import { executeCodeChallengeSafely } from './code-sandbox';

// Safe isolated deterministic code evaluator (JavaScript & Python)
export function evaluatePythonChallenge(
  challenge: CodingChallenge,
  submittedCode: string
): CodeChallengeResult {
  return executeCodeChallengeSafely(challenge, submittedCode);
}
