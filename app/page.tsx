"use client";

import { useState } from "react";
import Link from "next/link";
import {
    BookOpen,
    Music,
    Landmark,
    HelpCircle,
    Globe,
    ChevronRight,
    Heart,
    BookMarked,
    Play,
} from "lucide-react";
import { toast } from "sonner";

const CONTENT = {
    en: {
        heroBadge: "TEWAHEDO EDUCATION PLATFORM",
        heroTitleStart: "Learn",
        heroTitleEnd: "Orthodox",
        heroSubtitle:
            "Unveiling the ancient wisdom, liturgy, and sacred tradition of the Ethiopian Orthodox Tewahedo Church.",
        liturgyTitle: "Liturgy Reader",
        liturgyDesc:
            "Trilingual parallel reader for the Divine Liturgy of St. Dioscoros with AI-assisted commentary.",
        audioTitle: "Audio Chant & Hymns",
        audioDesc:
            "High-fidelity liturgical recordings, traditional notations, and chanting practice tools.",
        historyTitle: "Patristics & Iconography",
        historyDesc:
            "Explore the ancient lives of saints, traditional icons, and historical manuscripts.",
        catechismTitle: "Theological Catechism",
        catechismDesc:
            "Interactive lessons and Q&A on Tewahedo dogma, fasts, sacraments, and canon.",
        footerText:
            "Dedicated to preserving and learning the ancient Orthodox faith. Developed for learners and diaspora worldwide.",
        comingSoon: "COMING SOON",
        exploreBtn: "Begin Liturgy Reader",
        toastLangMsg: "Language switched to English",
        activeLabel: "ACTIVE MODULE",
        studySpaceLabel: "STUDY SPACE",
        studySpaceDesc:
            "Review your saved liturgy notes and patristic reflections.",
        studySpaceBtn: "Enter Study Space",
        visualWindowSubtitle: "The Sanctuary Window",
        videosTitle: "Video Lessons",
        videosDesc:
            "Watch theological lectures and studies grouped by traditional Orthodox pillars.",
        videosBtn: "Watch Lessons",
    },
    am: {
        heroBadge: "የተዋሕዶ ትምህርታዊ መድረክ",
        heroTitleStart: "ኦርቶዶክስን",
        heroTitleEnd: "ይማሩ",
        heroSubtitle:
            "የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያንን ጥንታዊ ጥበብ፣ ሥርዓተ ቅዳሴና ቅዱስ ትውፊት ይወቁ።",
        liturgyTitle: "ሥርዓተ ቅዳሴ አንባቢ",
        liturgyDesc:
            "የቅዱስ ዲዮስቆሮስን ቅዳሴ በሦስት ቋንቋዎች በትይዩ የሚያነቡበትና በዘመናዊ አርቴፊሻል ኢንተለጀንስ የሚማሩበት።",
        audioTitle: "የዜማና የመዝሙር ድምፅ",
        audioDesc: "ጥንታዊ የቅዳሴ ዜማዎች፣ ባህላዊ ምልክቶች እና የዝማሬ መለማመጃ መሣሪያዎች።",
        historyTitle: "የአበው ትምህርትና ሥዕላት",
        historyDesc: "የቅዱሳንን ታሪክ፣ ጥንታዊ የብራና መጻሕፍትና ቤተክርስቲያናዊ ሥዕላትን ያግኙ።",
        catechismTitle: "የነገረ መለኮት ትምህርት",
        catechismDesc: "ስለ ተዋሕዶ እምነት ዶግማ፣ አጽዋማትና ምስጢራተ ቤተ ክርስቲያን በውይይትና ትምህርት።",
        footerText:
            "ጥንታዊውን የኦርቶዶክስ እምነት ለመጠበቅና ለመማር የተዘጋጀ። ለዓለም አቀፍ ተማሪዎች የቀረበ።",
        comingSoon: "በቅርቡ የሚመጣ",
        exploreBtn: "ቅዳሴውን ይጀምሩ",
        toastLangMsg: "ቋንቋ ወደ አማርኛ ተቀይሯል",
        activeLabel: "ገቢር ክፍል",
        studySpaceLabel: "የጥናት ክፍል",
        studySpaceDesc: "የተቀመጡ የሥርዓተ ቅዳሴ ማስታወሻዎችንና የሊቃውንት አስተምህሮዎችን እዚህ ያንብቡ።",
        studySpaceBtn: "ወደ ጥናት ክፍል ይግቡ",
        visualWindowSubtitle: "የመቅደሱ መስኮት",
        videosTitle: "ትምህርት ቪዲዮዎች",
        videosDesc: "በቤተክርስቲያን ዓምዶች የተከፋፈሉ ትምህርታዊ ቪዲዮዎችንና ማብራሪያዎችን እዚህ ይመልከቱ።",
        videosBtn: "ቪዲዮዎችን ይመልከቱ",
    },
};

export default function LandingPage() {
    const [lang, setLang] = useState<"en" | "am">("en");
    const t = CONTENT[lang];

    const handleLangToggle = () => {
        const nextLang = lang === "en" ? "am" : "en";
        setLang(nextLang);
        toast(CONTENT[nextLang].toastLangMsg, {
            className: "sonner-toast-custom",
            duration: 3000,
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
                <svg
                    viewBox="0 0 200 200"
                    fill="currentColor"
                    className="w-full h-full"
                >
                    <path d="M95 10v45H80c-5 0-9 4-9 9s4 9 9 9h15v15H80c-5 0-9 4-9 9s4 9 9 9h15v45c0 5 4 9 9 9s9-4 9-9v-45h15c5 0 9-4 9-9s-4-9-9-9h-15V83h15c5 0 9-4 9-9s-4-9-9-9h-15V10c0-5-4-9-9-9s-9 4-9 9z" />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M100 25c-41.42 0-75 33.58-75 75s33.58 75 75 75 75-33.58 75-75-33.58-75-75-75zm0 144c-38.1 0-69-30.9-69-69s30.9-69 69-69 69 30.9 69 69-30.9 69-69 69z"
                    />
                </svg>
            </div>

            {/* Warm layout radial light overflows */}
            <div className="absolute top-0 right-1/4 w-[50vw] h-[350px] bg-gradient-to-b from-accent-gold/[0.05] via-accent-crimson/[0.02] to-transparent blur-[120px] pointer-events-none z-0" />
            <div className="absolute bottom-0 right-0 w-[30vw] h-[300px] bg-gradient-to-t from-accent-blue/[0.04] to-transparent blur-[100px] pointer-events-none z-0" />

            {/* Header */}
            <header className="max-w-7xl mx-auto w-full px-6 py-4 flex justify-between items-center z-10 border-b border-accent-gold/15 bg-bg-parchment/65 backdrop-blur-md relative">
                <div className="flex items-center space-x-3.5">
                    <img
                        src="/glasswindow.png"
                        alt="Learn Orthodox Logo"
                        className="h-9 w-auto object-contain filter drop-shadow-[0_2px_4px_rgba(197,146,70,0.15)]"
                    />
                    <div>
                        <span className="block ui-label text-[10px] font-bold tracking-widest text-text-ink">
                            LEARN ORTHODOX
                        </span>
                        <span className="block text-[7px] text-stone-500 tracking-wider uppercase font-medium mt-0.5 font-sans">
                            Tewahedo Faith & Heritage
                        </span>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <Link
                        href={`/study-space?lang=${lang}`}
                        className="text-[10px] ui-label font-bold tracking-wider text-text-ink hover:text-accent-gold transition-colors uppercase cursor-pointer"
                    >
                        {lang === "am" ? "የጥናት ክፍል" : "Study Space"}
                    </Link>
                    <div className="w-[1px] h-3 bg-accent-gold/25" />

                    {/* Language Selector */}
                    <button
                        onClick={handleLangToggle}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-bg-parchment hover:bg-bg-alabaster border border-accent-gold/25 text-[10px] ui-label font-bold text-text-ink hover:text-accent-gold transition-all duration-300 cursor-pointer active:scale-95 shadow-none"
                    >
                        <Globe className="h-3.5 w-3.5 text-accent-gold" />
                        <span>{lang === "en" ? "አማርኛ" : "English"}</span>
                    </button>
                </div>
            </header>

            {/* Main Container */}
            <main className="max-w-7xl mx-auto w-full px-6 py-10 md:py-16 z-10 flex-grow flex flex-col justify-center">
                {/* Two-Column Top Section: Headline/Intro & Animated Visual Stained Glass */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
                    {/* Column 1: Editorial Headline (Span 7) */}
                    <div className="lg:col-span-7 flex flex-col items-start text-left relative">
                        {/* Tagline */}
                        <div className="ui-label text-xs tracking-[0.18em] text-accent-grey mb-4 font-bold">
                            {lang === "am" ? "ተዋሕዶ ሃይማኖት • ቅርስ • ቅዱስ ትውፊት" : "TEWAHEDO FAITH • HERITAGE • SACRED TRADITION"}
                        </div>

                        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[90px] font-cormorant font-light tracking-wide mb-6 leading-[0.9] select-none">
                            <span className="text-accent-gold italic font-light pr-3 block sm:inline">
                                {t.heroTitleStart}
                            </span>
                            <span className="text-accent-indigo font-light block sm:inline">
                                {t.heroTitleEnd}
                            </span>
                        </h1>
                        <div className="w-20 h-[1.5px] bg-accent-gold mb-6" />
                        <p className="text-stone-600 text-sm md:text-base leading-relaxed max-w-xl font-serif font-light mb-8">
                            {t.heroSubtitle}
                        </p>

                        {/* Direct CTA Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href={`/liturgy/qiddase-dioscoros?lang=${lang}`}
                                className="px-6 py-3 rounded-none bg-accent-gold hover:bg-accent-gold/90 text-white text-[10px] ui-label font-bold tracking-wider uppercase transition-all shadow-none flex items-center gap-2 border border-accent-gold/30 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                            >
                                <BookOpen className="h-3.5 w-3.5" />
                                {t.exploreBtn}
                            </Link>
                            <Link
                                href={`/study-space?lang=${lang}`}
                                className="px-6 py-3 rounded-none border border-accent-gold/30 hover:border-accent-gold text-text-ink hover:text-accent-gold bg-bg-parchment/40 text-[10px] ui-label font-bold tracking-wider uppercase transition-all flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                            >
                                <BookMarked className="h-3.5 w-3.5" />
                                {t.studySpaceBtn}
                            </Link>
                        </div>
                    </div>

                    {/* Column 2: Simulated CSS Stained Glass Window Pane (Span 5) */}
                    <div className="lg:col-span-5 hidden lg:flex justify-center relative">
                        {/* Hand-drawn SVG Lalibela Window with animated staggered panes */}
                        <div className="w-[300px] h-[400px] relative p-1">
                            <svg viewBox="0 0 200 300" className="w-full h-full drop-shadow-[0_4px_12px_rgba(44,36,22,0.15)]">
                                {/* Panes - color filled with stagger pulse animation */}
                                {/* Top Arch Panes */}
                                <path d="M10 100C10 50 50 10 100 10v90H10z" className="animate-pulse" style={{ animationDuration: '3s', animationDelay: '0.2s', fill: 'var(--color-accent-indigo)', opacity: 0.35 }} />
                                <path d="M100 10C150 10 190 50 190 100H100V10z" className="animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '0.5s', fill: 'var(--color-accent-rose)', opacity: 0.35 }} />
                                
                                {/* Row 1 Panes */}
                                <rect x="10" y="100" width="45" height="50" className="animate-pulse" style={{ animationDuration: '4s', animationDelay: '0.8s', fill: 'var(--color-accent-rose)', opacity: 0.3 }} />
                                <rect x="55" y="100" width="90" height="50" className="animate-pulse" style={{ animationDuration: '3.2s', animationDelay: '1.1s', fill: 'var(--color-accent-gold)', opacity: 0.45 }} />
                                <rect x="145" y="100" width="45" height="50" className="animate-pulse" style={{ animationDuration: '3.8s', animationDelay: '1.4s', fill: 'var(--color-accent-indigo)', opacity: 0.3 }} />

                                {/* Row 2 Center Cross Panel Panes */}
                                <rect x="10" y="150" width="45" height="60" className="animate-pulse" style={{ animationDuration: '4.2s', animationDelay: '1.7s', fill: 'var(--color-accent-gold)', opacity: 0.25 }} />
                                <rect x="55" y="150" width="90" height="60" className="animate-pulse" style={{ animationDuration: '3s', animationDelay: '0.1s', fill: 'var(--color-bg-alabaster)', opacity: 0.6 }} />
                                <rect x="145" y="150" width="45" height="60" className="animate-pulse" style={{ animationDuration: '4.5s', animationDelay: '2s', fill: 'var(--color-accent-rose)', opacity: 0.25 }} />

                                {/* Row 3 Panes */}
                                <rect x="10" y="210" width="45" height="80" className="animate-pulse" style={{ animationDuration: '3.6s', animationDelay: '2.3s', fill: 'var(--color-accent-indigo)', opacity: 0.3 }} />
                                <rect x="55" y="210" width="90" height="80" className="animate-pulse" style={{ animationDuration: '4s', animationDelay: '2.6s', fill: 'var(--color-accent-rose)', opacity: 0.3 }} />
                                <rect x="145" y="210" width="45" height="80" className="animate-pulse" style={{ animationDuration: '3.4s', animationDelay: '2.9s', fill: 'var(--color-accent-gold)', opacity: 0.3 }} />

                                {/* Outer Frame Line (basalt rock-hewn style) */}
                                <path d="M10 290V100C10 50 50 10 100 10s90 40 90 90v190" fill="none" stroke="var(--color-accent-gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                {/* Inner border styling dots */}
                                <path d="M17 290V100C17 54 54 17 100 17s83 37 83 83v190" fill="none" stroke="var(--color-accent-gold)" strokeWidth="1" strokeDasharray="3,4" opacity="0.75" />
                                
                                {/* Vertical Grid Lines */}
                                <line x1="55" y1="10" x2="55" y2="290" stroke="var(--color-accent-gold)" strokeWidth="1.5" />
                                <line x1="145" y1="10" x2="145" y2="290" stroke="var(--color-accent-gold)" strokeWidth="1.5" />
                                
                                {/* Horizontal Grid Lines */}
                                <line x1="10" y1="100" x2="190" y2="100" stroke="var(--color-accent-gold)" strokeWidth="1.5" />
                                <line x1="10" y1="150" x2="190" y2="150" stroke="var(--color-accent-gold)" strokeWidth="1.5" />
                                <line x1="10" y1="210" x2="190" y2="210" stroke="var(--color-accent-gold)" strokeWidth="1.5" />
                                <line x1="10" y1="290" x2="190" y2="290" stroke="var(--color-accent-gold)" strokeWidth="3" />

                                {/* Center Lalibela Cross Detail */}
                                <path d="M85 180h30v3H85zm12-12h5v27h-5z" fill="var(--color-accent-gold)" />
                                <circle cx="100" cy="180" r="1.5" fill="var(--color-bg-parchment)" />
                            </svg>

                            {/* Label */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-bg-parchment border border-accent-gold/45 rounded-none px-3 py-1 text-[8px] ui-label font-bold text-accent-gold tracking-widest uppercase shadow-sm">
                                {t.visualWindowSubtitle}
                            </div>
                        </div>

                        {/* Background light glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full bg-accent-gold/10 blur-[50px] -z-10" />
                    </div>
                </div>

                {/* Modules Header */}
                <div className="w-full flex items-center gap-4 mb-10">
                    <div className="h-[0.5px] bg-accent-gold/25 flex-grow" />
                    <span className="text-[10px] ui-label font-bold text-accent-gold tracking-widest uppercase">
                        {lang === "am" ? "የትምህርት ክፍሎች" : "Explore Modules"}
                    </span>
                    <div className="h-[0.5px] bg-accent-gold/25 flex-grow" />
                </div>

                {/* Modules Horizontal Scroll Row (Aspect Ratio 3:4 portrait cards) */}
                <div className="flex gap-8 overflow-x-auto pb-10 pt-4 px-2 scrollbar-none snap-x snap-mandatory max-w-full">
                    
                    {/* 1. Liturgy Reader - Active */}
                    <div className="snap-start shrink-0" data-aos="fade-up" data-aos-delay="100">
                        <Link
                            href={`/liturgy/qiddase-dioscoros?lang=${lang}`}
                            className="group relative block aspect-[3/4] w-[280px] sm:w-[310px] bg-bg-alabaster border border-accent-gold p-6 flex flex-col justify-between transition-all duration-300 shadow-[2px_2px_0_0_var(--color-accent-grey)] hover:shadow-[4px_4px_0_0_var(--color-accent-gold)] hover:-translate-y-1"
                        >
                            {/* Four Corner Crosses */}
                            <span className="corner-cross top-[-7px] left-[-5px]">✦</span>
                            <span className="corner-cross top-[-7px] right-[-5px]">✦</span>
                            <span className="corner-cross bottom-[-7px] left-[-5px]">✦</span>
                            <span className="corner-cross bottom-[-7px] right-[-5px]">✦</span>

                            {/* Background Line Illustration watermark */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
                                <svg className="w-full h-full p-4" viewBox="0 0 100 100" fill="currentColor">
                                    <path d="M48 10h4v80h-4zM10 48h80v4H10z" />
                                    <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="2" fill="none" />
                                </svg>
                            </div>

                            <div className="flex justify-between items-start z-10">
                                <div className="h-11 w-11 bg-accent-indigo/10 border border-accent-indigo/25 flex items-center justify-center text-accent-indigo group-hover:bg-accent-indigo group-hover:text-white transition-all duration-500">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <span className="px-2.5 py-1 rounded-none bg-accent-gold/10 text-accent-gold text-[8px] ui-label font-bold tracking-widest uppercase border border-accent-gold/25 flex items-center gap-1.5">
                                    {/* 3-line lit candle icon */}
                                    <svg className="w-3.5 h-3.5 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="6" y="12" width="1.5" height="8" rx="0.5" fill="currentColor" stroke="none" />
                                        <path d="M6.75 12c0-1.5 .75-2.5 .75-2.5s-.75 1-.75 2.5z" fill="var(--color-accent-rose)" stroke="none" />
                                        <rect x="11.25" y="9" width="1.5" height="11" rx="0.5" fill="currentColor" stroke="none" />
                                        <path d="M12 9c0-1.5 .75-2.5 .75-2.5s-.75 1-.75 2.5z" fill="var(--color-accent-rose)" stroke="none" />
                                        <rect x="16.5" y="12" width="1.5" height="8" rx="0.5" fill="currentColor" stroke="none" />
                                        <path d="M17.25 12c0-1.5 .75-2.5 .75-2.5s-.75 1-.75 2.5z" fill="var(--color-accent-rose)" stroke="none" />
                                    </svg>
                                    {t.activeLabel}
                                </span>
                            </div>

                            <div className="z-10 space-y-3">
                                <h3 className="text-base font-serif font-extrabold text-text-ink group-hover:text-accent-gold transition-colors uppercase tracking-wider">
                                    {t.liturgyTitle}
                                </h3>
                                <p className="text-[11px] text-stone-600 leading-relaxed font-light font-serif line-clamp-4">
                                    {t.liturgyDesc}
                                </p>
                                <div className="flex items-center text-[9px] ui-label font-bold text-accent-gold tracking-wider uppercase pt-2">
                                    <span className="link-hover-draw">{t.exploreBtn}</span>
                                    <ChevronRight className="h-3.5 w-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* 2. Study Space - Active */}
                    <div className="snap-start shrink-0" data-aos="fade-up" data-aos-delay="200">
                        <Link
                            href={`/study-space?lang=${lang}`}
                            className="group relative block aspect-[3/4] w-[280px] sm:w-[310px] bg-bg-alabaster border border-accent-gold p-6 flex flex-col justify-between transition-all duration-300 shadow-[2px_2px_0_0_var(--color-accent-grey)] hover:shadow-[4px_4px_0_0_var(--color-accent-gold)] hover:-translate-y-1"
                        >
                            {/* Four Corner Crosses */}
                            <span className="corner-cross top-[-7px] left-[-5px]">✦</span>
                            <span className="corner-cross top-[-7px] right-[-5px]">✦</span>
                            <span className="corner-cross bottom-[-7px] left-[-5px]">✦</span>
                            <span className="corner-cross bottom-[-7px] right-[-5px]">✦</span>

                            {/* Background Line Illustration watermark */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
                                <svg className="w-full h-full p-4" viewBox="0 0 100 100" fill="currentColor">
                                    <path d="M48 20h4v60h-4zM20 48h60v4H20z" />
                                    <rect x="30" y="30" width="40" height="40" stroke="currentColor" strokeWidth="2" fill="none" />
                                </svg>
                            </div>

                            <div className="flex justify-between items-start z-10">
                                <div className="h-11 w-11 bg-accent-gold/10 border border-accent-gold/25 flex items-center justify-center text-accent-gold group-hover:bg-accent-gold group-hover:text-white transition-all duration-500">
                                    <BookMarked className="h-5 w-5" />
                                </div>
                                <span className="px-2.5 py-1 rounded-none bg-accent-gold/10 text-accent-gold text-[8px] ui-label font-bold tracking-widest uppercase border border-accent-gold/25 flex items-center gap-1.5">
                                    {/* 3-line lit candle icon */}
                                    <svg className="w-3.5 h-3.5 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="6" y="12" width="1.5" height="8" rx="0.5" fill="currentColor" stroke="none" />
                                        <path d="M6.75 12c0-1.5 .75-2.5 .75-2.5s-.75 1-.75 2.5z" fill="var(--color-accent-rose)" stroke="none" />
                                        <rect x="11.25" y="9" width="1.5" height="11" rx="0.5" fill="currentColor" stroke="none" />
                                        <path d="M12 9c0-1.5 .75-2.5 .75-2.5s-.75 1-.75 2.5z" fill="var(--color-accent-rose)" stroke="none" />
                                        <rect x="16.5" y="12" width="1.5" height="8" rx="0.5" fill="currentColor" stroke="none" />
                                        <path d="M17.25 12c0-1.5 .75-2.5 .75-2.5s-.75 1-.75 2.5z" fill="var(--color-accent-rose)" stroke="none" />
                                    </svg>
                                    {t.activeLabel}
                                </span>
                            </div>

                            <div className="z-10 space-y-3">
                                <h3 className="text-base font-serif font-extrabold text-text-ink group-hover:text-accent-gold transition-colors uppercase tracking-wider">
                                    {t.studySpaceLabel}
                                </h3>
                                <p className="text-[11px] text-stone-600 leading-relaxed font-light font-serif line-clamp-4">
                                    {t.studySpaceDesc}
                                </p>
                                <div className="flex items-center text-[9px] ui-label font-bold text-accent-gold tracking-wider uppercase pt-2">
                                    <span className="link-hover-draw">{t.studySpaceBtn}</span>
                                    <ChevronRight className="h-3.5 w-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* 3. Video Lessons - Active */}
                    <div className="snap-start shrink-0" data-aos="fade-up" data-aos-delay="300">
                        <Link
                            href={`/videos?lang=${lang}`}
                            className="group relative block aspect-[3/4] w-[280px] sm:w-[310px] bg-bg-alabaster border border-accent-gold p-6 flex flex-col justify-between transition-all duration-300 shadow-[2px_2px_0_0_var(--color-accent-grey)] hover:shadow-[4px_4px_0_0_var(--color-accent-gold)] hover:-translate-y-1"
                        >
                            {/* Four Corner Crosses */}
                            <span className="corner-cross top-[-7px] left-[-5px]">✦</span>
                            <span className="corner-cross top-[-7px] right-[-5px]">✦</span>
                            <span className="corner-cross bottom-[-7px] left-[-5px]">✦</span>
                            <span className="corner-cross bottom-[-7px] right-[-5px]">✦</span>

                            {/* Background Line Illustration watermark */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
                                <svg className="w-full h-full p-4" viewBox="0 0 100 100" fill="currentColor">
                                    <path d="M50 15v70M15 50h70" stroke="currentColor" strokeWidth="2" strokeDasharray="3,3" />
                                    <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>

                            <div className="flex justify-between items-start z-10">
                                <div className="h-11 w-11 bg-accent-indigo/10 border border-accent-indigo/25 flex items-center justify-center text-accent-indigo group-hover:bg-accent-indigo group-hover:text-white transition-all duration-500">
                                    <Play className="h-5 w-5" />
                                </div>
                                <span className="px-2.5 py-1 rounded-none bg-accent-gold/10 text-accent-gold text-[8px] ui-label font-bold tracking-widest uppercase border border-accent-gold/25 flex items-center gap-1.5">
                                    {/* 3-line lit candle icon */}
                                    <svg className="w-3.5 h-3.5 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="6" y="12" width="1.5" height="8" rx="0.5" fill="currentColor" stroke="none" />
                                        <path d="M6.75 12c0-1.5 .75-2.5 .75-2.5s-.75 1-.75 2.5z" fill="var(--color-accent-rose)" stroke="none" />
                                        <rect x="11.25" y="9" width="1.5" height="11" rx="0.5" fill="currentColor" stroke="none" />
                                        <path d="M12 9c0-1.5 .75-2.5 .75-2.5s-.75 1-.75 2.5z" fill="var(--color-accent-rose)" stroke="none" />
                                        <rect x="16.5" y="12" width="1.5" height="8" rx="0.5" fill="currentColor" stroke="none" />
                                        <path d="M17.25 12c0-1.5 .75-2.5 .75-2.5s-.75 1-.75 2.5z" fill="var(--color-accent-rose)" stroke="none" />
                                    </svg>
                                    {t.activeLabel}
                                </span>
                            </div>

                            <div className="z-10 space-y-3">
                                <h3 className="text-base font-serif font-extrabold text-text-ink group-hover:text-accent-gold transition-colors uppercase tracking-wider">
                                    {t.videosTitle}
                                </h3>
                                <p className="text-[11px] text-stone-600 leading-relaxed font-light font-serif line-clamp-4">
                                    {t.videosDesc}
                                </p>
                                <div className="flex items-center text-[9px] ui-label font-bold text-accent-gold tracking-wider uppercase pt-2">
                                    <span className="link-hover-draw">{t.videosBtn}</span>
                                    <ChevronRight className="h-3.5 w-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* 4. Audio Chant - Coming Soon */}
                    <div className="snap-start shrink-0">
                        <div className="relative aspect-[3/4] w-[280px] sm:w-[310px] bg-bg-alabaster/40 border border-accent-gold/15 p-6 flex flex-col justify-between opacity-60 grayscale hover:opacity-85 transition-all duration-300">
                            {/* Four Corner Crosses */}
                            <span className="corner-cross top-[-7px] left-[-5px] opacity-40">✦</span>
                            <span className="corner-cross top-[-7px] right-[-5px] opacity-40">✦</span>
                            <span className="corner-cross bottom-[-7px] left-[-5px] opacity-40">✦</span>
                            <span className="corner-cross bottom-[-7px] right-[-5px] opacity-40">✦</span>

                            <div className="flex justify-between items-start">
                                <div className="h-11 w-11 bg-stone-100 border border-stone-250 flex items-center justify-center text-stone-500">
                                    <Music className="h-5 w-5" />
                                </div>
                                <span className="px-2 py-0.5 rounded-none bg-stone-100 text-stone-500 text-[8px] ui-label font-bold tracking-widest uppercase border border-stone-200">
                                    {t.comingSoon}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-base font-serif font-extrabold text-stone-700 uppercase tracking-wider">
                                    {t.audioTitle}
                                </h3>
                                <p className="text-[11px] text-stone-550 leading-relaxed font-light font-serif">
                                    {t.audioDesc}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 5. History - Patristics & Church Fathers */}
                    <div className="snap-start shrink-0">
                        <Link
                            href={`/church-fathers?lang=${lang}`}
                            className="group relative aspect-[3/4] w-[280px] sm:w-[310px] bg-bg-parchment/65 hover:bg-bg-alabaster/55 border border-accent-gold/25 p-6 flex flex-col justify-between transition-all duration-350 soft-shadow-hover rounded-none cursor-pointer select-none"
                        >
                            {/* Four Corner Crosses */}
                            <span className="corner-cross top-[-7px] left-[-5px]">✦</span>
                            <span className="corner-cross top-[-7px] right-[-5px]">✦</span>
                            <span className="corner-cross bottom-[-7px] left-[-5px]">✦</span>
                            <span className="corner-cross bottom-[-7px] right-[-5px]">✦</span>

                            <div className="flex justify-between items-start z-10">
                                <div className="h-11 w-11 bg-accent-indigo/10 border border-accent-indigo/25 flex items-center justify-center text-accent-indigo group-hover:bg-accent-indigo group-hover:text-white transition-all duration-500">
                                    <Landmark className="h-5 w-5" />
                                </div>
                                <span className="px-2.5 py-1 rounded-none bg-accent-gold/10 text-accent-gold text-[8px] ui-label font-bold tracking-widest uppercase border border-accent-gold/25 flex items-center gap-1.5">
                                    {/* 3-line lit candle icon */}
                                    <svg className="w-3.5 h-3.5 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="6" y="12" width="1.5" height="8" rx="0.5" fill="currentColor" stroke="none" />
                                        <path d="M6.75 12c0-1.5 .75-2.5 .75-2.5s-.75 1-.75 2.5z" fill="var(--color-accent-rose)" stroke="none" />
                                        <rect x="11.25" y="9" width="1.5" height="11" rx="0.5" fill="currentColor" stroke="none" />
                                        <path d="M12 9c0-1.5 .75-2.5 .75-2.5s-.75 1-.75 2.5z" fill="var(--color-accent-rose)" stroke="none" />
                                        <rect x="16.5" y="12" width="1.5" height="8" rx="0.5" fill="currentColor" stroke="none" />
                                        <path d="M17.25 12c0-1.5 .75-2.5 .75-2.5s-.75 1-.75 2.5z" fill="var(--color-accent-rose)" stroke="none" />
                                    </svg>
                                    {t.activeLabel}
                                </span>
                            </div>

                            <div className="z-10 space-y-3">
                                <h3 className="text-base font-serif font-extrabold text-text-ink group-hover:text-accent-gold transition-colors uppercase tracking-wider">
                                    {t.historyTitle}
                                </h3>
                                <p className="text-[11px] text-stone-600 leading-relaxed font-light font-serif line-clamp-4">
                                    {t.historyDesc}
                                </p>
                                <div className="flex items-center text-[9px] ui-label font-bold text-accent-gold tracking-wider uppercase pt-2">
                                    <span className="link-hover-draw">{lang === 'am' ? 'አበውን ይወቁ' : 'Explore Fathers'}</span>
                                    <ChevronRight className="h-3.5 w-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* 6. Catechism - Orthodox 101 */}
                    <div className="snap-start shrink-0">
                        <Link
                            href={`/orthodox-101?lang=${lang}`}
                            className="group relative aspect-[3/4] w-[280px] sm:w-[310px] bg-bg-parchment/65 hover:bg-bg-alabaster/55 border border-accent-gold/25 p-6 flex flex-col justify-between transition-all duration-350 soft-shadow-hover rounded-none cursor-pointer select-none"
                        >
                            {/* Four Corner Crosses */}
                            <span className="corner-cross top-[-7px] left-[-5px]">✦</span>
                            <span className="corner-cross top-[-7px] right-[-5px]">✦</span>
                            <span className="corner-cross bottom-[-7px] left-[-5px]">✦</span>
                            <span className="corner-cross bottom-[-7px] right-[-5px]">✦</span>

                            <div className="flex justify-between items-start z-10">
                                <div className="h-11 w-11 bg-accent-indigo/10 border border-accent-indigo/25 flex items-center justify-center text-accent-indigo group-hover:bg-accent-indigo group-hover:text-white transition-all duration-500">
                                    <HelpCircle className="h-5 w-5" />
                                </div>
                                <span className="px-2.5 py-1 rounded-none bg-accent-gold/10 text-accent-gold text-[8px] ui-label font-bold tracking-widest uppercase border border-accent-gold/25 flex items-center gap-1.5">
                                    {/* 3-line lit candle icon */}
                                    <svg className="w-3.5 h-3.5 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="6" y="12" width="1.5" height="8" rx="0.5" fill="currentColor" stroke="none" />
                                        <path d="M6.75 12c0-1.5 .75-2.5 .75-2.5s-.75 1-.75 2.5z" fill="var(--color-accent-rose)" stroke="none" />
                                        <rect x="11.25" y="9" width="1.5" height="11" rx="0.5" fill="currentColor" stroke="none" />
                                        <path d="M12 9c0-1.5 .75-2.5 .75-2.5s-.75 1-.75 2.5z" fill="var(--color-accent-rose)" stroke="none" />
                                        <rect x="16.5" y="12" width="1.5" height="8" rx="0.5" fill="currentColor" stroke="none" />
                                        <path d="M17.25 12c0-1.5 .75-2.5 .75-2.5s-.75 1-.75 2.5z" fill="var(--color-accent-rose)" stroke="none" />
                                    </svg>
                                    {t.activeLabel}
                                </span>
                            </div>

                            <div className="z-10 space-y-3">
                                <h3 className="text-base font-serif font-extrabold text-text-ink group-hover:text-accent-gold transition-colors uppercase tracking-wider">
                                    {t.catechismTitle}
                                </h3>
                                <p className="text-[11px] text-stone-600 leading-relaxed font-light font-serif line-clamp-4">
                                    {t.catechismDesc}
                                </p>
                                <div className="flex items-center text-[9px] ui-label font-bold text-accent-gold tracking-wider uppercase pt-2">
                                    <span className="link-hover-draw">{lang === 'am' ? 'ትምህርቶችን ይጀምሩ' : 'Start Lessons'}</span>
                                    <ChevronRight className="h-3.5 w-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-8 border-t border-accent-gold/15 bg-bg-alabaster/40 backdrop-blur-sm relative">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-stone-500 text-[9px] ui-label font-bold tracking-wider uppercase space-y-4 md:space-y-0">
                    <p className="max-w-md text-center md:text-left leading-relaxed">
                        {t.footerText}
                    </p>
                    <div className="flex space-x-6 text-text-ink/65">
                        <span>© {new Date().getFullYear()} LEARN ORTHODOX</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
