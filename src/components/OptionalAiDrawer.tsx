'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare, X, Send, HelpCircle } from 'lucide-react';

interface ChatItem {
  role: 'user' | 'assistant';
  content: string;
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

export default function OptionalAiDrawer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<'english' | 'hinglish' | 'hindi'>('english');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      role: 'assistant',
      content:
        'Optional Study Assistant ready. All curriculum, lessons, and skill unlocks work without AI—use this drawer whenever you want a simpler explanation, a real-world analogy, or help debugging code.',
    },
  ]);

  // Don't float on the dedicated /coach page
  if (pathname === '/coach') return null;

  const topicIdMatch = pathname.match(/^\/topics\/([^/]+)/);
  const currentTopicId = topicIdMatch ? topicIdMatch[1] : undefined;

  const sendMessage = async (customText?: string) => {
    const query = (customText ?? input).trim();
    if (!query || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: query }]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: currentTopicId,
          userQuery: query,
          language,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || data.error || 'Please try rephrasing your question.',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Could not reach the assistant right now. Try again in a moment.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open optional AI study assistant"
          className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111827]/95 backdrop-blur hover:bg-[#162032] border border-slate-700 text-slate-100 text-xs font-medium shadow-lg transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Ask AI Helper</span>
          <span className="sm:hidden">AI Help</span>
        </button>
      )}

      {open && (
        <aside
          aria-label="Optional AI Study Assistant"
          className="fixed bottom-5 right-5 z-50 w-[min(400px,calc(100vw-2rem))] h-[520px] max-h-[80vh] rounded-2xl border border-slate-700 bg-[#111827] shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Optional AI Study Helper</h2>
              <p className="text-xs text-slate-400">
                {currentTopicId ? `Context: ${currentTopicId}` : 'Explanations, analogies & debugging'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close AI study assistant"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Language Switcher */}
          <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between gap-2 bg-[#0B1120]/50">
            <span className="text-xs text-slate-400">Language</span>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800">
              {(['english', 'hinglish', 'hindi'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
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

          {/* Quick Helpers */}
          <div className="px-4 py-2 border-b border-slate-800 flex flex-wrap items-center gap-1.5">
            {[
              'Explain this simply',
              'Real-world analogy',
              'Give me Hint 1',
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-800 text-[11px] text-slate-300 whitespace-nowrap transition-colors"
              >
                <HelpCircle className="w-3 h-3 text-blue-400" />
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#0B1120] border border-slate-800 text-slate-200'
                  }`}
                >
                  {m.role === 'assistant' ? renderAssistantText(m.content) : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-slate-400 px-2">Thinking...</div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-3 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question or paste an error..."
              aria-label="Ask optional AI helper"
              className="flex-1 bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send question"
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
