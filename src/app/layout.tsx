import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import OptionalAiDrawer from '@/components/OptionalAiDrawer';
import Link from 'next/link';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LearnPath AI — Complete Programming & Technology Learning Platform',
  description:
    'Learn computer fundamentals, programming languages, web & mobile development, AI, machine learning, data science, cybersecurity, and cloud engineering from absolute zero through structured multi-layer lessons, real coding sandboxes, skill trees, and portfolio projects.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-[#0B1120] text-slate-100 font-sans flex flex-col min-h-screen selection:bg-blue-600/30 selection:text-white">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-800/80 bg-[#0B1120] pt-8 pb-20 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>
              LearnPath AI — Open Structured Curriculum for Computer Science, Programming &amp; Engineering.
            </p>
            <div className="flex items-center gap-5">
              <Link href="/roadmap" className="hover:text-slate-200 transition-colors">
                Curriculum
              </Link>
              <Link href="/skill-tree" className="hover:text-slate-200 transition-colors">
                Skill Tree
              </Link>
              <Link href="/planner" className="hover:text-slate-200 transition-colors">
                Study Planner
              </Link>
              <Link href="/coach" className="hover:text-slate-200 transition-colors">
                Optional AI Helper
              </Link>
            </div>
          </div>
        </footer>
        <OptionalAiDrawer />
      </body>
    </html>
  );
}
