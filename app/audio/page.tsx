import Link from 'next/link';
import { ArrowLeft, Music } from 'lucide-react';

export default function AudioPlaceholderPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 flex flex-col justify-between selection:bg-amber-500/15 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ede8df_1px,transparent_1px),linear-gradient(to_bottom,#ede8df_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center z-10">
        <Link href="/" className="flex items-center space-x-2 text-xs font-semibold text-stone-555 hover:text-amber-600 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto w-full px-6 py-20 z-10 flex-grow flex flex-col items-center justify-center text-center">
        <div className="flex items-center space-x-3.5 mb-8">
          <img src="/glasswindow.png" alt="Learn Orthodox Logo" className="h-12 w-auto object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.05)]" />
          <div className="h-8 w-[1px] bg-stone-300" />
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 animate-pulse">
            <Music className="h-6 w-6" />
          </div>
        </div>
        
        <span className="px-3 py-1 rounded-full bg-emerald-550/10 border border-emerald-500/20 text-[9px] tracking-widest font-bold text-emerald-650 uppercase mb-4">
          COMING SOON
        </span>

        <h1 className="text-3xl md:text-4xl font-serif font-extrabold text-stone-900 mb-4">
          Audio Chant & Hymns
        </h1>

        <p className="text-stone-600 text-xs md:text-sm leading-relaxed max-w-md mb-8">
          We are currently cataloguing high-fidelity traditional recordings and notations from the Ge'ez liturgical chant system (Zema) to bring the authentic audio experience of the Divine Liturgy to your hands.
        </p>

        <Link 
          href="/" 
          className="px-5 py-2.5 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 rounded-xl text-xs font-bold transition-all border border-stone-200 shadow-sm"
        >
          Return to Dashboard
        </Link>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-stone-200 bg-white z-10 text-center text-stone-500 text-[10px] tracking-wider">
        <span>© {new Date().getFullYear()} LEARN ORTHODOX</span>
      </footer>
    </div>
  );
}
