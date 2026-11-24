'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Code2,
  BrainCircuit,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Laptop,
  Languages,
  Target,
  Compass
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // 10 Onboarding Questions state
  const [careerGoal, setCareerGoal] = useState('software-engineer');
  const [experienceLevel, setExperienceLevel] = useState('absolute-zero');
  const [priorLanguage, setPriorLanguage] = useState('none');
  const [mathComfort, setMathComfort] = useState('basic');
  const [preferredLanguage, setPreferredLanguage] = useState('english');
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState(60);
  const [availableDays, setAvailableDays] = useState(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
  const [preferredMethod, setPreferredMethod] = useState('practice-first');
  const [deviceType, setDeviceType] = useState('browser-only');
  const [targetMilestone, setTargetMilestone] = useState('job-ready');

  // Mini diagnostic question
  const [diagnosticAnswer, setDiagnosticAnswer] = useState('');
  const [diagnosticScore, setDiagnosticScore] = useState(100);

  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      if (availableDays.length > 1) {
        setAvailableDays(availableDays.filter(d => d !== day));
      }
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Diagnostic check: if question is answered correctly
      const score = diagnosticAnswer === 'B' ? 100 : (diagnosticAnswer === '' ? 80 : 50);
      setDiagnosticScore(score);

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
        router.push('/dashboard'); // Proceed to dashboard regardless
      }
    } catch {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      {/* Step Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-indigo-400">Zero-Barrier Onboarding</span>
          <span>Step {step} of 3</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-500 h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">1. Select Your Career Goal</h2>
            <p className="text-xs text-slate-400">You can change your target pathway anytime.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'software-engineer', title: 'Software Engineer', icon: Code2, desc: 'Systems, DBs & APIs' },
              { id: 'ml-engineer', title: 'ML Engineer', icon: BrainCircuit, desc: 'Data wrangling & PyTorch' },
              { id: 'ai-engineer', title: 'AI Engineer', icon: Sparkles, desc: 'LLMs, RAG & Agents' }
            ].map((c) => {
              const Icon = c.icon;
              const selected = careerGoal === c.id;
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCareerGoal(c.id)}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    selected
                      ? 'border-indigo-500 bg-indigo-600/15 text-white ring-1 ring-indigo-500'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-3 ${selected ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <div>
                    <h3 className="font-semibold text-sm">{c.title}</h3>
                    <p className="text-[11px] text-slate-400">{c.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-slate-300">2. Current Programming Experience</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'absolute-zero', label: 'Absolute Zero', sub: 'Never written 1 line of code' },
                { id: 'tried-tutorials', label: 'Tried Tutorials', sub: 'Know what variables are' },
                { id: 'intermediate', label: 'Built Small Scripts', sub: 'Understand basics' }
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setExperienceLevel(opt.id)}
                  className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                    experienceLevel === opt.id
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-slate-200">{opt.label}</div>
                  <div className="text-[10px] text-slate-500">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-slate-300">3. Preferred Learning Language</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'english', label: 'English', desc: 'Standard technical English' },
                { id: 'hinglish', label: 'Hinglish', desc: 'Hindi in Roman letters' },
                { id: 'hindi', label: 'Hindi (हिंदी)', desc: 'Devanagari script' }
              ].map((l) => (
                <button
                  type="button"
                  key={l.id}
                  onClick={() => setPreferredLanguage(l.id)}
                  className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                    preferredLanguage === l.id
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-slate-200">{l.label}</div>
                  <div className="text-[10px] text-slate-500">{l.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <span>Next: Time & Preferences</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">4. Study Schedule & Device Constraints</h2>
            <p className="text-xs text-slate-400">Our adaptive planner schedules study blocks based on realistic availability.</p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Daily Study Time Target</span>
              <span className="text-indigo-400 font-mono">{dailyStudyMinutes} minutes / day</span>
            </label>
            <input
              type="range"
              min="20"
              max="180"
              step="10"
              value={dailyStudyMinutes}
              onChange={(e) => setDailyStudyMinutes(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>20 mins (micro-learning)</span>
              <span>60 mins (recommended)</span>
              <span>180 mins (intensive)</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-slate-300">Available Days of the Week</label>
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
                        ? 'bg-indigo-600 text-white'
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
              <label className="text-xs font-semibold text-slate-300">Device Hardware</label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="browser-only">Browser Only / Low-Spec Laptop</option>
                <option value="standard-pc">Standard PC (8GB+ RAM)</option>
                <option value="gpu-workstation">Workstation with Dedicated GPU</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Target Outcome</label>
              <select
                value={targetMilestone}
                onChange={(e) => setTargetMilestone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="fundamentals">Understand Fundamentals Clearly</option>
                <option value="build-projects">Build Real Portfolio Projects</option>
                <option value="internship">Internship Readiness</option>
                <option value="job-ready">Full-Time Software/AI Engineer Role</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-lg border border-slate-800 text-xs text-slate-400 hover:text-white"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <span>Next: Diagnostic Check</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">5. Quick Diagnostic Check</h2>
            <p className="text-xs text-slate-400">
              This helps calibrate your starting module so you don't repeat concepts you already know.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-4">
            <p className="text-xs sm:text-sm text-slate-200 font-medium">
              A computer's CPU wants to read instructions currently running. Where does it fetch active data from during execution?
            </p>

            <div className="space-y-2">
              {[
                { id: 'A', text: 'Directly from the SSD hard drive each nanosecond' },
                { id: 'B', text: 'From RAM (Random Access Memory), which acts as fast working workspace' },
                { id: 'C', text: 'From the cloud internet servers' },
                { id: 'D', text: 'I am not sure yet (Start from absolute zero)' }
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setDiagnosticAnswer(opt.id)}
                  className={`w-full p-3 rounded-md border text-left text-xs transition-colors ${
                    diagnosticAnswer === opt.id
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                      : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="font-mono font-bold mr-2 text-indigo-400">{opt.id}.</span>
                  {opt.text}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-lg border border-slate-800 text-xs text-slate-400 hover:text-white"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleFinish}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? 'Building Personalized Roadmap...' : 'Generate My Roadmap'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
