'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function PlannerPage() {
  const [planner, setPlanner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);
  const [message, setMessage] = useState('');

  const loadPlanner = () => {
    fetch('/api/planner')
      .then((res) => res.json())
      .then((data) => setPlanner(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPlanner();
  }, []);

  const handleRecalculate = () => {
    setRescheduling(true);
    setTimeout(() => {
      loadPlanner();
      setRescheduling(false);
      setMessage('Schedule dynamically redistributed across available days without penalty!');
    }, 600);
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const schedule = planner?.schedule;

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Smart Adaptive Study Planner</h1>
          <p className="text-xs text-slate-400">
            Powered by SuperMemo-2 (SM-2) spaced repetition and non-punitive rescheduling.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRecalculate}
          disabled={rescheduling}
          className="px-4 py-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${rescheduling ? 'animate-spin' : ''}`} />
          <span>Missed a Day? Recalculate Plan</span>
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Date Card & Daily Target Summary */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold">
              {schedule?.dayOfWeek} • {schedule?.date}
            </span>
            <h2 className="text-lg font-bold text-white">Today's Personalized Study Session</h2>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-mono">Planned</span>
            <span className="text-lg font-bold text-white font-mono">{schedule?.totalAllocatedMins} mins</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-mono">Spaced Reviews</span>
            <span className="text-lg font-bold text-indigo-400 font-mono">{planner?.dueRevisionsCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Study Blocks Timeline */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Scheduled Study Blocks
        </h3>

        <div className="space-y-3">
          {schedule?.blocks?.map((block: any, idx: number) => (
            <div
              key={block.id}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">
                  {idx + 1}
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                        block.type === 'revision'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : block.type === 'practice'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {block.type}
                    </span>
                    <h4 className="text-sm font-bold text-white">{block.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{block.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 pl-9 sm:pl-0">
                <span className="text-xs font-mono text-slate-400">{block.durationMins}m</span>
                {block.topicId && (
                  <Link
                    href={`/topics/${block.topicId}`}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Launch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
