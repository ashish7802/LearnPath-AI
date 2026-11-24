import React from 'react';

export default function Loading() {
  return (
    <div className="py-20 space-y-6 max-w-4xl mx-auto animate-pulse">
      <div className="h-8 bg-slate-800 rounded-lg w-1/3" />
      <div className="h-4 bg-slate-800/60 rounded w-2/3" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
        <div className="h-32 bg-slate-900 border border-slate-800/80 rounded-xl" />
        <div className="h-32 bg-slate-900 border border-slate-800/80 rounded-xl" />
        <div className="h-32 bg-slate-900 border border-slate-800/80 rounded-xl" />
      </div>

      <div className="space-y-3 pt-6">
        <div className="h-20 bg-slate-900/60 border border-slate-800/60 rounded-xl" />
        <div className="h-20 bg-slate-900/60 border border-slate-800/60 rounded-xl" />
      </div>
    </div>
  );
}
