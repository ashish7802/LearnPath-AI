'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, Github, ExternalLink } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const [activeProjectId, setActiveProjectId] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [checkedReqs, setCheckedReqs] = useState<number[]>([]);
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [reflection, setReflection] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const loadProjects = () => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        const list = data?.projects || [];
        setProjects(list);
        setSubmissions(data?.submissions || []);
        setAuthenticated(!!data?.authenticated);
        if (list.length > 0 && !activeProjectId) {
          setActiveProjectId(list[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const toggleReq = (idx: number) => {
    setCheckedReqs((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    setCheckedReqs([]);
    setStatusMsg('');
    setIsError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;
    setSubmitting(true);
    setStatusMsg('');
    setIsError(false);

    try {
      const res = await fetch('/api/projects/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProject.id,
          repoUrl,
          demoUrl,
          reflection,
          checkedRequirements: checkedReqs,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(data.message || 'Project submitted and evaluated!');
        setRepoUrl('');
        setDemoUrl('');
        setReflection('');
        setCheckedReqs([]);
        loadProjects();
      } else {
        setIsError(true);
        setStatusMsg(data.error || 'Submission failed.');
      }
    } catch {
      setIsError(true);
      setStatusMsg('Network error submitting project.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-sm text-slate-400">Loading milestone projects...</div>;
  }

  return (
    <div className="space-y-8 py-4">
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-blue-400">Real Portfolio Engineering Deliverables</p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Milestone Portfolio Projects
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Every career track culminates in real software you can publish to GitHub. Check off completed requirements, submit your repository and reflection, and earn +150 XP.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between gap-4 ${
            isError
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
          }`}
        >
          <span>{statusMsg}</span>
          <button
            type="button"
            onClick={() => setStatusMsg('')}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Compact Track Filter & Project Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-800 bg-[#111827]">
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', ...Array.from(new Set(projects.map((p) => p.careerPathId)))].map((track) => {
            const label =
              track === 'all'
                ? `All Tracks (${projects.length})`
                : track.replace(/-/g, ' ');
            const active = selectedTrack === track;
            return (
              <button
                key={track}
                type="button"
                onClick={() => {
                  setSelectedTrack(track);
                  const matching =
                    track === 'all' ? projects : projects.filter((p) => p.careerPathId === track);
                  if (matching.length > 0 && !matching.some((p) => p.id === activeProjectId)) {
                    handleSelectProject(matching[0].id);
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="project-select" className="text-xs text-slate-400 whitespace-nowrap">
            Active Project:
          </label>
          <select
            id="project-select"
            value={activeProject?.id || ''}
            onChange={(e) => handleSelectProject(e.target.value)}
            className="bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 max-w-[280px]"
          >
            {(selectedTrack === 'all'
              ? projects
              : projects.filter((p) => p.careerPathId === selectedTrack)
            ).map((p) => {
              const submitted = submissions.some((s) => s.projectId === p.id);
              return (
                <option key={p.id} value={p.id}>
                  {submitted ? '✓ ' : ''}
                  {p.title}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {activeProject && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Project Brief & Interactive Requirements Checklist */}
          <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-6">
            <div className="space-y-2">
              <div className="text-xs text-slate-400 capitalize">
                Track: {activeProject.careerPathId.replace(/-/g, ' ')} · Phase {activeProject.phaseNumber} · +150 XP
              </div>
              <h2 className="font-display text-xl font-bold text-white">{activeProject.title}</h2>
              <p className="text-sm text-slate-300 leading-relaxed">{activeProject.description}</p>
            </div>

            <div className="pt-5 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-200">
                  Interactive Requirements Self-Check (Feeds Into Rubric Score)
                </h3>
                <span className="text-xs font-mono text-blue-400 tabular-nums">
                  {checkedReqs.length}/{activeProject.requirements.length} verified
                </span>
              </div>
              <div className="space-y-2">
                {activeProject.requirements.map((req: string, idx: number) => {
                  const checked = checkedReqs.includes(idx);
                  return (
                    <label
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg border border-slate-800 bg-[#0B1120] cursor-pointer hover:border-slate-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleReq(idx)}
                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-blue-600"
                      />
                      <span className="text-xs text-slate-200 leading-relaxed">{req}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-5 border-t border-slate-800 space-y-2">
              <h3 className="text-xs font-semibold text-slate-200">Expected Deliverables</h3>
              <ul className="space-y-1.5">
                {activeProject.deliverables.map((del: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <Github className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{del}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Submission Form */}
          <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-5">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-400" />
                <span>Submit Project Deliverable</span>
              </h3>
              <p className="text-xs text-slate-400">
                Submit a valid public GitHub URL and write an honest reflection on your architecture choices and bugs solved.
              </p>
            </div>

            {!authenticated && (
              <div className="p-3 rounded-lg border border-slate-800 bg-[#0B1120] text-xs text-slate-300 flex items-center justify-between gap-2">
                <span>Sign in required to save project submissions.</span>
                <Link href="/login" className="text-blue-400 font-semibold hover:underline shrink-0">
                  Sign In
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="repo-url" className="text-xs font-medium text-slate-300">
                  GitHub Repository URL
                </label>
                <input
                  id="repo-url"
                  type="url"
                  required
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/project-name"
                  className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="demo-url" className="text-xs font-medium text-slate-300">
                  Live Demo URL (Optional)
                </label>
                <input
                  id="demo-url"
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://my-project.vercel.app"
                  className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reflection-input" className="text-xs font-medium text-slate-300">
                  Engineering Reflection
                </label>
                <textarea
                  id="reflection-input"
                  rows={4}
                  required
                  minLength={10}
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Explain the key design decisions, edge cases you tested, and bugs you solved..."
                  className="w-full bg-[#0B1120] border border-slate-800 rounded-lg p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {submitting ? 'Evaluating & Saving...' : 'Submit for Rubric Review'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Saved Portfolio Submission History */}
      {submissions.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="font-display text-lg font-bold text-white">Your Saved Project Submissions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submissions.map((sub) => {
              const projObj = projects.find((p) => p.id === sub.projectId);
              return (
                <div
                  key={sub.id}
                  className="p-5 rounded-xl border border-slate-800 bg-[#111827] space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-emerald-400">
                      {sub.status} · Score {sub.score}/100
                    </span>
                    <span className="text-slate-500">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    {projObj?.title || sub.projectId}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{sub.feedback}</p>
                  <div className="flex items-center gap-4 pt-1 text-xs">
                    <a
                      href={sub.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-400 hover:underline"
                    >
                      <span>GitHub Repo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {sub.demoUrl && (
                      <a
                        href={sub.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-400 hover:underline"
                      >
                        <span>Live Demo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
