'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  Code2,
  Play,
  Sparkles,
  Lock,
  AlertCircle
} from 'lucide-react';
import CodingRunner from '@/components/CodingRunner';
import AssessmentModal from '@/components/AssessmentModal';

export default function TopicPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.id as string;

  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [markingStudied, setMarkingStudied] = useState(false);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const loadTopic = () => {
    fetch(`/api/topics/${topicId}`)
      .then((res) => res.json())
      .then((data) => setTopic(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTopic();
  }, [topicId]);

  const handleMarkStudied = async () => {
    setMarkingStudied(true);
    setStatusMessage('');
    try {
      const res = await fetch('/api/progress/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage('Topic marked as STUDIED! Take the assessment to prove mastery.');
        loadTopic();
      } else {
        setStatusMessage(data.error || 'Failed to update status');
      }
    } catch {
      setStatusMessage('Error updating status');
    } finally {
      setMarkingStudied(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!topic || topic.error) {
    return (
      <div className="py-16 text-center space-y-4">
        <h1 className="text-xl font-bold text-white">Topic Not Found</h1>
        <Link href="/roadmap" className="text-xs text-indigo-400 hover:underline">
          Return to Roadmap
        </Link>
      </div>
    );
  }

  const isMastered = topic.userProgress?.status === 'MASTERED';
  const isStudied = topic.userProgress?.status === 'STUDIED' || isMastered;

  return (
    <div className="space-y-8 py-4">
      {/* Back button & Status */}
      <div className="flex items-center justify-between">
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Roadmap</span>
        </Link>

        {isMastered ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold font-mono">
            <ShieldCheck className="w-4 h-4" /> Verified Mastered ({topic.userProgress?.bestScore}%)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-semibold font-mono">
            Status: {topic.userProgress?.status?.replace('_', ' ') || 'NOT STARTED'}
          </span>
        )}
      </div>

      {statusMessage && (
        <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Topic Title Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono">
          <span>{topic.moduleTitle}</span>
          <span>•</span>
          <span className="uppercase">{topic.difficulty}</span>
          <span>•</span>
          <span>{topic.estimatedLessonMins + topic.estimatedPracticeMins} mins total</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {topic.title}
        </h1>
      </div>

      {/* Plain Language Explanation */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="space-y-1">
          <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
            In Plain Words (No Jargon)
          </span>
          <p className="text-sm text-slate-200 leading-relaxed">
            {topic.plainExplanation}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800/80 space-y-1">
          <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
            Why It Matters in Software Engineering
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {topic.whyItMatters}
          </p>
        </div>
      </div>

      {/* Learning Objectives */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
          Measurable Learning Objectives
        </h3>
        <ul className="space-y-2">
          {topic.learningObjectives?.map((obj: string, i: number) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>{obj}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Verified Free Resources */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          Verified Free Resources
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {topic.resources?.map((res: any, idx: number) => (
            <a
              key={idx}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                    {res.provider}
                  </span>
                  <span className="uppercase text-emerald-400">100% Free</span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {res.title}
                </h4>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-indigo-400">
                <span>Verified {res.verifiedAt}</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Coding Challenge Runner (if topic has code challenge) */}
      {topic.codingChallenge && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            Practical Coding Challenge
          </h3>
          <CodingRunner
            topicId={topic.id}
            challenge={topic.codingChallenge}
            onSuccess={() => loadTopic()}
          />
        </div>
      )}

      {/* Actions: Mark Studied & Take Assessment */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white">Demonstrate Skill Mastery</h3>
          <p className="text-xs text-slate-400">
            Passing threshold: <span className="font-mono text-indigo-300 font-semibold">{topic.masteryThreshold}%</span>. Unlocks subsequent topics upon verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleMarkStudied}
            disabled={markingStudied || isStudied}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              isStudied
                ? 'bg-slate-800 text-slate-400 cursor-default'
                : 'border border-slate-700 hover:border-slate-600 bg-slate-800/60 text-slate-200'
            }`}
          >
            {isStudied ? '✓ Lesson Studied' : (markingStudied ? 'Updating...' : 'Mark as Studied')}
          </button>

          <button
            type="button"
            onClick={() => setAssessmentOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isMastered ? 'Retake Assessment' : 'Take Verification Assessment'}</span>
          </button>
        </div>
      </div>

      {/* Assessment Modal */}
      {assessmentOpen && (
        <AssessmentModal
          topicId={topic.id}
          topicTitle={topic.title}
          questions={topic.assessment?.questions || []}
          passingScore={topic.assessment?.passingScore || 80}
          onClose={() => setAssessmentOpen(false)}
          onSuccess={() => {
            loadTopic();
          }}
        />
      )}
    </div>
  );
}
