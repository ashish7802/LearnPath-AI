'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  BookOpen,
  Award
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [planner, setPlanner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/curriculum').then((r) => r.json()),
      fetch('/api/planner').then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json())
    ])
      .then(([curriculumData, plannerData, userData]) => {
        setData({
          curriculum: curriculumData,
          user: userData?.user
        });
        setPlanner(plannerData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading your mastery dashboard...</p>
      </div>
    );
  }

  const topics: any[] = data?.curriculum?.topics || [];
  const studiedCount = topics.filter((t) => t.status === 'STUDIED' || t.status === 'MASTERED').length;
  const masteredCount = topics.filter((t) => t.status === 'MASTERED').length;
  const pendingAssessmentCount = topics.filter((t) => t.status === 'STUDIED').length;
  const weakTopics = topics.filter((t) => t.status === 'NEEDS_REVISION');
  const nextTopic = planner?.nextTopic || topics.find((t) => !t.isLocked && t.status !== 'MASTERED');

  return (
    <div className="space-y-8 py-4">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-indigo-950/20 to-slate-900/90">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[11px] font-mono">
            Active Track: {data?.user?.profile?.careerGoal?.replace('-', ' ').toUpperCase() || 'SOFTWARE ENGINEER'}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Welcome back, {data?.user?.name || 'Engineer'}
          </h1>
          <p className="text-xs text-slate-400">
            Language: <span className="text-slate-200 capitalize">{data?.user?.profile?.preferredLanguage || 'English'}</span> | Daily Target: <span className="text-slate-200">{data?.user?.profile?.dailyStudyMinutes || 60}m</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/roadmap"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <span>View Full Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 6 Core Questions Answers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. What have I learned? */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">1. Topics Studied</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {studiedCount} <span className="text-xs font-normal text-slate-400">/ {topics.length} topics</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Lessons covered and resources reviewed across your curriculum.
          </p>
        </div>

        {/* 2. What have I mastered? */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">2. Verifiably Mastered</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {masteredCount} <span className="text-xs font-normal text-slate-400">passed verification</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Demonstrated by deterministic tests &gt;= 80% passing score.
          </p>
        </div>

        {/* 3. What should I learn today? */}
        <div className="p-5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 space-y-3">
          <div className="flex items-center justify-between text-xs text-indigo-300">
            <span className="font-semibold">3. Today's Recommended Topic</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-sm font-bold text-white line-clamp-1">
            {nextTopic?.title || 'All Foundations Mastered!'}
          </div>
          {nextTopic && (
            <Link
              href={`/topics/${nextTopic.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-200"
            >
              Start Lesson <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* 4. How much time to allocate? */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">4. Recommended Today</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {planner?.schedule?.totalAllocatedMins || 50} <span className="text-xs font-normal text-slate-400">minutes</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Includes lesson reading, hands-on practice, and active recall.
          </p>
        </div>

        {/* 5. What am I weak at? */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">5. Weak Concepts</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {weakTopics.length}{' '}
            <span className="text-xs font-normal text-slate-400">need revision</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {weakTopics.length > 0
              ? `Review: ${weakTopics.map((w) => w.title).join(', ')}`
              : 'Zero weak concepts detected! Great retention.'}
          </p>
        </div>

        {/* 6. What is my next milestone? */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">6. Next Milestone</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-white">
            Personal Expense Tracker CLI
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300"
          >
            Review Project Brief <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Today's Adaptive Schedule Blocks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            Today's Scheduled Study Plan
          </h2>
          <Link href="/planner" className="text-xs text-indigo-400 hover:underline">
            Open Full Planner &amp; Spaced Queue
          </Link>
        </div>

        <div className="space-y-2">
          {planner?.schedule?.blocks?.map((block: any) => (
            <div
              key={block.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {block.type}
                  </span>
                  <h3 className="text-xs sm:text-sm font-semibold text-white">{block.title}</h3>
                </div>
                <p className="text-[11px] text-slate-400">{block.description}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs font-mono text-slate-400">{block.durationMins} mins</span>
                {block.topicId && (
                  <Link
                    href={`/topics/${block.topicId}`}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                  >
                    Open
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
