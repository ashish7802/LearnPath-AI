'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  Languages,
  ArrowLeft,
  Compass,
  ArrowRight,
  ShieldCheck,
  Code2,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  source?: 'live_model' | 'curriculum_grounded_fallback';
  model?: string;
  groundingBadge?: string;
  recommendations?: any[];
}

function renderAssistantText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1 py-0.5 rounded bg-slate-800 text-blue-300 font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

const CONTEXTUAL_PROMPTS = [
  { label: 'Explain this concept in simple Hindi', lang: 'hindi' as const },
  { label: 'I do not understand this step', lang: 'english' as const },
  { label: 'Give me a real-world example', lang: 'english' as const },
  { label: 'Why am I learning this?', lang: 'english' as const },
  { label: 'What should I learn next?', lang: 'english' as const },
  { label: "Make today's study plan shorter", lang: 'english' as const },
  { label: 'Explain the mistake in my code', lang: 'english' as const },
  { label: 'Variables ko kitchen analogy se samjhao', lang: 'hinglish' as const },
];

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am your **AI Personal Learning Coach**. Your entire curriculum, roadmaps, coding labs, and skill unlocks work deterministically—use this coach whenever you want a simpler explanation, a real-world analogy, Socratic guidance, or help debugging code.

You can ask in **English**, **Hinglish** (e.g. *"Variable kya hota hai?"*), or **Hindi (हिंदी)**.`,
      groundingBadge: 'Verified Curriculum Tutor Engine (Deterministic Grounding)',
    },
  ]);
  const [input, setInput] = useState('');
  const [codeAttempt, setCodeAttempt] = useState('');
  const [showCodeBox, setShowCodeBox] = useState(false);
  const [language, setLanguage] = useState<'english' | 'hinglish' | 'hindi'>('english');
  const [topicId, setTopicId] = useState<string | undefined>(undefined);
  const [recData, setRecData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tParam = params.get('topic');
      if (tParam) setTopicId(tParam);
    }
    fetch('/api/recommendations')
      .then((r) => r.json())
      .then((data) => setRecData(data))
      .catch(() => {});
  }, []);

  const handleSend = async (
    queryText?: string,
    overrideLang?: 'english' | 'hinglish' | 'hindi',
    hintLevel?: number
  ) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const activeLang = overrideLang || language;
    if (overrideLang) setLanguage(overrideLang);

    const userMsg: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: textToSend,
          language: activeLang,
          topicId,
          userCodeAttempt: codeAttempt.trim() || undefined,
          hintLevel,
        }),
      });

      const data = await res.json();
      const botMsg: Message = {
        role: 'assistant',
        content: data.reply || 'Let me walk through that concept step by step.',
        source: data.source,
        model: data.model,
        groundingBadge: data.groundingBadge,
        recommendations: data.recommendations || [],
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered a temporary issue. Please try asking again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const recommendations: any[] = recData?.recommendations || [];

  return (
    <div className="max-w-6xl mx-auto py-4 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <Link href="/roadmap" className="hover:text-slate-100 flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Structured Curriculum
        </Link>
        <span className="font-mono text-slate-400">
          Context-Grounded Socratic Coach · Curriculum Works 100% Standalone
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Conversational Learning Coach */}
        <div className="lg:col-span-8 space-y-4 flex flex-col">
          {/* Header & Language selector */}
          <div className="p-4 rounded-xl border border-slate-800 bg-[#111827] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600/15 text-blue-400 border border-blue-500/25">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display text-base font-bold text-slate-50">
                  AI Personal Learning Coach
                </h1>
                <p className="text-xs text-slate-400">
                  Socratic guidance · Plain-language analogies · Code debugging · English, Hinglish &amp; Hindi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
              <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              {(['english', 'hinglish', 'hindi'] as const).map((lang) => (
                <button
                  type="button"
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors ${
                    language === lang
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Contextual Learner Quick Prompts */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              One-Click Coaching &amp; Diagnostic Prompts:
            </div>
            <div className="flex flex-wrap gap-2">
              {CONTEXTUAL_PROMPTS.map((item, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handleSend(item.label, item.lang)}
                  className="px-3 py-1.5 rounded-lg bg-[#111827] border border-slate-800 text-slate-300 hover:text-blue-300 hover:border-blue-500/40 text-xs transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="min-h-[380px] max-h-[500px] overflow-y-auto p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-xl p-4 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#111827] border border-slate-800 text-slate-200 space-y-2'
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {m.role === 'assistant' ? renderAssistantText(m.content) : m.content}
                  </div>
                  {m.role === 'assistant' && m.recommendations && m.recommendations.length > 0 && (
                    <div className="pt-2 space-y-2">
                      {m.recommendations.map((rec: any, rIdx: number) => (
                        <div
                          key={rec.id || rIdx}
                          className="p-3 rounded-lg border border-blue-500/25 bg-[#0B1120] space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <span className="font-mono text-blue-400 uppercase">{rec.type}</span>
                            <span className="font-mono text-slate-400 tabular-nums">{rec.durationMins} min</span>
                          </div>
                          <div className="text-xs font-semibold text-white">{rec.title}</div>
                          <p className="text-[11px] text-slate-400">{rec.whySelected}</p>
                          <Link
                            href={rec.actionUrl}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300"
                          >
                            <span>{rec.actionLabel}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                  {m.role === 'assistant' && (m.groundingBadge || m.source) && (
                    <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                      <span className="inline-flex items-center gap-1.5 text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {m.groundingBadge ||
                          (m.source === 'live_model'
                            ? 'Live AI Model Grounded in Verified Curriculum'
                            : 'Verified Curriculum Tutor Engine')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#111827] border border-slate-800 text-slate-400 text-xs rounded-xl p-3 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing grounded explanation...</span>
                </div>
              </div>
            )}
          </div>

          {/* Optional Code Debugging Attachment */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowCodeBox((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showCodeBox ? 'Hide Code Snippet Box' : 'Attach Code Snippet for Debugging Help'}</span>
            </button>

            {showCodeBox && (
              <textarea
                rows={3}
                value={codeAttempt}
                onChange={(e) => setCodeAttempt(e.target.value)}
                placeholder="Paste your code snippet or error message here so the coach can explain the exact bug..."
                className="w-full bg-[#111827] border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              aria-label="Ask the AI Personal Learning Coach"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                language === 'hinglish'
                  ? 'Poochiye koi bhi sawal... (e.g. "Loop kaise kaam karta hai?")'
                  : language === 'hindi'
                  ? 'कोई भी कॉन्सेप्ट या कोड सवाल पूछें...'
                  : 'Ask any concept question, request a simpler analogy, or paste an error...'
              }
              className="flex-1 bg-[#111827] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              aria-label="Send question"
              disabled={loading || !input.trim()}
              className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right 4 Cols: Explainable Chat-Based Learning Recommendations */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-xl border border-slate-800 bg-[#111827] space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-blue-400 font-semibold">
                  Adaptive Coach Context
                </span>
                <Compass className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="font-display text-base font-bold text-white">
                Explainable Next Actions
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Grounded in your active career track (
                <span className="text-slate-200 font-medium capitalize">
                  {(recData?.careerGoal || 'software-engineer').replace(/-/g, ' ')}
                </span>
                ),{' '}
                <span className="text-slate-200 tabular-nums">{recData?.masteredCount || 0}</span> mastered
                topic(s), and{' '}
                <span className="text-slate-200 tabular-nums">{recData?.dailyStudyMinutes || 60} min</span>{' '}
                daily study target.
              </p>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec: any) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl border border-slate-800 bg-[#0B1120] space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-blue-400 uppercase font-semibold">{rec.type}</span>
                    <span className="text-slate-400 tabular-nums">{rec.durationMins || rec.estimatedMins} min</span>
                  </div>
                  <h3 className="text-xs font-semibold text-white">{rec.title}</h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-slate-100">Why selected:</strong> {rec.whySelected}
                  </p>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-slate-500">{rec.evidenceBadge}</span>
                    <Link
                      href={rec.actionUrl || rec.href || '/roadmap'}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
                    >
                      <span>{rec.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
