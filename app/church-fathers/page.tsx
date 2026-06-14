'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Search, 
  Globe, 
  Sparkles, 
  Send, 
  MessageSquare, 
  HelpCircle, 
  ChevronRight,
  BookMarked,
  FileText,
  User,
  ArrowRight,
  ExternalLink,
  Loader2,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { getChurchFathers } from '@/lib/lessons/service';
import { ChurchFather } from '@/types/lessons';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const TRANSLATIONS = {
  en: {
    pageTitle: "Church Fathers",
    subtitle: "Patristic Writings & Teachings",
    searchPlaceholder: "Search fathers or eras...",
    loadingFathers: "Loading patristics...",
    selectPrompt: "Select a Church Father to begin exploring their writings and teachings.",
    aiCompanion: "AI Patristic Tutor",
    aiDescription: "Ask about this Father's history, theology, writings, or role in Ecumenical Councils.",
    chatPlaceholder: "Ask about this Father...",
    examplePrompts: "Example Topics",
    liturgyReader: "Liturgy Reader",
    videoLessons: "Video Lessons",
    studySpace: "Study Space",
    backToHome: "Back to Home",
    askButton: "Send",
    errorChat: "Could not retrieve response from AI tutor.",
    openTextBtn: "Open Patristic Text (PDF)",
    categoryApostolic: "Apostolic Fathers",
    categoryEcumenical: "Church Fathers (Ecumenical)",
    askCompanionBtn: "Consult AI Tutor",
    suggestedQuestions: [
      "What were the major theological contributions of this Father?",
      "How did this Father influence EOTC liturgy or christology?",
      "Can you tell me about this Father's writings and life?",
      "What did this Father defend at the Ecumenical Councils?"
    ]
  },
  am: {
    pageTitle: "ቅዱሳን አበው",
    subtitle: "የቤተ ክርስቲያን ሊቃውንትና ትምህርቶቻቸው",
    searchPlaceholder: "የአበውን ስም ወይም ዘመን እዚህ ይፈልጉ...",
    loadingFathers: "ሊቃውንት በመጫን ላይ ናቸው...",
    selectPrompt: "ስለ ሊቃውንቱ ሕይወትና ድርሳናት ለመማር ከጎን አንዱን ይምረጡ።",
    aiCompanion: "የአበው ትምህርት ረዳት (AI)",
    aiDescription: "ስለዚህ አባት ታሪክ፣ ነገረ መለኮት፣ ድርሳናት ወይም በጉባኤያት ስላደረጉት አስተዋጽዖ ይጠይቁ።",
    chatPlaceholder: "ስለዚህ ሊቅ ጥያቄዎን እዚህ ይጻፉ...",
    examplePrompts: "የመወያያ ርዕሶች",
    liturgyReader: "ሥርዓተ ቅዳሴ አንባቢ",
    videoLessons: "ትምህርት ቪዲዮዎች",
    studySpace: "የጥናት ክፍል",
    backToHome: "ወደ መነሻ ገጽ",
    askButton: "ላክ",
    errorChat: "ከAI ረዳት መልስ ማግኘት አልተቻለም።",
    openTextBtn: "የድርሳኑን መጽሐፍ ክፈት (PDF)",
    categoryApostolic: "ሐዋርያውያን አበው",
    categoryEcumenical: "የቤተ ክርስቲያን ሊቃውንት (አበው)",
    askCompanionBtn: "የአበው ረዳት ጠይቅ",
    suggestedQuestions: [
      "የዚህ ቅዱስ አባት ዋና የነገረ መለኮት አስተዋጽዖ ምንድን ነው?",
      "ይህ አባት በኢትዮጵያ ኦርቶዶክስ ቅዳሴ ወይም እምነት ላይ ምን ተጽዕኖ አሳደረ?",
      "ስለዚህ ቅዱስ አባት ታሪክና ድርሳናት ማብራሪያ ስጠኝ?",
      "ይህ አባት በዓለም አቀፍ ጉባኤያት (ኒቅያ፣ ቆስጠንጢኖስ፣ ኤፌሶን) ምን ተከራከረ?"
    ]
  }
};

export default function ChurchFathersPage() {
  const [lang, setLang] = useState<'en' | 'am'>('en');
  const t = TRANSLATIONS[lang];

  const [fathers, setFathers] = useState<ChurchFather[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFather, setSelectedFather] = useState<ChurchFather | null>(null);

  // AI Chat state
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});
  const [inputText, setInputText] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize lang from URL query param
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryLang = params.get('lang');
      if (queryLang === 'am' || queryLang === 'en') {
        setLang(queryLang);
      }
    }
  }, []);

  // Fetch church fathers from DB
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getChurchFathers();
      setFathers(data);
      if (data.length > 0) {
        setSelectedFather(data[0]);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (showAIChat) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, selectedFather, showAIChat]);

  // Toggle language
  const handleLangToggle = () => {
    const nextLang = lang === 'en' ? 'am' : 'en';
    setLang(nextLang);
    toast.success(nextLang === 'am' ? 'ቋንቋ ወደ አማርኛ ተቀይሯል' : 'Language switched to English', {
      className: 'sonner-toast-custom'
    });
  };

  // Filter fathers based on search query
  const filteredFathers = useMemo(() => {
    if (!searchQuery.trim()) return fathers;
    const q = searchQuery.toLowerCase();
    return fathers.filter(
      f => 
        f.name.toLowerCase().includes(q) || 
        f.category.toLowerCase().includes(q)
    );
  }, [fathers, searchQuery]);

  // Group filtered fathers by category
  const groupedFathers = useMemo(() => {
    const groups: Record<string, ChurchFather[]> = {};
    filteredFathers.forEach(f => {
      if (!groups[f.category]) {
        groups[f.category] = [];
      }
      groups[f.category].push(f);
    });
    return groups;
  }, [filteredFathers]);

  const currentMessages = useMemo(() => {
    if (!selectedFather) return [];
    return chatHistory[selectedFather.id] || [];
  }, [chatHistory, selectedFather]);

  // Send message to AI
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !selectedFather || sendingChat) return;

    if (!textToSend) {
      setInputText('');
    }

    const fatherId = selectedFather.id;
    const newUserMessage: ChatMessage = { role: 'user', content: text };
    
    // Add user message locally
    const updatedHistory = [...(chatHistory[fatherId] || []), newUserMessage];
    setChatHistory(prev => ({
      ...prev,
      [fatherId]: updatedHistory
    }));

    setSendingChat(true);

    try {
      const apiMessages = updatedHistory.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/lessons/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonTitle: selectedFather.name,
          lessonText: `This discussion is about ${selectedFather.name}, who is categorized under "${selectedFather.category}". Their writings are accessible at: ${selectedFather.pdf_link}.`,
          messages: apiMessages
        })
      });

      if (!res.ok) {
        throw new Error('Chat API returned error');
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.text || 'No response returned.'
      };

      setChatHistory(prev => ({
        ...prev,
        [fatherId]: [...updatedHistory, assistantMessage]
      }));
    } catch (err) {
      console.error(err);
      toast.error(t.errorChat, {
        className: 'sonner-toast-custom'
      });
      setChatHistory(prev => ({
        ...prev,
        [fatherId]: chatHistory[fatherId] || []
      }));
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-parchment text-text-ink flex flex-col justify-between selection:bg-accent-gold/20 relative overflow-hidden font-sans">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(197,146,70,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(197,146,70,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      
      {/* Decorative Frame */}
      <div className="absolute inset-4 border border-accent-gold/10 pointer-events-none z-0 rounded-none" />

      {/* Symmetrical Sticky Header */}
      <header className="border-b border-accent-gold/25 bg-bg-parchment/95 backdrop-blur-md sticky top-0 z-30 shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          
          {/* Logo / Home Link (Left 1/4) */}
          <Link href={`/?lang=${lang}`} className="flex items-center space-x-3 group w-1/4">
            <img
              src="/glasswindow.png"
              alt="Logo"
              className="h-8 w-auto object-contain filter drop-shadow-[0_2px_4px_rgba(197,146,70,0.15)] group-hover:scale-105 transition-transform duration-300"
            />
            <div className="hidden sm:block">
              <span className="block text-xs font-serif font-extrabold tracking-widest text-text-ink group-hover:text-accent-gold transition-colors">
                {lang === "am" ? "ኦርቶዶክስን ይማሩ" : "LEARN ORTHODOX"}
              </span>
              <span className="block text-[7px] text-stone-500 tracking-wider uppercase font-medium mt-0.5">
                EOTC Portal
              </span>
            </div>
          </Link>

          {/* Centered Page Name (Center) */}
          <div className="text-center flex-grow flex flex-col justify-center items-center">
            <span className="block font-serif font-extrabold text-[11px] sm:text-xs text-text-ink tracking-wider uppercase">
              {lang === "am" ? "ቅዱሳን አበው" : "Church Fathers"}
            </span>
            <span className="block text-[8px] text-accent-crimson tracking-widest uppercase font-bold mt-0.5">
              {lang === "am" ? "የቤተ ክርስቲያን ሊቃውንትና አባቶች" : "Patristic Catalog Ledger"}
            </span>
          </div>

          {/* Nav Actions / Language Toggle (Right 1/4) */}
          <div className="flex items-center justify-end gap-2 sm:gap-4 select-none w-1/4">
            <Link
              href={`/liturgy/qiddase-dioscoros?lang=${lang}`}
              className="text-[10px] font-serif uppercase tracking-wider text-accent-crimson hover:text-accent-crimson/80 transition-colors font-bold hidden md:inline-block"
            >
              {t.liturgyReader}
            </Link>
            <div className="w-[1px] h-3 bg-accent-gold/25 hidden md:block" />
            
            <Link
              href={`/videos?lang=${lang}`}
              className="text-[10px] font-serif uppercase tracking-wider text-accent-blue hover:text-accent-blue/80 transition-colors font-bold hidden md:inline-block"
            >
              {t.videoLessons}
            </Link>
            <div className="w-[1px] h-3 bg-accent-gold/25 hidden md:block" />

            <Link
              href={`/study-space?lang=${lang}`}
              className="text-[10px] font-serif uppercase tracking-wider text-text-ink hover:text-accent-gold transition-colors font-bold hidden md:inline-block"
            >
              {t.studySpace}
            </Link>
            <div className="w-[1px] h-3 bg-accent-gold/25 hidden md:block" />

            <button
              onClick={handleLangToggle}
              className="px-2 py-0.5 rounded-none border border-accent-gold/25 text-[9px] font-bold text-text-ink uppercase tracking-wider hover:bg-bg-alabaster transition-colors cursor-pointer"
            >
              {lang === "en" ? "አማርኛ" : "EN"}
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-grow relative z-10 flex flex-col">
        {loading ? (
          <div className="flex-grow flex flex-col items-center justify-center py-24">
            <Loader2 className="h-10 w-10 text-accent-gold animate-spin mb-4" />
            <p className="text-stone-500 font-serif text-sm italic">{t.loadingFathers}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-grow">
            
            {/* Column 1: Navigation Sidebar (Span 4) */}
            <aside className="lg:col-span-4 flex flex-col space-y-4">
              
              {/* Search Box */}
              <div className="relative border border-accent-gold/25 bg-bg-parchment p-3 rounded-none soft-shadow">
                <Search className="absolute left-6 top-6 h-4 w-4 text-accent-gold/60" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-bg-alabaster/40 border border-accent-gold/20 py-2.5 pl-10 pr-4 text-xs font-serif text-text-ink focus:outline-none focus:border-accent-gold placeholder-stone-400 rounded-none"
                />
              </div>

              {/* Fathers List by Category */}
              <div className="border border-accent-gold/25 bg-bg-alabaster/40 flex-grow max-h-[70vh] lg:max-h-[64vh] overflow-y-auto rounded-none soft-shadow relative">
                <span className="corner-cross top-[-7px] left-[-5px]">✦</span>
                <span className="corner-cross top-[-7px] right-[-5px]">✦</span>
                <span className="corner-cross bottom-[-7px] left-[-5px]">✦</span>
                <span className="corner-cross bottom-[-7px] right-[-5px]">✦</span>
                
                <div className="p-2 space-y-4">
                  {Object.entries(groupedFathers).map(([category, list]) => (
                    <div key={category} className="space-y-1">
                      <span className="block text-[8px] ui-label font-bold text-accent-crimson tracking-widest px-2 py-1 bg-bg-parchment/60 border border-accent-gold/15 mb-2">
                        {category === 'Apostolic Fathers' ? t.categoryApostolic : t.categoryEcumenical}
                      </span>
                      <div className="space-y-0.5">
                        {list.map((father) => {
                          const active = selectedFather?.id === father.id;
                          return (
                            <button
                              key={father.id}
                              onClick={() => setSelectedFather(father)}
                              className={`w-full text-left p-2.5 transition-all duration-200 cursor-pointer flex items-center justify-between rounded-none text-xs font-serif ${
                                active 
                                  ? 'bg-bg-alabaster border-l-3 border-accent-gold font-bold text-accent-indigo' 
                                  : 'hover:bg-bg-alabaster/60'
                              }`}
                            >
                              <span className="truncate pr-2">{father.name}</span>
                              <ChevronRight className={`h-3.5 w-3.5 text-accent-gold/40 shrink-0 ${active ? 'text-accent-gold translate-x-0.5' : ''}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {filteredFathers.length === 0 && (
                    <div className="p-8 text-center text-stone-400 font-serif text-xs italic">
                      No Church Fathers found.
                    </div>
                  )}
                </div>
              </div>

            </aside>

            {/* Column 2: Selected Father Card (Span 8) */}
            <section className="lg:col-span-8 flex flex-col">
              {selectedFather ? (
                <div className="bg-bg-parchment border border-accent-gold/25 p-6 md:p-8 flex flex-col flex-grow relative rounded-none soft-shadow overflow-hidden min-h-[50vh] lg:max-h-[72vh]">
                  <span className="corner-cross top-[-7px] left-[-5px]">✦</span>
                  <span className="corner-cross top-[-7px] right-[-5px]">✦</span>
                  <span className="corner-cross bottom-[-7px] left-[-5px]">✦</span>
                  <span className="corner-cross bottom-[-7px] right-[-5px]">✦</span>
                  
                  {/* Decorative internal frame */}
                  <div className="absolute inset-2 border border-accent-gold/10 pointer-events-none rounded-none" />

                  {/* Header */}
                  <div className="border-b border-accent-gold/20 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
                    <div>
                      <span className="ui-label text-[9px] font-bold text-accent-crimson tracking-widest block mb-1">
                        {selectedFather.category === 'Apostolic Fathers' ? t.categoryApostolic : t.categoryEcumenical}
                      </span>
                      <h2 className="font-serif font-extrabold text-base md:text-lg text-accent-indigo leading-tight">
                        {selectedFather.name}
                      </h2>
                    </div>

                    <button
                      onClick={() => setShowAIChat(true)}
                      className="flex items-center gap-2 px-3.5 py-1.5 border border-accent-gold/25 hover:border-accent-gold bg-bg-alabaster/40 hover:bg-bg-parchment text-[9px] ui-label font-bold uppercase transition-all duration-300 cursor-pointer rounded-none soft-shadow shrink-0 shadow-[1px_1px_0_0_rgba(140,128,112,0.15)]"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-accent-gold" />
                      <span>{t.askCompanionBtn}</span>
                    </button>
                  </div>

                  {/* Description / Information */}
                  <div className="flex-grow overflow-y-auto pr-2 relative z-10 font-serif text-xs md:text-sm leading-relaxed text-stone-700 space-y-4 max-h-[45vh]">
                    <div className="p-4 bg-bg-alabaster/40 border border-accent-gold/15 rounded-none relative">
                      <p className="italic text-text-ink leading-relaxed">
                        {lang === 'am' 
                          ? `ቅዱስ ${selectedFather.name} በኦርቶዶክስ ተዋሕዶ ነገረ መለኮት፣ ታሪክና ትውፊት ውስጥ ትልቅ ቦታ ካላቸው ቅዱሳን አባቶች አንዱ ነው። የእነርሱን ቅዱሳት መጻሕፍትና ትምህርቶች ማንበብ በመንፈሳዊ ጉዞና በእምነት ዕውቀት ላይ ከፍተኛ እገዛ ያደርግዎታል።`
                          : `St. ${selectedFather.name} is a vital pillar in EOTC patristic theology and historical tradition. Exploring their writings fosters a deeper understanding of the early Church council formulations and Christology.`
                        }
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="block text-[10px] ui-label font-bold text-accent-crimson tracking-wider mb-2">
                        {lang === 'am' ? 'የድርሳን ሰነድ' : 'DOCUMENT SOURCE'}
                      </span>
                      <p className="text-xs text-stone-550 break-all leading-normal font-mono bg-bg-alabaster/25 p-2 border border-accent-gold/10">
                        {selectedFather.pdf_link}
                      </p>
                    </div>
                  </div>

                  {/* Action Button to Open PDF */}
                  <div className="pt-6 border-t border-accent-gold/20 mt-4 relative z-20">
                    <a
                      href={selectedFather.pdf_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-accent-gold hover:bg-accent-gold/90 text-white text-[10px] ui-label font-bold tracking-wider uppercase transition-all shadow-none flex items-center justify-center gap-2 rounded-none cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>{t.openTextBtn}</span>
                    </a>
                  </div>

                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center border border-accent-gold/25 bg-bg-alabaster/40 p-8 rounded-none soft-shadow">
                  <BookOpen className="h-12 w-12 text-accent-gold/30 mb-3" />
                  <p className="text-stone-550 font-serif text-xs italic text-center">
                    {t.selectPrompt}
                  </p>
                </div>
              )}
            </section>

          </div>
        )}
      </main>

      {/* Slide-out AI Patristic Chat Companion (Drawer UI) */}
      {showAIChat && selectedFather && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div 
            className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowAIChat(false)}
          />
          
          {/* Drawer Wrapper */}
          <div className="relative w-full sm:w-[500px] h-full bg-bg-parchment border-l border-accent-gold/25 shadow-[-10px_0_40px_rgba(44,36,22,0.12)] p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300 z-10">
            <span className="corner-cross top-[-7px] left-[-5px]">✦</span>
            <span className="corner-cross bottom-[-7px] left-[-5px]">✦</span>

            <div className="flex flex-col flex-grow">
              {/* AI Chat Header */}
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-accent-gold/15">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-accent-gold/15 p-1.5 rounded-none border border-accent-gold/20 shadow-none">
                    <Sparkles className="h-4 w-4 text-accent-gold animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-serif font-black text-text-ink uppercase tracking-wider">
                      {t.aiCompanion}
                    </h3>
                    <p className="text-[9px] text-stone-500 mt-0.5 leading-tight">
                      {t.aiDescription}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIChat(false)}
                  className="text-stone-400 hover:text-text-ink transition-colors p-1.5 bg-stone-100 hover:bg-stone-250/60 rounded-none border border-accent-gold/20 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Chat Message Workspace */}
              <div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-1 max-h-[70vh]">
                
                {/* Greeting Bubble */}
                <div className="flex items-start gap-2.5 max-w-[85%]">
                  <div className="w-5 h-5 rounded-none border border-accent-gold/20 bg-bg-parchment flex items-center justify-center text-[10px] text-accent-gold font-bold font-serif shrink-0 shadow-none">
                    ✦
                  </div>
                  <div className="bg-bg-parchment border border-accent-gold/15 p-3 text-xs leading-relaxed text-text-ink font-serif rounded-none soft-shadow">
                    {lang === 'am' 
                      ? `እንኳን ደህና መጡ! ስለ ቅዱስ "${selectedFather.name}" ድርሳናት፣ ሕይወትና የሃይማኖት ትምህርት ምን ማወቅ ይፈልጋሉ? ከዚህ በታች መጠየቅ ይችላሉ።`
                      : `Welcome! What would you like to learn about St. "${selectedFather.name}"? Ask any patristic, historical, or theological questions.`
                    }
                  </div>
                </div>

                {/* Messages Map */}
                {currentMessages.map((msg, i) => {
                  const isUser = msg.role === 'user';
                  
                  return (
                    <div 
                      key={i} 
                      className={`flex items-start gap-2.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <div className={`w-5 h-5 rounded-none border flex items-center justify-center text-[8px] font-serif shrink-0 shadow-none ${
                        isUser 
                          ? 'border-accent-indigo/20 bg-accent-indigo/5 text-accent-indigo' 
                          : 'border-accent-gold/20 bg-bg-parchment text-accent-gold'
                      }`}>
                        {isUser ? <User className="h-3 w-3" /> : '✦'}
                      </div>
                      <div className={`p-3 text-xs leading-relaxed text-text-ink font-serif rounded-none soft-shadow ${
                        isUser 
                          ? 'bg-accent-indigo/5 border border-accent-indigo/10' 
                          : 'bg-bg-parchment border border-accent-gold/15'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}

                {/* Loading Spinner */}
                {sendingChat && (
                  <div className="flex items-start gap-2.5 max-w-[85%]">
                    <div className="w-5 h-5 rounded-none border border-accent-gold/20 bg-bg-parchment flex items-center justify-center shrink-0">
                      <Loader2 className="h-3 w-3 text-accent-gold animate-spin" />
                    </div>
                    <div className="bg-bg-parchment border border-accent-gold/15 p-3 text-xs text-stone-400 italic font-serif rounded-none">
                      Exploring patristic texts...
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Example Quick Actions */}
              {currentMessages.length === 0 && (
                <div className="p-4 bg-bg-parchment/40 border border-accent-gold/15 mb-4 rounded-none">
                  <span className="block text-[9px] ui-label font-bold text-accent-crimson tracking-widest mb-2">
                    {t.examplePrompts}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {t.suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        disabled={sendingChat}
                        className="w-full text-left p-2 border border-accent-gold/10 hover:border-accent-gold/30 bg-bg-parchment hover:bg-bg-alabaster/40 text-[10px] font-serif text-text-ink transition-colors cursor-pointer flex items-center justify-between rounded-none group"
                      >
                        <span className="truncate">{q}</span>
                        <ArrowRight className="h-3 w-3 text-accent-gold/45 group-hover:text-accent-gold group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="pt-3 border-t border-accent-gold/20 flex gap-2">
              <input
                type="text"
                placeholder={t.chatPlaceholder}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                disabled={sendingChat}
                className="flex-grow bg-bg-alabaster/45 border border-accent-gold/20 py-2.5 px-3 text-xs font-serif text-text-ink focus:outline-none focus:border-accent-gold placeholder-stone-400 rounded-none disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={sendingChat || !inputText.trim()}
                className="px-4 py-2.5 bg-accent-gold hover:bg-accent-gold/90 text-white text-[10px] ui-label font-bold tracking-wider uppercase transition-all shadow-none shrink-0 rounded-none flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{t.askButton}</span>
                <Send className="h-3 w-3" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-accent-gold/15 bg-bg-alabaster/20 py-5 text-center relative z-10">
        <p className="text-[9px] ui-label font-bold text-stone-500 tracking-wider">
          LEARN ORTHODOX • {new Date().getFullYear()} • ኃይማኖት ዶግማ ቀኖና
        </p>
      </footer>
    </div>
  );
}
