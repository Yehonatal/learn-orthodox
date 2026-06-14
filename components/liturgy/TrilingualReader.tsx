'use client';

import { useState } from 'react';
import type { LiturgyUnit } from '@/types/liturgy';
import ScriptureUnit from './ScriptureUnit';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

const AIExplainer = dynamic(() => import('./AIExplainer'), {
  ssr: false,
  loading: () => (
    <div className="fixed top-0 right-0 h-screen w-full sm:w-[500px] bg-bg-parchment/95 backdrop-blur-md border-l border-accent-gold/25 shadow-[-10px_0_40px_rgba(44,36,22,0.12)] z-50 p-6 flex flex-col items-center justify-center animate-in slide-in-from-right duration-300">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-gold border-t-transparent"></div>
      <p className="text-[9px] ui-label font-bold text-accent-gold tracking-widest uppercase mt-4">Consulting Library...</p>
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

  const options: LangPref[] = ['all', 'gez', 'am', 'en'];
  const activeIndex = options.indexOf(langPref);

  return (
    <div className="flex flex-col">
      {/* Sticky Language Toolbar with Sliding Background Pill */}
      <div className="sticky top-[125px] z-10 bg-bg-parchment/95 backdrop-blur-md border-b border-accent-gold/15 py-2 flex justify-center mb-3">
        <div className="relative flex p-0.5 bg-bg-alabaster/60 border border-accent-gold/20 max-w-md w-full justify-between">
          {/* Sliding background pill */}
          <div 
            className="absolute top-1 bottom-1 bg-accent-gold/15 border border-accent-gold/40 transition-all duration-300 ease-out"
            style={{
              left: `calc(1px + (${activeIndex} * (100% - 2px) / 4))`,
              width: `calc((100% - 2px) / 4 - 2px)`
            }}
          />
          
          {options.map((l) => (
            <button
              key={l}
              onClick={() => handleLangPrefChange(l)}
              className={`relative z-10 w-1/4 text-center py-1 text-[9px] ui-label font-bold uppercase transition-colors duration-300 cursor-pointer ${
                langPref === l ? 'text-accent-gold' : 'text-text-ink/60 hover:text-text-ink'
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
