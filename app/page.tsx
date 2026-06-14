'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Music, Landmark, HelpCircle, Globe, ChevronRight, Sparkles, BookMarked } from 'lucide-react';
import { toast } from 'sonner';

const CONTENT = {
  en: {
    heroBadge: "TEWAHEDO EDUCATION PLATFORM",
    heroTitleStart: "Learn",
    heroTitleEnd: "Orthodox",
    heroSubtitle: "Unveiling the ancient wisdom, liturgy, and sacred tradition of the Ethiopian Orthodox Tewahedo Church.",
    liturgyTitle: "Liturgy Reader",
    liturgyDesc: "Trilingual parallel reader for the Divine Liturgy of St. Dioscoros with AI-assisted commentary.",
    audioTitle: "Audio Chant & Hymns",
    audioDesc: "High-fidelity liturgical recordings, traditional notations, and chanting practice tools.",
    historyTitle: "Patristics & Iconography",
    historyDesc: "Explore the ancient lives of saints, traditional icons, and historical manuscripts.",
    catechismTitle: "Theological Catechism",
    catechismDesc: "Interactive lessons and Q&A on Tewahedo dogma, fasts, sacraments, and canon.",
    footerText: "Dedicated to preserving and learning the ancient Orthodox faith. Developed for learners and diaspora worldwide.",
    comingSoon: "COMING SOON",
    exploreBtn: "Begin Liturgy Reader",
    toastLangMsg: "Language switched to English",
    activeLabel: "ACTIVE MODULE",
    studySpaceLabel: "STUDY SPACE",
    studySpaceDesc: "Review your saved liturgy notes and patristic reflections.",
    studySpaceBtn: "Enter Study Space",
    visualWindowSubtitle: "The Sanctuary Window"
  },
  am: {
    heroBadge: "የተዋሕዶ ትምህርታዊ መድረክ",
    heroTitleStart: "ኦርቶዶክስን",
    heroTitleEnd: "ይማሩ",
    heroSubtitle: "የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያንን ጥንታዊ ጥበብ፣ ሥርዓተ ቅዳሴና ቅዱስ ትውፊት ይወቁ።",
    liturgyTitle: "ሥርዓተ ቅዳሴ አንባቢ",
    liturgyDesc: "የቅዱስ ዲዮስቆሮስን ቅዳሴ በሦስት ቋንቋዎች በትይዩ የሚያነቡበትና በዘመናዊ አርቴፊሻል ኢንተለጀንስ የሚማሩበት።",
    audioTitle: "የዜማና የመዝሙር ድምፅ",
    audioDesc: "ጥንታዊ የቅዳሴ ዜማዎች፣ ባህላዊ ምልክቶች እና የዝማሬ መለማመጃ መሣሪያዎች።",
    historyTitle: "የአበው ትምህርትና ሥዕላት",
    historyDesc: "የቅዱሳንን ታሪክ፣ ጥንታዊ የብራና መጻሕፍትና ቤተክርስቲያናዊ ሥዕላትን ያግኙ።",
    catechismTitle: "የነገረ መለኮት ትምህርት",
    catechismDesc: "ስለ ተዋሕዶ እምነት ዶግማ፣ አጽዋማትና ምስጢራተ ቤተ ክርስቲያን በውይይትና ትምህርት።",
    footerText: "ጥንታዊውን የኦርቶዶክስ እምነት ለመጠበቅና ለመማር የተዘጋጀ። ለዓለም አቀፍ ተማሪዎች የቀረበ።",
    comingSoon: "በቅርቡ የሚመጣ",
    exploreBtn: "ቅዳሴውን ይጀምሩ",
    toastLangMsg: "ቋንቋ ወደ አማርኛ ተቀይሯል",
    activeLabel: "ገቢር ክፍል",
    studySpaceLabel: "የጥናት ክፍል",
    studySpaceDesc: "የተቀመጡ የሥርዓተ ቅዳሴ ማስታወሻዎችንና የሊቃውንት አስተምህሮዎችን እዚህ ያንብቡ።",
    studySpaceBtn: "ወደ ጥናት ክፍል ይግቡ",
    visualWindowSubtitle: "የመቅደሱ መስኮት"
  }
};

export default function LandingPage() {
  const [lang, setLang] = useState<'en' | 'am'>('en');
  const t = CONTENT[lang];

  const handleLangToggle = () => {
    const nextLang = lang === 'en' ? 'am' : 'en';
    setLang(nextLang);
    toast(CONTENT[nextLang].toastLangMsg, {
      className: 'sonner-toast-custom',
      duration: 3000
    });
  };

  return (
    <div className="min-h-screen bg-bg-parchment text-text-ink flex flex-col justify-between selection:bg-accent-gold/20 relative overflow-hidden font-sans p-4 md:p-6 lg:p-8">
      
      {/* Decorative Editorial Border Frame */}
      <div className="absolute inset-4 md:inset-6 lg:inset-8 border border-accent-gold/15 pointer-events-none z-0 rounded-2xl" />
      <div className="absolute inset-[18px] md:inset-[26px] lg:inset-[34px] border-[0.5px] border-accent-gold/5 pointer-events-none z-0 rounded-2xl" />

      {/* Traditional Ge'ez Text Grid Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(197,146,70,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(197,146,70,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none z-0 opacity-70" />

      {/* Background Lalibela Cross watermark (re-aligned to bottom-left) */}
      <div className="absolute bottom-10 left-10 w-[250px] md:w-[350px] h-[250px] md:h-[350px] text-accent-gold/[0.02] pointer-events-none select-none z-0">
        <svg viewBox="0 0 200 200" fill="currentColor" className="w-full h-full">
          <path d="M95 10v45H80c-5 0-9 4-9 9s4 9 9 9h15v15H80c-5 0-9 4-9 9s4 9 9 9h15v45c0 5 4 9 9 9s9-4 9-9v-45h15c5 0 9-4 9-9s-4-9-9-9h-15V83h15c5 0 9-4 9-9s-4-9-9-9h-15V10c0-5-4-9-9-9s-9 4-9 9z" />
          <path fillRule="evenodd" clipRule="evenodd" d="M100 25c-41.42 0-75 33.58-75 75s33.58 75 75 75 75-33.58 75-75-33.58-75-75-75zm0 144c-38.1 0-69-30.9-69-69s30.9-69 69-69 69 30.9 69 69-30.9 69-69 69z" />
        </svg>
      </div>

      {/* Warm layout radial light overflows */}
      <div className="absolute top-0 right-1/4 w-[50vw] h-[350px] bg-gradient-to-b from-accent-gold/[0.05] via-accent-crimson/[0.02] to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[30vw] h-[300px] bg-gradient-to-t from-accent-blue/[0.04] to-transparent blur-[100px] pointer-events-none z-0" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-4 flex justify-between items-center z-10 border-b border-accent-gold/15 bg-bg-parchment/65 backdrop-blur-md rounded-t-xl relative">
        <div className="flex items-center space-x-3.5">
          <img src="/glasswindow.png" alt="Learn Orthodox Logo" className="h-9 w-auto object-contain filter drop-shadow-[0_2px_4px_rgba(197,146,70,0.15)]" />
          <div>
            <span className="block font-serif font-extrabold tracking-widest text-text-ink text-xs">LEARN ORTHODOX</span>
            <span className="block text-[7px] text-stone-500 tracking-wider uppercase font-medium mt-0.5">Tewahedo Faith & Heritage</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link
            href={`/study-space?lang=${lang}`}
            className="text-[10px] font-serif font-bold tracking-wider text-text-ink hover:text-accent-gold transition-colors uppercase cursor-pointer"
          >
            {lang === 'am' ? 'የጥናት ክፍል' : 'Study Space'}
          </Link>
          <div className="w-[1px] h-3 bg-accent-gold/25" />
          
          {/* Language Selector */}
          <button 
            onClick={handleLangToggle}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-bg-parchment hover:bg-bg-alabaster border border-accent-gold/25 text-[10px] font-bold text-text-ink hover:text-accent-gold transition-all duration-300 cursor-pointer active:scale-95 shadow-none"
          >
            <Globe className="h-3.5 w-3.5 text-accent-gold" />
            <span>{lang === 'en' ? 'አማርኛ' : 'English'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-6 py-10 md:py-16 z-10 flex-grow flex flex-col justify-center">
        
        {/* Two-Column Top Section: Headline/Intro & Animated Visual Stained Glass */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          
          {/* Column 1: Editorial Headline (Span 7) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left relative">
            <span className="inline-block px-3.5 py-1 rounded-full bg-accent-gold/[0.06] border border-accent-gold/25 text-[8px] tracking-widest font-bold text-accent-gold uppercase mb-5">
              {t.heroBadge}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-extrabold tracking-tight text-text-ink mb-6 leading-[1.08]">
              <span className="text-accent-gold italic font-serif font-semibold pr-2">{t.heroTitleStart}</span> 
              <span>{t.heroTitleEnd}</span>
            </h1>
            <div className="w-20 h-[2px] bg-gradient-to-r from-accent-gold to-accent-crimson mb-6" />
            <p className="text-stone-600 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl font-light mb-8">
              {t.heroSubtitle}
            </p>
            
            {/* Direct CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link 
                href={`/liturgy/qiddase-dioscoros?lang=${lang}`}
                className="px-6 py-3 rounded-xl bg-accent-gold hover:bg-accent-gold/90 text-white text-[11px] font-extrabold tracking-wider uppercase transition-all shadow-none flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5" />
                {t.exploreBtn}
              </Link>
              <Link 
                href={`/study-space?lang=${lang}`}
                className="px-6 py-3 rounded-xl border border-accent-gold/30 hover:border-accent-gold text-text-ink hover:text-accent-gold bg-bg-parchment/40 text-[11px] font-extrabold tracking-wider uppercase transition-all flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <BookMarked className="h-3.5 w-3.5" />
                {t.studySpaceBtn}
              </Link>
            </div>
          </div>

          {/* Column 2: Simulated CSS Stained Glass Window Pane (Span 5) */}
          <div className="lg:col-span-5 hidden lg:flex justify-center relative">
            {/* Elegant Golden Arched Stained Glass Window Container */}
            <div className="w-[280px] h-[360px] rounded-t-full border-4 border-accent-gold bg-bg-alabaster/40 p-3 shadow-md relative overflow-hidden flex flex-col justify-between backdrop-blur-sm group hover:border-accent-gold/90 transition-colors duration-500">
              
              {/* Overlaying lead lines grid */}
              <div className="absolute inset-0 border-r border-l border-accent-gold/15 pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(197,146,70,0.1)_1.5px,transparent_1.5px)] bg-[size:100%_40px] pointer-events-none" />

              {/* Glowing Panes inside the arch */}
              <div className="grid grid-cols-3 gap-2 h-full w-full opacity-60 group-hover:opacity-85 transition-opacity duration-700">
                {/* Panel row 1 */}
                <div className="bg-gradient-to-br from-accent-blue/30 to-accent-blue/5 rounded-t-full h-20" />
                <div className="bg-gradient-to-br from-accent-gold/45 to-accent-gold/10 rounded-t-full h-20" />
                <div className="bg-gradient-to-br from-accent-crimson/30 to-accent-crimson/5 rounded-t-full h-20" />
                {/* Panel row 2 */}
                <div className="bg-gradient-to-br from-accent-crimson/30 to-accent-crimson/5 h-24" />
                <div className="bg-gradient-to-br from-accent-blue/40 to-accent-blue/10 h-24 border border-accent-gold/30 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-accent-gold/75 animate-pulse">
                    <path d="M12 2v20M2 12h20M12 6l3 3M12 6L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="bg-gradient-to-br from-accent-gold/30 to-accent-gold/5 h-24" />
                {/* Panel row 3 */}
                <div className="bg-gradient-to-br from-accent-gold/30 to-accent-gold/5 h-20" />
                <div className="bg-gradient-to-br from-accent-crimson/40 to-accent-crimson/10 h-20" />
                <div className="bg-gradient-to-br from-accent-blue/30 to-accent-blue/5 h-20" />
              </div>

              {/* Stained Glass Footer Label */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-bg-parchment/90 border border-accent-gold/35 rounded-full px-3 py-1 text-[8px] font-bold text-accent-gold tracking-widest uppercase">
                {t.visualWindowSubtitle}
              </div>
            </div>
            
            {/* Halo background glow behind stained glass */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full bg-accent-gold/10 blur-[50px] -z-10 group-hover:scale-110 transition-transform duration-700" />
          </div>

        </div>

        {/* Modules Header */}
        <div className="w-full flex items-center gap-4 mb-8">
          <div className="h-[0.5px] bg-accent-gold/25 flex-grow" />
          <span className="text-[10px] font-serif font-bold text-accent-gold tracking-widest uppercase">
            {lang === 'am' ? 'የትምህርት ክፍሎች' : 'Explore Modules'}
          </span>
          <div className="h-[0.5px] bg-accent-gold/25 flex-grow" />
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
          
          {/* 1. Liturgy Reader - Active (Gold Arched Highlight) */}
          <Link 
            href={`/liturgy/qiddase-dioscoros?lang=${lang}`} 
            className="group block relative rounded-2xl bg-white border-2 border-accent-gold p-6 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 relative overflow-hidden"
          >
            {/* Top gold/crimson liturgical border line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-gold via-accent-crimson to-accent-blue" />

            <div className="flex justify-between items-start mb-5 mt-1">
              <div className="h-11 w-11 rounded-t-full rounded-b-md bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue group-hover:bg-accent-blue group-hover:text-white transition-all duration-500">
                <BookOpen className="h-4.5 w-4.5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-accent-blue/10 text-accent-blue text-[7px] font-bold tracking-widest uppercase border border-accent-blue/20 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-accent-blue animate-ping" />
                {t.activeLabel}
              </span>
            </div>
            
            <h3 className="text-base font-serif font-extrabold text-text-ink group-hover:text-accent-gold transition-colors mb-2 uppercase">
              {t.liturgyTitle}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-light mb-4">
              {t.liturgyDesc}
            </p>
            <div className="flex items-center text-[9px] font-bold text-accent-gold tracking-wider uppercase">
              <span>{t.exploreBtn}</span>
              <ChevronRight className="h-3.5 w-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. Study Space - Active */}
          <Link 
            href={`/study-space?lang=${lang}`} 
            className="group block relative rounded-2xl bg-white border border-accent-gold/25 hover:border-accent-gold p-6 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 relative overflow-hidden"
          >
            {/* Top gold border line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-accent-gold" />

            <div className="flex justify-between items-start mb-5 mt-1">
              <div className="h-11 w-11 rounded-t-full rounded-b-md bg-accent-gold/10 border border-accent-gold/25 flex items-center justify-center text-accent-gold group-hover:bg-accent-gold group-hover:text-white transition-all duration-500">
                <BookMarked className="h-4.5 w-4.5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-accent-gold/10 text-accent-gold text-[7px] font-bold tracking-widest uppercase border border-accent-gold/20 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-accent-gold animate-ping" />
                {t.activeLabel}
              </span>
            </div>
            
            <h3 className="text-base font-serif font-extrabold text-text-ink group-hover:text-accent-gold transition-colors mb-2 uppercase">
              {t.studySpaceLabel}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-light mb-4">
              {t.studySpaceDesc}
            </p>
            <div className="flex items-center text-[9px] font-bold text-accent-gold tracking-wider uppercase">
              <span>{t.studySpaceBtn}</span>
              <ChevronRight className="h-3.5 w-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 3. Audio player - Placeholder */}
          <div className="group relative rounded-2xl bg-white/40 border border-accent-gold/15 p-6 shadow-sm grayscale opacity-70 hover:opacity-80 transition-all duration-300">
            <div className="flex justify-between items-start mb-5">
              <div className="h-11 w-11 rounded-t-full rounded-b-md bg-stone-100 border border-stone-250 flex items-center justify-center text-stone-500">
                <Music className="h-4.5 w-4.5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 text-[7px] font-bold tracking-widest uppercase border border-stone-200">
                {t.comingSoon}
              </span>
            </div>
            <h3 className="text-base font-serif font-extrabold text-stone-700 mb-2 uppercase">
              {t.audioTitle}
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed font-light">
              {t.audioDesc}
            </p>
          </div>

          {/* 4. History & Patristics - Placeholder */}
          <div className="group relative rounded-2xl bg-white/40 border border-accent-gold/15 p-6 shadow-sm grayscale opacity-70 hover:opacity-80 transition-all duration-300">
            <div className="flex justify-between items-start mb-5">
              <div className="h-11 w-11 rounded-t-full rounded-b-md bg-stone-100 border border-stone-250 flex items-center justify-center text-stone-500">
                <Landmark className="h-4.5 w-4.5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 text-[7px] font-bold tracking-widest uppercase border border-stone-200">
                {t.comingSoon}
              </span>
            </div>
            <h3 className="text-base font-serif font-extrabold text-stone-700 mb-2 uppercase">
              {t.historyTitle}
            </h3>
            <p className="text-xs text-stone-550 leading-relaxed font-light">
              {t.historyDesc}
            </p>
          </div>

          {/* 5. Catechism - Placeholder */}
          <div className="group relative rounded-2xl bg-white/40 border border-accent-gold/15 p-6 shadow-sm grayscale opacity-70 hover:opacity-80 transition-all duration-300">
            <div className="flex justify-between items-start mb-5">
              <div className="h-11 w-11 rounded-t-full rounded-b-md bg-stone-100 border border-stone-250 flex items-center justify-center text-stone-500">
                <HelpCircle className="h-4.5 w-4.5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 text-[7px] font-bold tracking-widest uppercase border border-stone-200">
                {t.comingSoon}
              </span>
            </div>
            <h3 className="text-base font-serif font-extrabold text-stone-700 mb-2 uppercase">
              {t.catechismTitle}
            </h3>
            <p className="text-xs text-stone-550 leading-relaxed font-light">
              {t.catechismDesc}
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-accent-gold/15 bg-bg-alabaster/40 backdrop-blur-sm rounded-b-xl relative">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-stone-500 text-[9px] tracking-wider uppercase space-y-4 md:space-y-0 font-medium">
          <p className="max-w-md text-center md:text-left leading-relaxed">
            {t.footerText}
          </p>
          <div className="flex space-x-6 font-semibold text-text-ink/65">
            <span>© {new Date().getFullYear()} LEARN ORTHODOX</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
