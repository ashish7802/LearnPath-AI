import Link from 'next/link';
import { Compass, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto py-24 text-center space-y-6">
      <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
        <Compass className="w-6 h-6" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">404 — Page Not Found</h1>
        <p className="text-xs text-slate-400">
          The curriculum module or page you are looking for does not exist or has been moved.
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
        >
          <span>Return to Career Roadmap</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
