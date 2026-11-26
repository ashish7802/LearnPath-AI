'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  CheckCircle2,
  FileText,
  Layers,
} from 'lucide-react';
import {
  CONCEPT_VISUALIZATIONS,
  ConceptVisualizationSpec,
  getVisualizationForTopic,
} from '@/lib/concept-visualizations';

interface Props {
  topicId?: string;
  allowConceptSwitch?: boolean;
}

export default function ConceptVisualizer({
  topicId,
  allowConceptSwitch = true,
}: Props) {
  const initialSpec = topicId
    ? getVisualizationForTopic(topicId)
    : CONCEPT_VISUALIZATIONS[0];

  const [selectedId, setSelectedId] = useState<string>(initialSpec.id);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const spec: ConceptVisualizationSpec =
    CONCEPT_VISUALIZATIONS.find((v) => v.id === selectedId) || initialSpec;

  useEffect(() => {
    if (topicId) {
      const matched = getVisualizationForTopic(topicId);
      setSelectedId(matched.id);
      setStepIndex(0);
      setIsPlaying(false);
      setSelectedAnswer(null);
    }
  }, [topicId]);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mq.matches) {
        setIsPlaying(false);
        setReducedMotion(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= spec.steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2200);
    return () => clearInterval(timer);
  }, [isPlaying, spec.steps.length]);

  const currentStep = spec.steps[stepIndex] || spec.steps[0];

  const handleSelectConcept = (id: string) => {
    setSelectedId(id);
    setStepIndex(0);
    setIsPlaying(false);
    setSelectedAnswer(null);
  };

  return (
    <section
      aria-label={`Interactive Concept Visualization: ${spec.title}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') {
          setIsPlaying(false);
          setStepIndex((prev) => Math.min(spec.steps.length - 1, prev + 1));
        } else if (e.key === 'ArrowLeft') {
          setIsPlaying(false);
          setStepIndex((prev) => Math.max(0, prev - 1));
        }
      }}
      className="rounded-xl border border-slate-800 bg-[#111827] overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {/* Header & Concept Selector */}
      <div className="p-5 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0B1120]/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-blue-400 font-medium">
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Step-by-Step Concept Simulation · {spec.category}</span>
          </div>
          <h3 className="font-display text-lg font-bold text-white">{spec.title}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {allowConceptSwitch && (
            <div className="flex flex-wrap items-center gap-1.5">
              {CONCEPT_VISUALIZATIONS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleSelectConcept(v.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    spec.id === v.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {v.title.split(':')[0]}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setTextMode(!textMode)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>{textMode ? 'Interactive Diagram' : 'Accessible Text View'}</span>
          </button>
        </div>
      </div>

      {/* Two-Zone Sandbox Layout (60% Interactive Stage / 40% Concept & Control Deck) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Left Zone: Interactive Visual Stage */}
        <div className="lg:col-span-7 p-6 space-y-5 bg-[#0B1120]/40 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300">1. The Engineering Problem (Plain Words)</div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{spec.problemIntroduction}</p>
          </div>

          {textMode ? (
            /* Accessible Reduced-Motion Full Text Transcript */
            <div className="space-y-3 p-4 rounded-xl border border-slate-800 bg-[#0B1120]">
              <div className="text-xs font-semibold text-blue-400">
                Complete Text Walkthrough (Screen-Reader &amp; Reduced-Motion Transcript)
              </div>
              <ol className="space-y-3 text-xs text-slate-200">
                {spec.steps.map((st) => (
                  <li key={st.stepNumber} className="space-y-1 pb-2 border-b border-slate-800/80 last:border-none">
                    <div className="font-semibold text-white">
                      Step {st.stepNumber}: {st.label}
                    </div>
                    <p className="text-slate-300">{st.whatChanges}</p>
                    <code className="block font-mono text-[11px] text-blue-300">{st.codeOrFormula}</code>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            /* Interactive Step-by-Step Visual Stage */
            <div className="p-5 rounded-xl border border-slate-800 bg-[#0B1120] space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-800/80 pb-3">
                <span className="font-mono font-semibold text-blue-400">
                  Step {currentStep.stepNumber} of {spec.steps.length}: {currentStep.label}
                </span>
                <span className="font-mono text-slate-400 tabular-nums">
                  {currentStep.visualState.pointerLabel} · {currentStep.visualState.metricLabel}
                </span>
              </div>

              {/* Animated Visual Nodes (Dual-coded with explicit status labels + icons, never hue-only) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5">
                {currentStep.visualState.items.map((item) => {
                  let borderCls = 'border-slate-800 bg-[#111827] text-slate-200';
                  let statusTag = '● IDLE';
                  if (item.status === 'active') {
                    borderCls = 'border-blue-500 bg-blue-500/15 text-white';
                    statusTag = '▲ INSPECTING';
                  } else if (item.status === 'found') {
                    borderCls = 'border-emerald-500 bg-emerald-500/15 text-emerald-200';
                    statusTag = '✓ VERIFIED';
                  } else if (item.status === 'flowing') {
                    borderCls = 'border-amber-500 bg-amber-500/15 text-amber-200';
                    statusTag = '→ ACTIVE FLOW';
                  } else if (item.status === 'eliminated') {
                    borderCls = 'border-slate-800/60 bg-slate-950/60 text-slate-500 opacity-60';
                    statusTag = '✕ DISCARDED';
                  }

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border transition-opacity duration-150 space-y-1 ${borderCls}`}
                    >
                      <div className="text-[10px] font-mono uppercase tracking-wider opacity-85">
                        {statusTag}
                      </div>
                      <div className="font-mono text-sm font-bold tabular-nums">{item.label}</div>
                      {item.sublabel && (
                        <div className="text-[11px] font-mono opacity-85">{item.sublabel}</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Step Transition Explanation & Live Formula */}
              <div className="p-3.5 rounded-lg bg-[#111827] border border-slate-800 space-y-1.5">
                <div className="text-xs font-semibold text-white">What Changes at Step {currentStep.stepNumber}:</div>
                <p className="text-xs text-slate-300 leading-relaxed">{currentStep.whatChanges}</p>
                <pre className="pt-1 font-mono text-xs text-blue-300 overflow-x-auto">
                  <code>{currentStep.codeOrFormula}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Playback Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play Step-by-Step'}</span>
              </button>

              <button
                type="button"
                disabled={stepIndex === 0}
                onClick={() => {
                  setIsPlaying(false);
                  setStepIndex((s) => Math.max(0, s - 1));
                }}
                aria-label="Previous step"
                className="p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 disabled:opacity-40"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={stepIndex >= spec.steps.length - 1}
                onClick={() => {
                  setIsPlaying(false);
                  setStepIndex((s) => Math.min(spec.steps.length - 1, s + 1));
                }}
                aria-label="Next step"
                className="p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 disabled:opacity-40"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setStepIndex(0);
                }}
                aria-label="Reset simulation to step 1"
                className="px-2.5 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Direct Step Selector Buttons */}
            <div className="flex items-center gap-1.5">
              {spec.steps.map((st, idx) => (
                <button
                  key={st.stepNumber}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIndex(idx);
                  }}
                  aria-label={`Jump to step ${st.stepNumber}`}
                  className={`w-7 h-7 rounded-md font-mono text-xs font-semibold tabular-nums transition-colors ${
                    stepIndex === idx
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {st.stepNumber}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Zone: Concept Connection, Practical Use & Comprehension Check */}
        <div className="lg:col-span-5 p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-blue-400">2. How the Animation Connects to Code</div>
              <p className="text-xs text-slate-300 leading-relaxed">{spec.conceptConnection}</p>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-800">
              <div className="text-xs font-semibold text-emerald-400">3. Real-World Engineering Application</div>
              <p className="text-xs text-slate-300 leading-relaxed">{spec.practicalExample}</p>
            </div>
          </div>

          {/* Interactive Comprehension Question */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-white">
              4. Quick Comprehension Check
            </div>
            <p className="text-xs text-slate-200 font-medium">
              {spec.comprehensionQuestion.question}
            </p>
            <div className="space-y-1.5">
              {spec.comprehensionQuestion.options.map((opt, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === spec.comprehensionQuestion.correctIndex;
                let btnCls = 'border-slate-800 bg-[#0B1120] text-slate-300 hover:border-slate-700';
                if (isSelected) {
                  btnCls = isCorrect
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-200'
                    : 'border-rose-500 bg-rose-500/15 text-rose-200';
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAnswer(idx)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between gap-2 ${btnCls}`}
                  >
                    <span>{opt}</span>
                    {isSelected && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
            {selectedAnswer !== null && (
              <div
                className={`p-3 rounded-lg text-xs leading-relaxed ${
                  selectedAnswer === spec.comprehensionQuestion.correctIndex
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
                    : 'bg-amber-500/10 border border-amber-500/30 text-amber-200'
                }`}
              >
                <strong>
                  {selectedAnswer === spec.comprehensionQuestion.correctIndex
                    ? 'Correct! '
                    : 'Not quite: '}
                </strong>
                {spec.comprehensionQuestion.explanation}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
