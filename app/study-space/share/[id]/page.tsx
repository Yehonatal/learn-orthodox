import { getStudyNoteById } from "@/lib/notes/service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";

const CrossIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11 2h2v6h6v2h-6v12h-2V10H5V8h6V2z" />
  </svg>
);

interface Props {
    params: Promise<{ id: string }>;
}

export default async function SharedNotePage({ params }: Props) {
    const { id } = await params;
    const note = await getStudyNoteById(id);

    if (!note) {
        notFound();
    }

    // Render text with an elegant gold drop cap
    const renderWithDropCap = (text: string) => {
        if (!text) return null;
        return (
            <p className="text-stone-850 text-xs md:text-sm leading-relaxed font-serif first-letter:float-left first-letter:text-4xl first-letter:font-serif first-letter:font-extrabold first-letter:text-accent-gold first-letter:mr-2.5 first-letter:mt-0.5 first-letter:leading-none">
                {text.trim()}
            </p>
        );
    };

    return (
        <div className="min-h-screen bg-bg-parchment text-text-ink flex flex-col justify-between selection:bg-accent-gold/20 relative overflow-hidden font-sans py-8 px-4">
            {/* Decorative background glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70vw] h-[250px] bg-gradient-to-b from-accent-gold/[0.04] via-accent-blue/[0.02] to-transparent blur-[80px] pointer-events-none" />

            {/* Main Container */}
            <main className="max-w-3xl mx-auto w-full bg-bg-alabaster/60 border border-accent-gold/25 p-6 md:p-10 shadow-[2px_2px_0_0_rgba(140,128,112,0.15)] relative z-10 rounded-none">
                <span className="corner-cross top-[-7px] left-[-5px]">✦</span>
                <span className="corner-cross top-[-7px] right-[-5px]">✦</span>
                <span className="corner-cross bottom-[-7px] left-[-5px]">✦</span>
                <span className="corner-cross bottom-[-7px] right-[-5px]">✦</span>

                {/* Top Header */}
                <div className="flex flex-col items-center text-center border-b border-accent-gold/20 pb-6 mb-8">
                    <Link
                        href="/"
                        className="flex flex-col items-center group mb-4"
                    >
                        <img
                            src="/glasswindow.png"
                            alt="Learn Orthodox Stained Glass Logo"
                            className="h-12 w-auto object-contain mb-2 filter drop-shadow-[0_2px_4px_rgba(197,146,70,0.15)] group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="block text-xs font-serif font-extrabold tracking-wider text-text-ink group-hover:text-accent-gold transition-colors">
                            LEARN ORTHODOX
                        </span>
                        <span className="block text-[8px] tracking-widest text-stone-500 uppercase mt-0.5 font-bold font-sans">
                            Shared Study Space Reflection
                        </span>
                    </Link>

                    <h1 className="text-xl md:text-2xl font-serif font-extrabold text-text-ink mt-2 leading-tight uppercase">
                        {note.title}
                    </h1>
                    <p className="text-[10px] text-accent-crimson font-bold uppercase tracking-wider mt-1 font-sans">
                        Liturgy: {note.liturgy_slug.replace("-", " ")} &bull; Section:{" "}
                        {note.section_slug.replace("-", " ")}
                    </p>
                </div>

                {/* Liturgical Passage Display */}
                <div className="bg-bg-parchment/60 p-5 border border-accent-gold/20 mb-8 rounded-none">
                    <span className="block text-[9px] font-serif font-bold text-accent-crimson uppercase tracking-widest mb-3">
                        Liturgical Passage
                    </span>

                    {note.passage_gez && (
                        <p
                            className="text-lg md:text-xl text-accent-blue font-serif font-normal Ethiopic-font mb-3 leading-relaxed"
                            style={{
                                fontFamily:
                                    "var(--font-noto-serif-ethiopic), serif",
                            }}
                        >
                            {note.passage_gez}
                        </p>
                    )}
                    {note.passage_am && (
                        <p
                            className="text-xs md:text-sm text-stone-750 font-medium Ethiopic-font mb-3 leading-relaxed"
                            style={{
                                fontFamily:
                                    "var(--font-noto-serif-ethiopic), serif",
                            }}
                        >
                            {note.passage_am}
                        </p>
                    )}
                    {note.passage_en && (
                        <p className="text-stone-600 text-xs italic font-light leading-relaxed font-serif">
                            &ldquo;{note.passage_en}&rdquo;
                        </p>
                    )}
                </div>

                {/* AI Commentary Layers */}
                <div className="space-y-6 mb-8">
                    <div className="flex items-center gap-1.5 font-serif font-extrabold text-accent-gold text-xs tracking-wider uppercase border-b border-accent-gold/20 pb-1">
                        <CrossIcon className="h-3.5 w-3.5" />
                        AI Patristic Commentary
                    </div>

                    {note.commentary_core && (
                        <div className="border-l-2 border-accent-gold p-4 rounded-none bg-white">
                            <span className="block text-[9px] font-serif font-bold text-accent-gold uppercase tracking-widest mb-1.5">
                                Theological Doctrine
                            </span>
                            {renderWithDropCap(note.commentary_core)}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {note.commentary_context && (
                            <div className="border-l-2 border-accent-crimson/50 p-4 rounded-none bg-white">
                                <span className="block text-[9px] font-serif font-bold text-accent-crimson uppercase tracking-widest mb-1.5">
                                    Liturgical Integration
                                </span>
                                <p className="text-stone-700 text-xs leading-relaxed font-light font-serif">
                                    {note.commentary_context}
                                </p>
                            </div>
                        )}

                        {note.commentary_symbolism && (
                            <div className="border-l-2 border-accent-blue/50 p-4 rounded-none bg-white">
                                <span className="block text-[9px] font-serif font-bold text-accent-blue uppercase tracking-widest mb-1.5">
                                    Mystagogy & Symbolism
                                </span>
                                <p className="text-stone-700 text-xs leading-relaxed font-light font-serif whitespace-pre-line">
                                    {note.commentary_symbolism}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* User Reflections */}
                {note.user_notes && (
                    <div className="bg-bg-parchment/40 border border-accent-gold/15 p-5 rounded-none">
                        <div className="flex items-center gap-1.5 font-serif font-extrabold text-stone-700 text-xs tracking-wider uppercase border-b border-accent-gold/15 pb-2 mb-3">
                            <BookOpen className="h-3.5 w-3.5" />
                            Theological Reflection
                        </div>
                        <p 
                            className="text-stone-850 text-xs md:text-sm leading-relaxed font-serif whitespace-pre-line italic relative pl-4 border-l border-accent-gold/25"
                            style={{
                                background: 'linear-gradient(rgba(197, 146, 70, 0.03), rgba(197, 146, 70, 0.03) 23px, transparent 23px, transparent 24px)',
                                backgroundSize: '100% 24px',
                                lineHeight: '24px'
                            }}
                        >
                            &ldquo;{note.user_notes}&rdquo;
                        </p>
                    </div>
                )}

                {/* Action Link back */}
                <div className="text-center mt-10 pt-6 border-t border-accent-gold/20">
                    <Link
                        href="/"
                        className="inline-block px-5 py-2.5 bg-accent-gold hover:bg-accent-gold/90 text-white text-[10px] ui-label font-bold tracking-wider uppercase transition-all shadow-none rounded-none"
                    >
                        Explore Liturgy Reader
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center py-6 text-[9px] text-stone-550 tracking-widest uppercase mt-8">
                <span>© {new Date().getFullYear()} LEARN ORTHODOX</span>
            </footer>
        </div>
    );
}
