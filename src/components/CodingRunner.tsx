'use client';

import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, Lightbulb, RotateCcw } from 'lucide-react';

interface Props {
  topicId: string;
  challenge: any;
  onSuccess?: () => void;
}

export default function CodingRunner({ topicId, challenge, onSuccess }: Props) {
  const [code, setCode] = useState(challenge.starterCode || '');
  const [running, setRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [xpNotice, setXpNotice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    setErrorMsg('');
    setXpNotice('');
    try {
      const res = await fetch('/api/coding/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Could not execute tests.');
        return;
      }
      setExecutionResult(data.result);
      if (data.result?.passed) {
        if (data.xpAwarded) {
          setXpNotice(`All tests passed! +${data.xpAwarded} XP recorded.`);
        }
        if (onSuccess) onSuccess();
      }
    } catch {
      setErrorMsg('Network error running sandbox tests.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#111827] overflow-hidden">
      <div className="p-5 border-b border-slate-800 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-base font-semibold text-white">{challenge.title}</h4>
          <span className="text-xs font-mono text-slate-400">
            Language: {challenge.language || 'python'}
          </span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{challenge.instructions}</p>
      </div>

      <div>
        <textarea
          rows={9}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-label={`Code editor for ${challenge.title}`}
          spellCheck={false}
          className="w-full bg-[#0B1120] p-4 font-mono text-sm text-slate-100 leading-relaxed border-none focus:outline-none resize-y"
        />

        <div className="px-5 py-3.5 border-t border-slate-800 bg-[#111827] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-xs font-medium text-amber-300 hover:text-amber-200 inline-flex items-center gap-1.5 transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCode(challenge.starterCode || '');
                setExecutionResult(null);
                setErrorMsg('');
                setXpNotice('');
              }}
              className="text-xs font-medium text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Starter Code</span>
            </button>
          </div>

          <button
            type="button"
            disabled={running}
            onClick={handleRun}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{running ? 'Running Sandbox Tests...' : 'Run Tests'}</span>
          </button>
        </div>
      </div>

      {showHint && (
        <div className="px-5 py-3.5 bg-amber-500/10 border-t border-amber-500/20 text-xs text-amber-200 leading-relaxed">
          <strong>Hint: </strong>
          {challenge.solutionHint}
        </div>
      )}

      {errorMsg && (
        <div className="px-5 py-3 bg-rose-500/10 border-t border-rose-500/20 text-xs text-rose-300">
          {errorMsg}
        </div>
      )}

      {xpNotice && (
        <div className="px-5 py-3 bg-emerald-500/10 border-t border-emerald-500/20 text-xs font-medium text-emerald-300">
          {xpNotice}
        </div>
      )}

      {executionResult && (
        <div className="p-5 border-t border-slate-800 bg-[#0B1120] space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Sandbox Verification Results</span>
            <span
              className={`font-mono font-semibold tabular-nums ${
                executionResult.passed ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {executionResult.testsPassed} / {executionResult.testsTotal} Tests Passed
            </span>
          </div>

          <div className="divide-y divide-slate-800 rounded-lg border border-slate-800 bg-[#111827]">
            {executionResult.visibleResults?.map((t: any, idx: number) => (
              <div key={idx} className="p-3.5 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1 min-w-0">
                  <div className="font-medium text-slate-200">{t.description}</div>
                  <div className="font-mono text-slate-400">
                    Input: {t.input} · Expected: {t.expected} · Actual: {t.actual}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 font-medium shrink-0 ${
                    t.passed ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {t.passed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Pass</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Fail</span>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>

          <p className="font-mono text-xs text-slate-400">{executionResult.outputLog}</p>
        </div>
      )}
    </div>
  );
}
