'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Languages,
  Lightbulb,
  HelpCircle,
  Code2,
  Cpu
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  source?: 'live_model' | 'curriculum_grounded_fallback';
  model?: string;
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am your **AI Learning Coach**. I'm here to explain concepts simply, give intuitive real-world analogies, and guide you step by step.

You can ask me in **English**, **Hinglish** (e.g. *"Variable kya hota hai?"*), or **Hindi**.

How can I help you today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<'english' | 'hinglish' | 'hindi'>('hinglish');
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
        content: data.reply || 'Let me help you understand that concept step by step.',
        source: data.source,
        model: data.model
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue. Please try asking again!'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-4 flex flex-col h-[82vh]">
      {/* Header & Language selector */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">AI Personal Learning Coach</h1>
            <p className="text-[11px] text-slate-400">Socratic guidance • Real-world analogies • Error diagnosis</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          {(['hinglish', 'english', 'hindi'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold capitalize transition-colors ${
                language === lang
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          'Variables ko kitchen analogy se samjhao',
          'Difference between RAM and CPU?',
          'Why does range(1, 5) stop at 4?',
          'Explain what a merge conflict is'
        ].map((promptText, i) => (
          <button
            key={i}
            onClick={() => handleSend(promptText)}
            className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/30 text-[11px] transition-colors"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none space-y-2'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
              {m.source && (
                <div className="pt-2 mt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>
                    {m.source === 'live_model' ? '⚡ Live AI Reasoning' : '📘 Curriculum Mentor Engine'}
                  </span>
                  <span>{m.model}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-800 text-slate-400 text-xs rounded-xl p-3 flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span>Coach is thinking...</span>
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            language === 'hinglish'
              ? 'Poochiye koi bhi sawal... (e.g. "Loop kaise kaam karta hai?")'
              : 'Ask any question or paste an error message...'
          }
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
