'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Send, Languages, ArrowLeft } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  source?: 'live_model' | 'curriculum_grounded_fallback';
  model?: string;
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

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am your optional Study Helper. Your entire curriculum, roadmaps, coding labs, and skill unlocks work independently without AI—use this chat whenever you want a simpler explanation, a real-world analogy, or help debugging an error.

You can ask in English, Hinglish (e.g. "Variable kya hota hai?"), or Hindi.`
    }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<'english' | 'hinglish' | 'hindi'>('english');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string, hintLevel?: number) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

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
          language,
          hintLevel
        })
      });

      const data = await res.json();
      const botMsg: Message = {
        role: 'assistant',
        content: data.reply || 'Let me walk through that concept step by step.',
        source: data.source,
        model: data.model
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered a temporary issue. Please try asking again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-4 flex flex-col h-[80vh]">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <Link href="/roadmap" className="hover:text-slate-100 flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Structured Curriculum
        </Link>
        <span className="font-mono text-slate-400">Optional Assistant · Curriculum Works Standalone</span>
      </div>

      {/* Header & Language selector */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#111827] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600/15 text-blue-400 border border-blue-500/25">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold text-slate-50">
              Optional AI Study Helper
            </h1>
            <p className="text-xs text-slate-400">
              Plain-language analogies · Code explanations · Debugging hints
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

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {[
          'Explain variables with a simple everyday analogy',
          'Difference between RAM and CPU?',
          'Why does range(1, 5) stop at 4?',
          'Variables ko kitchen analogy se samjhao'
        ].map((promptText, i) => (
          <button
            type="button"
            key={i}
            onClick={() => handleSend(promptText)}
            className="px-3 py-1.5 rounded-lg bg-[#111827] border border-slate-800 text-slate-300 hover:text-blue-300 hover:border-blue-500/40 text-xs transition-colors"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl p-4 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#111827] border border-slate-800 text-slate-200 space-y-2'
              }`}
            >
              <div className="whitespace-pre-wrap">
                {m.role === 'assistant' ? renderAssistantText(m.content) : m.content}
              </div>
              {m.source && (
                <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>
                    {m.source === 'live_model' ? 'Live AI Helper' : 'Curriculum Reference Guide'}
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
              <span>Preparing explanation...</span>
            </div>
          </div>
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
          aria-label="Ask the optional study helper"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            language === 'hinglish'
              ? 'Poochiye koi bhi sawal... (e.g. "Loop kaise kaam karta hai?")'
              : 'Ask any concept question or paste an error message...'
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
  );
}
