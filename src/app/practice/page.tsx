'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Play,
  CheckCircle2,
  XCircle,
  Lightbulb,
  RotateCcw,
  ArrowRight,
  Code2,
  BookOpen,
  RefreshCw,
} from 'lucide-react';

function renderInlineCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, idx) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code
        key={idx}
        className="px-1.5 py-0.5 rounded bg-slate-800/90 text-blue-300 font-mono text-xs"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      <React.Fragment key={idx}>{part}</React.Fragment>
    )
  );
}

function PracticeContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'challenges' | 'languages' | 'revision') || 'challenges';
  const initialLang = searchParams.get('lang') || 'python';

  const [activeTab, setActiveTab] = useState<'challenges' | 'languages' | 'revision'>(initialTab);
  const [practiceData, setPracticeData] = useState<any>(null);
  const [plannerData, setPlannerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Challenges state
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');
  const [challengeCode, setChallengeCode] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [runningChallenge, setRunningChallenge] = useState(false);
  const [challengeResult, setChallengeResult] = useState<any>(null);
  const [challengeNotice, setChallengeNotice] = useState('');

  // Languages playground state
  const [selectedLangId, setSelectedLangId] = useState(initialLang);
  const [playgroundCode, setPlaygroundCode] = useState('');
  const [runningPlayground, setRunningPlayground] = useState(false);
  const [playgroundOutput, setPlaygroundOutput] = useState<{ ok: boolean; text: string } | null>(null);

  // Revision flashcards state
  const [revealedCardId, setRevealedCardId] = useState<string | null>(null);
  const [revisionNotice, setRevisionNotice] = useState('');
  const [ratingBusy, setRatingBusy] = useState(false);

  const loadAll = async () => {
    try {
      const [pRes, plRes] = await Promise.all([
        fetch('/api/practice').then((r) => r.json()),
        fetch('/api/planner').then((r) => r.json()),
      ]);
      setPracticeData(pRes);
      setPlannerData(plRes);

      if (pRes?.challenges?.length > 0 && !selectedChallengeId) {
        setSelectedChallengeId(pRes.challenges[0].id);
        setChallengeCode(pRes.challenges[0].starterCode);
      }
      if (pRes?.languages?.length > 0) {
        const langObj =
          pRes.languages.find((l: any) => l.id === selectedLangId) || pRes.languages[0];
        setPlaygroundCode((prev) => (prev ? prev : langObj.exampleCode));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const challenges: any[] = practiceData?.challenges || [];
  const languages: any[] = practiceData?.languages || [];
  const activeChallenge = challenges.find((c) => c.id === selectedChallengeId) || challenges[0];
  const activeLanguage = languages.find((l) => l.id === selectedLangId) || languages[0];
  const revisionQueue: any[] = plannerData?.revisionQueue || [];

  const handleSelectChallenge = (ch: any) => {
    setSelectedChallengeId(ch.id);
    setChallengeCode(ch.starterCode);
    setChallengeResult(null);
    setChallengeNotice('');
    setShowHint(false);
  };

  const handleRunChallenge = async () => {
    if (!activeChallenge) return;
    setRunningChallenge(true);
    setChallengeNotice('');
    try {
      const res = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: activeChallenge.id, code: challengeCode }),
      });
      const data = await res.json();
      if (data.result) {
        setChallengeResult(data.result);
        if (data.result.passed) {
          setChallengeNotice(
            data.saved
              ? `Challenge solved! +${data.xpAwarded} XP saved to your profile.`
              : 'All tests passed! Sign in to persist your XP and completed badge.'
          );
          loadAll();
        }
      } else {
        setChallengeNotice(data.error || 'Could not evaluate code.');
      }
    } catch {
      setChallengeNotice('Error executing challenge tests.');
    } finally {
      setRunningChallenge(false);
    }
  };

  const handleSelectLanguage = (lang: any) => {
    setSelectedLangId(lang.id);
    setPlaygroundCode(lang.exampleCode);
    setPlaygroundOutput(null);
  };

  const handleRunPlayground = async () => {
    if (!activeLanguage) return;
    setRunningPlayground(true);
    try {
      const res = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'playground',
          language: activeLanguage.runnableLanguage,
          code: playgroundCode,
        }),
      });
      const data = await res.json();
      if (data.playground) {
        setPlaygroundOutput({
          ok: data.playground.ok,
          text: data.playground.ok
            ? data.playground.output
            : `Error: ${data.playground.error}`,
        });
      }
    } catch {
      setPlaygroundOutput({ ok: false, text: 'Could not run snippet.' });
    } finally {
      setRunningPlayground(false);
    }
  };

  const handleRateRevision = async (topicId: string, quality: number) => {
    setRatingBusy(true);
    setRevisionNotice('');
    try {
      const res = await fetch('/api/revision/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, quality }),
      });
      const data = await res.json();
      if (res.ok) {
        setRevisionNotice(`${data.message} (+${data.xpAwarded} XP)`);
        setRevealedCardId(null);
        loadAll();
      } else {
        setRevisionNotice(data.error || 'Sign in to save spaced repetition progress.');
      }
    } catch {
      setRevisionNotice('Could not save revision review.');
    } finally {
      setRatingBusy(false);
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-sm text-slate-400">Loading practice arena...</div>;
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header & Workspace Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-blue-400">Hands-On Mastery &amp; Active Recall</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Coding Practice, Languages &amp; Revision
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Solve verified sandbox coding challenges, run live interactive examples across 8 programming languages, and strengthen retention with SM-2 flashcards.
          </p>
        </div>

        {/* Segmented Tabs */}
        <div
          role="tablist"
          aria-label="Practice sections"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#111827] border border-slate-800 shrink-0"
        >
          <button
            role="tab"
            type="button"
            aria-selected={activeTab === 'challenges'}
            onClick={() => setActiveTab('challenges')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'challenges' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Challenges ({practiceData?.completedCount || 0}/{challenges.length})</span>
          </button>
          <button
            role="tab"
            type="button"
            aria-selected={activeTab === 'languages'}
            onClick={() => setActiveTab('languages')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'languages' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Languages Hub ({languages.length})</span>
          </button>
          <button
            role="tab"
            type="button"
            aria-selected={activeTab === 'revision'}
            onClick={() => setActiveTab('revision')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'revision' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Revision ({revisionQueue.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CODING CHALLENGES ARENA */}
      {activeTab === 'challenges' && activeChallenge && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Challenge List */}
          <div className="lg:col-span-4 space-y-2.5">
            {challenges.map((ch) => {
              const selected = ch.id === activeChallenge.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => handleSelectChallenge(ch)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors space-y-1.5 ${
                    selected
                      ? 'border-blue-500 bg-[#162032]'
                      : 'border-slate-800 bg-[#111827] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-400">
                      {ch.category} · {ch.difficulty}
                    </span>
                    {ch.completed ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                      </span>
                    ) : (
                      <span className="font-mono text-blue-400 tabular-nums">+{ch.xpReward} XP</span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-white">{ch.title}</div>
                  <div className="text-xs font-mono text-slate-500">{ch.language}</div>
                </button>
              );
            })}
          </div>

          {/* Challenge Sandbox Editor */}
          <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-[#111827] overflow-hidden">
            <div className="p-5 border-b border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                <span>
                  {activeChallenge.category} · {activeChallenge.difficulty} · {activeChallenge.language}
                </span>
                <span className="font-mono text-blue-400 tabular-nums">+{activeChallenge.xpReward} XP</span>
              </div>
              <h2 className="font-display text-lg font-bold text-white">{activeChallenge.title}</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {renderInlineCode(activeChallenge.instructions)}
              </p>
            </div>

            <textarea
              rows={9}
              value={challengeCode}
              onChange={(e) => setChallengeCode(e.target.value)}
              aria-label={`Code editor for ${activeChallenge.title}`}
              spellCheck={false}
              className="w-full bg-[#0B1120] p-4 font-mono text-sm text-slate-100 leading-relaxed focus:outline-none resize-y"
            />

            <div className="px-5 py-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs font-medium text-amber-300 hover:text-amber-200 inline-flex items-center gap-1.5"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChallengeCode(activeChallenge.starterCode);
                    setChallengeResult(null);
                    setChallengeNotice('');
                  }}
                  className="text-xs font-medium text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Code</span>
                </button>
              </div>

              <button
                type="button"
                disabled={runningChallenge}
                onClick={handleRunChallenge}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{runningChallenge ? 'Running Tests...' : 'Run & Verify Challenge'}</span>
              </button>
            </div>

            {showHint && (
              <div className="px-5 py-3 bg-amber-500/10 border-t border-amber-500/20 text-xs text-amber-200">
                <strong>Hint: </strong>
                {renderInlineCode(activeChallenge.solutionHint)}
              </div>
            )}

            {challengeNotice && (
              <div className="px-5 py-3 bg-emerald-500/10 border-t border-emerald-500/20 text-xs font-medium text-emerald-300">
                {challengeNotice}
              </div>
            )}

            {challengeResult && (
              <div className="p-5 border-t border-slate-800 bg-[#0B1120] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Test Case Results</span>
                  <span
                    className={`font-mono font-semibold tabular-nums ${
                      challengeResult.passed ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {challengeResult.testsPassed} / {challengeResult.testsTotal} Passed
                  </span>
                </div>
                <div className="divide-y divide-slate-800 rounded-lg border border-slate-800 bg-[#111827]">
                  {challengeResult.visibleResults?.map((t: any, i: number) => (
                    <div key={i} className="p-3 flex items-start justify-between gap-4 text-xs">
                      <div className="space-y-0.5">
                        <div className="text-slate-200 font-medium">{t.description}</div>
                        <div className="font-mono text-slate-400">
                          Input: {t.input} · Expected: {t.expected} · Actual: {t.actual}
                        </div>
                      </div>
                      <span className={t.passed ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                        {t.passed ? 'Pass' : 'Fail'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PROGRAMMING LANGUAGES HUB */}
      {activeTab === 'languages' && activeLanguage && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => handleSelectLanguage(lang)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeLanguage.id === lang.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#111827] border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Guide Info & Line-by-line Syntax */}
            <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-5">
              <div className="space-y-1.5">
                <div className="text-xs text-slate-400">
                  {activeLanguage.paradigm} · {activeLanguage.difficulty}
                </div>
                <h2 className="font-display text-2xl font-bold text-white">{activeLanguage.name}</h2>
                <p className="text-sm text-slate-300 leading-relaxed">{activeLanguage.starterConcept}</p>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-1">
                <div className="text-xs font-semibold text-slate-300">Primary Industry Uses</div>
                <p className="text-xs text-slate-400">{activeLanguage.usedFor}</p>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                <div className="text-xs font-semibold text-slate-300">Syntax Breakdown</div>
                <div className="space-y-2.5">
                  {activeLanguage.syntaxBreakdown.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-0.5">
                      <code className="block font-mono text-xs text-blue-300">{item.snippet}</code>
                      <p className="text-xs text-slate-400">{item.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/topics/${activeLanguage.relatedTopicId}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  <span>Open Full {activeLanguage.name} Curriculum Topic</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Interactive Language Sandbox */}
            <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#111827] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Interactive {activeLanguage.name} Sandbox
                  </h3>
                  <p className="text-xs text-slate-400">
                    Modify variables or values below and click Run to observe behavior live.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setPlaygroundCode(activeLanguage.exampleCode);
                      setPlaygroundOutput(null);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:text-white"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    disabled={runningPlayground}
                    onClick={handleRunPlayground}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{runningPlayground ? 'Running...' : 'Run Code'}</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={10}
                value={playgroundCode}
                onChange={(e) => setPlaygroundCode(e.target.value)}
                aria-label={`${activeLanguage.name} interactive code editor`}
                spellCheck={false}
                className="w-full bg-[#0B1120] p-4 font-mono text-sm text-slate-100 leading-relaxed focus:outline-none resize-y"
              />

              <div className="p-4 border-t border-slate-800 bg-[#0B1120]">
                <div className="text-xs text-slate-400 mb-1.5">Console Output</div>
                {playgroundOutput ? (
                  <pre
                    className={`font-mono text-xs whitespace-pre-wrap ${
                      playgroundOutput.ok ? 'text-emerald-300' : 'text-rose-300'
                    }`}
                  >
                    {playgroundOutput.text}
                  </pre>
                ) : (
                  <pre className="font-mono text-xs text-slate-500 whitespace-pre-wrap">
                    Expected: {activeLanguage.expectedOutput}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVE RECALL SPACED REVISION */}
      {activeTab === 'revision' && (
        <div className="space-y-6">
          {revisionNotice && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm">
              {revisionNotice}
            </div>
          )}

          {revisionQueue.length === 0 ? (
            <div className="p-8 rounded-xl border border-slate-800 bg-[#111827] text-center space-y-3">
              <h2 className="text-base font-semibold text-white">No Spaced Revision Cards Yet</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Pass your first topic assessment (or sign in to the demo learner account) to unlock automated 1-day, 6-day, and 30-day SuperMemo-2 recall cards.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Link
                  href="/roadmap"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  Start a Topic
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Sign In
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {revisionQueue.map((item) => {
                const isRevealed = revealedCardId === item.topicId;
                return (
                  <div
                    key={item.id || item.topicId}
                    className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className={item.isDue ? 'font-semibold text-amber-300' : 'text-slate-400'}>
                          {item.isDue ? 'Due for Recall Today' : `Next review in ${item.intervalDays}d`}
                        </span>
                        <span className="font-mono text-slate-500 tabular-nums">
                          Rep #{item.repetitionCount} · EF {Number(item.easeFactor || 2.5).toFixed(2)}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-white">{item.title}</h3>
                      <p className="text-xs text-slate-400">
                        Try explaining this concept and its biggest pitfall out loud before revealing the core summary.
                      </p>

                      {isRevealed && (
                        <div className="pt-3 mt-3 border-t border-slate-800 space-y-2 text-xs text-slate-200 leading-relaxed">
                          <p>{item.plainExplanation}</p>
                          {item.commonMistakes?.length > 0 && (
                            <p className="text-amber-300">
                              <strong>Key Pitfall:</strong> {item.commonMistakes[0]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800">
                      {!isRevealed ? (
                        <button
                          type="button"
                          onClick={() => setRevealedCardId(item.topicId)}
                          className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                        >
                          Reveal Summary &amp; Rate Recall
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-xs text-slate-400">How clearly did you recall this?</div>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { label: 'Again', q: 1, cls: 'border-rose-500/40 text-rose-300 hover:bg-rose-500/10' },
                              { label: 'Hard', q: 3, cls: 'border-amber-500/40 text-amber-300 hover:bg-amber-500/10' },
                              { label: 'Good', q: 4, cls: 'border-blue-500/40 text-blue-300 hover:bg-blue-500/10' },
                              { label: 'Easy', q: 5, cls: 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10' },
                            ].map((btn) => (
                              <button
                                key={btn.label}
                                type="button"
                                disabled={ratingBusy}
                                onClick={() => handleRateRevision(item.topicId, btn.q)}
                                className={`py-2 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-50 ${btn.cls}`}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-slate-400">Loading practice arena...</div>}>
      <PracticeContent />
    </Suspense>
  );
}
