'use client';

import React, { useState } from 'react';
import {
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Terminal,
  ShieldCheck
} from 'lucide-react';

interface Props {
  topicId: string;
  challenge: any;
  onSuccess?: () => void;
}

export default function CodingRunner({ topicId, challenge, onSuccess }: Props) {
  const [code, setCode] = useState(challenge.starterCode || '');
  const [running, setRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [showHint, setShowHint] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    try {
      const res = await fetch('/api/coding/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, code })
      });
      const data = await res.json();
      setExecutionResult(data.result);
      if (data.result?.passed && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden space-y-0">
      {/* Instructions Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            {challenge.title}
          </h4>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
            {challenge.language?.toUpperCase() || 'PYTHON'}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{challenge.instructions}</p>
      </div>

      {/* Editor & Controls */}
      <div className="relative">
        <textarea
          rows={10}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="w-full bg-slate-950 p-4 font-mono text-xs text-indigo-300 leading-relaxed border-none focus:outline-none focus:ring-0 resize-y"
        />

        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            {showHint ? 'Hide Hint' : 'Need a Progressive Hint?'}
          </button>

          <button
            type="button"
            disabled={running}
            onClick={handleRun}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {running ? 'Running Tests...' : 'Execute & Run Test Suite'}
          </button>
        </div>
      </div>

      {/* Progressive Hint Drawer */}
      {showHint && (
        <div className="p-4 bg-amber-500/10 border-t border-amber-500/20 text-xs text-amber-300 space-y-1">
          <div className="font-semibold flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5" /> Conceptual Hint:
          </div>
          <p className="text-[11px] leading-relaxed">{challenge.solutionHint}</p>
        </div>
      )}

      {/* Test Execution Output */}
      {executionResult && (
        <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">Test Execution Results:</span>
            <span
              className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                executionResult.passed
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {executionResult.testsPassed} / {executionResult.testsTotal} Passed
            </span>
          </div>

          <div className="space-y-1.5">
            {executionResult.visibleResults?.map((t: any, idx: number) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="text-[11px] text-slate-300 font-medium">{t.description}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Input: {t.input}</div>
                </div>
                {t.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded bg-slate-900 text-[10px] font-mono text-slate-400 border border-slate-800">
            {executionResult.outputLog}
          </div>
        </div>
      )}
    </div>
  );
}
