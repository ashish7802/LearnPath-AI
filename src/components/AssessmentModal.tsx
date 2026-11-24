'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
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

  const handleSelectOption = (order: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [order]: val }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
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
      setResult(data);
      if (data.mastered) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setAnswers({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
              Skill Verification Assessment
            </span>
            <h2 className="text-base font-bold text-white">{topicTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {result ? (
            /* Result View */
            <div className="space-y-6">
              <div
                className={`p-6 rounded-xl border text-center space-y-2 ${
                  result.mastered
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                }`}
              >
                <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-slate-950/40">
                  {result.mastered ? (
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-rose-400" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-white">
                  {result.mastered ? 'Verified Skill Mastery Achieved!' : 'Mastery Threshold Not Reached'}
                </h3>
                <div className="text-3xl font-extrabold font-mono py-1">
                  {result.evaluation?.score}%{' '}
                  <span className="text-xs font-normal text-slate-400">
                    (Required: {passingScore}%)
                  </span>
                </div>
                <p className="text-xs max-w-md mx-auto text-slate-300">{result.message}</p>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Question Breakdown &amp; Explanations
                </h4>
                {result.evaluation?.feedback?.map((fb: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      fb.isCorrect
                        ? 'border-emerald-500/20 bg-slate-950/60'
                        : 'border-rose-500/20 bg-slate-950/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-200">
                        {idx + 1}. {fb.prompt}
                      </span>
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                          fb.isCorrect
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {fb.isCorrect ? 'CORRECT' : 'INCORRECT'}
                      </span>
                    </div>

                    <div className="text-slate-400 pt-1">
                      <span className="text-slate-500">Your Answer:</span> {fb.userAnswer}
                    </div>

                    {!fb.isCorrect && (
                      <div className="text-emerald-400 pt-0.5">
                        <span className="text-slate-500">Correct:</span> {fb.correctAnswer}
                      </div>
                    )}

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] mt-2">
                      <span className="font-semibold text-indigo-400">Why: </span>
                      {fb.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Questions Form */
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={q.order} className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-indigo-600/20 text-indigo-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-slate-200">{q.prompt}</p>
                  </div>

                  {q.codeSnippet && (
                    <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-indigo-300 font-mono text-xs overflow-x-auto">
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
                                ? 'border-indigo-500 bg-indigo-500/15 text-indigo-200'
                                : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <span>{opt}</span>
                            {selected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
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
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
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
          <span className="text-[11px] text-slate-500">
            Passing score: <span className="text-slate-300 font-mono">{passingScore}%</span>
          </span>

          {result ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-300 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={submitting || Object.keys(answers).length === 0}
              onClick={handleSubmit}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Verifying Answers...' : 'Submit Assessment'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
