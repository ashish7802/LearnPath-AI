'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Brain,
  FolderGit2,
  X
} from 'lucide-react';

interface StudyBlock {
  id: string;
  type: 'revision' | 'lesson' | 'practice' | 'project';
  title: string;
  topicId?: string;
  durationMins: number;
  description: string;
}

interface RevisionItem {
  id: string;
  topicId: string;
  title: string;
  intervalDays: number;
  repetitionCount: number;
  easeFactor: number;
  nextReviewDate: string;
}

interface PlannerResponse {
  authenticated?: boolean;
  schedule?: {
    date: string;
    dayOfWeek: string;
    totalAllocatedMins: number;
    blocks: StudyBlock[];
  };
  dueRevisionsCount?: number;
  revisionQueue?: RevisionItem[];
  activeProject?: {
    id: string;
    title: string;
    careerPathId: string;
    phaseNumber: number;
    description: string;
  } | null;
}

export default function PlannerPage() {
  const [planner, setPlanner] = useState<PlannerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);
  const [message, setMessage] = useState('');
  const [reviewingTopicId, setReviewingTopicId] = useState<string | null>(null);

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
      setMessage('Schedule redistributed across your available study days without streak penalties.');
    }, 350);
  };

  const handleQuickReview = async (topicId: string, quality: number) => {
    setReviewingTopicId(topicId);
    try {
      const res = await fetch('/api/revision/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, quality })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'SM-2 spaced revision logged (+20 XP).');
        loadPlanner();
      } else {
        setMessage(data.error || 'Sign in to save your spaced revision interval.');
      }
    } catch {
      setMessage('Could not record review right now. Please try again.');
    } finally {
      setReviewingTopicId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const schedule = planner?.schedule;
  const revisionQueue = planner?.revisionQueue || [];

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-mono uppercase tracking-wider text-blue-400">
            SuperMemo-2 Spaced Repetition · Adaptive Daily Blocks
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-50 tracking-tight">
            Adaptive Study Planner
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Balanced daily blocks across spaced revision, structured lessons, and hands-on coding practice.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRecalculate}
          disabled={rescheduling}
          className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-blue-400 ${rescheduling ? 'animate-spin' : ''}`} />
          <span>Recalculate Plan</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {message}
          </span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setMessage('')}
            className="text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {!planner?.authenticated && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-slate-300">
            Viewing the starter 60-minute beginner schedule. Sign in to personalize daily minutes, available days, and SM-2 spaced repetition intervals.
          </p>
          <Link
            href="/login"
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            Sign In to Personalize
          </Link>
        </div>
      )}

      {/* Session Overview */}
      <div className="p-6 rounded-xl border border-slate-800 bg-[#111827] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-600/15 text-blue-400 border border-blue-500/25">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-mono text-slate-400">
              {schedule?.dayOfWeek} · {schedule?.date}
            </p>
            <h2 className="font-display text-lg font-semibold text-slate-50">
              Today&apos;s Study Session
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-8 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] uppercase font-mono">Planned Time</span>
            <span className="text-xl font-bold text-slate-50 font-mono tabular-nums">
              {schedule?.totalAllocatedMins || 60} mins
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase font-mono">Due Reviews</span>
            <span className="text-xl font-bold text-blue-400 font-mono tabular-nums">
              {planner?.dueRevisionsCount || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Scheduled Blocks */}
      <div className="space-y-3">
        <h3 className="font-display text-base font-semibold text-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          Scheduled Study Blocks
        </h3>

        <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-[#111827] overflow-hidden">
          {schedule?.blocks?.map((block, idx) => (
            <div
              key={block.id}
              className="p-5 hover:bg-slate-900/50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <span className="w-7 h-7 rounded-md bg-slate-900 text-slate-300 font-mono text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5 border border-slate-700 tabular-nums">
                  {idx + 1}
                </span>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span
                      className={`text-[11px] uppercase font-mono font-semibold ${
                        block.type === 'revision'
                          ? 'text-amber-400'
                          : block.type === 'practice'
                          ? 'text-emerald-400'
                          : 'text-blue-400'
                      }`}
                    >
                      {block.type}
                    </span>
                    <span className="text-slate-600">·</span>
                    <h4 className="text-sm font-semibold text-slate-100">{block.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{block.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 pl-10 sm:pl-0">
                <span className="text-xs font-mono text-slate-400 tabular-nums">{block.durationMins}m</span>
                {block.topicId ? (
                  <Link
                    href={`/topics/${block.topicId}`}
                    className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <span>Start Block</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    href="/practice"
                    className="px-3.5 py-2 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <span>Open Practice</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inline SM-2 Spaced Revision Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-100 flex items-center gap-2">
                <Brain className="w-4 h-4 text-amber-400" />
                Spaced Revision Queue (SM-2)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Rate how well you recall a mastered topic to schedule the next optimal review interval.
              </p>
            </div>
            <Link
              href="/practice?tab=revision"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium whitespace-nowrap"
            >
              Flashcard Deck →
            </Link>
          </div>

          {revisionQueue.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-800 rounded-lg">
              All caught up! Complete a topic assessment to add concepts to your long-term memory queue.
            </p>
          ) : (
            <div className="space-y-3">
              {revisionQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg border border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <Link
                      href={`/topics/${item.topicId}`}
                      className="text-sm font-semibold text-slate-100 hover:text-blue-400 transition-colors"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs font-mono text-slate-400 mt-0.5 tabular-nums">
                      Interval {item.intervalDays}d · Repetitions {item.repetitionCount ?? 0} · Ease {Number(item.easeFactor || 2.5).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {[
                      { label: 'Again', q: 1, cls: 'border-rose-500/30 text-rose-300 hover:bg-rose-500/10' },
                      { label: 'Good', q: 4, cls: 'border-blue-500/30 text-blue-300 hover:bg-blue-500/10' },
                      { label: 'Easy', q: 5, cls: 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10' }
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        type="button"
                        disabled={reviewingTopicId === item.topicId}
                        onClick={() => handleQuickReview(item.topicId, btn.q)}
                        className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors disabled:opacity-50 ${btn.cls}`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Career Milestone Project Card */}
        <div className="rounded-xl border border-slate-800 bg-[#111827] p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5" />
              Next Milestone Project
            </p>
            {planner?.activeProject ? (
              <>
                <h3 className="font-display text-base font-semibold text-slate-100">
                  {planner.activeProject.title}
                </h3>
                <p className="text-xs font-mono text-slate-400 capitalize">
                  Phase {planner.activeProject.phaseNumber} · {planner.activeProject.careerPathId.replace(/-/g, ' ')}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {planner.activeProject.description}
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-400">
                Explore real portfolio projects with requirement checklists and rubric scoring.
              </p>
            )}
          </div>
          <Link
            href="/projects"
            className="w-full py-2.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-900 text-slate-100 text-xs font-medium text-center transition-colors"
          >
            Open Portfolio Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
