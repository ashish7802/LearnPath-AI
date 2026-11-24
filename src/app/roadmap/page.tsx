'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Code2,
  BrainCircuit,
  Sparkles,
  Lock,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  BookOpen
} from 'lucide-react';

export default function RoadmapPage() {
  const [selectedCareer, setSelectedCareer] = useState('software-engineer');
  const [curriculumData, setCurriculumData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/curriculum?career=${selectedCareer}`)
      .then((res) => res.json())
      .then((data) => setCurriculumData(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCareer]);

  const careers = [
    { id: 'software-engineer', title: 'Software Engineer', icon: Code2 },
    { id: 'ml-engineer', title: 'ML Engineer', icon: BrainCircuit },
    { id: 'ai-engineer', title: 'AI Engineer', icon: Sparkles }
  ];

  const getStatusBadge = (topic: any) => {
    if (topic.isLocked) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
          <Lock className="w-3 h-3 text-slate-500" /> Locked
        </span>
      );
    }
    if (topic.status === 'MASTERED') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <ShieldCheck className="w-3 h-3" /> Mastered ({topic.bestScore}%)
        </span>
      );
    }
    if (topic.status === 'STUDIED') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
          <BookOpen className="w-3 h-3" /> Assessment Pending
        </span>
      );
    }
    if (topic.status === 'NEEDS_REVISION') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <AlertCircle className="w-3 h-3" /> Needs Revision
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
        Ready to Start
      </span>
    );
  };

  // Group topics by module
  const topics: any[] = curriculumData?.topics || [];
  const modulesMap = new Map<string, { title: string; topics: any[] }>();
  for (const t of topics) {
    if (!modulesMap.has(t.moduleId)) {
      modulesMap.set(t.moduleId, { title: t.moduleTitle, topics: [] });
    }
    modulesMap.get(t.moduleId)!.topics.push(t);
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header & Career Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Structured Career Roadmaps</h1>
          <p className="text-xs text-slate-400">
            Every topic requires verifiable mastery. Gated by real prerequisite dependencies.
          </p>
        </div>

        {/* Pathway Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
          {careers.map((c) => {
            const Icon = c.icon;
            const active = selectedCareer === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCareer(c.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{c.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(modulesMap.entries()).map(([modId, mod], modIdx) => (
            <div key={modId} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-indigo-600/20 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center border border-indigo-500/30">
                  {modIdx + 1}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-slate-200">{mod.title}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mod.topics.map((topic) => (
                  <div
                    key={topic.id}
                    className={`p-5 rounded-xl border transition-all ${
                      topic.isLocked
                        ? 'border-slate-800/60 bg-slate-950/40 opacity-70'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(topic)}
                          <span className="text-[10px] font-mono text-slate-500 uppercase">
                            {topic.difficulty}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white pt-1">{topic.title}</h3>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 my-3">
                      {topic.plainExplanation}
                    </p>

                    {topic.isLocked && (
                      <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-300 mb-3 flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        <span>Prerequisites needed: {topic.missingPrereqs?.join(', ')}</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                        <span>{topic.estimatedLessonMins + topic.estimatedPracticeMins} mins</span>
                        <span>{topic.resourcesCount} resources</span>
                      </div>

                      <Link
                        href={`/topics/${topic.id}`}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          topic.isLocked
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        <span>{topic.status === 'MASTERED' ? 'Review Lesson' : 'Open Topic'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
