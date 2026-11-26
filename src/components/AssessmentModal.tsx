'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface Props {
  topicId: string;
  topicTitle: string;
  questions: any[];
  passingScore: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssessmentModal({
  topicId,
  topicTitle,
  questions,
  passingScore,
  onClose,
  onSuccess
}: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [authError, setAuthError] = useState('');

  const handleSelectOption = (order: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [order]: val }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setAuthError('');
    try {
      const payload = questions.map((q) => ({
        order: q.order,
        questionId: q.id,
        userAnswer: answers[q.order] || ''
      }));

      const res = await fetch('/api/assessments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, answers: payload })
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(
          res.status === 401
            ? 'Please sign in to save your mastery verification and unlock downstream skills.'
            : data.error || 'Could not submit assessment.'
        );
        return;
      }

      setResult(data);
      if (data.mastered) {
        onSuccess();
      }
    } catch {
      setAuthError('Network error while grading assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setAuthError('');
    setAnswers({});
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Skill Verification Assessment: ${topicTitle}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-[#111827] border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="space-y-0.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-semibold">
              Skill Verification Assessment
            </span>
            <h2 className="font-display text-base font-bold text-slate-50">{topicTitle}</h2>
          </div>
          <button
            type="button"
            aria-label="Close assessment"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {authError && (
            <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-200 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                {authError}
              </span>
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium whitespace-nowrap self-start sm:self-auto"
              >
                Sign In
              </Link>
            </div>
          )}

          {result ? (
            <div className="space-y-6">
              <div
                className={`p-6 rounded-xl border text-center space-y-2 ${
                  result.mastered
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                }`}
              >
                <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-slate-950/50">
                  {result.mastered ? (
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-rose-400" />
                  )}
                </div>
                <h3 className="font-display text-lg font-bold text-slate-50">
                  {result.mastered ? 'Verified Skill Mastery Achieved' : 'Mastery Threshold Not Reached'}
                </h3>
                <div className="text-3xl font-extrabold font-mono py-1 tabular-nums text-slate-50">
                  {result.evaluation?.score}%{' '}
                  <span className="text-xs font-normal text-slate-300">
                    (Required: {passingScore}%)
                  </span>
                </div>
                <p className="text-xs max-w-md mx-auto text-slate-200">{result.message}</p>
              </div>

              {result.remediation && (
                <div className="p-4 rounded-xl border border-blue-500/30 bg-[#0B1120] space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-blue-400 font-semibold">
                      Adaptive Diagnostic &amp; Remediation Engine
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {result.remediation.passed ? 'Ready for Next Skill' : 'Targeted Micro-Lesson Review'}
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{result.remediation.explanation}</p>

                  {result.remediation.recommendedMicroLessons?.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="font-semibold text-slate-300">
                        Recommended Micro-Lessons to Review Before Retaking:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {result.remediation.recommendedMicroLessons.map((ml: any) => (
                          <div
                            key={ml.id}
                            className="p-2.5 rounded-lg border border-slate-800 bg-[#111827] space-y-1"
                          >
                            <div className="text-[11px] text-blue-400 font-medium">{ml.subtopicTitle}</div>
                            <div className="font-semibold text-white">{ml.title}</div>
                            <div className="text-[11px] text-slate-400 leading-snug">{ml.reason}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800/80 text-slate-300 flex items-center justify-between gap-2">
                    <span>
                      <strong className="text-blue-400">Next Action:</strong> {result.remediation.nextActionText}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Question Breakdown &amp; Explanations
                </h4>
                {result.evaluation?.feedback?.map((fb: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      fb.isCorrect
                        ? 'border-emerald-500/25 bg-slate-950/60'
                        : 'border-rose-500/25 bg-slate-950/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-100">
                        {idx + 1}. {fb.prompt}
                      </span>
                      <span
                        className={`font-mono text-[11px] font-semibold shrink-0 ${
                          fb.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {fb.isCorrect ? 'CORRECT' : 'INCORRECT'}
                      </span>
                    </div>

                    <div className="text-slate-300 pt-1">
                      <span className="text-slate-500">Your Answer:</span> {fb.userAnswer}
                    </div>

                    {!fb.isCorrect && (
                      <div className="text-emerald-400 pt-0.5">
                        <span className="text-slate-500">Correct:</span> {fb.correctAnswer}
                      </div>
                    )}

                    <div className="p-2.5 rounded-lg bg-[#111827] border border-slate-800 text-slate-300 text-xs mt-2">
                      <span className="font-semibold text-blue-400">Why: </span>
                      {fb.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {questions.map((q, idx) => (
                <div key={q.order} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded bg-blue-600/20 text-blue-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/30 tabular-nums">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-slate-100">{q.prompt}</p>
                  </div>

                  {q.codeSnippet && (
                    <pre className="p-3 rounded-lg bg-[#0B1120] border border-slate-800 text-blue-200 font-mono text-xs overflow-x-auto">
                      <code>{q.codeSnippet}</code>
                    </pre>
                  )}

                  {q.options && q.options.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      {q.options.map((opt: string, optIdx: number) => {
                        const selected = answers[q.order] === opt;
                        return (
                          <button
                            type="button"
                            key={optIdx}
                            onClick={() => handleSelectOption(q.order, opt)}
                            className={`w-full p-2.5 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${
                              selected
                                ? 'border-blue-500 bg-blue-500/15 text-blue-100'
                                : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span>{opt}</span>
                            {selected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="pt-1">
                      <textarea
                        rows={3}
                        value={answers[q.order] || ''}
                        onChange={(e) => handleSelectOption(q.order, e.target.value)}
                        placeholder="Write your explanation in plain English or Hinglish..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Passing score: <span className="text-slate-100 font-mono tabular-nums">{passingScore}%</span>
          </span>

          {result ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-200 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={submitting || Object.keys(answers).length === 0}
              onClick={handleSubmit}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              <span>{submitting ? 'Verifying Answers...' : 'Submit Assessment'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
