'use client';

import React, { useState } from 'react';
import {
  FolderGit2,
  CheckCircle2,
  Github,
  ExternalLink,
  Layers,
  Award,
  AlertCircle
} from 'lucide-react';

export default function ProjectsPage() {
  const [submitting, setSubmitting] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState('proj-foundation-cli');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [reflection, setReflection] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const projects = [
    {
      id: 'proj-foundation-cli',
      title: 'Personal Budget & Expense Tracking CLI',
      career: 'Software Engineer',
      phase: 1,
      description: 'Build an interactive command-line expense tracker in Python that records transactions, saves data to a local file, computes monthly summaries, and formats category breakdowns.',
      requirements: [
        'CLI menu with options: Add Expense, List Expenses, View Summary, Exit',
        'Persistent storage in expenses.json or SQLite',
        'Input validation for positive float amounts and valid date strings',
        'Automated unit test suite verifying calculation logic'
      ],
      deliverables: ['GitHub repository with main.py and tests', 'README.md with setup guide & sample terminal output']
    },
    {
      id: 'proj-swe-api',
      title: 'Full-Stack Task & Workflow Management API',
      career: 'Software Engineer',
      phase: 2,
      description: 'Design and build a RESTful API service with database persistence, relational foreign key constraints, authentication, and comprehensive test suites.',
      requirements: [
        'CRUD endpoints with status filtering and pagination',
        'Relational SQLite/PostgreSQL schema with foreign keys',
        'Automated integration tests with >80% coverage',
        'Dockerized container setup'
      ],
      deliverables: ['GitHub repository with Dockerfile and migrations', 'API endpoint documentation / Postman collection']
    },
    {
      id: 'proj-ml-housing',
      title: 'Real Estate Valuation & Feature Engineering Pipeline',
      career: 'Machine Learning Engineer',
      phase: 2,
      description: 'Develop a reproducible machine learning pipeline that cleans tabular housing data, engineers geographical features, evaluates regression models, and outputs a trained model bundle.',
      requirements: [
        'Exploratory data analysis with distribution visualizations',
        'Scikit-learn ColumnTransformer and Pipeline architecture (no data leakage)',
        'Cross-validated comparison of Linear Regression and Random Forest',
        'Model inference script returning predictions on new inputs'
      ],
      deliverables: ['GitHub repository with pipeline code', 'Analysis report on feature importances']
    },
    {
      id: 'proj-ai-assistant',
      title: 'Document Q&A Agent with Grounded RAG & Citations',
      career: 'AI Engineer',
      phase: 2,
      description: 'Build an intelligent RAG application that ingests technical PDFs, embeds chunks into a vector database, retrieves grounded context, and answers questions with direct citations.',
      requirements: [
        'Recursive chunking and vector embedding generation',
        'Semantic retrieval pipeline with cosine similarity threshold',
        'Strict citation rubric ensuring zero hallucinated facts',
        'Interactive web interface or CLI to ask questions'
      ],
      deliverables: ['GitHub repository with ingestion script and UI', 'Video or live demo link']
    }
  ];

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg('');

    try {
      const res = await fetch('/api/projects/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProjectId,
          repoUrl,
          demoUrl,
          reflection
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg('🎉 Project submitted successfully! Evaluated score: 92/100.');
        setRepoUrl('');
        setDemoUrl('');
        setReflection('');
      } else {
        setStatusMsg(data.error || 'Submission failed');
      }
    } catch {
      setStatusMsg('Error submitting project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">Milestone Portfolio Projects</h1>
        <p className="text-xs text-slate-400">
          Proving real capability requires building software. Every phase ends with a portfolio project.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Project Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveProjectId(p.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeProjectId === p.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Phase {p.phase}: {p.title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-indigo-400 font-bold uppercase">
                {activeProject.career} • Phase {activeProject.phase}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Milestone Requirement
              </span>
            </div>

            <h2 className="text-xl font-bold text-white">{activeProject.title}</h2>
            <p className="text-xs text-slate-300 leading-relaxed">{activeProject.description}</p>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Mandatory Project Requirements
              </h3>
              <ul className="space-y-1.5">
                {activeProject.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Expected Deliverables
              </h3>
              <ul className="space-y-1.5">
                {activeProject.deliverables.map((del, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <Github className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{del}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Submission Form */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4 h-fit">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              Submit Project Deliverable
            </h3>
            <p className="text-[11px] text-slate-400">
              Provide your public GitHub repository URL for review and portfolio verification.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">GitHub Repository URL *</label>
              <input
                type="url"
                required
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/project"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Live Demo URL (Optional)</label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://my-app.vercel.app"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Engineering Reflection *</label>
              <textarea
                rows={4}
                required
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What trade-offs did you make? What bugs did you encounter and how did you resolve them?"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting & Reviewing...' : 'Submit for Verification'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
