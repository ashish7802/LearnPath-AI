'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Code2,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import CodingRunner from '@/components/CodingRunner';
import AssessmentModal from '@/components/AssessmentModal';
import InteractiveMicroLesson from '@/components/InteractiveMicroLesson';

export default function TopicPage() {
  const params = useParams();
  const topicId = params.id as string;

  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [markingStudied, setMarkingStudied] = useState(false);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [completedMicroIds, setCompletedMicroIds] = useState<Set<string>>(new Set());

  const loadTopic = useCallback(() => {
    fetch(`/api/topics/${topicId}`)
      .then((res) => res.json())
      .then((data) => {
        setTopic(data);
        setCompletedMicroIds(new Set(data?.completedMicroLessonIds || []));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [topicId]);

  useEffect(() => {
    loadTopic();
  }, [loadTopic]);

  const handleToggleMicroLesson = async (microLessonId: string, nextCompleted: boolean) => {
    setStatusMessage('');
    const res = await fetch('/api/progress/micro-lesson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId, microLessonId, completed: nextCompleted }),
    });
    const data = await res.json();
    if (res.ok) {
      setCompletedMicroIds(new Set(data.completedMicroLessonIds || []));
      if (nextCompleted) {
        setStatusMessage(`Micro-lesson completed! +${data.xpAwarded || 15} XP saved.`);
      }
      loadTopic();
    } else {
      setStatusMessage(data.error || 'Please sign in to save micro-lesson progress.');
    }
  };

  const handleMarkStudied = async () => {
    setMarkingStudied(true);
    setStatusMessage('');
    try {
      const res = await fetch('/api/progress/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage('Topic marked as Studied (+25 XP). Take the verification assessment below to prove mastery.');
        loadTopic();
      } else {
        setStatusMessage(data.error || 'Please sign in to save topic progress.');
      }
    } catch {
      setStatusMessage('Error updating status.');
    } finally {
      setMarkingStudied(false);
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-sm text-slate-400">Loading lesson layers...</div>;
  }

  if (!topic || topic.error) {
    return (
      <div className="py-20 text-center space-y-4">
        <h1 className="font-display text-xl font-bold text-white">Topic Not Found</h1>
        <Link href="/roadmap" className="text-sm font-semibold text-blue-400 hover:underline">
          Return to Curriculum
        </Link>
      </div>
    );
  }

  const isMastered = topic.userProgress?.status === 'MASTERED';
  const isStudied = topic.userProgress?.status === 'STUDIED' || isMastered;
  const totalMicroCount = (topic.subtopics || []).reduce(
    (sum: number, st: any) => sum + (st.microLessons?.length || 0),
    0
  );

  return (
    <div className="space-y-10 py-4 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Curriculum</span>
        </Link>

        <div className="text-xs font-medium tabular-nums">
          {isMastered ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              Verified Mastered ({topic.userProgress?.bestScore}%)
            </span>
          ) : (
            <span className="text-slate-300">
              Status: {topic.userProgress?.status?.replace('_', ' ') || 'NOT STARTED'} ·{' '}
              {completedMicroIds.size}/{totalMicroCount} micro-lessons complete
            </span>
          )}
        </div>
      </div>

      {/* Locked Prerequisite Notice */}
      {topic.isLocked && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-amber-200">
          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Prerequisite Lock Active:</strong> You can read this lesson preview, but mastering{' '}
              <span className="underline">{topic.missingPrereqs?.join(', ')}</span> is required before unlocking progress &amp; assessments here.
            </div>
          </div>
          <Link
            href="/skill-tree"
            className="text-xs font-semibold text-amber-100 underline whitespace-nowrap shrink-0"
          >
            View Skill Tree
          </Link>
        </div>
      )}

      {!topic.authenticated && (
        <div className="p-4 rounded-xl border border-slate-800 bg-[#111827] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <span>
            You are reading in open preview mode. Sign in to save completed micro-lessons, earn XP, and unlock prerequisite skills.
          </span>
          <Link
            href="/login"
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold whitespace-nowrap shrink-0 text-center"
          >
            Sign In / Demo Account
          </Link>
        </div>
      )}

      {statusMessage && (
        <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-200 text-sm flex items-center justify-between gap-4">
          <span>{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage('')}
            aria-label="Dismiss status message"
            className="text-slate-300 hover:text-white text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Topic Header */}
      <header className="space-y-3 pb-6 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 tabular-nums">
          <span>{topic.moduleTitle}</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{topic.difficulty}</span>
          <span aria-hidden="true">·</span>
          <span>{topic.estimatedLessonMins + topic.estimatedPracticeMins} min total</span>
          <span aria-hidden="true">·</span>
          <span>Mastery bar: {topic.masteryThreshold}%</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
          {topic.title}
        </h1>
        <p className="text-base text-slate-300 leading-relaxed max-w-3xl">
          {topic.plainExplanation}
        </p>
      </header>

      {/* Why It Matters & Learning Objectives */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-2.5">
          <h2 className="text-sm font-semibold text-blue-400">Why This Matters in Real Engineering</h2>
          <p className="text-sm text-slate-300 leading-relaxed">{topic.whyItMatters}</p>
        </div>

        <div className="space-y-2.5">
          <h2 className="text-sm font-semibold text-slate-200">What You Will Be Able to Do</h2>
          <ul className="space-y-2">
            {topic.learningObjectives?.map((obj: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Deep Nested Subtopics & Micro-Lessons */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold text-white">
            Step-by-Step Subtopics &amp; Micro-Lessons
          </h2>
          <p className="text-sm text-slate-400">
            Work through each micro-lesson in order, run the interactive examples, answer the quick check, and mark it complete.
          </p>
        </div>

        <div className="space-y-4">
          {(topic.subtopics || []).map((st: any, idx: number) => (
            <InteractiveMicroLesson
              key={st.id}
              topicId={topic.id}
              subtopic={st}
              defaultExpanded={idx === 0}
              completedIds={completedMicroIds}
              isLocked={topic.isLocked}
              onToggleComplete={handleToggleMicroLesson}
            />
          ))}
        </div>
      </section>

      {/* Common Beginner Mistakes */}
      {topic.commonMistakes?.length > 0 && (
        <section className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-3">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Common Beginner Mistakes to Avoid</span>
          </h2>
          <ul className="space-y-2 text-sm text-slate-300">
            {topic.commonMistakes.map((mistake: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="font-mono text-xs text-amber-400 mt-0.5">0{idx + 1}.</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Practical Coding Challenge */}
      {topic.codingChallenge && (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-400" />
            <span>Hands-On Coding Challenge</span>
          </h2>
          <CodingRunner
            topicId={topic.id}
            challenge={topic.codingChallenge}
            onSuccess={() => loadTopic()}
          />
        </section>
      )}

      {/* Verified Free Learning Resources */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <span>Verified Free Study Resources</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topic.resources?.map((res: any, idx: number) => (
            <a
              key={idx}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-xl border border-slate-800 bg-[#111827] hover:border-slate-700 transition-colors flex flex-col justify-between gap-4 group"
            >
              <div className="space-y-1.5">
                <div className="text-xs text-slate-400">
                  {res.provider} · 100% Free · Verified {res.verifiedAt}
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {res.title}
                </h3>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400">
                <span>Open Official Resource</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Mastery Verification Bar */}
      <section className="p-6 rounded-xl border border-slate-800 bg-[#111827] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-white">Verify Your Mastery &amp; Unlock Next Topic</h2>
          <p className="text-sm text-slate-400">
            Score at least <span className="font-mono text-white tabular-nums">{topic.masteryThreshold}%</span> on the deterministic verification assessment to earn +100 XP and unlock dependent skills.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleMarkStudied}
            disabled={markingStudied || isStudied || topic.isLocked}
            className="px-4 py-2.5 rounded-lg border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-200 disabled:opacity-50 transition-colors"
          >
            {isStudied ? 'Lesson Studied' : markingStudied ? 'Saving...' : 'Mark as Studied'}
          </button>

          <button
            type="button"
            disabled={topic.isLocked}
            onClick={() => setAssessmentOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isMastered ? 'Retake Assessment' : 'Take Verification Assessment'}</span>
          </button>
        </div>
      </section>

      {assessmentOpen && (
        <AssessmentModal
          topicId={topic.id}
          topicTitle={topic.title}
          questions={topic.assessment?.questions || []}
          passingScore={topic.assessment?.passingScore || 80}
          onClose={() => setAssessmentOpen(false)}
          onSuccess={() => loadTopic()}
        />
      )}
    </div>
  );
}
