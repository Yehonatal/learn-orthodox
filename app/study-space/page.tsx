"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    Heart,
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
    Sparkles,
    Calendar,
    Layers,
    FileText,
    BookMarked,
    ChevronDown,
    ChevronUp,
    Compass,
    Activity,
    Feather,
    Loader2
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
            "Search notes by title, scripture, or reflection...",
        emptyState: "No study notes saved yet.",
        emptyStateSub:
            "Consult the AI Explainer inside the Liturgy Reader to store notes here.",
        backHome: "Back to Home",
        liturgyReader: "Liturgy Reader",
        editReflection: "Edit Reflection",
        reflectionLabel: "My Reflection & Reflections",
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
        shareBtn: "Share",
        deleteBtn: "Delete",
        allLiturgyFilter: "All Liturgies",
        dateLabel: "Saved on",
        scriptureLabel: "Liturgical Passage",
        statsTitle: "Study Journal Index",
        statsTotal: "Total Reflections",
        statsLiturgies: "Liturgies Explored",
        statsRecent: "Last Study Date",
        toggleShowAi: "Show AI Commentary",
        toggleHideAi: "Hide AI Commentary"
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
        statsTitle: "የጥናት መጽሔት ማውጫ",
        statsTotal: "ጠቅላላ ማስታወሻዎች",
        statsLiturgies: "የተጠኑ ቅዳሴዎች",
        statsRecent: "የመጨረሻው ጥናት",
        toggleShowAi: "የሊቃውንት ማብራሪያ አሳይ",
        toggleHideAi: "የሊቃውንት ማብራሪያ ደብቅ"
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

    // Track which notes have their AI commentary expanded
    const [expandedAiNotes, setExpandedAiNotes] = useState<Record<string, boolean>>({});

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

    const toggleAiExpansion = (id: string) => {
        setExpandedAiNotes(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
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

    // Compute stats
    const totalReflections = notes.length;
    const uniqueLiturgiesCount = uniqueLiturgies.length;
    const lastStudyDate = notes.length > 0 && notes[0].created_at
        ? new Date(notes[0].created_at).toLocaleDateString(lang === "am" ? "am-ET" : "en-US", {
            month: 'short',
            day: 'numeric',
            year: '2-digit'
          })
        : "—";

    // Render text with an elegant gold drop cap
    const renderWithDropCap = (text: string) => {
        if (!text) return null;
        return (
            <p className="text-[#141211] text-xs md:text-sm leading-relaxed font-serif first-letter:float-left first-letter:text-4xl first-letter:font-serif first-letter:font-extrabold first-letter:text-accent-gold first-letter:mr-2.5 first-letter:mt-0.5 first-letter:leading-none">
                {text.trim()}
            </p>
        );
    };

    return (
        <div className="min-h-screen bg-bg-parchment text-text-ink flex flex-col justify-between selection:bg-accent-gold/20 relative overflow-x-hidden font-sans">
            
            {/* Background Lalibela Cross Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] md:w-[650px] h-[450px] md:h-[650px] text-accent-gold/[0.015] pointer-events-none select-none z-0">
                <svg viewBox="0 0 200 200" fill="currentColor" className="w-full h-full">
                  <path d="M95 10v45H80c-5 0-9 4-9 9s4 9 9 9h15v15H80c-5 0-9 4-9 9s4 9 9 9h15v45c0 5 4 9 9 9s9-4 9-9v-45h15c5 0 9-4 9-9s-4-9-9-9h-15V83h15c5 0 9-4 9-9s-4-9-9-9h-15V10c0-5-4-9-9-9s-9 4-9 9z" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M100 25c-41.42 0-75 33.58-75 75s33.58 75 75 75 75-33.58 75-75-33.58-75-75-75zm0 144c-38.1 0-69-30.9-69-69s30.9-69 69-69 69 30.9 69 69-30.9 69-69 69z" />
                </svg>
            </div>

            {/* Header */}
            <header className="border-b border-accent-gold/15 bg-bg-parchment/80 backdrop-blur-md sticky top-0 z-30 shadow-none">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <Link
                        href={`/?lang=${lang}`}
                        className="flex items-center space-x-3.5 group"
                    >
                        <img
                            src="/glasswindow.png"
                            alt="Learn Orthodox Logo"
                            className="h-8 w-auto object-contain filter drop-shadow-[0_2px_4px_rgba(197,146,70,0.1)] group-hover:scale-105 transition-transform duration-300"
                        />
                        <div>
                            <span className="block text-xs font-serif font-extrabold tracking-widest text-text-ink group-hover:text-accent-gold transition-colors">
                                {lang === "am" ? "ኦርቶዶክስን ይማሩ" : "LEARN ORTHODOX"}
                            </span>
                            <span className="block text-[7px] text-stone-500 tracking-wider uppercase font-medium mt-0.5">
                                {lang === "am" ? "የጥናት ክፍል" : "Theological Study Space"}
                            </span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link
                            href={`/liturgy/qiddase-dioscoros?lang=${lang}`}
                            className="text-[10px] font-serif uppercase tracking-wider text-accent-crimson hover:text-accent-crimson/80 transition-colors font-bold"
                        >
                            {t.liturgyReader}
                        </Link>
                        <div className="w-[1px] h-3 bg-accent-gold/25" />
                        <Link
                            href={`/videos?lang=${lang}`}
                            className="text-[10px] font-serif uppercase tracking-wider text-accent-blue hover:text-accent-blue/80 transition-colors font-bold"
                        >
                            {lang === "am" ? "ትምህርት ቪዲዮዎች" : "Video Lessons"}
                        </Link>
                        <div className="w-[1px] h-3 bg-accent-gold/25" />
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
            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-grow relative z-10">
                
                {/* Title Block */}
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-text-ink tracking-tight mb-3">
                        {t.title}
                    </h1>
                    <div className="w-20 h-[1.5px] bg-accent-gold/45 mb-3 mx-auto" />
                    <p className="text-stone-550 text-xs font-light">
                        {t.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Tactile Journal Index Panel (Span 4) */}
                    <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-[88px]">
                        
                        {/* Search & Filter Card */}
                        <div className="bg-white border border-accent-gold/15 rounded-2xl p-5 space-y-4 soft-shadow">
                            <h3 className="text-xs font-serif font-extrabold text-text-ink uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-stone-100">
                                <Search className="h-4 w-4 text-accent-gold" />
                                <span>Filter & Search</span>
                            </h3>

                            {/* Search Box */}
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-455" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t.searchPlaceholder}
                                    className="w-full bg-white border border-accent-gold/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-ink placeholder-stone-400 outline-none focus:border-accent-gold transition-all"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-450 hover:text-stone-700"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Liturgy Filter */}
                            {uniqueLiturgies.length > 0 && (
                                <div className="space-y-1.5">
                                    <label className="block text-[8px] font-bold text-stone-400 uppercase tracking-wider">Liturgy Reference</label>
                                    <select
                                        value={selectedLiturgyFilter}
                                        onChange={(e) => setSelectedLiturgyFilter(e.target.value)}
                                        className="w-full bg-bg-parchment/30 border border-accent-gold/15 rounded-xl px-3 py-2 text-xs text-text-ink outline-none cursor-pointer focus:border-accent-gold"
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
                                </div>
                            )}
                        </div>

                        {/* Journal Stats Card */}
                        <div className="bg-bg-alabaster/40 border border-accent-gold/15 rounded-2xl p-5 space-y-4 soft-shadow">
                            <h3 className="text-xs font-serif font-extrabold text-text-ink uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-accent-gold/10">
                                <BookMarked className="h-4 w-4 text-accent-gold" />
                                <span>{t.statsTitle}</span>
                            </h3>

                            <div className="grid grid-cols-3 gap-2 text-center select-none">
                                <div className="bg-white p-3 rounded-xl border border-accent-gold/10">
                                    <span className="block text-lg font-serif font-bold text-accent-gold">{totalReflections}</span>
                                    <span className="block text-[7px] text-stone-400 uppercase font-semibold leading-tight mt-0.5">{t.statsTotal}</span>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-accent-gold/10">
                                    <span className="block text-lg font-serif font-bold text-accent-crimson">{uniqueLiturgiesCount}</span>
                                    <span className="block text-[7px] text-stone-400 uppercase font-semibold leading-tight mt-0.5">{t.statsLiturgies}</span>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-accent-gold/10">
                                    <span className="block text-[10px] py-1.5 font-bold text-accent-blue truncate">{lastStudyDate}</span>
                                    <span className="block text-[7px] text-stone-400 uppercase font-semibold leading-tight mt-0.5">{t.statsRecent}</span>
                                </div>
                            </div>

                            {/* Patristic Quote Block */}
                            <div className="bg-white p-4 rounded-xl border border-accent-gold/10 relative overflow-hidden">
                                <Feather className="absolute right-2 bottom-2 h-10 w-10 text-accent-gold/[0.04] pointer-events-none" />
                                <p className="text-[10px] text-stone-500 font-serif leading-relaxed italic">
                                    &ldquo;The liturgy is the heaven on earth; a divine mystery which requires our deepest patristic reflection and prayerful silence.&rdquo;
                                </p>
                                <span className="block text-[8px] text-accent-gold font-bold uppercase mt-2 tracking-wider">— St. John Chrysostom</span>
                            </div>
                        </div>

                    </aside>

                    {/* Right Column: Reflections Grid/List (Span 8) */}
                    <section className="lg:col-span-8 space-y-6">
                        
                        {/* Loading State */}
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-20 bg-white border border-accent-gold/15 rounded-2xl soft-shadow">
                                <Loader2 className="animate-spin h-8 w-8 text-accent-gold mb-3" />
                                <span className="text-xs text-stone-500 font-serif tracking-widest uppercase">Loading reflections...</span>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && filteredNotes.length === 0 && (
                            <div className="text-center py-20 bg-white border border-dashed border-accent-gold/25 rounded-2xl flex flex-col items-center justify-center p-6 soft-shadow">
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

                        {/* Reflections List */}
                        {!loading && filteredNotes.length > 0 && (
                            <div className="space-y-6">
                                {filteredNotes.map((note) => {
                                    const isEditing = editingId === note.id;
                                    const isAiExpanded = !!expandedAiNotes[note.id];
                                    const formattedDate = note.created_at
                                        ? new Date(note.created_at).toLocaleDateString(
                                              lang === "am" ? "am-ET" : "en-US",
                                              {
                                                  year: "numeric",
                                                  month: "short",
                                                  day: "numeric",
                                              },
                                          )
                                        : "N/A";

                                    return (
                                        <article
                                            key={note.id}
                                            className="bg-white border border-accent-gold/15 border-l-[6px] border-l-accent-gold/45 rounded-2xl p-5 md:p-6 relative overflow-hidden soft-shadow soft-shadow-hover"
                                        >
                                            {/* Card Header */}
                                            <div className="flex justify-between items-start gap-4 border-b border-stone-100 pb-3 mb-4">
                                                <div className="space-y-1 flex-grow">
                                                    {isEditing ? (
                                                        <div className="mb-2">
                                                            <label className="block text-[8px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                                                                {t.editTitleLabel}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={editTitle}
                                                                onChange={(e) => setEditTitle(e.target.value)}
                                                                className="w-full bg-bg-parchment/60 border border-accent-gold/25 rounded-xl px-3 py-2 text-xs focus:border-accent-gold outline-none font-serif font-bold text-text-ink"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <h2 className="text-sm md:text-base font-serif font-bold text-text-ink uppercase tracking-wide">
                                                            {note.title}
                                                        </h2>
                                                    )}
                                                    
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-[8px] text-accent-crimson font-serif font-bold uppercase tracking-wider bg-accent-crimson/[0.04] px-2 py-0.5 rounded border border-accent-crimson/15">
                                                            {note.liturgy_slug.replace("-", " ")}
                                                        </span>
                                                        <span className="text-[8px] text-stone-400 font-medium">
                                                            {formattedDate}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Toolbar actions */}
                                                {!isEditing && (
                                                    <div className="flex gap-1.5 select-none">
                                                        <button
                                                            onClick={() => handleShare(note.id)}
                                                            className="p-1.5 border border-accent-gold/15 text-stone-500 hover:text-accent-gold hover:border-accent-gold/50 rounded-lg transition-colors cursor-pointer bg-white"
                                                            title={t.shareBtn}
                                                        >
                                                            {copiedId === note.id ? (
                                                                <Check className="h-3.5 w-3.5 text-accent-gold animate-bounce" />
                                                            ) : (
                                                                <Share2 className="h-3.5 w-3.5" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleStartEdit(note)}
                                                            className="p-1.5 border border-accent-gold/15 text-stone-500 hover:text-accent-gold hover:border-accent-gold/50 rounded-lg transition-colors cursor-pointer bg-white"
                                                            title={t.editReflection}
                                                        >
                                                            <Edit3 className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(note.id)}
                                                            className="p-1.5 bg-accent-crimson/[0.02] hover:bg-accent-crimson/10 border border-accent-crimson/15 text-accent-crimson/70 hover:text-accent-crimson rounded-lg transition-colors cursor-pointer"
                                                            title={t.deleteBtn}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Scripture Snippet */}
                                            <div className="bg-bg-parchment/50 rounded-xl p-4 border border-accent-gold/15 mb-4 relative">
                                                <span className="block text-[8px] font-serif font-bold text-accent-crimson/70 uppercase tracking-widest mb-2">
                                                    {t.scriptureLabel}
                                                </span>
                                                {note.passage_gez && (
                                                    <p className="text-sm sm:text-base text-accent-blue font-serif font-semibold Ethiopic-font mb-2 leading-relaxed">
                                                        {note.passage_gez}
                                                    </p>
                                                )}
                                                {note.passage_am && (
                                                    <p className="text-xs text-stone-750 font-medium Ethiopic-font mb-2 leading-relaxed">
                                                        {note.passage_am}
                                                    </p>
                                                )}
                                                {note.passage_en && (
                                                    <p className="text-stone-550 text-xs italic font-light leading-relaxed">
                                                        &ldquo;{note.passage_en}&rdquo;
                                                    </p>
                                                )}
                                            </div>

                                            {/* Collapsible AI Patristic Commentary */}
                                            {(note.commentary_core || note.commentary_context || note.commentary_symbolism) && (
                                                <div className="mb-4 border-b border-stone-100 pb-4">
                                                    <button
                                                        onClick={() => toggleAiExpansion(note.id)}
                                                        className="w-full flex items-center justify-between py-2 px-3 bg-bg-alabaster/40 border border-accent-gold/10 hover:border-accent-gold/25 rounded-xl text-[9px] font-serif font-bold text-accent-gold uppercase tracking-widest transition-all cursor-pointer"
                                                    >
                                                        <span className="flex items-center gap-1.5">
                                                            <Sparkles className="h-3.5 w-3.5" />
                                                            {t.aiCommentaryLabel}
                                                        </span>
                                                        {isAiExpanded ? (
                                                            <span className="inline-flex items-center gap-1 text-[8px] text-stone-400">
                                                                {t.toggleHideAi} <ChevronUp className="h-3 w-3" />
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[8px] text-stone-400">
                                                                {t.toggleShowAi} <ChevronDown className="h-3 w-3" />
                                                            </span>
                                                        )}
                                                    </button>

                                                    {isAiExpanded && (
                                                        <div className="space-y-4 mt-3 bg-white p-1 rounded-xl animate-in slide-in-from-top-2 duration-300">
                                                            {note.commentary_core && (
                                                                <div className="bg-accent-gold/[0.02] border-l-2 border-accent-gold p-4 rounded-r-xl">
                                                                    <span className="block text-[8px] font-serif font-bold text-accent-gold uppercase tracking-widest mb-1.5">
                                                                        {t.theologyLabel}
                                                                    </span>
                                                                    {renderWithDropCap(note.commentary_core)}
                                                                </div>
                                                            )}

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {note.commentary_context && (
                                                                    <div className="bg-accent-crimson/[0.01] border-l-2 border-accent-crimson/50 p-4 rounded-r-xl">
                                                                        <span className="block text-[8px] font-serif font-bold text-accent-crimson uppercase tracking-widest mb-1.5">
                                                                            {t.liturgyLabel}
                                                                        </span>
                                                                        <p className="text-stone-700 text-xs leading-relaxed font-light">
                                                                            {note.commentary_context}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {note.commentary_symbolism && (
                                                                    <div className="bg-accent-blue/[0.01] border-l-2 border-accent-blue/50 p-4 rounded-r-xl">
                                                                        <span className="block text-[8px] font-serif font-bold text-accent-blue uppercase tracking-widest mb-1.5">
                                                                            {t.symbolismLabel}
                                                                        </span>
                                                                        <p className="text-stone-700 text-xs leading-relaxed font-light whitespace-pre-line">
                                                                            {note.commentary_symbolism}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Reflection Block */}
                                            <div className="bg-bg-parchment/35 border border-accent-gold/10 rounded-xl p-4 relative">
                                                <span className="block text-[8px] font-serif font-bold text-stone-500 uppercase tracking-widest mb-2 border-b border-stone-200/40 pb-1">
                                                    {t.reflectionLabel}
                                                </span>

                                                {isEditing ? (
                                                    <div className="mt-2 space-y-3">
                                                        <textarea
                                                            value={editReflection}
                                                            onChange={(e) => setEditReflection(e.target.value)}
                                                            rows={4}
                                                            className="w-full resize-none bg-white border border-accent-gold/15 rounded-xl p-3 text-xs md:text-sm text-text-ink placeholder-stone-400 outline-none focus:border-accent-gold font-serif"
                                                        />
                                                        <div className="flex gap-2 justify-end">
                                                            <button
                                                                onClick={() => setEditingId(null)}
                                                                className="px-3 py-1.5 border border-stone-300 hover:border-stone-450 text-stone-600 rounded-lg text-xs font-semibold cursor-pointer bg-white"
                                                            >
                                                                {t.cancel}
                                                            </button>
                                                            <button
                                                                onClick={() => handleSaveEdit(note.id)}
                                                                className="flex items-center gap-1.5 px-4 py-1.5 bg-accent-gold hover:bg-accent-gold/90 text-white rounded-lg text-xs font-bold cursor-pointer"
                                                            >
                                                                <Save className="h-3.5 w-3.5" />
                                                                {t.save}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p 
                                                        className="text-stone-700 text-xs md:text-sm leading-relaxed font-serif whitespace-pre-line italic relative pl-4 border-l border-accent-gold/25"
                                                        style={{
                                                            background: 'linear-gradient(rgba(197, 146, 70, 0.03), rgba(197, 146, 70, 0.03) 23px, transparent 23px, transparent 24px)',
                                                            backgroundSize: '100% 24px',
                                                            lineHeight: '24px'
                                                        }}
                                                    >
                                                        {note.user_notes ? `“${note.user_notes}”` : "—"}
                                                    </p>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 border-t border-accent-gold/15 bg-bg-alabaster/40 text-center text-[9px] text-stone-500 tracking-widest uppercase mt-12">
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
        <Suspense
            fallback={
                <div className="min-h-screen bg-bg-parchment flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-gold border-t-transparent" />
                </div>
            }
        >
            <StudySpaceContent />
        </Suspense>
    );
}
