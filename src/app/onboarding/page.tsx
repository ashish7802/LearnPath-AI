'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Code2,
  Globe,
  Smartphone,
  BrainCircuit,
  Sparkles,
  BarChart3,
  Shield,
  Cloud,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const CAREER_OPTIONS = [
  { id: 'software-engineer', title: 'Software Engineer', icon: Code2, desc: 'Computer basics, Python, DSA, SQL & APIs' },
  { id: 'web-developer', title: 'Web Developer', icon: Globe, desc: 'HTML, CSS, JavaScript, React & backends' },
  { id: 'mobile-developer', title: 'Mobile App Developer', icon: Smartphone, desc: 'Cross-platform mobile UI, state & offline sync' },
  { id: 'data-scientist', title: 'Data Scientist', icon: BarChart3, desc: 'Statistics, Pandas, SQL & data storytelling' },
  { id: 'ml-engineer', title: 'ML Engineer', icon: BrainCircuit, desc: 'Math intuition, Scikit-Learn & deep learning' },
  { id: 'ai-engineer', title: 'AI Engineer', icon: Sparkles, desc: 'LLMs, prompting, RAG pipelines & agents' },
  { id: 'cybersecurity-engineer', title: 'Cybersecurity Engineer', icon: Shield, desc: 'Networking, threat modeling & secure coding' },
  { id: 'cloud-devops-engineer', title: 'Cloud & DevOps', icon: Cloud, desc: 'Linux, Docker containers, CI/CD & cloud infra' }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [careerGoal, setCareerGoal] = useState('software-engineer');
  const [experienceLevel, setExperienceLevel] = useState('absolute-zero');
  const [priorLanguage] = useState('none');
  const [mathComfort] = useState('basic');
  const [preferredLanguage, setPreferredLanguage] = useState('english');
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState(60);
  const [availableDays, setAvailableDays] = useState(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
  const [preferredMethod] = useState('practice-first');
  const [deviceType, setDeviceType] = useState('browser-only');
  const [targetMilestone, setTargetMilestone] = useState('job-ready');

  const [diagnosticAnswer, setDiagnosticAnswer] = useState('');

  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      if (availableDays.length > 1) {
        setAvailableDays(availableDays.filter((d) => d !== day));
      }
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    setError('');
    try {
      const score = diagnosticAnswer === 'B' ? 100 : diagnosticAnswer === '' ? 80 : 50;

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          careerGoal,
          experienceLevel,
          priorLanguage,
          mathComfort,
          preferredLanguage,
          dailyStudyMinutes,
          availableDays,
          preferredMethod,
          deviceType,
          targetMilestone,
          diagnosticScore: score
        })
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
          router.push(`/roadmap?career=${careerGoal}`);
        } else {
          setError(data.error || 'Could not save onboarding profile.');
        }
      }
    } catch {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      {/* Step Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono uppercase tracking-wider text-blue-400 font-semibold">
            Zero-Barrier Onboarding
          </span>
          <span className="font-mono tabular-nums">Step {step} of 3</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="p-6 rounded-xl border border-slate-800 bg-[#111827] space-y-6">
          <div className="space-y-1">
            <h1 className="font-display text-xl font-bold text-slate-50">
              1. Select Your Career Pathway
            </h1>
            <p className="text-xs text-slate-400">
              Every track starts from computer fundamentals and builds step by step. You can switch careers anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CAREER_OPTIONS.map((c) => {
              const Icon = c.icon;
              const selected = careerGoal === c.id;
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCareerGoal(c.id)}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                    selected
                      ? 'border-blue-500 bg-blue-600/15 text-slate-50'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-2.5 ${selected ? 'text-blue-400' : 'text-slate-400'}`} />
                  <div>
                    <h2 className="font-semibold text-xs text-slate-100">{c.title}</h2>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{c.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-xs font-semibold text-slate-200">2. Current Programming Experience</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'absolute-zero', label: 'Absolute Zero', sub: 'Never written a line of code' },
                { id: 'tried-tutorials', label: 'Tried Tutorials', sub: 'Know basic variables or HTML' },
                { id: 'intermediate', label: 'Built Small Scripts', sub: 'Understand basic programming' }
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setExperienceLevel(opt.id)}
                  className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                    experienceLevel === opt.id
                      ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                      : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-slate-100">{opt.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-xs font-semibold text-slate-200">3. Preferred Explanation Language</p>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'english', label: 'English', desc: 'Simple plain English' },
                { id: 'hinglish', label: 'Hinglish', desc: 'Hindi in Roman script' },
                { id: 'hindi', label: 'Hindi (हिंदी)', desc: 'Devanagari script' }
              ].map((l) => (
                <button
                  type="button"
                  key={l.id}
                  onClick={() => setPreferredLanguage(l.id)}
                  className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                    preferredLanguage === l.id
                      ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                      : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-slate-100">{l.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{l.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <span>Next: Schedule &amp; Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="p-6 rounded-xl border border-slate-800 bg-[#111827] space-y-6">
          <div className="space-y-1">
            <h1 className="font-display text-xl font-bold text-slate-50">
              4. Study Schedule &amp; Device Setup
            </h1>
            <p className="text-xs text-slate-400">
              Your adaptive planner schedules daily lessons, coding labs, and spaced reviews to fit your time.
            </p>
          </div>

          <div className="space-y-3">
            <label
              htmlFor="daily-minutes"
              className="text-xs font-semibold text-slate-200 flex items-center justify-between"
            >
              <span>Daily Study Time Target</span>
              <span className="text-blue-400 font-mono tabular-nums">{dailyStudyMinutes} minutes / day</span>
            </label>
            <input
              id="daily-minutes"
              type="range"
              min="20"
              max="180"
              step="10"
              value={dailyStudyMinutes}
              onChange={(e) => setDailyStudyMinutes(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>20 mins (micro-learning)</span>
              <span>60 mins (recommended)</span>
              <span>180 mins (intensive)</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-xs font-semibold text-slate-200">Available Days of the Week</p>
            <div className="flex flex-wrap gap-2">
              {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((d) => {
                const active = availableDays.includes(d);
                return (
                  <button
                    type="button"
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={`px-3 py-1.5 rounded-md text-xs uppercase font-mono font-medium transition-colors ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label htmlFor="device-type" className="text-xs font-semibold text-slate-200 block">
                Device Hardware
              </label>
              <select
                id="device-type"
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="browser-only">Browser Only / Low-Spec Laptop</option>
                <option value="standard-pc">Standard PC (8GB+ RAM)</option>
                <option value="gpu-workstation">Workstation with Dedicated GPU</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="target-milestone" className="text-xs font-semibold text-slate-200 block">
                Target Outcome
              </label>
              <select
                id="target-milestone"
                value={targetMilestone}
                onChange={(e) => setTargetMilestone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="fundamentals">Understand Fundamentals Clearly</option>
                <option value="build-projects">Build Real Portfolio Projects</option>
                <option value="internship">Internship Readiness</option>
                <option value="job-ready">Full-Time Engineering Role</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-300 hover:text-white"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <span>Next: Diagnostic Check</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="p-6 rounded-xl border border-slate-800 bg-[#111827] space-y-6">
          <div className="space-y-1">
            <h1 className="font-display text-xl font-bold text-slate-50">
              5. Quick Baseline Check
            </h1>
            <p className="text-xs text-slate-400">
              No pressure — selecting &quot;not sure yet&quot; simply starts you cleanly from Computer Fundamentals.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-4">
            <p className="text-xs sm:text-sm text-slate-100 font-medium">
              When a program runs, where does the CPU fetch active data and instructions for fast access?
            </p>

            <div className="space-y-2">
              {[
                { id: 'A', text: 'Directly from the SSD hard drive every nanosecond' },
                { id: 'B', text: 'From RAM (Random Access Memory), which acts as the fast working desk' },
                { id: 'C', text: 'From remote cloud internet servers' },
                { id: 'D', text: 'I am not sure yet (Start from absolute zero)' }
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setDiagnosticAnswer(opt.id)}
                  className={`w-full p-3 rounded-lg border text-left text-xs transition-colors ${
                    diagnosticAnswer === opt.id
                      ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="font-mono font-bold mr-2 text-blue-400">{opt.id}.</span>
                  {opt.text}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-300 hover:text-white"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleFinish}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <span>{loading ? 'Saving Profile...' : 'Build My Learning Plan'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
