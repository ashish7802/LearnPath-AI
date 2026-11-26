import Link from 'next/link';
import { ArrowRight, BookOpen, Code2, GitBranch, Layers, Compass, Sparkles, ShieldCheck } from 'lucide-react';
import { getAllCareers, getAllTopics, getProjects } from '@/lib/curriculum';
import { LANGUAGE_GUIDES } from '@/lib/curriculum-layers';
import HomeInteractivePreview from '@/components/HomeInteractivePreview';

export default function HomePage() {
  const careers = getAllCareers();
  const topics = getAllTopics();
  const projects = getProjects();
  const totalMicroLessons = topics.reduce(
    (sum, t) => sum + (t.subtopics || []).reduce((s, st) => s + st.microLessons.length, 0),
    0
  );

  const layers = [
    { step: '01', name: 'Career Path', desc: 'Pick your target engineering discipline from 8 complete tracks.' },
    { step: '02', name: 'Subject', desc: 'Master shared foundations first: computers, OS, programming, networking.' },
    { step: '03', name: 'Module', desc: 'Structured skill groups ordered by real dependency prerequisites.' },
    { step: '04', name: 'Topic', desc: 'Focused concept units with measurable objectives and verified resources.' },
    { step: '05', name: 'Subtopic', desc: 'Logical sub-layers breaking complex topics into digestible mental models.' },
    { step: '06', name: 'Micro-Lesson', desc: 'Meaning, purpose, analogy, runnable code, line-by-line guide & quick check.' },
  ];

  const howItWorks = [
    {
      step: 'Step 1',
      title: 'Describe Your Goal in Plain Language',
      desc: 'Tell LearnPath your goal, available daily time, and starting point—or choose any of the 8 career pathways directly. No prior coding jargon required.',
      icon: Compass,
    },
    {
      step: 'Step 2',
      title: 'Learn Step-by-Step with Interactive Visuals & AI Coach',
      desc: 'Study bite-sized micro-lessons with interactive step-by-step concept animations and an optional English, Hindi, or Hinglish AI coach whenever you get stuck.',
      icon: Sparkles,
    },
    {
      step: 'Step 3',
      title: 'Prove Mastery & Build Portfolio Projects',
      desc: 'Pass deterministic 80%+ verification quizzes and real code sandbox assertions to unlock dependent skills, spaced repetition reviews, and portfolio milestones.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section: Immediate 30-Second Product Clarity */}
      <section className="max-w-4xl space-y-5 pt-2">
        <p className="text-xs sm:text-sm font-semibold text-blue-400 tracking-wide">
          100% Free &amp; Open Access · Zero-to-Engineer Personalized Learning Platform
        </p>

        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
          From beginner to engineer. One skill at a time.
        </h1>

        <p className="text-base sm:text-lg text-slate-200 max-w-3xl leading-relaxed">
          Learn the right skills, practice with an AI coach, and build real projects. Get a personalized roadmap that adapts to your progress.
        </p>

        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed italic">
          &ldquo;Bilkul zero se shuru karo. Apni skills seekho, practice karo aur real projects banao — ek personalized roadmap ke saath.&rdquo;
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20"
          >
            <span>Build My Personalized Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-[#111827] hover:bg-slate-800 text-slate-100 text-sm font-semibold transition-colors"
          >
            <span>Explore Full Curriculum</span>
          </Link>
          <Link
            href="/practice"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-2 py-2"
          >
            Open Coding Sandbox →
          </Link>
        </div>

        {/* Grounded Curriculum Quantitative Proof Row */}
        <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <div className="font-display text-2xl font-bold text-white tabular-nums">{careers.length}</div>
            <div className="text-xs text-slate-400 mt-0.5">Technology Career Paths</div>
          </div>
          <div>
            <div className="font-display text-2xl font-bold text-white tabular-nums">{topics.length}</div>
            <div className="text-xs text-slate-400 mt-0.5">Structured Topics</div>
          </div>
          <div>
            <div className="font-display text-2xl font-bold text-white tabular-nums">{totalMicroLessons}</div>
            <div className="text-xs text-slate-400 mt-0.5">Interactive Micro-Lessons</div>
          </div>
          <div>
            <div className="font-display text-2xl font-bold text-white tabular-nums">{projects.length}</div>
            <div className="text-xs text-slate-400 mt-0.5">Portfolio Milestone Projects</div>
          </div>
        </div>
      </section>

      {/* 3-Step Visual Explanation: How Personalized Learning Works */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
            How LearnPath Takes You From Zero to Demonstrable Engineering Skills
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Designed around verified mastery, explainable recommendations, and real code execution—not passive video watching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {howItWorks.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-blue-400 uppercase tracking-wider">
                    {item.step}
                  </span>
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Product Preview: Roadmap Generator, Animated Visualizer, AI Coach & Mastery */}
      <HomeInteractivePreview />

      {/* Section 2: All 8 Career Pathways */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Choose Your Engineering Pathway
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Every track starts from computer fundamentals with zero assumed knowledge and unlocks advanced skills strictly through verified mastery.
            </p>
          </div>
          <Link
            href="/skill-tree"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-400 hover:text-blue-300 whitespace-nowrap shrink-0"
          >
            <span>Inspect Interactive Skill Tree</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {careers.map((career) => (
            <Link
              key={career.id}
              href={`/roadmap?career=${career.id}`}
              className="group rounded-xl border border-slate-800 bg-[#111827] hover:border-slate-700 p-5 flex flex-col justify-between gap-5 transition-colors"
            >
              <div className="space-y-2.5">
                <div className="text-xs text-slate-400">
                  {career.category} · {career.duration}
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {career.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{career.description}</p>
              </div>
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-blue-400">
                <span>Open Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 3: 6-Layer Teaching Architecture */}
      <section className="rounded-2xl border border-slate-800 bg-[#111827] p-8 space-y-6">
        <div className="space-y-1.5 max-w-2xl">
          <h2 className="font-display text-2xl font-bold text-white">
            The Website Is Your Primary Teacher
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            LearnPath organizes every field into six transparent learning layers so you never hit an unexplained prerequisite.
            An optional AI Coach is available whenever you want a simpler explanation, a real-world analogy, or a debugging hint, while the structured curriculum, sandboxes, and mastery rules remain 100% deterministic.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {layers.map((layer) => (
            <div key={layer.step} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-blue-400 tabular-nums">{layer.step}.</span>
                <h3 className="text-sm font-semibold text-white">{layer.name}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{layer.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Programming Languages Directory */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Programming Languages Hub
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Learn core syntax, memory models, and real runnable examples across major programming languages.
            </p>
          </div>
          <Link
            href="/practice?tab=languages"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-400 hover:text-blue-300 whitespace-nowrap shrink-0"
          >
            <span>Open Interactive Language Guides</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LANGUAGE_GUIDES.map((lang) => (
            <Link
              key={lang.id}
              href={`/practice?tab=languages&lang=${lang.id}`}
              className="rounded-xl border border-slate-800 bg-[#111827] hover:border-slate-700 p-4 space-y-2 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-white">{lang.name}</h3>
                <span className="text-xs text-slate-400">{lang.difficulty}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{lang.usedFor}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 5: Core Platform Guarantees */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-slate-800/80 pt-12">
        <div className="space-y-2">
          <Layers className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Zero Assumed Knowledge</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Starts from bits, bytes, RAM, CPU, and terminal basics before introducing code syntax or frameworks.
          </p>
        </div>
        <div className="space-y-2">
          <Code2 className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Real Sandbox Verification</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every coding challenge runs against visible and hidden test assertions—never hollow checkboxes.
          </p>
        </div>
        <div className="space-y-2">
          <GitBranch className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Prerequisite Skill Tree</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mastery unlocks dependent topics deterministically and schedules SM-2 spaced repetition reviews.
          </p>
        </div>
        <div className="space-y-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Verified Free Resources</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Grounded in Harvard CS50, MIT Missing Semester, MDN Web Docs, OWASP, Kaggle, and official language docs.
          </p>
        </div>
      </section>
    </div>
  );
}
