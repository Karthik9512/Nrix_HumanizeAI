import { Link } from 'react-router-dom';
import { Zap, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-[#0b0e14] text-slate-900 dark:text-white selection:bg-accent-500/30">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Zap size={24} className="text-accent-500" />
          <span className="font-display text-xl font-bold tracking-tight">Nrix</span>
        </div>
        <nav className="flex items-center gap-6">
          <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Features</a>
          <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Pricing</a>
          <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Log in</Link>
          <Link to="/signup" className="btn-primary py-2 px-4 shadow-glow-cyan">Get Started</Link>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-3xl py-14 sm:py-20 lg:py-24 text-center">
            <h1 className="text-4xl font-display font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
              Turn robotic AI text into <span className="text-accent-500">human-quality</span> writing.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
              Nrix goes beyond simple synonym spinning. We use advanced NLP syntax trees to perfectly restructure sentences, giving you flawless, undetectable, and professional copy.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/signup" className="btn-primary text-base px-8 py-3.5 shadow-glow-lg">
                Try for free
              </Link>
              <a href="#demo" className="text-sm font-semibold leading-6 text-slate-900 dark:text-slate-200">
                View live demo <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div id="features" className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-white dark:bg-[#151821] border border-slate-200 dark:border-white/5">
                 <CheckCircle2 className="text-accent-500 mb-4" size={32} />
                 <h3 className="text-xl font-bold mb-2">Context-Aware NLP</h3>
                 <p className="text-slate-500 dark:text-slate-400">Our spaCy pipeline ensures we never break the original meaning of your text.</p>
              </div>
              <div className="p-8 rounded-2xl bg-white dark:bg-[#151821] border border-slate-200 dark:border-white/5">
                 <CheckCircle2 className="text-accent-500 mb-4" size={32} />
                 <h3 className="text-xl font-bold mb-2">Bypass AI Detectors</h3>
                 <p className="text-slate-500 dark:text-slate-400">We analyze perplexity and burstiness to produce writing indistinguishable from a human author.</p>
              </div>
              <div className="p-8 rounded-2xl bg-white dark:bg-[#151821] border border-slate-200 dark:border-white/5">
                 <CheckCircle2 className="text-accent-500 mb-4" size={32} />
                 <h3 className="text-xl font-bold mb-2">Tone Mastery</h3>
                 <p className="text-slate-500 dark:text-slate-400">Shift from thick academic jargon to breezy casual phrasing in a single click.</p>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
