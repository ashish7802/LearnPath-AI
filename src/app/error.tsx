'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto py-24 text-center space-y-6">
      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-bold text-white">Something went wrong</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          An unexpected error occurred while processing this request. Our engineering logs have recorded the event.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
