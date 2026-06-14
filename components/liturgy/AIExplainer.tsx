"use client";

import { useState, useRef, useEffect } from "react";
import type { LiturgyUnit } from "@/types/liturgy";
import { toast } from "sonner";
import { saveStudyNote } from "@/lib/notes/service";
import {
    Clipboard,
    Bookmark,
    X,
    Send,
    AlertTriangle,
} from "lucide-react";

const CrossIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11 2h2v6h6v2h-6v12h-2V10H5V8h6V2z" />
  </svg>
);

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
        <div className="fixed top-0 right-0 h-screen w-full sm:w-[500px] bg-bg-parchment/95 backdrop-blur-md border-l border-accent-gold/25 shadow-[-10px_0_40px_rgba(44,36,22,0.12)] z-50 p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Inner Content */}
            <div className="flex flex-col flex-grow">
                {/* Header */}
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-accent-gold/15">
                    <div>
                        <span className="flex items-center gap-1.5 ui-label font-bold text-accent-gold text-xs tracking-wider uppercase">
                            <CrossIcon className="h-3.5 w-3.5 text-accent-gold" />
                            {lang === "am" ? "የነገረ መለኮት ማብራሪያ" : "Theological Explainer"}
                        </span>
                        <p className="text-[9px] text-stone-400 mt-0.5 uppercase tracking-wider font-sans">
                            {lang === "am" ? "የኦርቶዶክስ ትምህርት ማብራሪያ" : "Learn Orthodox Commentary Layer"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-text-ink transition-colors p-1.5 bg-stone-100 hover:bg-stone-250/60 rounded-none border border-accent-gold/20 cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Selected verse preview card */}
                <div className="relative bg-bg-alabaster/65 p-4 border border-accent-gold/30 mb-5 shadow-[2px_2px_0_0_rgba(140,128,112,0.15)]">
                    <span className="corner-cross top-[-7px] left-[-5px]">✦</span>
                    <span className="corner-cross top-[-7px] right-[-5px]">✦</span>
                    <span className="corner-cross bottom-[-7px] left-[-5px]">✦</span>
                    <span className="corner-cross bottom-[-7px] right-[-5px]">✦</span>

                    <div className="text-[9px] ui-label font-bold text-accent-rose uppercase tracking-widest mb-1.5">
                        {lang === "am"
                            ? `ተናጋሪ፦ ${ROLE_LABELS_AM[unit.role] || unit.role}`
                            : `Spoken by: ${ROLE_LABELS_EN[unit.role] || unit.role}`}
                    </div>
                    {unit.textGez && (
                        <p
                            className="text-lg text-accent-indigo font-serif font-normal Ethiopic-font mb-2 leading-relaxed"
                            style={{ fontFamily: "var(--font-noto-serif-ethiopic), serif" }}
                        >
                            {unit.textGez}
                        </p>
                    )}
                    {unit.textAm && (
                        <p
                            className="text-xs text-stone-750 font-medium Ethiopic-font mb-2 leading-relaxed"
                            style={{ fontFamily: "var(--font-noto-serif-ethiopic), serif" }}
                        >
                            {unit.textAm}
                        </p>
                    )}
                    <p className="text-stone-600 text-xs italic font-light leading-relaxed font-serif">
                        &ldquo;{unit.textEn}&rdquo;
                    </p>
                </div>

                {/* Model/Provider configuration dropdowns (visible if not loaded or during reset) */}
                {messages.length === 0 && !loading && (
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        <div>
                            <label className="block text-[9px] ui-label font-bold text-stone-500 uppercase tracking-widest mb-1">
                                {lang === "am" ? "አቅራቢ" : "Provider"}
                            </label>
                            <select
                                value={provider}
                                onChange={(e) => {
                                    const p = e.target.value;
                                    setProvider(p);
                                    const found = PROVIDERS.find((prov) => prov.id === p);
                                    if (found) setModel(found.models[0]);
                                }}
                                className="w-full bg-bg-parchment border border-accent-gold/25 text-text-ink rounded-none px-2.5 py-1.5 text-xs focus:border-accent-gold outline-none"
                            >
                                {PROVIDERS.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[9px] ui-label font-bold text-stone-500 uppercase tracking-widest mb-1">
                                {lang === "am" ? "ሞዴል" : "Model"}
                            </label>
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full bg-bg-parchment border border-accent-gold/25 text-text-ink rounded-none px-2.5 py-1.5 text-xs focus:border-accent-gold outline-none"
                            >
                                {PROVIDERS.find((p) => p.id === provider)?.models.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Active model badge if chatting */}
                {messages.length > 0 && (
                    <div className="px-3 py-2 border border-accent-gold/15 bg-bg-alabaster/40 text-[9px] ui-label text-stone-600 mb-4 flex items-center justify-between">
                        <span>
                            {lang === "am" ? "አገልግሎት ላይ ያለ ሞዴል፦" : "Active Model:"}{" "}
                            <strong>{activeModelName}</strong>
                        </span>
                        <button
                            onClick={() => {
                                setMessages([]);
                                setInputValue("");
                            }}
                            className="text-accent-rose hover:underline font-bold tracking-wider uppercase cursor-pointer"
                        >
                            {lang === "am" ? "ቻቱን አዲስ ጀምር" : "Reset Chat"}
                        </button>
                    </div>
                )}

                {/* Trigger Initial Commentary */}
                {messages.length === 0 && (
                    <button
                        onClick={explain}
                        disabled={loading}
                        className="w-full py-3 px-4 bg-accent-gold hover:bg-accent-gold/90 text-white text-[10px] ui-label font-bold tracking-wider uppercase transition-all disabled:opacity-50 cursor-pointer shadow-none"
                    >
                        {loading
                            ? (lang === "am" ? "የነገረ መለኮት ማብራሪያውን በመፈለግ ላይ..." : "Consulting theological library...")
                            : (lang === "am" ? "ማብራሪያ ጠይቅ" : "Consult Commentary")}
                    </button>
                )}

                {/* Messages Space */}
                <div className="flex-grow overflow-y-auto pr-1 space-y-4 mb-4 mt-2 scrollbar-none max-h-[60vh]">
                    {messages.length === 0 && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-center py-10">
                            <CrossIcon className="h-8 w-8 text-accent-gold/25 mb-3" />
                            <p className="text-[11px] text-stone-550 font-light font-serif max-w-xs leading-relaxed">
                                {lang === "am"
                                    ? 'ስለ ጥቅሱ ዝርዝር ማብራሪያ ለማግኘት "ማብራሪያ ጠይቅ" የሚለውን ይጫኑ።'
                                    : 'Click "Consult Commentary" to analyze the selected verse and open patristic reflections.'}
                            </p>
                        </div>
                    )}

                    {loading && messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center py-10">
                            <div className="animate-spin rounded-full h-7 w-7 border-2 border-accent-gold border-t-transparent mb-3"></div>
                            <p className="text-[10px] text-accent-gold ui-label font-bold tracking-wider uppercase">
                                {lang === "am" ? "ማብራሪያ በመጻፍ ላይ..." : "Formulating commentary..."}
                            </p>
                        </div>
                    )}

                    {messages.map((msg, index) => {
                        const isUser = msg.role === "user";
                        return (
                            <div key={index} className={`flex flex-col ${isUser ? "items-end" : "items-start"} animate-in fade-in duration-300`}>
                                <span className="text-[8px] ui-label font-bold text-stone-400 uppercase tracking-widest mb-1 px-1">
                                    {isUser ? (lang === "am" ? "እርስዎ" : "You") : (lang === "am" ? "AI ማብራሪያ" : "AI Commentary")}
                                </span>
                                <div className={`w-full p-4 border border-accent-gold/15 bg-bg-alabaster/40 ${isUser ? "border-accent-gold/25" : ""}`}>
                                    {msg.isError ? (
                                        <div className="text-accent-rose text-xs space-y-2">
                                            <div className="flex items-center gap-1 font-bold"><AlertTriangle className="w-3.5 h-3.5" /> ERROR</div>
                                            <p>{msg.content}</p>
                                            <pre className="text-[9px] font-mono bg-stone-900 text-stone-200 p-2 overflow-x-auto">{msg.errorDetails}</pre>
                                        </div>
                                    ) : msg.parsedCommentary ? (
                                        <div className="space-y-4">
                                            {msg.parsedCommentary.core && (
                                                <div className="border-l-2 border-accent-gold pl-3 py-1">
                                                    <span className="block text-[8px] ui-label font-bold text-accent-gold uppercase tracking-widest mb-1">
                                                        {lang === "am" ? "የነገረ መለኮት አስተምህሮ" : "Theological Doctrine"}
                                                    </span>
                                                    {renderWithDropCap(msg.parsedCommentary.core)}
                                                </div>
                                            )}
                                            {msg.parsedCommentary.context && (
                                                <div className="border-l-2 border-accent-rose pl-3 py-1">
                                                    <span className="block text-[8px] ui-label font-bold text-accent-rose uppercase tracking-widest mb-1">
                                                        {lang === "am" ? "ሥርዓተ ቅዳሴያዊ ትስስር" : "Liturgical Integration"}
                                                    </span>
                                                    <p className="text-stone-700 text-xs leading-relaxed font-light font-serif">
                                                        {msg.parsedCommentary.context}
                                                    </p>
                                                </div>
                                            )}
                                            {msg.parsedCommentary.symbolism && (
                                                <div className="border-l-2 border-accent-indigo pl-3 py-1">
                                                    <span className="block text-[8px] ui-label font-bold text-accent-indigo uppercase tracking-widest mb-1">
                                                        {lang === "am" ? "ምስጢራትና ምልክቶች" : "Mystagogy & Symbolism"}
                                                    </span>
                                                    <div className="text-stone-700 text-xs leading-relaxed font-light font-serif whitespace-pre-line">
                                                        {msg.parsedCommentary.symbolism}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex gap-2 justify-end pt-2 border-t border-accent-gold/10">
                                                <button
                                                    onClick={() => handleCopy(msg.content)}
                                                    className="flex items-center gap-1 px-2 py-1 border border-accent-gold/25 hover:border-accent-gold text-text-ink hover:text-accent-gold text-[9px] ui-label font-bold uppercase transition-colors cursor-pointer"
                                                >
                                                    <Clipboard className="h-3 w-3" />
                                                    {lang === "am" ? "ቅዳ" : "Copy"}
                                                </button>
                                                <button
                                                    onClick={handleSave}
                                                    className="flex items-center gap-1 px-2 py-1 bg-accent-gold hover:bg-accent-gold/90 text-white text-[9px] ui-label font-bold uppercase transition-colors cursor-pointer"
                                                >
                                                    <Bookmark className="h-3 w-3" />
                                                    {lang === "am" ? "አስቀምጥ" : "Save"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="whitespace-pre-line font-serif text-xs leading-relaxed text-stone-700 font-light">
                                            {msg.content}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {loading && messages.length > 0 && (
                        <div className="flex flex-col items-start animate-pulse">
                            <span className="text-[8px] ui-label font-bold text-stone-400 uppercase tracking-widest mb-1 px-1">
                                {lang === "am" ? "የኦርቶዶክስ AI" : "Learn Orthodox AI"}
                            </span>
                            <div className="border border-accent-gold/15 bg-bg-alabaster/40 p-3 text-xs text-stone-550 italic font-light flex items-center gap-2">
                                <div className="animate-spin rounded-full h-3 w-3 border border-accent-gold border-t-transparent"></div>
                                <span>...</span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
            </div>

            {/* Chat Input Form */}
            {messages.length > 0 && (
                <form onSubmit={handleSend} className="mt-auto border-t border-accent-gold/15 pt-3">
                    <div className="border border-accent-gold/25 focus-within:border-accent-gold/60 rounded-none bg-white p-2 transition-all">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={lang === "am" ? "ተጨማሪ ጥያቄ ይጠይቁ..." : "Ask a follow-up question..."}
                            rows={2}
                            disabled={loading}
                            className="w-full resize-none bg-transparent border-0 outline-none text-xs text-text-ink placeholder-stone-400 p-1 font-serif"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                        />
                        <div className="flex items-center justify-between pt-1 border-t border-stone-100 mt-1">
                            <span className="text-[8px] ui-label text-stone-400 font-bold uppercase tracking-wider pl-1">
                                {lang === "am" ? `መልእክት ለ፦ ${activeModelName}` : `Target: ${activeModelName}`}
                            </span>
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || loading}
                                className="p-1 bg-accent-gold disabled:bg-stone-200 text-white disabled:text-stone-400 transition-all cursor-pointer flex items-center justify-center"
                            >
                                <Send className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}
