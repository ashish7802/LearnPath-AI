'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Play,
  RotateCcw,
  BookOpen,
  Lightbulb,
} from 'lucide-react';

interface MicroLessonProps {
  topicId: string;
  subtopic: {
    id: string;
    title: string;
    summary: string;
    microLessons: {
      id: string;
      title: string;
      estimatedMins: number;
      xpReward: number;
      meaning: string;
      purpose: string;
      realWorldAnalogy: string;
      stepByStep: string[];
      codeExample?: {
        language: string;
        title: string;
        code: string;
        runnable?: boolean;
        expectedOutput: string;
        lineByLine: { line: string; explanation: string }[];
      };
      practicalUse: string;
      quickCheck: {
        question: string;
        options: string[];
        correctIndex: number;
        explanation: string;
      };
    }[];
  };
  defaultExpanded?: boolean;
  completedIds: Set<string>;
  isLocked: boolean;
  onToggleComplete: (microLessonId: string, nextCompleted: boolean) => Promise<void>;
}

export default function InteractiveMicroLesson({
  subtopic,
  defaultExpanded = true,
  completedIds,
  isLocked,
  onToggleComplete,
}: MicroLessonProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [activeCodeByMl, setActiveCodeByMl] = useState<Record<string, string>>({});
  const [runOutputByMl, setRunOutputByMl] = useState<Record<string, { ok: boolean; text: string }>>({});
  const [runningMl, setRunningMl] = useState<string | null>(null);
  const [selectedChoiceByMl, setSelectedChoiceByMl] = useState<Record<string, number>>({});
  const [savingMl, setSavingMl] = useState<string | null>(null);

  const completedInSubtopic = subtopic.microLessons.filter((m) => completedIds.has(m.id)).length;

  const handleRunExample = async (mlId: string, language: string, defaultCode: string) => {
    const code = activeCodeByMl[mlId] ?? defaultCode;
    const execLang = language === 'python' ? 'python' : 'javascript';
    setRunningMl(mlId);
    try {
      const res = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'playground', language: execLang, code }),
      });
      const data = await res.json();
      if (data.playground) {
        setRunOutputByMl((prev) => ({
          ...prev,
          [mlId]: {
            ok: data.playground.ok,
            text: data.playground.ok
              ? data.playground.output
              : `Error: ${data.playground.error}`,
          },
        }));
      } else {
        setRunOutputByMl((prev) => ({
          ...prev,
          [mlId]: { ok: false, text: data.error || 'Could not run snippet.' },
        }));
      }
    } catch {
      setRunOutputByMl((prev) => ({
        ...prev,
        [mlId]: { ok: false, text: 'Execution failed. Try again.' },
      }));
    } finally {
      setRunningMl(null);
    }
  };

  const handleCompleteClick = async (mlId: string, currentDone: boolean) => {
    setSavingMl(mlId);
    try {
      await onToggleComplete(mlId, !currentDone);
    } finally {
      setSavingMl(null);
    }
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-[#111827] overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-slate-800/40 transition-colors"
      >
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Subtopic</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {completedInSubtopic} of {subtopic.microLessons.length} micro-lessons complete
            </span>
          </div>
          <h3 className="text-base font-semibold text-white">{subtopic.title}</h3>
          <p className="text-sm text-slate-400">{subtopic.summary}</p>
        </div>
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-slate-800 divide-y divide-slate-800/80">
          {subtopic.microLessons.map((ml, mlIndex) => {
            const isDone = completedIds.has(ml.id);
            const chosenIdx = selectedChoiceByMl[ml.id];
            const hasAnswered = chosenIdx !== undefined;
            const isCorrectChoice = chosenIdx === ml.quickCheck.correctIndex;
            const currentCode = activeCodeByMl[ml.id] ?? ml.codeExample?.code ?? '';
            const runOutput = runOutputByMl[ml.id];

            return (
              <article key={ml.id} className="p-6 space-y-6">
                {/* Micro-Lesson Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400 tabular-nums">
                      <span>Micro-Lesson {mlIndex + 1}</span>
                      <span aria-hidden="true">·</span>
                      <span>{ml.estimatedMins} min</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-blue-400">+{ml.xpReward} XP</span>
                    </div>
                    <h4 className="text-lg font-semibold text-white">{ml.title}</h4>
                  </div>

                  <button
                    type="button"
                    disabled={isLocked || savingMl === ml.id}
                    onClick={() => handleCompleteClick(ml.id, isDone)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors disabled:opacity-50 ${
                      isDone
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4" />
                        <span>{savingMl === ml.id ? 'Saving...' : 'Mark Micro-Lesson Complete'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Meaning, Purpose & Analogy */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm leading-relaxed">
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-blue-400">What It Means (Simple Words)</div>
                    <p className="text-slate-200">{ml.meaning}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-slate-300">Why It Exists (Purpose)</div>
                    <p className="text-slate-300">{ml.purpose}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Real-World Analogy</span>
                    </div>
                    <p className="text-slate-300">{ml.realWorldAnalogy}</p>
                  </div>
                </div>

                {/* Step-by-step Walkthrough */}
                <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
                  <h5 className="text-xs font-semibold text-slate-300">Step-by-Step Walkthrough</h5>
                  <ol className="space-y-2 text-sm text-slate-300">
                    {ml.stepByStep.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-3">
                        <span className="font-mono text-xs text-blue-400 tabular-nums mt-0.5 shrink-0">
                          {String(sIdx + 1).padStart(2, '0')}.
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Interactive Runnable Code Example */}
                {ml.codeExample && (
                  <div className="pt-4 border-t border-slate-800/80 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h5 className="text-sm font-semibold text-white">{ml.codeExample.title}</h5>
                        <p className="text-xs text-slate-400">
                          Interactive example · {ml.codeExample.language} · Edit and run directly in the sandbox
                        </p>
                      </div>
                      {ml.codeExample.runnable && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveCodeByMl((prev) => ({
                                ...prev,
                                [ml.id]: ml.codeExample!.code,
                              }));
                              setRunOutputByMl((prev) => {
                                const next = { ...prev };
                                delete next[ml.id];
                                return next;
                              });
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset</span>
                          </button>
                          <button
                            type="button"
                            disabled={runningMl === ml.id}
                            onClick={() =>
                              handleRunExample(ml.id, ml.codeExample!.language, ml.codeExample!.code)
                            }
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>{runningMl === ml.id ? 'Running...' : 'Run Example'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <textarea
                          rows={6}
                          value={currentCode}
                          onChange={(e) =>
                            setActiveCodeByMl((prev) => ({ ...prev, [ml.id]: e.target.value }))
                          }
                          aria-label={`Code editor for ${ml.title}`}
                          spellCheck={false}
                          className="w-full rounded-lg bg-[#0B1120] border border-slate-800 p-3.5 font-mono text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-blue-500 resize-y"
                        />
                        {runOutput ? (
                          <div
                            className={`rounded-lg p-3 font-mono text-xs whitespace-pre-wrap border ${
                              runOutput.ok
                                ? 'bg-[#0B1120] border-emerald-500/30 text-emerald-300'
                                : 'bg-[#0B1120] border-rose-500/30 text-rose-300'
                            }`}
                          >
                            <div className="text-[11px] text-slate-400 mb-1">Sandbox Output:</div>
                            {runOutput.text}
                          </div>
                        ) : (
                          <div className="rounded-lg p-3 bg-[#0B1120] border border-slate-800 font-mono text-xs text-slate-400 whitespace-pre-wrap">
                            <span className="text-slate-500">Expected Output: </span>
                            {ml.codeExample.expectedOutput}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-slate-300">Line-by-Line Explanation</div>
                        <div className="divide-y divide-slate-800 rounded-lg border border-slate-800 bg-[#0B1120]">
                          {ml.codeExample.lineByLine.map((item, idx) => (
                            <div key={idx} className="p-3 space-y-1">
                              <code className="block font-mono text-xs text-blue-300">{item.line}</code>
                              <p className="text-xs text-slate-300">{item.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Practical Use + Quick Check */}
                <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                      <span>Real-World Engineering Application</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{ml.practicalUse}</p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="text-xs font-semibold text-slate-300">Quick Concept Check</div>
                    <p className="text-sm font-medium text-white">{ml.quickCheck.question}</p>
                    <div className="space-y-1.5">
                      {ml.quickCheck.options.map((opt, optIdx) => {
                        const isPicked = chosenIdx === optIdx;
                        const showRight = hasAnswered && optIdx === ml.quickCheck.correctIndex;
                        const showWrong = hasAnswered && isPicked && !isCorrectChoice;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() =>
                              setSelectedChoiceByMl((prev) => ({ ...prev, [ml.id]: optIdx }))
                            }
                            className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs transition-colors ${
                              showRight
                                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                                : showWrong
                                ? 'border-rose-500/50 bg-rose-500/10 text-rose-200'
                                : isPicked
                                ? 'border-blue-500 bg-blue-500/10 text-white'
                                : 'border-slate-800 bg-[#0B1120] text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {hasAnswered && (
                      <p
                        className={`text-xs leading-relaxed pt-1 ${
                          isCorrectChoice ? 'text-emerald-300' : 'text-amber-300'
                        }`}
                      >
                        <strong>{isCorrectChoice ? 'Correct: ' : 'Review: '}</strong>
                        {ml.quickCheck.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
