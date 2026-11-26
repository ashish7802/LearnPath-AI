'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  Lock,
  CheckCircle2,
  ArrowRight,
  Search,
  BookOpen,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

function RoadmapContent() {
  const searchParams = useSearchParams();
  const initialCareer = searchParams.get('career') || 'software-engineer';

  const [selectedCareer, setSelectedCareer] = useState(initialCareer);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [curriculumData, setCurriculumData] = useState<any>(null);
  const [guestPrefs, setGuestPrefs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const paramCareer = searchParams.get('career');
    if (paramCareer) setSelectedCareer(paramCareer);
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('lp_guest_profile');
        if (raw) setGuestPrefs(JSON.parse(raw));
      } catch {
        // ignore
      }
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/curriculum?career=${selectedCareer}`)
      .then((res) => res.json())
      .then((data) => {
        setCurriculumData(data);
        // Auto-expand all modules by default and expand the first unlocked topic
        const modOpen: Record<string, boolean> = {};
        const firstUnlocked = (data?.topics || []).find((t: any) => !t.isLocked);
        for (const t of data?.topics || []) {
          modOpen[t.moduleId] = true;
        }
        setExpandedModules(modOpen);
        if (firstUnlocked) {
          setExpandedTopics({ [firstUnlocked.id]: true });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCareer]);

  const careers: any[] = curriculumData?.careers || [];
  const subjects: any[] = curriculumData?.subjects || [];
  const allTopics: any[] = curriculumData?.topics || [];

  const filteredTopics = allTopics.filter((t) => {
    if (selectedSubject !== 'all' && t.subjectId !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const hitTitle = t.title.toLowerCase().includes(q);
      const hitDesc = t.plainExplanation.toLowerCase().includes(q);
      const hitMod = t.moduleTitle.toLowerCase().includes(q);
      const hitSub = (t.subtopics || []).some((st: any) =>
        st.title.toLowerCase().includes(q)
      );
      return hitTitle || hitDesc || hitMod || hitSub;
    }
    return true;
  });

  // Group strictly by Subject -> Module -> Topics
  const subjectGroups: { subject: any; modules: { moduleId: string; moduleTitle: string; topics: any[] }[] }[] = [];
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const groupedBySubj = new Map<string, Map<string, { moduleId: string; moduleTitle: string; topics: any[] }>>();

  for (const t of filteredTopics) {
    const sId = t.subjectId || 'subj-software-eng';
    if (!groupedBySubj.has(sId)) groupedBySubj.set(sId, new Map());
    const modMap = groupedBySubj.get(sId)!;
    if (!modMap.has(t.moduleId)) {
      modMap.set(t.moduleId, { moduleId: t.moduleId, moduleTitle: t.moduleTitle, topics: [] });
    }
    modMap.get(t.moduleId)!.topics.push(t);
  }

  for (const [sId, modMap] of groupedBySubj.entries()) {
    subjectGroups.push({
      subject: subjectMap.get(sId) || { id: sId, title: 'Core Curriculum', description: '' },
      modules: Array.from(modMap.values()),
    });
  }

  const activeCareerObj = careers.find((c) => c.id === selectedCareer);

  const renderStatusText = (topic: any) => {
    if (topic.isLocked) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
          <Lock className="w-3.5 h-3.5" /> Locked
        </span>
      );
    }
    if (topic.status === 'MASTERED') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 tabular-nums">
          <ShieldCheck className="w-3.5 h-3.5" /> Mastered ({topic.bestScore}%)
        </span>
      );
    }
    if (topic.status === 'STUDIED' || topic.status === 'IN_PROGRESS') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-400">
          <BookOpen className="w-3.5 h-3.5" /> In Progress
        </span>
      );
    }
    if (topic.status === 'NEEDS_REVISION') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-400">
          <AlertCircle className="w-3.5 h-3.5" /> Needs Revision
        </span>
      );
    }
    return <span className="text-xs font-medium text-slate-300">Ready to Start</span>;
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-blue-400">
            Career → Subject → Module → Topic → Subtopic → Micro-Lesson
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Structured Learning Curriculum
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            {activeCareerObj
              ? `${activeCareerObj.title}: ${activeCareerObj.description}`
              : 'Browse every computer science, programming, web, mobile, AI, security, and cloud topic in prerequisite order.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/skill-tree?career=${selectedCareer}`}
            className="px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-600 bg-[#111827] text-xs font-semibold text-slate-200 whitespace-nowrap transition-colors"
          >
            View Visual Skill Tree
          </Link>
        </div>
      </div>

      {/* Guest Personalized Goal Banner */}
      {guestPrefs && !curriculumData?.authenticated && (
        <div className="p-4 rounded-xl border border-blue-500/25 bg-blue-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-200">
            <strong className="text-blue-300">Your Onboarding Plan:</strong>{' '}
            {guestPrefs.dailyStudyMinutes || 60} mins/day ·{' '}
            <span className="capitalize">{guestPrefs.preferredLanguage || 'english'}</span> ·{' '}
            {(guestPrefs.experienceLevel || 'absolute-zero').replace(/-/g, ' ')}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/onboarding" className="text-blue-300 hover:text-white underline">
              Adjust Goals
            </Link>
            <Link
              href="/register"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
            >
              Save Permanently
            </Link>
          </div>
        </div>
      )}

      {/* Career Selector Buttons */}
      <div className="space-y-3">
        <div className="text-xs font-medium text-slate-400">Select Career Track</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedCareer('all');
              setSelectedSubject('all');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCareer === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-[#111827] border border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            All Technology Fields
          </button>
          {careers.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelectedCareer(c.id);
                setSelectedSubject('all');
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCareer === c.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#111827] border border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {c.shortTitle || c.title}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics, modules, or subtopics..."
            aria-label="Search curriculum topics"
            className="w-full bg-[#111827] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="subject-filter" className="text-xs text-slate-400 whitespace-nowrap">
            Filter Subject:
          </label>
          <select
            id="subject-filter"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-[#111827] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Subjects ({allTopics.length} topics)</option>
            {subjects
              .filter((s) => allTopics.some((t) => t.subjectId === s.id))
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Curriculum Tree */}
      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading structured curriculum...</div>
      ) : subjectGroups.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-slate-800 bg-[#111827] space-y-2">
          <p className="text-sm font-medium text-white">No matching topics found.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedSubject('all');
            }}
            className="text-xs font-semibold text-blue-400 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {subjectGroups.map(({ subject, modules }, subjIdx) => (
            <section key={subject.id} className="space-y-5">
              {/* Subject Header */}
              <div className="space-y-1">
                <div className="text-xs text-slate-400">
                  Subject {String(subjIdx + 1).padStart(2, '0')} · {subject.levelRange || 'Structured Path'}
                </div>
                <h2 className="font-display text-xl font-bold text-white">{subject.title}</h2>
                {subject.description && (
                  <p className="text-sm text-slate-400 max-w-3xl">{subject.description}</p>
                )}
              </div>

              {/* Modules inside Subject */}
              <div className="space-y-4">
                {modules.map((mod) => {
                  const modOpen = expandedModules[mod.moduleId] ?? true;
                  return (
                    <div
                      key={mod.moduleId}
                      className="rounded-xl border border-slate-800 bg-[#111827] overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedModules((prev) => ({
                            ...prev,
                            [mod.moduleId]: !modOpen,
                          }))
                        }
                        aria-expanded={modOpen}
                        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-slate-800/40 transition-colors"
                      >
                        <div>
                          <div className="text-xs text-slate-400">
                            Module · {mod.topics.length} {mod.topics.length === 1 ? 'Topic' : 'Topics'}
                          </div>
                          <h3 className="text-base font-semibold text-white mt-0.5">{mod.moduleTitle}</h3>
                        </div>
                        {modOpen ? (
                          <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {modOpen && (
                        <div className="border-t border-slate-800 divide-y divide-slate-800/80">
                          {mod.topics.map((topic) => {
                            const topicExpanded = !!expandedTopics[topic.id];
                            return (
                              <div
                                key={topic.id}
                                className={`p-5 space-y-3 ${topic.isLocked ? 'opacity-75' : ''}`}
                              >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                  <div className="space-y-1.5 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 tabular-nums">
                                      {renderStatusText(topic)}
                                      <span aria-hidden="true">·</span>
                                      <span className="capitalize">{topic.difficulty}</span>
                                      <span aria-hidden="true">·</span>
                                      <span>{topic.estimatedLessonMins + topic.estimatedPracticeMins} min</span>
                                      <span aria-hidden="true">·</span>
                                      <span>
                                        {topic.completedMicroLessons}/{topic.totalMicroLessons} micro-lessons
                                      </span>
                                    </div>

                                    <h4 className="text-base font-semibold text-white">{topic.title}</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
                                      {topic.plainExplanation}
                                    </p>

                                    {topic.isLocked && topic.missingPrereqs?.length > 0 && (
                                      <p className="text-xs text-amber-300 pt-1">
                                        Requires mastery of: {topic.missingPrereqs.join(', ')}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedTopics((prev) => ({
                                          ...prev,
                                          [topic.id]: !topicExpanded,
                                        }))
                                      }
                                      aria-expanded={topicExpanded}
                                      className="px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-600 text-xs font-medium text-slate-300 hover:text-white whitespace-nowrap transition-colors"
                                    >
                                      {topicExpanded ? 'Hide Subtopics' : `View Layers (${topic.subtopics?.length || 0})`}
                                    </button>

                                    <Link
                                      href={`/topics/${topic.id}`}
                                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                                        topic.isLocked
                                          ? 'bg-slate-800 text-slate-400 hover:text-slate-200'
                                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                                      }`}
                                    >
                                      <span>
                                        {topic.isLocked
                                          ? 'Preview'
                                          : topic.status === 'MASTERED'
                                          ? 'Review Topic'
                                          : 'Start Topic'}
                                      </span>
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                  </div>
                                </div>

                                {/* Expandable Subtopics -> Micro-Lessons Layer */}
                                {topicExpanded && topic.subtopics && (
                                  <div className="pt-3 mt-3 border-t border-slate-800/70 space-y-3 pl-2 sm:pl-4">
                                    {topic.subtopics.map((st: any) => (
                                      <div key={st.id} className="space-y-1.5">
                                        <div className="text-xs font-semibold text-slate-200">
                                          Subtopic: {st.title}
                                        </div>
                                        <ul className="space-y-1 pl-3">
                                          {st.microLessons.map((ml: any) => (
                                            <li
                                              key={ml.id}
                                              className="flex items-center justify-between gap-3 text-xs text-slate-400 py-1"
                                            >
                                              <span className="flex items-center gap-2">
                                                <CheckCircle2
                                                  className={`w-3.5 h-3.5 shrink-0 ${
                                                    ml.completed ? 'text-emerald-400' : 'text-slate-600'
                                                  }`}
                                                />
                                                <span className={ml.completed ? 'text-slate-200' : ''}>
                                                  Micro-Lesson: {ml.title}
                                                </span>
                                              </span>
                                              <span className="font-mono tabular-nums text-slate-500 shrink-0">
                                                {ml.estimatedMins}m · +{ml.xpReward} XP
                                              </span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-slate-400">Loading curriculum...</div>}>
      <RoadmapContent />
    </Suspense>
  );
}
