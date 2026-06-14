"use client";

import { useState, useRef, useEffect } from "react";
import type { LiturgyUnit } from "@/types/liturgy";
import { toast } from "sonner";
import { saveStudyNote } from "@/lib/notes/service";
import {
    Heart,
    Clipboard,
    Bookmark,
    X,
    Send,
    AlertTriangle,
} from "lucide-react";

const PROVIDERS = [
    {
        id: "google",
        name: "Google Gemini",
        models: ["gemini-2.5-flash", "gemini-1.5-pro"],
    },
    { id: "openai", name: "OpenAI GPT", models: ["gpt-4o-mini", "gpt-4o"] },
    {
        id: "anthropic",
        name: "Anthropic Claude",
        models: ["claude-3-5-haiku-latest", "claude-3-5-sonnet-latest"],
    },
];

const ROLE_LABELS_EN: Record<string, string> = {
    priest: "Priest",
    asst_priest: "Asst. Priest",
    deacon: "Deacon",
    congregation: "People",
    cantor: "Cantor",
    all: "All",
    rubric: "Rubric",
};

const ROLE_LABELS_AM: Record<string, string> = {
    priest: "ካህን",
    asst_priest: "ረዳት ካህን",
    deacon: "ዲያቆን",
    congregation: "ሕዝብ",
    cantor: "ዘማሪ",
    all: "ሁሉም",
    rubric: "መመሪያ",
};

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    parsedCommentary?: {
        core: string;
        context: string;
        symbolism: string;
    } | null;
    isError?: boolean;
    errorDetails?: string;
}

function parseExplanation(rawText: string) {
    const sections = { core: "", context: "", symbolism: "" };

    try {
        let cleanText = rawText.trim();
        if (cleanText.startsWith("```")) {
            cleanText = cleanText.replace(/^```(json)?/, "");
            cleanText = cleanText.replace(/```$/, "");
            cleanText = cleanText.trim();
        }

        const data = JSON.parse(cleanText);
        sections.core = data.theologicalDoctrine || "";
        sections.context = data.liturgicalIntegration || "";

        if (Array.isArray(data.mystagogySymbolism)) {
            sections.symbolism = data.mystagogySymbolism
                .map((s: string) => `- ${s}`)
                .join("\n");
        } else if (typeof data.mystagogySymbolism === "string") {
            sections.symbolism = data.mystagogySymbolism;
        }

        return sections;
    } catch (e) {
        console.warn(
            "Failed to parse explanation JSON. Falling back to text splitting.",
            e,
        );
    }

    // Fallback to text splitting parser if JSON parsing fails
    const parts = rawText.split(/###\s+/);
    for (const part of parts) {
        const trimmed = part.trim();
        const lower = trimmed.toLowerCase();
        if (lower.startsWith("theological core")) {
            sections.core = trimmed.slice("theological core".length).trim();
        } else if (lower.startsWith("theological doctrine")) {
            sections.core = trimmed.slice("theological doctrine".length).trim();
        } else if (lower.startsWith("liturgical context")) {
            sections.context = trimmed
                .slice("liturgical context".length)
                .trim();
        } else if (lower.startsWith("liturgical integration")) {
            sections.context = trimmed
                .slice("liturgical integration".length)
                .trim();
        } else if (lower.startsWith("mystagogy & symbolism")) {
            sections.symbolism = trimmed
                .slice("mystagogy & symbolism".length)
                .trim();
        } else if (lower.startsWith("symbolism")) {
            sections.symbolism = trimmed.slice("symbolism".length).trim();
        }
    }

    if (!sections.core && !sections.context && !sections.symbolism) {
        sections.core = rawText;
    }
    return sections;
}

export default function AIExplainer({
    unit,
    onClose,
    lang = "en",
}: {
    unit: LiturgyUnit;
    onClose: () => void;
    lang?: "en" | "am";
}) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [provider, setProvider] = useState("google");
    const [model, setModel] = useState("gemini-2.5-flash");
    const [inputValue, setInputValue] = useState("");

    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll chat history to the bottom when messages or loading changes
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // Initial commentary fetch
    async function explain() {
        setLoading(true);
        setMessages([]);
        try {
            const res = await fetch("/api/liturgy/explain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    textEn: unit.textEn,
                    textAm: unit.textAm,
                    textGez: unit.textGez,
                    role: unit.role,
                    provider,
                    model,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw {
                    message: data.error || "Server error",
                    cause: data.cause,
                    stack: data.stack,
                };
            }

            setMessages([
                {
                    role: "assistant",
                    content: data.explanation || "Could not load explanation.",
                    parsedCommentary: data.explanation
                        ? parseExplanation(data.explanation)
                        : null,
                },
            ]);

            toast.success("Commentary loaded successfully", {
                className: "sonner-toast-custom-blue",
                duration: 2000,
            });
        } catch (e: unknown) {
            console.error("Error generating commentary:", e);
            const err = e as {
                message?: string;
                cause?: string;
                stack?: string;
            };

            // Construct a detailed error report to show fully without cutting
            const rawErrorReport = `${err.message || String(e)}\n\nCause: ${err.cause || "N/A"}\n\nStack Trace:\n${err.stack || "N/A"}`;

            setMessages([
                {
                    role: "assistant",
                    content: `Failed to consult theological library.`,
                    isError: true,
                    errorDetails: rawErrorReport,
                },
            ]);

            toast.error("Commentary consult failed", {
                className: "sonner-toast-custom",
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    }

    // Handle follow-up chat messages
    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!inputValue.trim() || loading) return;

        const userQuery = inputValue.trim();
        setInputValue("");

        const nextUserMessage: ChatMessage = {
            role: "user",
            content: userQuery,
        };

        // Optimistically update UI with user's message
        const updatedMessages = [...messages, nextUserMessage];
        setMessages(updatedMessages);
        setLoading(true);

        try {
            // Clean messages array to send as context (excluding parsed client helpers)
            const apiMessages = updatedMessages.map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const res = await fetch("/api/liturgy/explain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    textEn: unit.textEn,
                    textAm: unit.textAm,
                    textGez: unit.textGez,
                    role: unit.role,
                    provider,
                    model,
                    messages: apiMessages, // Pass chat history
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw {
                    message: data.error || "Server error",
                    cause: data.cause,
                    stack: data.stack,
                };
            }

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: data.explanation || "No response returned.",
                },
            ]);
        } catch (e: unknown) {
            console.error("Chat error:", e);
            const err = e as {
                message?: string;
                cause?: string;
                stack?: string;
            };
            const rawErrorReport = `${err.message || String(e)}\n\nCause: ${err.cause || "N/A"}\n\nStack:\n${err.stack || "N/A"}`;

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Unable to process follow-up question.",
                    isError: true,
                    errorDetails: rawErrorReport,
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast(
            lang === "am" ? "ማብራሪያው ተገልብጧል" : "Commentary copied to clipboard",
            {
                className: "sonner-toast-custom-blue",
                duration: 2500,
            },
        );
    };

    const handleSave = async () => {
        const defaultTitle =
            lang === "am"
                ? `ማስታወሻ - ገጽ ${unit.sourcePage}`
                : `Reflection - Page ${unit.sourcePage}`;

        // Get the last assistant message
        const assistantMsg = messages.find(
            (m) => m.role === "assistant" && !m.isError,
        );
        const parsed = assistantMsg
            ? parseExplanation(assistantMsg.content)
            : null;

        const liturgySlug =
            typeof window !== "undefined"
                ? window.location.pathname.split("/").pop() ||
                  "qiddase-dioscoros"
                : "qiddase-dioscoros";
        const sectionSlug =
            typeof window !== "undefined"
                ? new URLSearchParams(window.location.search).get("section") ||
                  "opening-hymns"
                : "opening-hymns";

        try {
            await saveStudyNote({
                unit_id: unit.id,
                liturgy_slug: liturgySlug,
                section_slug: sectionSlug,
                passage_gez: unit.textGez,
                passage_am: unit.textAm,
                passage_en: unit.textEn,
                title: defaultTitle,
                commentary_core: parsed?.core || null,
                commentary_context: parsed?.context || null,
                commentary_symbolism: parsed?.symbolism || null,
                user_notes: "",
            });

            toast(
                lang === "am"
                    ? "ማብራሪያው በጥናት ማስታወሻዎ ላይ ተቀምጧል"
                    : "Commentary saved to your study notes",
                {
                    className: "sonner-toast-custom",
                    duration: 2500,
                },
            );
        } catch (err) {
            console.error("Failed to save study note:", err);
            toast(
                lang === "am"
                    ? "ማስታወሻውን ማስቀመጥ አልተቻለም"
                    : "Failed to save study note",
                {
                    className: "sonner-toast-custom-red",
                    duration: 2500,
                },
            );
        }
    };

    // Render text with an elegant gold drop cap (for the initial commentary)
    const renderWithDropCap = (text: string) => {
        if (!text) return null;
        return (
            <p className="text-stone-850 text-xs md:text-sm leading-relaxed font-serif first-letter:float-left first-letter:text-4xl first-letter:font-serif first-letter:font-extrabold first-letter:text-accent-gold first-letter:mr-2.5 first-letter:mt-0.5 first-letter:leading-none">
                {text.trim()}
            </p>
        );
    };

    const activeModelName =
        PROVIDERS.find((p) => p.id === provider)?.name || provider;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/85 backdrop-blur-xl border-t border-accent-gold/35 shadow-[0_-12px_45px_rgba(0,0,0,0.06)] p-6 max-h-[85vh] overflow-y-auto z-40 animate-in slide-in-from-bottom duration-300 rounded-t-2xl">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar Column (col-span-4): Passage context, model config, metadata */}
                <div className="lg:col-span-4 flex flex-col justify-between lg:pr-6 lg:border-r lg:border-accent-gold/20">
                    <div>
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-accent-gold/15">
                            <div>
                                <span className="flex items-center gap-1.5 font-serif font-bold text-accent-gold text-xs tracking-wider uppercase">
                                    <Heart className="h-3.5 w-3.5" />
                                    {lang === "am"
                                        ? "የየነገረ መለኮት ማብራሪያ"
                                        : "Theological Explainer"}
                                </span>
                                <p className="text-[9px] text-stone-400 mt-0.5 uppercase tracking-wider">
                                    {lang === "am"
                                        ? "የኦርቶዶክስ ትምህርት ማብራሪያ"
                                        : "Learn Orthodox Commentary Layer"}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-stone-400 hover:text-text-ink transition-colors p-1.5 bg-stone-100 hover:bg-stone-250/60 rounded-full cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Selected verse preview card */}
                        <div className="bg-bg-parchment/65 rounded-xl p-4 border border-accent-gold/25 mb-4">
                            <div className="text-[9px] font-bold text-accent-crimson uppercase tracking-widest mb-1.5">
                                {lang === "am"
                                    ? `ተናጋሪ፦ ${ROLE_LABELS_AM[unit.role] || unit.role}`
                                    : `Spoken by: ${ROLE_LABELS_EN[unit.role] || unit.role}`}
                            </div>
                            {unit.textGez && (
                                <p
                                    className="text-lg text-accent-blue font-serif font-semibold Ethiopic-font mb-2 leading-relaxed"
                                    style={{
                                        fontFamily:
                                            "var(--font-noto-serif-ethiopic), serif",
                                    }}
                                >
                                    {unit.textGez}
                                </p>
                            )}
                            {unit.textAm && (
                                <p
                                    className="text-xs text-stone-750 font-medium Ethiopic-font mb-2 leading-relaxed"
                                    style={{
                                        fontFamily:
                                            "var(--font-noto-serif-ethiopic), serif",
                                    }}
                                >
                                    {unit.textAm}
                                </p>
                            )}
                            <p className="text-stone-600 text-xs italic font-light leading-relaxed">
                                &ldquo;{unit.textEn}&rdquo;
                            </p>
                        </div>

                        {/* Model/Provider configuration dropdowns (visible if not loaded or during reset) */}
                        {messages.length === 0 && !loading && (
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                                        {lang === "am" ? "አቅራቢ" : "Provider"}
                                    </label>
                                    <select
                                        value={provider}
                                        onChange={(e) => {
                                            const p = e.target.value;
                                            setProvider(p);
                                            const found = PROVIDERS.find(
                                                (prov) => prov.id === p,
                                            );
                                            if (found)
                                                setModel(found.models[0]);
                                        }}
                                        className="w-full bg-bg-parchment border border-accent-gold/25 text-text-ink rounded-lg px-2.5 py-1.5 text-xs focus:border-accent-gold outline-none"
                                    >
                                        {PROVIDERS.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                                        {lang === "am" ? "ሞዴል" : "Model"}
                                    </label>
                                    <select
                                        value={model}
                                        onChange={(e) =>
                                            setModel(e.target.value)
                                        }
                                        className="w-full bg-bg-parchment border border-accent-gold/25 text-text-ink rounded-lg px-2.5 py-1.5 text-xs focus:border-accent-gold outline-none"
                                    >
                                        {PROVIDERS.find(
                                            (p) => p.id === provider,
                                        )?.models.map((m) => (
                                            <option key={m} value={m}>
                                                {m}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* If currently chatting, show a small pill summarizing selected model */}
                        {messages.length > 0 && (
                            <div className="px-3.5 py-2 rounded-lg bg-bg-alabaster/40 border border-accent-gold/15 text-[10px] text-stone-600 mb-4 flex items-center justify-between">
                                <span>
                                    {lang === "am"
                                        ? "በአገልግሎት ላይ ያለ ሞዴል፦"
                                        : "Active Model:"}{" "}
                                    <strong>
                                        {activeModelName} ({model})
                                    </strong>
                                </span>
                                <button
                                    onClick={() => {
                                        setMessages([]);
                                        setInputValue("");
                                    }}
                                    className="text-accent-crimson hover:underline text-[9px] font-bold tracking-wider uppercase cursor-pointer"
                                >
                                    {lang === "am"
                                        ? "ቻቱን አዲስ ጀምር"
                                        : "Reset Chat"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Trigger Initial Commentary */}
                    {messages.length === 0 && (
                        <button
                            onClick={explain}
                            disabled={loading}
                            className="w-full py-2.5 px-4 bg-accent-gold hover:bg-accent-gold/90 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all disabled:opacity-50 cursor-pointer shadow-none active:scale-[0.99]"
                        >
                            {loading
                                ? lang === "am"
                                    ? "የነገረ መለኮት ማብራሪያውን በመፈለግ ላይ..."
                                    : "Consulting theological library..."
                                : lang === "am"
                                  ? "ማብራሪያ ጠይቅ"
                                  : "Consult Commentary"}
                        </button>
                    )}
                </div>

                {/* Right Main Column (col-span-8): The Claude UI-like Chat Interface */}
                <div className="lg:col-span-8 flex flex-col justify-between min-h-[350px] lg:h-[60vh]">
                    {/* Messages Space */}
                    <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4 scrollbar-none">
                        {messages.length === 0 && !loading && (
                            <div className="h-full flex flex-col items-center justify-center text-center py-14">
                                <Heart className="h-9 w-9 text-accent-gold/30 mb-3" />
                                <p className="text-xs text-stone-500 font-light max-w-sm">
                                    {lang === "am"
                                        ? 'ስለ ጥቅሱ ዝርዝር ማብራሪያ ለማግኘት "ማብራሪያ ጠይቅ" የሚለውን ይጫኑ። አንዴ ማብራሪያው ሲጫን ተጨማሪ ጥያቄዎችን በውይይት መጠየቅ ይችላሉ።'
                                        : 'Click "Consult Commentary" to analyze the selected verse. Once loaded, you can ask follow-up questions in an interactive chat session.'}
                                </p>
                            </div>
                        )}

                        {/* Loading Indicator for Initial Commentary */}
                        {loading && messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center py-14">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-gold border-t-transparent mb-4"></div>
                                <p className="text-xs text-accent-gold font-serif font-semibold tracking-wide uppercase">
                                    {lang === "am"
                                        ? "ማብራሪያ በመጻፍ ላይ..."
                                        : "Formulating commentary..."}
                                </p>
                                <p className="text-[10px] text-stone-400 mt-1">
                                    {lang === "am"
                                        ? "የአበው ድርሳናትንና የሥርዓተ ቅዳሴውን ሰንሰለት በመመርመር ላይ..."
                                        : "Accessing patristic archives and liturgical contexts"}
                                </p>
                            </div>
                        )}

                        {/* Chat History Log */}
                        {messages.map((msg, index) => {
                            const isUser = msg.role === "user";

                            return (
                                <div
                                    key={index}
                                    className={`flex flex-col ${isUser ? "items-end" : "items-start"} animate-in fade-in duration-300`}
                                >
                                    {/* Speaker Label */}
                                    <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mb-1 px-1">
                                        {isUser
                                            ? lang === "am"
                                                ? "እርስዎ"
                                                : "You"
                                            : lang === "am"
                                              ? `የኦርቶዶክስ AI (${activeModelName})`
                                              : `Learn Orthodox AI (${activeModelName})`}
                                    </span>

                                    {/* Message Bubble Content */}
                                    <div
                                        className={`max-w-full md:max-w-[85%] rounded-xl p-4 ${
                                            isUser
                                                ? "bg-bg-alabaster/40 border border-accent-gold/20 text-text-ink text-xs md:text-sm font-sans"
                                                : "bg-transparent text-text-ink"
                                        }`}
                                    >
                                        {/* If it's an assistant error block, show EVERYTHING without cutting */}
                                        {msg.isError ? (
                                            <div className="border border-accent-crimson/30 rounded-xl p-4 bg-accent-crimson/[0.02] text-accent-crimson">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    <span className="font-serif font-bold text-xs uppercase tracking-wider">
                                                        Detailed Fetch / API
                                                        Failure Report
                                                    </span>
                                                </div>
                                                <p className="text-xs font-serif font-semibold mb-3">
                                                    {msg.content}
                                                </p>
                                                <div className="bg-stone-900 text-stone-200 p-3 rounded-lg text-[10px] font-mono whitespace-pre overflow-x-auto max-w-full leading-normal border border-stone-850">
                                                    {msg.errorDetails}
                                                </div>
                                                <p className="text-[9px] text-stone-500 mt-2 italic font-sans">
                                                    Tip: To bypass
                                                    timeout/blocked connection
                                                    issues, configure a proxy in
                                                    GEMINI_BASE_URL inside your
                                                    environment.
                                                </p>
                                            </div>
                                        ) : msg.parsedCommentary ? (
                                            /* Render Initial Structured Cards */
                                            <div className="space-y-4">
                                                {msg.parsedCommentary.core && (
                                                    <div className="bg-accent-gold/[0.03] border-l-2 border-accent-gold p-4 rounded-r-xl">
                                                        <span className="block text-[9px] font-serif font-bold text-accent-gold uppercase tracking-widest mb-1.5">
                                                            {lang === "am"
                                                                ? "የነገረ መለኮት አስተምህሮ"
                                                                : "Theological Doctrine"}
                                                        </span>
                                                        {renderWithDropCap(
                                                            msg.parsedCommentary
                                                                .core,
                                                        )}
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {msg.parsedCommentary
                                                        .context && (
                                                        <div className="bg-accent-crimson/[0.01] border-l-2 border-accent-crimson/50 p-4 rounded-r-xl">
                                                            <span className="block text-[9px] font-serif font-bold text-accent-crimson uppercase tracking-widest mb-1.5">
                                                                {lang === "am"
                                                                    ? "ሥርዓተ ቅዳሴያዊ ትስስር"
                                                                    : "Liturgical Integration"}
                                                            </span>
                                                            <p className="text-stone-700 text-xs leading-relaxed font-light">
                                                                {
                                                                    msg
                                                                        .parsedCommentary
                                                                        .context
                                                                }
                                                            </p>
                                                        </div>
                                                    )}

                                                    {msg.parsedCommentary
                                                        .symbolism && (
                                                        <div className="bg-accent-blue/[0.01] border-l-2 border-accent-blue/50 p-4 rounded-r-xl">
                                                            <span className="block text-[9px] font-serif font-bold text-accent-blue uppercase tracking-widest mb-1.5">
                                                                {lang === "am"
                                                                    ? "ምስጢራተ ቤተ ክርስቲያንና ምልክቶች"
                                                                    : "Mystagogy & Symbolism"}
                                                            </span>
                                                            <div className="text-stone-700 text-xs leading-relaxed font-light whitespace-pre-line">
                                                                {
                                                                    msg
                                                                        .parsedCommentary
                                                                        .symbolism
                                                                }
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Card toolbar */}
                                                <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-accent-gold/10">
                                                    <button
                                                        onClick={() =>
                                                            handleCopy(
                                                                msg.content,
                                                            )
                                                        }
                                                        className="flex items-center gap-1 px-2.5 py-1 bg-transparent border border-accent-gold/20 hover:border-accent-gold/45 text-text-ink hover:text-accent-gold text-[10px] font-semibold rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <Clipboard className="h-3 w-3" />
                                                        {lang === "am"
                                                            ? "ቅዳ"
                                                            : "Copy"}
                                                    </button>
                                                    <button
                                                        onClick={handleSave}
                                                        className="flex items-center gap-1 px-2.5 py-1 bg-accent-gold hover:bg-accent-gold/90 text-white text-[10px] font-semibold rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <Bookmark className="h-3 w-3" />
                                                        {lang === "am"
                                                            ? "ማስታወሻ አስቀምጥ"
                                                            : "Save Note"}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Render standard follow-up conversation turns (preserves whitespaces/paragraphs) */
                                            <div className="whitespace-pre-line font-sans text-xs md:text-sm text-stone-750 leading-relaxed font-light">
                                                {msg.content}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Chat follow-up loading spinner */}
                        {loading && messages.length > 0 && (
                            <div className="flex flex-col items-start animate-pulse">
                                <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mb-1 px-1">
                                    {lang === "am"
                                        ? "የኦርቶዶክስ AI"
                                        : "Learn Orthodox AI"}
                                </span>
                                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-xs text-stone-550 italic font-light flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-3 w-3 border border-accent-gold border-t-transparent"></div>
                                    {lang === "am"
                                        ? "መልስ በመጻፍ ላይ..."
                                        : "Formulating answer..."}
                                </div>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input Area (Claude UI replication) */}
                    {messages.length > 0 && (
                        <form onSubmit={handleSend} className="mt-2">
                            <div className="border border-accent-gold/25 focus-within:border-accent-gold/60 focus-within:ring-1 focus-within:ring-accent-gold/20 rounded-xl bg-white p-2.5 transition-all">
                                {/* Textarea */}
                                <textarea
                                    value={inputValue}
                                    onChange={(e) =>
                                        setInputValue(e.target.value)
                                    }
                                    placeholder={
                                        lang === "am"
                                            ? "ስለ ቅዳሴው ክፍል ተጨማሪ ጥያቄ ይጠይቁ..."
                                            : "Ask a follow-up question on this liturgical passage..."
                                    }
                                    rows={2}
                                    disabled={loading}
                                    className="w-full resize-none bg-transparent border-0 outline-none text-xs md:text-sm text-text-ink placeholder-stone-400 focus:ring-0 p-1.5"
                                    onKeyDown={(e) => {
                                        // Send on Enter (unless shift is pressed)
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend(e);
                                        }
                                    }}
                                />

                                {/* Toolbar inside input box */}
                                <div className="flex items-center justify-between pt-1 border-t border-stone-100 mt-1.5">
                                    {/* Left info badge */}
                                    <span className="text-[9px] text-stone-400 font-medium uppercase tracking-wider pl-1.5">
                                        {lang === "am"
                                            ? `መልእክት ለ፦ ${activeModelName}`
                                            : `Typing to: ${activeModelName}`}
                                    </span>

                                    {/* Send Button */}
                                    <button
                                        type="submit"
                                        disabled={!inputValue.trim() || loading}
                                        className="p-1.5 bg-accent-gold disabled:bg-stone-200 text-white disabled:text-stone-400 rounded-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center shadow-sm"
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <p className="text-[8px] text-stone-400 text-center mt-1.5 italic font-light">
                                {lang === "am"
                                    ? "ማብራሪያዎች ስህተት ሊኖራቸው ስለሚችል ከሊቃውንትና ከቅዱሳት መጻሕፍት ጋር ያነጻጽሩ።"
                                    : "Learn Orthodox AI commentary can make mistakes. Please cross-reference with patristic guides."}
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
