'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, BookOpen, ArrowRight, GitBranch, CheckCircle2 } from 'lucide-react';

function computeTierDepth(topic: any, byId: Map<string, any>, memo = new Map<string, number>()): number {
  if (memo.has(topic.id)) return memo.get(topic.id)!;
  if (!topic.prerequisites || topic.prerequisites.length === 0) {
    memo.set(topic.id, 0);
    return 0;
  }
  let maxDepth = 0;
  for (const preId of topic.prerequisites) {
    const pre = byId.get(preId);
    if (pre) {
      maxDepth = Math.max(maxDepth, computeTierDepth(pre, byId, memo) + 1);
    }
  }
  memo.set(topic.id, maxDepth);
  return maxDepth;
}

function SkillTreeContent() {
  const searchParams = useSearchParams();
  const [selectedCareer, setSelectedCareer] = useState(searchParams.get('career') || 'all');
  const [data, setData] = useState<any>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/curriculum?career=${selectedCareer}`)
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        if (res?.topics?.length > 0) {
          setSelectedNodeId((prev) =>
            prev && res.topics.some((t: any) => t.id === prev) ? prev : res.topics[0].id
          );
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCareer]);

  const careers: any[] = data?.careers || [];
  const topics: any[] = data?.topics || [];
  const byId = new Map<string, any>(topics.map((t) => [t.id, t]));

  // Organize into dependency depth tiers (Tier 0 = Zero-Barrier Foundations -> Tier N = Advanced)
  const tiersMap = new Map<number, any[]>();
  const memo = new Map<string, number>();
  for (const t of topics) {
    const depth = computeTierDepth(t, byId, memo);
    if (!tiersMap.has(depth)) tiersMap.set(depth, []);
    tiersMap.get(depth)!.push(t);
  }
  const sortedTiers = Array.from(tiersMap.entries()).sort((a, b) => a[0] - b[0]);

  const selectedNode = selectedNodeId ? byId.get(selectedNodeId) : topics[0];
  const unlocksTopics = selectedNode
    ? topics.filter((t) => (t.prerequisites || []).includes(selectedNode.id))
    : [];

  const tierLabels = [
    'Tier 1 · Absolute Zero Foundations',
    'Tier 2 · Core Building Blocks',
    'Tier 3 · Practical Programming & Web Basics',
    'Tier 4 · Applied Engineering & Systems',
    'Tier 5 · Intermediate Specialization',
    'Tier 6 · Advanced Architecture & Production',
  ];

  const getNodeStyle = (t: any, isSelected: boolean) => {
    const baseRing = isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-800 hover:border-slate-600';
    if (t.status === 'MASTERED') {
      return `bg-emerald-500/10 ${isSelected ? 'ring-2 ring-emerald-400 border-emerald-400' : 'border-emerald-500/40 hover:border-emerald-400'}`;
    }
    if (!t.isLocked) {
      return `bg-[#111827] ${baseRing}`;
    }
    return `bg-[#0F1629] opacity-75 ${baseRing}`;
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-blue-400">Prerequisite Dependency Graph</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Interactive Engineering Skill Tree
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Every skill unlocks strictly after mastering its prerequisites. Click any node to inspect dependencies, what it unlocks, and launch its micro-lessons.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-300 tabular-nums shrink-0">
          <span>
            Mastered: <strong className="text-emerald-400">{data?.masteredCount || 0}</strong> / {topics.length}
          </span>
          <Link
            href="/roadmap"
            className="px-3.5 py-2 rounded-lg border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-200 whitespace-nowrap"
          >
            Switch to List View
          </Link>
        </div>
      </div>

      {/* Career Filter Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedCareer('all')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedCareer === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-[#111827] border border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          Complete Tech Tree
        </button>
        {careers.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCareer(c.id)}
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

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Building skill tree graph...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 8 Columns: Tiered Skill Tree Map */}
          <div className="lg:col-span-8 space-y-6">
            {sortedTiers.map(([depth, tierTopics]) => (
              <div key={depth} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h2 className="text-xs font-semibold text-slate-300">
                    {tierLabels[depth] || `Tier ${depth + 1} · Specialized Mastery`}
                  </h2>
                  <span className="text-xs font-mono text-slate-500 tabular-nums">
                    {tierTopics.length} {tierTopics.length === 1 ? 'skill' : 'skills'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tierTopics.map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-4 rounded-xl border text-left space-y-2 transition-all ${getNodeStyle(
                          node,
                          isSelected
                        )}`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-slate-400 capitalize">{node.difficulty}</span>
                          {node.status === 'MASTERED' ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                              <ShieldCheck className="w-3.5 h-3.5" /> Mastered
                            </span>
                          ) : node.isLocked ? (
                            <span className="inline-flex items-center gap-1 text-slate-500">
                              <Lock className="w-3.5 h-3.5" /> Locked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-medium text-blue-400">
                              <BookOpen className="w-3.5 h-3.5" /> Unlocked
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-white leading-snug">
                          {node.title}
                        </div>
                        <div className="text-xs text-slate-400 tabular-nums">
                          {node.completedMicroLessons}/{node.totalMicroLessons} micro-lessons ·{' '}
                          {node.prerequisites.length === 0
                            ? 'Entry node'
                            : `${node.prerequisites.length} prereq${node.prerequisites.length > 1 ? 's' : ''}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right 4 Columns: Node Inspector Panel */}
          {selectedNode && (
            <aside className="lg:col-span-4 lg:sticky lg:top-24 rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-5">
              <div className="space-y-1.5">
                <div className="text-xs text-slate-400">
                  Selected Skill Node · {selectedNode.moduleTitle}
                </div>
                <h3 className="font-display text-lg font-bold text-white">{selectedNode.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedNode.plainExplanation}
                </p>
              </div>

              {/* Prerequisites Required */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-300">Prerequisites Required</div>
                {selectedNode.prerequisites.length === 0 ? (
                  <p className="text-xs text-emerald-400">None — Start right here from absolute zero.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {selectedNode.prerequisites.map((preId: string) => {
                      const pre = byId.get(preId);
                      const preMastered = pre?.status === 'MASTERED';
                      return (
                        <li key={preId} className="flex items-center justify-between gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => pre && setSelectedNodeId(pre.id)}
                            className="text-left text-blue-400 hover:underline truncate"
                          >
                            {pre ? pre.title : preId}
                          </button>
                          <span className={preMastered ? 'text-emerald-400 shrink-0' : 'text-amber-300 shrink-0'}>
                            {preMastered ? 'Mastered' : 'Pending'}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Unlocks Downstream */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                  <span>Unlocks Downstream Skills ({unlocksTopics.length})</span>
                </div>
                {unlocksTopics.length === 0 ? (
                  <p className="text-xs text-slate-400">Capstone skill in this branch.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {unlocksTopics.map((child) => (
                      <li key={child.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedNodeId(child.id)}
                          className="text-xs text-slate-300 hover:text-blue-400 text-left transition-colors"
                        >
                          → {child.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Subtopics Preview */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-300">Included Micro-Lessons</div>
                <ul className="space-y-1.5">
                  {(selectedNode.subtopics || []).flatMap((st: any) => st.microLessons).map((ml: any) => (
                    <li key={ml.id} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 ${
                          ml.completed ? 'text-emerald-400' : 'text-slate-600'
                        }`}
                      />
                      <span className="truncate">{ml.title}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <Link
                  href={`/topics/${selectedNode.id}`}
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <span>{selectedNode.isLocked ? 'Preview Lesson' : 'Open Full Lesson & Assessment'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}

export default function SkillTreePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-slate-400">Loading skill tree...</div>}>
      <SkillTreeContent />
    </Suspense>
  );
}
