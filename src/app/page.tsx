import Link from 'next/link';
import {
  Code2,
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  GraduationCap,
  ArrowRight,
  Terminal,
  Cpu
} from 'lucide-react';

export default function HomePage() {
  const careers = [
    {
      id: 'software-engineer',
      title: 'Software Engineer',
      icon: Code2,
      badge: 'Full Stack & Systems',
      description: 'Master computer architecture, terminal mastery, algorithms, relational databases, HTTP, and scalable APIs.',
      topicsCount: 9,
      duration: '4-6 months'
    },
    {
      id: 'ml-engineer',
      title: 'Machine Learning Engineer',
      icon: BrainCircuit,
      badge: 'Data & Modeling',
      description: 'NumPy vectorized arrays, data cleaning, exploratory analysis, Scikit-learn pipelines, PyTorch, and deep learning.',
      topicsCount: 8,
      duration: '5-7 months'
    },
    {
      id: 'ai-engineer',
      title: 'AI Engineer',
      icon: Sparkles,
      badge: 'GenAI & Autonomous Agents',
      description: 'Tokens, high-dimensional embeddings, production RAG, vector databases, ReAct agent loops, and LLM guardrails.',
      topicsCount: 8,
      duration: '4-6 months'
    }
  ];

  return (
    <div className="space-y-16 py-6">
      {/* Hero */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium">
          <Terminal className="w-3.5 h-3.5" />
          <span>Zero-to-Engineer Platform — Free & Open Source</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Start from Zero. Learn Step by Step.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200">
            Prove Your Skills. Become an Engineer.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
          The first engineering learning platform engineered specifically for absolute beginners. 
          No assumed terminal or math knowledge. Verifiable mastery over checkboxes. Free official university resources.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/register"
            className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
          >
            <span>Begin Free Onboarding</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800/60 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all"
          >
            Explore Dashboard Demo
          </Link>
        </div>
      </section>

      {/* 3 Core Career Roadmaps */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Three Distinct Career Pathways</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Shared computer fundamentals first, followed by specialized industry tracks. No bloated or arbitrary lists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {careers.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-indigo-950/20"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-800 text-indigo-300 border border-slate-700">
                      {c.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{c.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{c.description}</p>
                </div>

                <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    {c.topicsCount} Core Topics
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {c.duration}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* The 5 Non-Negotiable Differences */}
      <section className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 p-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Why LearnPath AI Is Different</h2>
          <p className="text-slate-400 text-xs sm:text-sm">We reject superficial completion bars and video-watching certificates.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Verifiable Mastery, Not Checkboxes</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Manually checking a box never marks a topic mastered. You must pass deterministic code tests and conceptual rubrics.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Zero-Barrier Absolute Beginner UX</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              We never assume you know what a terminal, Git, or Python is. We explain memory like kitchen shelves and RAM like counters.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Hindi, Hinglish & English AI Coach</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Learn in the language you think in. Our coach provides Socratic progressive hints instead of spoiling answers.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <Clock className="w-4 h-4" />
              <span>Adaptive Spaced Repetition (SM-2)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Daily study blocks schedule automatic 1-day, 7-day, and 30-day reviews. If you miss a day, workload recalculates without penalty.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <GraduationCap className="w-4 h-4" />
              <span>100% Free Verified Resources</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Grounded exclusively in Harvard CS50, MIT Missing Semester, Google ML Crash Course, and official docs. Zero fabricated links.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Milestone Portfolio Deliverables</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every phase finishes with a real GitHub project: CLI tools, REST APIs, ML training pipelines, and production RAG bots.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
