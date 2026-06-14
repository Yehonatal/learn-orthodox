"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    Sparkles,
    BookOpen,
    Trash2,
    Edit3,
    Share2,
    X,
    Search,
    ArrowLeft,
    Copy,
    Check,
    Save,
} from "lucide-react";
import { toast } from "sonner";
import {
    getStudyNotes,
    saveStudyNote,
    deleteStudyNote,
    type StudyNote,
} from "@/lib/notes/service";

const TRANSLATIONS = {
    en: {
        title: "Theological Study Space",
        subtitle:
            "Your personal archive of liturgy commentaries and patristic reflections",
        searchPlaceholder:
            "Search notes by title, scripture snippet, or reflection...",
        emptyState: "No study notes saved yet.",
        emptyStateSub:
            "Consult the AI Explainer inside the Liturgy Reader to store notes here.",
        backHome: "Back to Home",
        liturgyReader: "Liturgy Reader",
        editReflection: "Edit Reflection",
        reflectionLabel: "My Reflection / Thoughts",
        aiCommentaryLabel: "AI Patristic Commentary",
        theologyLabel: "Theological Doctrine",
        liturgyLabel: "Liturgical Integration",
        symbolismLabel: "Mystagogy & Symbolism",
        deleteConfirm: "Are you sure you want to delete this study note?",
        deleteSuccess: "Note successfully deleted.",
        saveSuccess: "Changes saved successfully.",
        shareSuccess: "Share link copied to clipboard!",
        editTitleLabel: "Note Title",
        cancel: "Cancel",
        save: "Save Changes",
        shareBtn: "Share Reflection",
        deleteBtn: "Delete",
        allLiturgyFilter: "All Liturgies",
        dateLabel: "Saved on",
        scriptureLabel: "Liturgical Passage",
    },
    am: {
        title: "የነገረ መለኮት ጥናት ክፍል",
        subtitle: "የሥርዓተ ቅዳሴና የሊቃውንት ትምህርት ማስታወሻዎችዎ የግል ማኅደር",
        searchPlaceholder: "ማስታወሻዎችን በትርጉም፣ በምዕራፍ ወይም በርዕስ ይፈልጉ...",
        emptyState: "ምንም የተቀመጠ ማስታወሻ የለም።",
        emptyStateSub:
            "በሥርዓተ ቅዳሴ ንባቡ ውስጥ የ AI ማብራሪያን በመጠየቅ ማስታወሻዎችን እዚህ ያስቀምጡ።",
        backHome: "ወደ መጀመሪያ ገጽ",
        liturgyReader: "የሥርዓተ ቅዳሴ አንባቢ",
        editReflection: "ማስታወሻውን አርም",
        reflectionLabel: "የግል ማስታወሻ / አስተምህሮ",
        aiCommentaryLabel: "የሊቃውንት ማብራሪያ",
        theologyLabel: "የነገረ መለኮት አስተምህሮ",
        liturgyLabel: "ሥርዓተ ቅዳሴያዊ ትስስር",
        symbolismLabel: "ምስጢራተ ቤተ ክርስቲያንና ምልክቶች",
        deleteConfirm: "ይህን ማስታወሻ ለመሰረዝ እርግጠኛ ነዎት?",
        deleteSuccess: "ማስታወሻው በተሳካ ሁኔታ ተሰርዟል።",
        saveSuccess: "ለውጦቹ በተሳካ ሁኔታ ተቀምጠዋል።",
        shareSuccess: "የማጋሪያው ሊንክ ተገልብጧል!",
        editTitleLabel: "የማስታወሻ ርዕስ",
        cancel: "አጥፋ",
        save: "ለውጦችን አስቀምጥ",
        shareBtn: "አጋራ",
        deleteBtn: "ሰርዝ",
        allLiturgyFilter: "ሁሉም ቅዳሴዎች",
        dateLabel: "የተቀመጠበት ቀን",
        scriptureLabel: "የሥርዓተ ቅዳሴ ጥቅስ",
    },
};

function StudySpaceContent() {
    const searchParams = useSearchParams();
    const lang = searchParams.get("lang") === "am" ? "am" : "en";
    const t = TRANSLATIONS[lang];

    const [notes, setNotes] = useState<StudyNote[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLiturgyFilter, setSelectedLiturgyFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editReflection, setEditReflection] = useState("");

    // Share copy confirmation states
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        async function loadNotes() {
            try {
                const data = await getStudyNotes();
                setNotes(data);
            } catch (err) {
                console.error("Error loading notes:", err);
            } finally {
                setLoading(false);
            }
        }
        loadNotes();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm(t.deleteConfirm)) {
            try {
                await deleteStudyNote(id);
                setNotes((prev) => prev.filter((n) => n.id !== id));
                toast.success(t.deleteSuccess, {
                    className: "sonner-toast-custom",
                });
            } catch (err) {
                console.error("Delete note failed:", err);
            }
        }
    };

    const handleStartEdit = (note: StudyNote) => {
        setEditingId(note.id);
        setEditTitle(note.title);
        setEditReflection(note.user_notes || "");
    };

    const handleSaveEdit = async (id: string) => {
        const original = notes.find((n) => n.id === id);
        if (!original) return;

        try {
            const updated = await saveStudyNote({
                ...original,
                title: editTitle,
                user_notes: editReflection,
            });

            setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
            setEditingId(null);
            toast.success(t.saveSuccess, { className: "sonner-toast-custom" });
        } catch (err) {
            console.error("Failed to save edit:", err);
        }
    };

    const handleShare = (id: string) => {
        if (typeof window !== "undefined") {
            const shareUrl = `${window.location.origin}/study-space/share/${id}`;
            navigator.clipboard.writeText(shareUrl);
            setCopiedId(id);
            toast.success(t.shareSuccess, {
                className: "sonner-toast-custom-blue",
            });
            setTimeout(() => setCopiedId(null), 3000);
        }
    };

    // Filter & Search Logic
    const filteredNotes = notes.filter((note) => {
        const matchesSearch =
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (note.passage_en || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (note.passage_am || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (note.passage_gez || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (note.commentary_core || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (note.user_notes || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesLiturgy =
            selectedLiturgyFilter === "all" ||
            note.liturgy_slug === selectedLiturgyFilter;

        return matchesSearch && matchesLiturgy;
    });

    // Extract unique liturgy slugs for filter dropdown
    const uniqueLiturgies = Array.from(
        new Set(notes.map((n) => n.liturgy_slug)),
    );

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
        <div className="min-h-screen bg-bg-parchment text-text-ink flex flex-col justify-between selection:bg-accent-gold/20 relative overflow-hidden font-sans">
            {/* Background Lalibela Cross Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] md:w-[650px] h-[450px] md:h-[650px] text-accent-gold/[0.03] pointer-events-none select-none z-0">
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

            {/* Header */}
            <header className="border-b border-accent-gold/20 bg-bg-parchment/80 backdrop-blur-md sticky top-0 z-20 shadow-none">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href={`/?lang=${lang}`}
                        className="flex items-center space-x-3.5 group"
                    >
                        <img
                            src="/glasswindow.png"
                            alt="Learn Orthodox Stained Glass Logo"
                            className="h-8 w-auto object-contain filter drop-shadow-[0_2px_4px_rgba(197,146,70,0.1)] group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="hidden sm:block">
                            <span className="block text-xs font-serif font-extrabold tracking-wider text-text-ink group-hover:text-accent-gold transition-colors">
                                {lang === "am"
                                    ? "ኦርቶዶክስን ይማሩ"
                                    : "LEARN ORTHODOX"}
                            </span>
                            <span className="block text-[8px] tracking-widest text-stone-500 uppercase">
                                {lang === "am" ? "የጥናት ክፍል" : "Study Space"}
                            </span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link
                            href={`/liturgy/qiddase-dioscoros?lang=${lang}`}
                            className="text-xs font-serif uppercase tracking-wider text-accent-crimson hover:text-accent-crimson/80 transition-colors font-bold"
                        >
                            {t.liturgyReader}
                        </Link>
                        <div className="w-[1px] h-4 bg-accent-gold/30" />
                        <Link
                            href={`/study-space?lang=${lang === "en" ? "am" : "en"}`}
                            className="px-2.5 py-1 rounded-full border border-accent-gold/20 text-[9px] font-bold text-text-ink uppercase tracking-wider hover:bg-bg-alabaster transition-colors"
                        >
                            {lang === "en" ? "አማርኛ" : "EN"}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto w-full px-6 py-10 flex-grow relative z-10">
                {/* Title Block */}
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <h1 className="text-3xl md:text-5xl font-serif font-extrabold text-text-ink tracking-tight mb-3">
                        {t.title}
                    </h1>
                    <div className="w-20 h-[1.5px] bg-accent-gold mb-4 mx-auto" />
                    <p className="text-stone-550 text-xs md:text-sm font-light">
                        {t.subtitle}
                    </p>
                </div>

                {/* Controls: Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 bg-bg-alabaster/40 p-4 border border-accent-gold/20 rounded-2xl">
                    {/* Search Box */}
                    <div className="flex-grow relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t.searchPlaceholder}
                            className="w-full bg-white border border-accent-gold/20 rounded-xl pl-10 pr-4 py-2 text-xs md:text-sm text-text-ink placeholder-stone-400 outline-none focus:border-accent-gold"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-450 hover:text-stone-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Liturgy Filter */}
                    {uniqueLiturgies.length > 0 && (
                        <select
                            value={selectedLiturgyFilter}
                            onChange={(e) =>
                                setSelectedLiturgyFilter(e.target.value)
                            }
                            className="bg-white border border-accent-gold/20 rounded-xl px-4 py-2 text-xs md:text-sm text-text-ink outline-none cursor-pointer focus:border-accent-gold min-w-[180px]"
                        >
                            <option value="all">{t.allLiturgyFilter}</option>
                            {uniqueLiturgies.map((slug) => (
                                <option key={slug} value={slug}>
                                    {slug
                                        .split("-")
                                        .map(
                                            (w) =>
                                                w.charAt(0).toUpperCase() +
                                                w.slice(1),
                                        )
                                        .join(" ")}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-gold border-t-transparent mb-4"></div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredNotes.length === 0 && (
                    <div className="text-center py-20 bg-bg-alabaster/10 border border-dashed border-accent-gold/25 rounded-2xl flex flex-col items-center justify-center p-6">
                        <BookOpen className="h-10 w-10 text-accent-gold/30 mb-4 animate-pulse" />
                        <h3 className="text-base font-serif font-bold text-text-ink mb-1">
                            {t.emptyState}
                        </h3>
                        <p className="text-stone-500 text-xs max-w-sm mb-6">
                            {t.emptyStateSub}
                        </p>
                        <Link
                            href={`/liturgy/qiddase-dioscoros?lang=${lang}`}
                            className="px-5 py-2.5 rounded-xl bg-accent-gold hover:bg-accent-gold/90 text-white text-xs font-bold tracking-wider uppercase transition-all"
                        >
                            {t.liturgyReader}
                        </Link>
                    </div>
                )}

                {/* Study Notes List */}
                {!loading && filteredNotes.length > 0 && (
                    <div className="space-y-8">
                        {filteredNotes.map((note) => {
                            const isEditing = editingId === note.id;
                            const formattedDate = note.created_at
                                ? new Date(note.created_at).toLocaleDateString(
                                      lang === "am" ? "am-ET" : "en-US",
                                      {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                      },
                                  )
                                : "N/A";

                            return (
                                <div
                                    key={note.id}
                                    className="bg-white border border-accent-gold/20 rounded-2xl p-5 md:p-8 shadow-sm hover:border-accent-gold/40 transition-colors"
                                >
                                    {/* Card Header */}
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-stone-100 pb-4 mb-4">
                                        <div className="w-full">
                                            {isEditing ? (
                                                <div className="mb-2">
                                                    <label className="block text-[8px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                                                        {t.editTitleLabel}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editTitle}
                                                        onChange={(e) =>
                                                            setEditTitle(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full bg-bg-parchment border border-accent-gold/25 rounded-lg px-3 py-1.5 text-xs focus:border-accent-gold outline-none font-serif font-bold text-text-ink"
                                                    />
                                                </div>
                                            ) : (
                                                <h2 className="text-base md:text-lg font-serif font-extrabold text-text-ink uppercase">
                                                    {note.title}
                                                </h2>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] text-accent-crimson font-bold uppercase tracking-wider bg-accent-crimson/[0.04] px-2 py-0.5 rounded border border-accent-crimson/15">
                                                    {note.liturgy_slug.replace(
                                                        "-",
                                                        " ",
                                                    )}
                                                </span>
                                                <span className="text-[9px] text-stone-400 font-medium">
                                                    {t.dateLabel}:{" "}
                                                    {formattedDate}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Desktop Toolbar */}
                                        {!isEditing && (
                                            <div className="flex gap-2 shrink-0 self-end md:self-auto">
                                                <button
                                                    onClick={() =>
                                                        handleShare(note.id)
                                                    }
                                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-accent-gold/20 text-text-ink hover:text-accent-gold hover:border-accent-gold/50 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                                >
                                                    {copiedId === note.id ? (
                                                        <Check className="h-3.5 w-3.5 text-accent-gold animate-bounce" />
                                                    ) : (
                                                        <Share2 className="h-3.5 w-3.5" />
                                                    )}
                                                    {t.shareBtn}
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleStartEdit(note)
                                                    }
                                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-accent-gold/20 text-text-ink hover:text-accent-gold hover:border-accent-gold/50 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                                >
                                                    <Edit3 className="h-3.5 w-3.5" />
                                                    {t.editReflection}
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(note.id)
                                                    }
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-crimson/[0.04] hover:bg-accent-crimson/10 border border-accent-crimson/25 text-accent-crimson rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    {t.deleteBtn}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Body - Scripture Snippet */}
                                    <div className="bg-bg-parchment/60 rounded-xl p-4 border border-accent-gold/15 mb-6">
                                        <span className="block text-[8px] font-serif font-bold text-accent-crimson uppercase tracking-widest mb-2">
                                            {t.scriptureLabel}
                                        </span>
                                        {note.passage_gez && (
                                            <p
                                                className="text-base text-accent-blue font-serif font-semibold Ethiopic-font mb-2 leading-relaxed"
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
                                                className="text-xs text-stone-750 font-medium Ethiopic-font mb-2 leading-relaxed"
                                                style={{
                                                    fontFamily:
                                                        "var(--font-noto-serif-ethiopic), serif",
                                                }}
                                            >
                                                {note.passage_am}
                                            </p>
                                        )}
                                        {note.passage_en && (
                                            <p className="text-stone-600 text-xs italic font-light leading-relaxed">
                                                &ldquo;{note.passage_en}&rdquo;
                                            </p>
                                        )}
                                    </div>

                                    {/* Card Body - AI Commentary */}
                                    {(note.commentary_core ||
                                        note.commentary_context ||
                                        note.commentary_symbolism) && (
                                        <div className="space-y-4 mb-6 border-b border-stone-100 pb-6">
                                            <span className="block text-[9px] font-serif font-bold text-accent-gold uppercase tracking-widest border-b border-accent-gold/10 pb-1.5 mb-2">
                                                {t.aiCommentaryLabel}
                                            </span>

                                            {note.commentary_core && (
                                                <div className="bg-accent-gold/[0.02] border-l-2 border-accent-gold p-4 rounded-r-xl">
                                                    <span className="block text-[8px] font-serif font-bold text-accent-gold uppercase tracking-widest mb-1">
                                                        {t.theologyLabel}
                                                    </span>
                                                    {renderWithDropCap(
                                                        note.commentary_core,
                                                    )}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {note.commentary_context && (
                                                    <div className="bg-accent-crimson/[0.01] border-l-2 border-accent-crimson/50 p-4 rounded-r-xl">
                                                        <span className="block text-[8px] font-serif font-bold text-accent-crimson uppercase tracking-widest mb-1">
                                                            {t.liturgyLabel}
                                                        </span>
                                                        <p className="text-stone-700 text-xs leading-relaxed font-light">
                                                            {
                                                                note.commentary_context
                                                            }
                                                        </p>
                                                    </div>
                                                )}

                                                {note.commentary_symbolism && (
                                                    <div className="bg-accent-blue/[0.01] border-l-2 border-accent-blue/50 p-4 rounded-r-xl">
                                                        <span className="block text-[8px] font-serif font-bold text-accent-blue uppercase tracking-widest mb-1">
                                                            {t.symbolismLabel}
                                                        </span>
                                                        <p className="text-stone-700 text-xs leading-relaxed font-light whitespace-pre-line">
                                                            {
                                                                note.commentary_symbolism
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Card Body - Reflection Block */}
                                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                                        <span className="block text-[9px] font-serif font-bold text-stone-600 uppercase tracking-widest mb-2 border-b border-stone-200/60 pb-1">
                                            {t.reflectionLabel}
                                        </span>

                                        {isEditing ? (
                                            <div className="mt-2">
                                                <textarea
                                                    value={editReflection}
                                                    onChange={(e) =>
                                                        setEditReflection(
                                                            e.target.value,
                                                        )
                                                    }
                                                    rows={4}
                                                    className="w-full resize-none bg-white border border-accent-gold/25 rounded-lg p-3 text-xs md:text-sm text-text-ink placeholder-stone-400 outline-none focus:border-accent-gold font-serif"
                                                />
                                                <div className="flex gap-2 justify-end mt-3">
                                                    <button
                                                        onClick={() =>
                                                            setEditingId(null)
                                                        }
                                                        className="px-3.5 py-1.5 border border-stone-300 hover:border-stone-450 text-stone-600 rounded-lg text-xs font-semibold cursor-pointer"
                                                    >
                                                        {t.cancel}
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleSaveEdit(
                                                                note.id,
                                                            )
                                                        }
                                                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-accent-gold hover:bg-accent-gold/90 text-white rounded-lg text-xs font-bold cursor-pointer"
                                                    >
                                                        <Save className="h-3.5 w-3.5" />
                                                        {t.save}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-stone-700 text-xs md:text-sm leading-relaxed font-serif whitespace-pre-line italic">
                                                {note.user_notes
                                                    ? `“${note.user_notes}”`
                                                    : "—"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="py-8 border-t border-accent-gold/20 bg-bg-alabaster/40 text-center text-[9px] text-stone-550 tracking-widest uppercase backdrop-blur-sm">
                <span>
                    © {new Date().getFullYear()}{" "}
                    {lang === "am" ? "ኦርቶዶክስን ይማሩ" : "LEARN ORTHODOX"}
                </span>
            </footer>
        </div>
    );
}

export default function StudySpacePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-bg-parchment flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-gold border-t-transparent" />
            </div>
        }>
            <StudySpaceContent />
        </Suspense>
    );
}
