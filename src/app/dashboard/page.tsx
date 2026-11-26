'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  ShieldCheck,
  Trophy,
  AlertTriangle,
} from 'lucide-react';

export default function DashboardPage() {
  const [curriculum, setCurriculum] = useState<any>(null);
  const [planner, setPlanner] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [demoSigningIn, setDemoSigningIn] = useState(false);

  const loadDashboard = () => {
    Promise.all([
      fetch('/api/curriculum').then((r) => r.json()),
      fetch('/api/planner').then((r) => r.json()),
      fetch('/api/progress/summary').then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
    ])
      .then(([currData, planData, sumData, userData]) => {
        setCurriculum(currData);
        setPlanner(planData);
        setSummary(sumData);
        setUser(userData?.user || null);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleQuickDemoSignIn = async () => {
    setDemoSigningIn(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'learner@learnpath.ai',
          password: 'Password123!',
        }),
      });
      if (res.ok) {
        loadDashboard();
      }
    } finally {
      setDemoSigningIn(false);
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-sm text-slate-400">Loading learner dashboard...</div>;
  }

  const topics: any[] = curriculum?.topics || [];
  const weakTopics = topics.filter((t) => t.status === 'NEEDS_REVISION');
  const nextTopic = planner?.nextTopic || topics.find((t) => !t.isLocked && t.status !== 'MASTERED');
  const activeProject = planner?.activeProject;
  const levelInfo = summary?.level || {
    level: 1,
    title: 'First Spark',
    currentXp: 0,
    nextLevelXp: 120,
    progressPercent: 0,
    xpToNext: 120,
  };
  const achievements: any[] = summary?.achievements || [];
  const unlockedBadges = achievements.filter((a) => a.unlocked).length;
  const subjectMastery: any[] = summary?.subjectMastery || [];

  return (
    <div className="space-y-10 py-4">
      {/* Guest Demo Banner if unauthenticated */}
      {!user && (
        <div className="p-5 rounded-xl border border-blue-500/30 bg-blue-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-white">Save Your XP, Skill Unlocks &amp; Progress</h2>
            <p className="text-xs text-slate-300">
              Sign in with one click using the seeded learner account or create your own free account.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              disabled={demoSigningIn}
              onClick={handleQuickDemoSignIn}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold whitespace-nowrap transition-colors disabled:opacity-50"
            >
              {demoSigningIn ? 'Signing in...' : 'Sign In as Demo Learner'}
            </button>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold whitespace-nowrap"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}

      {/* Learner Hero & XP Level Bar */}
      <section className="p-6 rounded-xl border border-slate-800 bg-[#111827] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-slate-400">
              Active Track: <span className="text-blue-400 font-medium capitalize">{(user?.profile?.careerGoal || 'software-engineer').replace(/-/g, ' ')}</span>
              {' · '}
              Daily Goal: <span className="tabular-nums text-slate-200">{user?.profile?.dailyStudyMinutes || 60} min</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              {user ? `Welcome back, ${user.name}` : 'Learner Mastery Dashboard'}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/onboarding"
              className="px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-200 whitespace-nowrap"
            >
              Update Goals
            </Link>
            <Link
              href={nextTopic ? `/topics/${nextTopic.id}` : '/roadmap'}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-2 whitespace-nowrap"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* XP & Level Progress Bar */}
        <div className="pt-5 border-t border-slate-800 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-display text-sm font-bold text-white tabular-nums">
                Level {levelInfo.level} · {levelInfo.title}
              </span>
              <span className="text-slate-400 tabular-nums">
                <strong className="text-blue-400">{levelInfo.currentXp} XP</strong> earned
              </span>
            </div>
            <span className="text-slate-400 tabular-nums">
              {levelInfo.xpToNext} XP to Level {levelInfo.level + 1}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#0B1120] overflow-hidden border border-slate-800">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* 4 Core KPI Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-slate-800 bg-[#111827] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Verified Topics Mastered</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-display text-2xl font-bold text-white tabular-nums">
            {summary?.stats?.topicsMastered || 0}{' '}
            <span className="text-xs font-normal text-slate-400">/ {summary?.stats?.totalTopics || topics.length}</span>
          </div>
          <p className="text-xs text-slate-400">Passed assessments at 80%+ score.</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-[#111827] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Micro-Lessons Completed</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-display text-2xl font-bold text-white tabular-nums">
            {summary?.stats?.microLessonsCompleted || 0}
          </div>
          <p className="text-xs text-slate-400">Step-by-step concept units completed.</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-[#111827] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Study Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-display text-2xl font-bold text-white tabular-nums">
            {summary?.streakDays || 0}{' '}
            <span className="text-xs font-normal text-slate-400">days</span>
          </div>
          <p className="text-xs text-slate-400">
            {planner?.dueRevisionsCount || 0} spaced review(s) due today.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-[#111827] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Achievements Unlocked</span>
            <Trophy className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-display text-2xl font-bold text-white tabular-nums">
            {unlockedBadges}{' '}
            <span className="text-xs font-normal text-slate-400">/ {achievements.length}</span>
          </div>
          <p className="text-xs text-slate-400">
            {summary?.stats?.projectsSubmitted || 0} portfolio project(s) submitted.
          </p>
        </div>
      </section>

      {/* Main Split: Today's Study Plan + Next Milestone & Weak Concepts */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Today's Adaptive Schedule */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Today&apos;s Adaptive Study Plan</span>
            </h2>
            <Link href="/planner" className="text-xs font-semibold text-blue-400 hover:underline">
              Open Full Planner
            </Link>
          </div>

          <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-[#111827]">
            {(planner?.schedule?.blocks || []).map((block: any) => (
              <div
                key={block.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="text-xs text-slate-400 capitalize">
                    {block.type} · <span className="tabular-nums">{block.durationMins} min</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{block.title}</h3>
                  <p className="text-xs text-slate-400">{block.description}</p>
                </div>
                {block.topicId ? (
                  <Link
                    href={`/topics/${block.topicId}`}
                    className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold whitespace-nowrap shrink-0 self-start sm:self-center"
                  >
                    Open Topic
                  </Link>
                ) : (
                  <Link
                    href="/projects"
                    className="px-3.5 py-2 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold whitespace-nowrap shrink-0 self-start sm:self-center"
                  >
                    View Project
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Next Topic, Milestone Project & Weak Concepts */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl border border-slate-800 bg-[#111827] space-y-2.5">
            <div className="text-xs font-medium text-blue-400">Next Recommended Step</div>
            <h3 className="text-base font-semibold text-white">
              {nextTopic?.title || 'All Topics in This Track Mastered!'}
            </h3>
            {nextTopic && (
              <Link
                href={`/topics/${nextTopic.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                <span>Start Lesson &amp; Micro-Lessons</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-[#111827] space-y-2.5">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Active Milestone Project</span>
              <Award className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-base font-semibold text-white">
              {activeProject?.title || 'Personal Budget & Expense Tracking CLI'}
            </h3>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              <span>Open Project Brief &amp; Rubric</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-[#111827] space-y-2">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Concepts Needing Revision</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            {weakTopics.length > 0 ? (
              <ul className="space-y-1.5">
                {weakTopics.map((w) => (
                  <li key={w.id}>
                    <Link href={`/topics/${w.id}`} className="text-xs text-rose-300 hover:underline">
                      {w.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">
                No weak concepts flagged right now. Keep practicing in the{' '}
                <Link href="/practice?tab=revision" className="text-blue-400 hover:underline">
                  Revision Queue
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Subject-by-Subject Mastery Breakdown */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">Mastery Across Technology Subjects</h2>
          <Link href="/skill-tree" className="text-xs font-semibold text-blue-400 hover:underline">
            Inspect Full Skill Tree
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectMastery.map((subj) => (
            <div
              key={subj.subjectId}
              className="p-4 rounded-xl border border-slate-800 bg-[#111827] space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">{subj.title}</span>
                <span className="font-mono text-slate-400 tabular-nums">
                  {subj.masteredTopics}/{subj.totalTopics} ({subj.percent}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#0B1120] overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${subj.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements & Badges Gallery */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-white">Achievements &amp; Milestones</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border space-y-2 ${
                badge.unlocked
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-slate-800 bg-[#111827] opacity-75'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className={badge.unlocked ? 'font-semibold text-emerald-400' : 'text-slate-500'}>
                  {badge.unlocked ? 'Unlocked' : 'Locked'}
                </span>
                <span className="font-mono text-blue-400 tabular-nums">+{badge.xpBonus} XP</span>
              </div>
              <h3 className="text-sm font-semibold text-white">{badge.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{badge.description}</p>
              <div className="text-[11px] text-slate-500 pt-1">Goal: {badge.requirementText}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
