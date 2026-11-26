'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Send,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import ConceptVisualizer from '@/components/ConceptVisualizer';

const SAMPLE_GOALS = [
  {
    label: 'Python Developer in 6 Months (1 hr/day)',
    text: 'I am a complete beginner. I want to become a Python developer in six months. I can study one hour every day.',
  },
  {
    label: 'Full-Stack Web Developer (45 mins/day)',
    text: 'I am starting from zero and want to build full-stack React web applications. I can study 45 minutes daily.',
  },
  {
    label: 'AI & RAG Engineer in Hinglish (1 hr/day)',
    text: 'Mujhe bilkul zero se AI engineer aur RAG LLM pipelines seekhna hai in 6 months, 1 hour every day.',
  },
];

export default function HomeInteractivePreview() {
  const [goalText, setGoalText] = useState(SAMPLE_GOALS[0].text);
  const [parsedResult, setParsedResult] = useState<any>({
    careerGoal: 'software-engineer',
    experienceLevel: 'absolute-zero',
    dailyStudyMinutes: 60,
    targetMonths: 6,
    preferredLanguage: 'english',
    summaryExplanation:
      'Configured Software Engineer pathway starting from absolute zero at 60 mins/day (6-month horizon).',
  });
  const [recommendations, setRecommendations] = useState<any[]>([
    {
      id: 'rec-next-comp-101',
      type: 'lesson',
      title: 'Next Core Skill: How Computers Actually Work: Hardware, OS & Memory',
      durationMins: 40,
      whySelected:
        'This is the foundational entry point for your software engineer pathway—assuming zero prior knowledge.',
      evidenceBadge: 'Prerequisites Verified',
      actionLabel: 'Start Interactive Lesson',
      actionUrl: '/topics/comp-101',
    },
    {
      id: 'rec-practice-comp-101',
      type: 'practice',
      title: 'Hands-On Sandbox: Memory Capacity Unit Converter',
      durationMins: 15,
      whySelected:
        'Applies "How Computers Actually Work" in an isolated code sandbox with deterministic unit tests so you build muscle memory.',
      evidenceBadge: 'javascript Sandbox',
      actionLabel: 'Solve Coding Exercise',
      actionUrl: '/topics/comp-101#coding-challenge',
    },
    {
      id: 'rec-project-proj-budget-cli',
      type: 'project',
      title: 'Portfolio Milestone: Personal Budget & Expense Tracking CLI',
      durationMins: 25,
      whySelected:
        'Turns your mastered skills into demonstrable GitHub portfolio evidence evaluated against a 4-point engineering rubric.',
      evidenceBadge: 'Phase 1 Deliverable',
      actionLabel: 'Inspect Project Rubric',
      actionUrl: '/projects',
    },
  ]);
  const [analyzing, setAnalyzing] = useState(false);

  // Live Multilingual AI Coach Demo state
  const [coachLang, setCoachLang] = useState<'english' | 'hinglish' | 'hindi'>('hinglish');
  const [coachPrompt, setCoachPrompt] = useState('Explain variables in simple Hinglish with a real-world analogy');
  const [coachReply, setCoachReply] = useState<string>(
    `Variable ko aap **kitchen ke ek labeled dabbe (jar)** ki tarah samjhein:\n- Dabba ka label: **Variable Name** (e.g., \`age\`, \`score\`)\n- Dabbe ke andar ka saman: **Value** (e.g., \`20\`, \`"Maya"\`)\n\nJab aap \`age = 20\` likhte hain, toh computer RAM mein ek slot reserve karke usme 20 rakh deta hai.`
  );
  const [coachSource, setCoachSource] = useState('Verified Curriculum Tutor Engine');
  const [coachLoading, setCoachLoading] = useState(false);

  const handleGeneratePreview = async (customText?: string) => {
    const textToAnalyze = (customText ?? goalText).trim();
    if (!textToAnalyze) return;
    if (customText) setGoalText(customText);
    setAnalyzing(true);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalText: textToAnalyze }),
      });
      const data = await res.json();
      if (res.ok && data.parsedGoal) {
        setParsedResult(data.parsedGoal);
        setRecommendations(data.recommendations || []);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTryCoach = async (customQuery?: string, customLang?: 'english' | 'hinglish' | 'hindi') => {
    const q = (customQuery ?? coachPrompt).trim();
    const l = customLang ?? coachLang;
    if (!q) return;
    if (customQuery) setCoachPrompt(customQuery);
    if (customLang) setCoachLang(customLang);
    setCoachLoading(true);
    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: 'py-foundations-01',
          userQuery: q,
          language: l,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setCoachReply(data.reply);
        setCoachSource(data.groundingBadge || 'Verified Curriculum Tutor Engine');
      }
    } finally {
      setCoachLoading(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* 1. Interactive Personalized Roadmap Generator Preview (Labelled Clearly as Sample Preview) */}
      <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="text-xs font-mono text-blue-400">
              Interactive Preview · Realistic Sample Data (Try Your Own Goal Below)
            </div>
            <h2 className="font-display text-2xl font-bold text-white">
              Describe Your Learning Goal in Plain Words
            </h2>
            <p className="text-sm text-slate-400">
              Tell LearnPath AI where you are starting from, what you want to build, and how much time you have each day.
            </p>
          </div>
          <Link
            href={`/onboarding?goal=${encodeURIComponent(goalText)}`}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-2 whitespace-nowrap shrink-0 self-start sm:self-center"
          >
            <span>Save &amp; Customize Full Plan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Preset Goal Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">Try a sample goal:</span>
          {SAMPLE_GOALS.map((g, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleGeneratePreview(g.text)}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-[#0B1120] hover:border-blue-500/40 text-xs text-slate-200 transition-colors"
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Natural Language Input */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            aria-label="Describe your learning goal in natural language"
            placeholder="e.g. I am a complete beginner. I want to become a Python developer in six months. I can study one hour every day."
            className="flex-1 bg-[#0B1120] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            disabled={analyzing}
            onClick={() => handleGeneratePreview()}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold whitespace-nowrap transition-colors disabled:opacity-50"
          >
            {analyzing ? 'Generating Path...' : 'Preview Personalized Roadmap'}
          </button>
        </div>

        {/* Generated Explainable Recommendations Preview */}
        {parsedResult && (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl border border-blue-500/25 bg-blue-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-blue-300">
                  Parsed Learning Profile (Deterministic Roadmap Plan)
                </div>
                <p className="text-xs text-slate-200">{parsedResult.summaryExplanation}</p>
              </div>
              <div className="text-xs font-mono text-slate-300 tabular-nums shrink-0">
                {parsedResult.dailyStudyMinutes} min/day · {parsedResult.targetMonths} mo target ·{' '}
                <span className="capitalize">{parsedResult.preferredLanguage}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.slice(0, 3).map((rec, i) => (
                <div
                  key={rec.id || i}
                  className="p-5 rounded-xl border border-slate-800 bg-[#0B1120] flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono text-blue-400">
                        Step 0{i + 1} · {rec.type}
                      </span>
                      <span className="font-mono tabular-nums">{rec.durationMins} min</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white">{rec.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong className="text-slate-200">Why recommended: </strong>
                      {rec.whySelected}
                    </p>
                  </div>
                  <Link
                    href={rec.actionUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 pt-2 border-t border-slate-800/80"
                  >
                    <span>{rec.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 2. Interactive Concept Visualization Preview */}
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="text-xs font-mono text-blue-400">
            Sample Interactive Learning Session · Visual Mental Models
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            See How Difficult Engineering Concepts Work Step by Step
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            Every core module pairs plain-language analogies with interactive step-by-step diagrams you can pause, step through, or read in accessible text mode.
          </p>
        </div>
        <ConceptVisualizer allowConceptSwitch={true} />
      </div>

      {/* 3. Live Multilingual AI Coach Demo & Sample Mastery Verification */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Live Multilingual Socratic Coach Demo */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
                <MessageSquare className="w-4 h-4" />
                <span>Conversational AI Learning Coach (English · Hinglish · Hindi)</span>
              </div>
              <span className="text-xs font-mono text-slate-400">{coachSource}</span>
            </div>

            <h3 className="font-display text-xl font-bold text-white">
              Ask for Analogies, Progressive Hints, or Error Debugging
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The AI coach knows your current topic, recent quiz scores, and learning goal. It gives progressive hints rather than spoiling solutions, and never replaces deterministic mastery checks.
            </p>

            {/* Quick Try Prompts across languages */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: 'Hinglish Analogy', q: 'Variables ko kitchen analogy se samjhao', lang: 'hinglish' as const },
                { label: 'Simple Hindi (हिंदी)', q: 'Explain this concept in simple Hindi', lang: 'hindi' as const },
                { label: 'Why Am I Learning This?', q: 'Why am I learning this?', lang: 'english' as const },
                { label: 'What Should I Learn Next?', q: 'What should I learn next?', lang: 'english' as const },
                { label: 'Make Study Plan Shorter', q: "Make today's study plan shorter", lang: 'english' as const },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleTryCoach(item.q, item.lang)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-[#0B1120] hover:border-blue-500/40 text-xs text-slate-200 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Coach Reply Output */}
            <div className="p-4 rounded-xl border border-slate-800 bg-[#0B1120] text-xs text-slate-200 leading-relaxed whitespace-pre-wrap min-h-[150px]">
              {coachLoading ? 'Preparing grounded explanation...' : coachReply}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTryCoach();
            }}
            className="flex items-center gap-2 pt-2"
          >
            <input
              type="text"
              value={coachPrompt}
              onChange={(e) => setCoachPrompt(e.target.value)}
              aria-label="Test the AI learning coach"
              placeholder="Ask a question in English, Hinglish, or Hindi..."
              className="flex-1 bg-[#0B1120] border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={coachLoading}
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask Coach</span>
            </button>
          </form>
        </div>

        {/* Right: Sample Skill Mastery & Transparent 100% Free Commitment */}
        <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4">
            <div className="text-xs font-mono text-emerald-400">
              Sample Skill Mastery &amp; Portfolio Evidence
            </div>
            <h3 className="font-display text-lg font-bold text-white">
              How Verified Mastery Works
            </h3>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Deterministic 80%+ Mastery Bar:</strong> Pass concept quizzes and isolated `node:vm` unit-test coding challenges to unlock downstream skills.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Code2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Explainable Remediation:</strong> If you score below 80%, LearnPath pinpoints the exact missed concept and recommends a 10-minute micro-lesson before retesting.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">GitHub Portfolio Milestones:</strong> Build 9 real engineering deliverables evaluated against transparent requirement rubrics.
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-2.5">
            <div className="text-xs font-mono text-blue-400">
              100% Free &amp; Open Curriculum · Zero Paywalls
            </div>
            <h3 className="font-display text-base font-bold text-white">
              Transparent Access &amp; Optional AI
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              All 8 career roadmaps, 27 topics, 54+ micro-lessons, interactive code sandboxes, SM-2 spaced repetition flashcards, and portfolio project rubrics are <strong>100% free</strong> with no credit card, no trial traps, and no hearts/energy limits. The built-in Curriculum Tutor works offline without any paid API key.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
