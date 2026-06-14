'use client';

import { useState } from 'react';
import type { LiturgyUnit } from '@/types/liturgy';
import ScriptureUnit from './ScriptureUnit';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

const AIExplainer = dynamic(() => import('./AIExplainer'), {
  ssr: false,
  loading: () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white/85 backdrop-blur-xl border-t border-accent-gold/35 p-6 h-[40vh] flex flex-col items-center justify-center z-40 rounded-t-2xl">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-gold border-t-transparent"></div>
    </div>
  )
});

type LangPref = 'all' | 'en' | 'am' | 'gez';

const TOAST_MESSAGES = {
  all: { en: "Showing all languages", am: "ሁሉንም ቋንቋዎች ያሳያል" },
  gez: { en: "Focused on Ge'ez text", am: "በግዕዝ ጽሑፍ ላይ ያተኮረ" },
  am: { en: "Focused on Amharic translation", am: "በአማርኛ ትርጉም ላይ ያተኮረ" },
  en: { en: "Focused on English translation", am: "በእንግሊዝኛ ትርጉም ላይ ያተኮረ" }
};

export default function TrilingualReader({ units, lang }: { units: LiturgyUnit[]; lang: 'en' | 'am' }) {
  const [selected, setSelected] = useState<LiturgyUnit | null>(null);
  const [langPref, setLangPref] = useState<LangPref>('all');

  const handleLangPrefChange = (pref: LangPref) => {
    setLangPref(pref);
    const msg = TOAST_MESSAGES[pref][lang];
    toast(msg, {
      className: 'sonner-toast-custom-blue',
      duration: 2500
    });
  };

  return (
    <div className="flex flex-col">
      {/* Sticky Language Toolbar */}
      <div className="sticky top-[125px] z-10 bg-bg-parchment/95 backdrop-blur-md border-b border-accent-gold/15 py-3 flex gap-2 overflow-x-auto scrollbar-none mb-6">
        {(['all', 'gez', 'am', 'en'] as LangPref[]).map(l => (
          <button
            key={l}
            onClick={() => handleLangPrefChange(l)}
            className={`px-4 py-1 text-xs rounded-full border transition-all duration-300 cursor-pointer active:scale-95 whitespace-nowrap shadow-none ${
              langPref === l
                ? 'bg-accent-gold/15 text-accent-gold border-accent-gold font-bold'
                : 'bg-transparent border-accent-gold/20 text-text-ink/70 hover:text-text-ink hover:border-accent-gold/50'
            }`}
          >
            {{ 
              all: lang === 'am' ? 'ሁሉም' : 'All / ሁሉም', 
              gez: 'ግዕዝ', 
              am: 'አማርኛ', 
              en: lang === 'am' ? 'እንግሊዝኛ' : 'English' 
            }[l]}
          </button>
        ))}
      </div>

      {/* Scripture Units with stagger animation indices */}
      <div className="space-y-6">
        {units.map((unit, index) => (
          <ScriptureUnit
            key={unit.id}
            unit={unit}
            index={index}
            langPref={langPref}
            isSelected={selected?.id === unit.id}
            onSelect={() => setSelected(selected?.id === unit.id ? null : unit)}
            lang={lang}
          />
        ))}
      </div>

      {selected && <AIExplainer unit={selected} onClose={() => setSelected(null)} lang={lang} />}
    </div>
  );
}
