import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'LearnPath AI — Zero-to-Engineer Skill Mastery Platform',
  description: 'An open-source, personalized, skill-based engineering learning platform with verifiable mastery, AI coaching, and adaptive study planning.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-800 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
          <p>LearnPath AI — Open Source Curriculum & Mastery Verification Platform. Built with Harvard CS50, MIT Missing Semester, and Open Standards.</p>
        </footer>
      </body>
    </html>
  );
}
