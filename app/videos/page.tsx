'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Play, 
  Trash2, 
  Clock, 
  ArrowLeft, 
  Search, 
  Globe, 
  Sparkles, 
  Plus,
  Loader2,
  Bookmark,
  Share2,
  ListVideo,
  User,
  FileText,
  BookMarked,
  ChevronRight,
  Edit3,
  Feather,
  Undo2
} from 'lucide-react';
import { toast } from 'sonner';
import { getVideoLessons, getVideoNotes, saveVideoNote, deleteVideoNote } from '@/lib/video/service';
import { VideoLesson, VideoNote } from '@/types/video';

const TRANSLATIONS = {
  en: {
    title: "Pillars of Faith",
    subtitle: "Video Lessons & Studies",
    selectPrompt: "Select a video lesson to begin your theological study.",
    noNotes: "No notes saved for this lesson yet. Write your first reflection below!",
    saveNote: "Save Reflection",
    addNotePlaceholder: "Write your study notes, reflections, or questions here...",
    captureTime: "Link to current playback time",
    timestampLabel: "At",
    deleteConfirm: "Delete this note?",
    noteTitle: "Reflection",
    teacherLabel: "Teacher: ",
    tagLabel: "Topic: ",
    allTopics: "All Topics",
    notesSectionTitle: "Study Notes & Bookmarks",
    backToHome: "Back to Home",
    studySpace: "Study Space",
    liturgyReader: "Liturgy Reader",
    videoLessons: "Video Lessons",
    toastNoteSaved: "Reflection saved successfully!",
    toastNoteDeleted: "Reflection deleted!",
    unnamedNote: "Reflection",
    loadingLessons: "Loading video lessons...",
    searchPlaceholder: "Search lessons or teachers...",
    activeLabel: "PLAYING",
    noteBadgeLabel: "Note",
    notesCountSuffix: "notes",
    shareVideo: "Share Lesson",
    upNext: "Up Next / More Lessons",
    backToAll: "Back to All Lessons",
    viewsAndDate: "Theological Study Lesson"
  },
  am: {
    title: "ዓምደ ሃይማኖት",
    subtitle: "የትምህርት ቪዲዮዎችና ጥናቶች",
    selectPrompt: "ትምህርቱን ለመጀመር ቪዲዮ ይምረጡ።",
    noNotes: "ለዚህ ትምህርት የተቀመጠ ማስታወሻ የለም። የመጀመሪያ አስተያየትዎን ከታች ይጻፉ!",
    saveNote: "ማስታወሻውን አስቀምጥ",
    addNotePlaceholder: "የጥናት ማስታወሻዎን፣ ትዝታዎን ወይም ጥያቄዎን እዚህ ይጻፉ...",
    captureTime: "ከቪዲዮው ሰዓት ጋር አገናኝ",
    timestampLabel: "በ",
    deleteConfirm: "ይህን ማስታወሻ መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት?",
    noteTitle: "ማስታወሻ",
    teacherLabel: "አስተማሪ: ",
    tagLabel: "ርዕስ: ",
    allTopics: "ሁሉም ርዕሶች",
    notesSectionTitle: "የጥናት ማስታወሻዎችና ዕልባቶች",
    backToHome: "ወደ መነሻ ገጽ",
    studySpace: "የጥናት ክፍል",
    liturgyReader: "ሥርዓተ ቅዳሴ አንባቢ",
    videoLessons: "ትምህርት ቪዲዮዎች",
    toastNoteSaved: "ማስታወሻው በትክክል ተቀምጧል!",
    toastNoteDeleted: "ማስታወሻው ተሰርዟል!",
    unnamedNote: "አስተያየት",
    loadingLessons: "የቪዲዮ ትምህርቶች በመጫን ላይ ናቸው...",
    searchPlaceholder: "ትምህርቶችን ወይም መምህራንን ይፈልጉ...",
    activeLabel: "ገቢር",
    noteBadgeLabel: "ማስታወሻ",
    notesCountSuffix: "ማስታወሻዎች",
    shareVideo: "ትምህርቱን አጋራ",
    upNext: "ቀጣይ / ተጨማሪ ትምህርቶች",
    backToAll: "ወደ ሁሉም ትምህርቶች ተመለስ",
    viewsAndDate: "የነገረ መለኮት ትምህርት"
  }
};

// Helper to format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Convert numbers to Ge'ez numerals for elegant traditional numbering
function toGeezNumeral(num: number): string {
  const geezUnits = ["", "፩", "፪", "፫", "፬", "፭", "፮", "፯", "፰", "፱"];
  const geezTens = ["", "፲", "፳", "፴", "፵", "፶", "፷", "፸", "፹", "፺"];
  
  if (num <= 0) return "";
  if (num < 10) return geezUnits[num];
  
  const tens = Math.floor(num / 10);
  const units = num % 10;
  return geezTens[tens] + geezUnits[units];
}

// Custom Checkbox Component
interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

function CustomCheckbox({ checked, onChange, label }: CustomCheckboxProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center space-x-3 group cursor-pointer select-none outline-none focus:outline-none"
    >
      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 ${
        checked 
          ? 'bg-accent-gold border-accent-gold text-white shadow-[0_0_8px_rgba(197,146,70,0.3)]' 
          : 'bg-white border-accent-gold/25 group-hover:border-accent-gold/60'
      }`}>
        <svg 
          className={`w-3.5 h-3.5 stroke-current transition-all duration-300 transform ${
            checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`} 
          viewBox="0 0 24 24" 
          fill="none" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <span className="text-xs text-stone-600 font-medium group-hover:text-stone-850 transition-colors">
        {label}
      </span>
    </button>
  );
}

export default function VideoLessonsPage() {
  const [lang, setLang] = useState<'en' | 'am'>('en');
  const t = TRANSLATIONS[lang];

  const [lessons, setLessons] = useState<VideoLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  
  // Selected video
  const [activeVideo, setActiveVideo] = useState<VideoLesson | null>(null);
  const [player, setPlayer] = useState<any>(null);
  
  // Notes state
  const [notes, setNotes] = useState<VideoNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [linkToTime, setLinkToTime] = useState(true);
  const [savingNote, setSavingNote] = useState(false);

  // Tab state in Watch Mode
  const [activeTab, setActiveTab] = useState<'journal' | 'details' | 'playlist'>('journal');
  
  // Note category state
  const [noteCategory, setNoteCategory] = useState<string>('Reflection');
  
  // Edit note state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState<string>('');

  // Load URL query params for language
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryLang = params.get('lang');
      if (queryLang === 'am' || queryLang === 'en') {
        setLang(queryLang);
      }
    }
  }, []);

  // Fetch all video lessons
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getVideoLessons();
      setLessons(data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Fetch notes when active video changes
  useEffect(() => {
    if (!activeVideo) return;
    
    setNotes([]);
    setPlayer(null); // Reset player state for new video
    
    const videoId = activeVideo.id;
    async function loadNotes() {
      const videoNotes = await getVideoNotes(videoId);
      setNotes(videoNotes);
    }
    loadNotes();
  }, [activeVideo]);

  // Load YouTube Iframe API and setup player when video is loaded
  useEffect(() => {
    if (!activeVideo || typeof window === 'undefined') return;

    // Load iframe script if not present
    if (!document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    let ytPlayer: any = null;
    
    // Poll until YT is ready, then create player
    const checkYT = setInterval(() => {
      if ((window as any).YT && (window as any).YT.Player) {
        clearInterval(checkYT);
        
        try {
          ytPlayer = new (window as any).YT.Player('youtube-player-iframe', {
            events: {
              onReady: (event: any) => {
                setPlayer(event.target);
              }
            }
          });
        } catch (e) {
          // Defer until frame is ready in DOM
        }
      }
    }, 200);

    return () => {
      clearInterval(checkYT);
    };
  }, [activeVideo]);

  const handleLangToggle = () => {
    const nextLang = lang === 'en' ? 'am' : 'en';
    setLang(nextLang);
    toast(nextLang === 'am' ? 'ቋንቋ ወደ አማርኛ ተቀይሯል' : 'Language switched to English', {
      className: 'sonner-toast-custom',
      duration: 3000
    });
  };

  // Get unique subjects for chips
  const subjects = useMemo(() => {
    const list = new Set<string>();
    lessons.forEach(l => {
      if (l.subject) list.add(l.subject);
    });
    return Array.from(list);
  }, [lessons]);

  // Filter lessons based on search query and category chips
  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => {
      const matchesSearch = 
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (lesson.teacher_name && lesson.teacher_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        lesson.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSubject = selectedSubject === 'all' || lesson.subject === selectedSubject;
      
      return matchesSearch && matchesSubject;
    });
  }, [lessons, searchQuery, selectedSubject]);

  // Next up lessons (recommendations in active mode)
  const upNextLessons = useMemo(() => {
    if (!activeVideo) return [];
    const sameSubject = lessons.filter(l => l.id !== activeVideo.id && l.subject === activeVideo.subject);
    const otherSubjects = lessons.filter(l => l.id !== activeVideo.id && l.subject !== activeVideo.subject);
    return [...sameSubject, ...otherSubjects];
  }, [lessons, activeVideo]);

  const handleSelectVideo = (video: VideoLesson) => {
    setActiveVideo(video);
    setEditingNoteId(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVideo || !newNoteText.trim()) return;

    setSavingNote(true);
    try {
      let timestamp = 0;
      if (linkToTime && player) {
        try {
          timestamp = Math.floor(player.getCurrentTime());
        } catch (err) {
          console.warn("Could not retrieve playback time:", err);
        }
      }

      const noteData = {
        video_id: activeVideo.id,
        title: noteCategory, 
        user_notes: newNoteText.trim(),
        timestamp_seconds: timestamp
      };

      const saved = await saveVideoNote(noteData);
      setNotes(prev => [...prev, saved].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds));
      setNewNoteText('');
      toast.success(t.toastNoteSaved, {
        className: 'sonner-toast-custom-blue'
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to save note.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    const original = notes.find(n => n.id === noteId);
    if (!original || !editingNoteText.trim()) return;
    
    try {
      const updated = await saveVideoNote({
        ...original,
        user_notes: editingNoteText.trim()
      });
      setNotes(prev => prev.map(n => n.id === noteId ? updated : n));
      setEditingNoteId(null);
      setEditingNoteText('');
      toast.success(lang === 'am' ? 'ማስታወሻው በትክክል ተሻሽሏል!' : 'Note updated successfully!', {
        className: 'sonner-toast-custom-blue'
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to update note.');
    }
  };

  const startEditingNote = (note: VideoNote) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.user_notes || '');
  };

  const handleDeleteNote = async (noteId: string) => {
    if (confirm(t.deleteConfirm)) {
      const success = await deleteVideoNote(noteId);
      if (success) {
        setNotes(prev => prev.filter(n => n.id !== noteId));
        toast(t.toastNoteDeleted, {
          className: 'sonner-toast-custom'
        });
      }
    }
  };

  const seekToTime = (seconds: number) => {
    if (player) {
      player.seekTo(seconds, true);
    }
  };

  const handleShareVideo = () => {
    if (activeVideo && typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/videos?lang=${lang}&v=${activeVideo.id}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success(lang === 'am' ? 'የቪዲዮው ሊንክ ተገልብጧል!' : 'Video link copied to clipboard!', {
        className: 'sonner-toast-custom-blue'
      });
    }
  };

  return (
    <div className="min-h-screen bg-bg-parchment text-text-ink flex flex-col justify-between selection:bg-accent-gold/20 relative overflow-x-hidden font-sans">
      
      {/* Editorial Parchment Decorative Grid Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(197,146,70,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(197,146,70,0.012)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      
      {/* Light Radial Gold Accents */}
      <div className="absolute top-0 right-1/4 w-[60vw] h-[400px] bg-gradient-to-b from-accent-gold/[0.03] via-accent-crimson/[0.01] to-transparent blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-[40vw] h-[400px] bg-gradient-to-t from-accent-blue/[0.02] to-transparent blur-[120px] pointer-events-none z-0" />

      {/* Header */}
      <header className="border-b border-accent-gold/15 bg-bg-parchment/80 backdrop-blur-md sticky top-0 z-30 shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <Link href={`/?lang=${lang}`} className="flex items-center space-x-3 cursor-pointer group">
            <img src="/glasswindow.png" alt="Learn Orthodox Logo" className="h-8 w-auto object-contain filter drop-shadow-[0_2px_4px_rgba(197,146,70,0.15)] group-hover:scale-105 transition-transform" />
            <div>
              <span className="block font-serif font-extrabold tracking-widest text-text-ink text-xs uppercase group-hover:text-accent-gold transition-colors">LEARN ORTHODOX</span>
              <span className="block text-[7px] text-stone-500 tracking-wider uppercase font-medium mt-0.5">Tewahedo Faith & Heritage</span>
            </div>
          </Link>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link
              href={`/liturgy/qiddase-dioscoros?lang=${lang}`}
              className="text-[10px] font-serif font-bold tracking-wider text-text-ink hover:text-accent-gold transition-colors uppercase"
            >
              {t.liturgyReader}
            </Link>
            <div className="w-[1px] h-3 bg-accent-gold/25" />
            <Link
              href={`/study-space?lang=${lang}`}
              className="text-[10px] font-serif font-bold tracking-wider text-text-ink hover:text-accent-gold transition-colors uppercase"
            >
              {t.studySpace}
            </Link>
            <div className="w-[1px] h-3 bg-accent-gold/25" />
            
            {/* Language Selector */}
            <button 
              onClick={handleLangToggle}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white hover:bg-bg-alabaster border border-accent-gold/25 text-[10px] font-bold text-text-ink hover:text-accent-gold transition-all duration-300 cursor-pointer active:scale-95 shadow-none"
            >
              <Globe className="h-3 w-3 text-accent-gold" />
              <span>{lang === 'en' ? 'አማርኛ' : 'English'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 md:py-8 z-10 flex-grow relative">
        
        {loading ? (
          /* Loading Indicator */
          <div className="flex flex-col items-center justify-center py-32 text-stone-500">
            <Loader2 className="h-10 w-10 animate-spin text-accent-gold mb-4" />
            <span className="text-xs font-serif tracking-widest uppercase font-medium">{t.loadingLessons}</span>
          </div>
        ) : !activeVideo ? (
          
          /* ============================================================== */
          /* GRID MODE (Dashboard Style)                                    */
          /* ============================================================== */
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* Hero Section */}
            <div className="text-center py-10 max-w-2xl mx-auto relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] text-accent-gold/[0.015] pointer-events-none select-none -z-10">
                <svg viewBox="0 0 200 200" fill="currentColor" className="w-full h-full">
                  <path d="M95 10v45H80c-5 0-9 4-9 9s4 9 9 9h15v15H80c-5 0-9 4-9 9s4 9 9 9h15v45c0 5 4 9 9 9s9-4 9-9v-45h15c5 0 9-4 9-9s-4-9-9-9h-15V83h15c5 0 9-4 9-9s-4-9-9-9h-15V10c0-5-4-9-9-9s-9 4-9 9z" />
                </svg>
              </div>

              <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-text-ink tracking-tight flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-accent-gold animate-pulse" />
                <span className="Ethiopic-font">{t.title}</span>
              </h1>
              <div className="w-24 h-[1.5px] bg-accent-gold/45 mx-auto my-3" />
              <p className="text-[10px] text-stone-550 uppercase tracking-widest font-bold font-serif">{t.subtitle}</p>
            </div>

            {/* Search and Tags Bar */}
            <div className="space-y-4 bg-white border border-accent-gold/15 p-4 rounded-2xl sticky top-[72px] z-20 soft-shadow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* Search input */}
                <div className="md:col-span-2 relative">
                  <input 
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-accent-gold/15 rounded-xl px-4 py-2.5 pl-10 text-xs text-text-ink focus:outline-none focus:border-accent-gold transition-all placeholder:text-stone-400 focus:shadow-none"
                  />
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-450" />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-3.5 text-[10px] text-stone-550 hover:text-accent-crimson font-serif"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                {/* Info Text */}
                <div className="text-right hidden md:block">
                  <span className="text-[9px] font-serif font-bold text-accent-gold uppercase tracking-wider bg-accent-gold/10 px-3 py-1 rounded-full border border-accent-gold/25">
                    {filteredLessons.length} lessons available
                  </span>
                </div>
              </div>

              {/* Scrollable Category Chips */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 pt-0.5 select-none no-scrollbar">
                <button
                  onClick={() => setSelectedSubject('all')}
                  className={`px-4 py-1.5 rounded-full text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer border whitespace-nowrap shrink-0 ${
                    selectedSubject === 'all'
                      ? 'bg-accent-gold border-accent-gold text-white shadow-none font-extrabold'
                      : 'bg-white border-accent-gold/15 text-stone-750 hover:bg-bg-alabaster hover:border-accent-gold/45'
                  }`}
                >
                  {t.allTopics}
                </button>
                {subjects.map(subject => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`px-4 py-1.5 rounded-full text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer border whitespace-nowrap shrink-0 ${
                      selectedSubject === subject
                        ? 'bg-accent-gold border-accent-gold text-white shadow-none font-extrabold'
                        : 'bg-white border-accent-gold/15 text-stone-750 hover:bg-bg-alabaster hover:border-accent-gold/45'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Lesson Grid */}
            {filteredLessons.length === 0 ? (
              <div className="text-center py-20 bg-white border border-dashed border-accent-gold/25 rounded-2xl p-6 soft-shadow">
                <Feather className="h-10 w-10 text-accent-gold/20 mb-3 mx-auto" />
                <p className="text-xs text-stone-500 italic">No video lessons found matching your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredLessons.map((lesson) => (
                  <article 
                    key={lesson.id}
                    onClick={() => handleSelectVideo(lesson)}
                    className="group flex flex-col bg-white border border-accent-gold/15 rounded-2xl overflow-hidden cursor-pointer relative soft-shadow soft-shadow-hover hover:border-accent-gold/30"
                  >
                    {/* Thumbnail Section */}
                    <div className="aspect-video w-full bg-black relative overflow-hidden">
                      <img 
                        src={`https://i3.ytimg.com/vi/${lesson.youtube_video_id}/hqdefault.jpg`} 
                        alt={lesson.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-[0.9] group-hover:brightness-100"
                        loading="lazy"
                      />
                      
                      {/* Hover Overlay with play icon */}
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                        <div className="w-12 h-12 rounded-full bg-accent-gold/95 text-white flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all duration-300">
                          <Play className="h-5 w-5 fill-current ml-0.5" />
                        </div>
                      </div>

                      {/* Topic Badge */}
                      <div className="absolute bottom-3 left-3 z-10">
                        <span className="inline-block px-2.5 py-0.5 rounded bg-bg-parchment/95 backdrop-blur-sm border border-accent-gold/30 text-[9px] font-serif font-bold tracking-wider text-accent-gold uppercase">
                          {lesson.subject}
                        </span>
                      </div>

                      {/* Priority Ge'ez Numeral Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-accent-crimson text-white border border-accent-crimson/35 text-[9px] font-serif font-extrabold tracking-wider min-w-[20px] text-center">
                          {toGeezNumeral(lesson.priority || 1)}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-serif font-bold text-text-ink leading-snug Ethiopic-font group-hover:text-accent-gold transition-colors duration-200 line-clamp-2">
                          {lesson.title}
                        </h3>
                        {lesson.teacher_name && (
                          <div className="flex items-center space-x-1.5 text-stone-500">
                            <User className="h-3 w-3 text-accent-gold/60" />
                            <span className="text-[10px] font-medium Ethiopic-font line-clamp-1">
                              {lesson.teacher_name}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-accent-gold/10 pt-3.5 flex justify-between items-center text-[9px] font-serif font-bold text-stone-500 uppercase tracking-widest">
                        <span>{t.viewsAndDate}</span>
                        <span className="text-accent-blue group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          Study Lesson <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : (
          
          /* ============================================================== */
          /* WATCH MODE (Split Desk light Parchment Workspace)              */
          /* ============================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Left Column: Video Player & Metadata (Span 7) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Back Link */}
              <button 
                onClick={() => {
                  setActiveVideo(null);
                  setEditingNoteId(null);
                }}
                className="flex items-center space-x-1.5 text-xs font-serif font-bold text-accent-gold hover:text-accent-gold/85 transition-colors uppercase cursor-pointer self-start"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t.backToAll}</span>
              </button>

              {/* YouTube Player Container */}
              <div 
                id="video-player-container"
                className="w-full rounded-2xl border border-accent-gold/25 bg-black p-1 md:p-1.5 relative overflow-hidden soft-shadow"
              >
                {/* 16:9 Aspect Ratio Container */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner">
                  <iframe
                    id="youtube-player-iframe"
                    src={`https://www.youtube.com/embed/${activeVideo.youtube_video_id}?enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&start=${activeVideo.start_time}`}
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>
              </div>

              {/* Simple title and subject under player */}
              <div className="px-1 py-1">
                <span className="inline-block px-2.5 py-0.5 rounded bg-accent-gold/10 border border-accent-gold/20 text-[9px] font-serif font-bold tracking-wider text-accent-gold uppercase mb-2">
                  {activeVideo.subject}
                </span>
                <h1 className="text-lg sm:text-xl font-serif font-extrabold text-text-ink leading-snug Ethiopic-font">
                  {activeVideo.title}
                </h1>
              </div>
            </div>

            {/* Right Column: Split Desk Interactive Study Workspace (Span 5) */}
            <div className="lg:col-span-5 flex flex-col bg-white border border-accent-gold/15 rounded-2xl overflow-hidden h-[510px] lg:h-[510px] soft-shadow">
              
              {/* Workspace Navigation Tabs */}
              <div className="flex border-b border-stone-100 bg-bg-alabaster/40 text-[10px] font-serif font-bold tracking-wider uppercase select-none">
                <button
                  onClick={() => setActiveTab('journal')}
                  className={`flex-1 py-3.5 text-center transition-colors cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
                    activeTab === 'journal'
                      ? 'border-accent-gold text-accent-gold bg-white'
                      : 'border-transparent text-stone-500 hover:text-text-ink hover:bg-bg-alabaster/25'
                  }`}
                >
                  <BookMarked className="h-3.5 w-3.5" />
                  <span>Journal</span>
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 py-3.5 text-center transition-colors cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
                    activeTab === 'details'
                      ? 'border-accent-gold text-accent-gold bg-white'
                      : 'border-transparent text-stone-500 hover:text-text-ink hover:bg-bg-alabaster/25'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Summary</span>
                </button>
                <button
                  onClick={() => setActiveTab('playlist')}
                  className={`flex-1 py-3.5 text-center transition-colors cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
                    activeTab === 'playlist'
                      ? 'border-accent-gold text-accent-gold bg-white'
                      : 'border-transparent text-stone-500 hover:text-text-ink hover:bg-bg-alabaster/25'
                  }`}
                >
                  <ListVideo className="h-3.5 w-3.5" />
                  <span>Playlist</span>
                </button>
              </div>

              {/* Tab Contents Pane (Invisible scrollbar globally) */}
              <div className="flex-grow p-5 overflow-y-auto no-scrollbar">
                
                {/* 1. JOURNAL & BOOKMARKS TAB */}
                {activeTab === 'journal' && (
                  <div className="space-y-5 animate-in fade-in duration-300">
                    
                    {/* Add reflection form */}
                    <form onSubmit={handleSaveNote} className="space-y-3 bg-bg-parchment/35 border border-accent-gold/10 p-4 rounded-xl">
                      
                      {/* Note Type Selector Chips */}
                      <div className="flex flex-wrap items-center gap-2 mb-1 select-none">
                        {['Reflection', 'Theology', 'Question', 'Prayer'].map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setNoteCategory(cat)}
                            className={`px-2 py-0.5 rounded text-[8px] font-serif font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                              noteCategory === cat
                                ? 'bg-accent-gold border-accent-gold text-white font-extrabold'
                                : 'bg-white border-accent-gold/10 text-stone-500 hover:border-accent-gold/30 hover:text-text-ink'
                            }`}
                          >
                            {cat === 'Reflection' ? '✍️ Reflection' :
                             cat === 'Theology' ? '📜 Theology' :
                             cat === 'Question' ? '❓ Question' : '🕊️ Prayer'}
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows={3}
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder={t.addNotePlaceholder}
                        className="w-full bg-white border border-accent-gold/15 rounded-xl px-3 py-2 text-xs text-text-ink focus:outline-none focus:border-accent-gold transition-all placeholder:text-stone-400 font-serif leading-relaxed"
                        required
                      />

                      <div className="flex items-center justify-between gap-2">
                        <CustomCheckbox 
                          checked={linkToTime} 
                          onChange={setLinkToTime} 
                          label={t.captureTime} 
                        />
                        <button
                          type="submit"
                          disabled={savingNote || !newNoteText.trim()}
                          className="px-4 py-2 rounded-lg bg-accent-gold hover:bg-accent-gold/90 text-white text-[9px] font-extrabold tracking-wider uppercase transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 active:scale-95"
                        >
                          {savingNote ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                          <span>{t.saveNote}</span>
                        </button>
                      </div>
                    </form>

                    {/* Timeline Notes List */}
                    <div className="space-y-4">
                      {notes.length === 0 ? (
                        <p className="text-center py-8 text-xs text-stone-400 font-light italic">
                          {t.noNotes}
                        </p>
                      ) : (
                        notes.map((note, index) => {
                          const isNoteEditing = editingNoteId === note.id;
                          const cat = ['Reflection', 'Theology', 'Question', 'Prayer'].includes(note.title) 
                            ? note.title 
                            : 'Reflection';
                          
                          return (
                            <div 
                              key={note.id} 
                              className="p-4 rounded-xl border border-accent-gold/10 transition-all flex justify-between items-start gap-3 bg-bg-parchment/10 relative overflow-hidden"
                              style={{
                                background: 'linear-gradient(white, white 23px, rgba(197, 146, 70, 0.04) 23px, rgba(197, 146, 70, 0.04) 24px)',
                                backgroundSize: '100% 24px',
                                lineHeight: '24px'
                              }}
                            >
                              <div className="space-y-2 flex-grow">
                                {/* Metadata line */}
                                <div className="flex items-center gap-1.5 border-b border-accent-gold/5 pb-1 mb-1">
                                  
                                  {/* Play time link */}
                                  {note.timestamp_seconds > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => seekToTime(note.timestamp_seconds)}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-blue/10 text-accent-blue hover:bg-accent-blue hover:text-white text-[8px] font-bold transition-all cursor-pointer border border-accent-blue/15"
                                      title="Seek playback"
                                    >
                                      <Clock className="h-2 w-2" />
                                      <span>{formatTime(note.timestamp_seconds)}</span>
                                    </button>
                                  )}

                                  {/* Category label badge */}
                                  <span className={`text-[8px] font-serif font-bold px-1.5 rounded-full ${
                                    cat === 'Theology' ? 'bg-accent-gold/10 text-accent-gold' :
                                    cat === 'Question' ? 'bg-accent-crimson/10 text-accent-crimson' :
                                    cat === 'Prayer' ? 'bg-accent-blue/10 text-accent-blue' :
                                    'bg-stone-100 text-stone-500'
                                  }`}>
                                    {cat === 'Reflection' ? '✍️ Reflection' :
                                     cat === 'Theology' ? '📜 Theology' :
                                     cat === 'Question' ? '❓ Question' : '🕊️ Prayer'}
                                  </span>

                                  <span className="text-[8px] text-stone-400 font-light ml-auto">
                                    {note.created_at ? new Date(note.created_at).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric'
                                    }) : ''}
                                  </span>
                                </div>
                                
                                {/* Edit form or text content */}
                                {isNoteEditing ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={editingNoteText}
                                      onChange={(e) => setEditingNoteText(e.target.value)}
                                      rows={2}
                                      className="w-full bg-white border border-accent-gold/20 rounded-lg p-2 text-xs text-text-ink font-serif"
                                    />
                                    <div className="flex justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setEditingNoteId(null)}
                                        className="px-2 py-1 border border-stone-200 text-stone-500 rounded text-[9px] font-serif bg-white"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateNote(note.id)}
                                        className="px-2 py-1 bg-accent-gold text-white rounded text-[9px] font-serif font-bold"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-stone-750 font-serif leading-relaxed Ethiopic-font italic pt-1 pl-1">
                                    &ldquo;{note.user_notes}&rdquo;
                                  </p>
                                )}
                              </div>

                              {/* Tool buttons */}
                              {!isNoteEditing && (
                                <div className="flex flex-col gap-1.5 shrink-0 self-start">
                                  <button
                                    type="button"
                                    onClick={() => startEditingNote(note)}
                                    className="text-stone-400 hover:text-accent-gold p-1 rounded-md hover:bg-bg-alabaster transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="text-stone-400 hover:text-accent-crimson p-1 rounded-md hover:bg-accent-crimson/5 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* 2. DETAILS & LITURGY CONNECTIONS TAB */}
                {activeTab === 'details' && (
                  <div className="space-y-6 animate-in fade-in duration-300 relative">
                    
                    {/* Summary Header */}
                    <div className="space-y-3.5 border-b border-stone-100 pb-5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-accent-gold/10 border border-accent-gold/20 text-[9px] font-bold text-accent-gold uppercase">
                          Theological Profile
                        </span>
                        <span className="text-[9px] text-stone-400 font-serif font-bold">
                          Index Priority {toGeezNumeral(activeVideo.priority || 1)}
                        </span>
                      </div>
                      
                      <h2 className="text-base font-serif font-extrabold text-text-ink Ethiopic-font">
                        {activeVideo.title}
                      </h2>
                      
                      {activeVideo.teacher_name && (
                        <div className="flex items-center space-x-2 text-[#141211] bg-bg-parchment/40 p-3 rounded-xl border border-accent-gold/15">
                          <User className="h-4 w-4 text-accent-gold" />
                          <div>
                            <span className="block text-[8px] text-stone-500 uppercase font-bold tracking-wider">{t.teacherLabel}</span>
                            <span className="block text-xs font-semibold text-text-ink Ethiopic-font">{activeVideo.teacher_name}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Patristic Themes Card */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-serif font-bold uppercase tracking-widest text-accent-crimson flex items-center gap-1.5">
                        <Feather className="h-4 w-4" />
                        <span>Liturgical Contexts</span>
                      </h4>

                      <div className="bg-bg-alabaster/40 p-4 rounded-xl border border-accent-gold/15 space-y-2 relative">
                        <span className="block text-[8px] font-bold text-accent-blue uppercase tracking-widest">Linked Study Reference</span>
                        <p className="text-[11px] text-stone-600 font-serif leading-relaxed">
                          This lesson concerns theological facets of <strong className="text-text-ink">{activeVideo.subject}</strong>. You can find related reflections inside the <Link href={`/study-space?lang=${lang}`} className="text-accent-gold hover:underline font-bold">Study Space</Link> or look up scripture interpretations in the reader.
                        </p>
                        <Link
                          href={`/liturgy/qiddase-dioscoros?lang=${lang}`}
                          className="inline-flex items-center gap-1 text-[9px] font-serif font-bold text-accent-gold hover:text-accent-gold/80 uppercase pt-1"
                        >
                          <span>Open Liturgy Reader</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>

                      {/* Share link button */}
                      <button 
                        onClick={handleShareVideo}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-accent-gold/25 hover:border-accent-gold hover:bg-bg-parchment/20 text-[10px] font-serif font-bold uppercase tracking-wider transition-colors cursor-pointer bg-white"
                      >
                        <Share2 className="h-4 w-4 text-accent-gold" />
                        <span>{t.shareVideo}</span>
                      </button>
                    </div>

                    <div className="w-[120px] h-[120px] text-accent-gold/[0.012] absolute right-2 bottom-2 pointer-events-none select-none z-0">
                      <svg viewBox="0 0 200 200" fill="currentColor" className="w-full h-full">
                        <path d="M95 10v45H80c-5 0-9 4-9 9s4 9 9 9h15v15H80c-5 0-9 4-9 9s4 9 9 9h15v45c0 5 4 9 9 9s9-4 9-9v-45h15c5 0 9-4 9-9s-4-9-9-9h-15V83h15c5 0 9-4 9-9s-4-9-9-9h-15V10c0-5-4-9-9-9s-9 4-9 9z" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* 3. PLAYLIST / LESSONS TAB */}
                {activeTab === 'playlist' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    
                    {/* Small inner search */}
                    <div className="relative mb-2 select-none">
                      <input 
                        type="text"
                        placeholder="Search playlist..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-accent-gold/15 rounded-xl px-3.5 py-2 pl-9 text-[11px] text-text-ink focus:outline-none focus:border-accent-gold transition-all placeholder:text-stone-450"
                      />
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                    </div>

                    {/* Playlist cards */}
                    <div className="space-y-3">
                      {upNextLessons.map((lesson) => {
                        const isCurrent = lesson.id === activeVideo.id;
                        return (
                          <div 
                            key={lesson.id}
                            onClick={() => handleSelectVideo(lesson)}
                            className={`flex gap-3 p-2 rounded-xl transition-all duration-200 cursor-pointer border items-start ${
                              isCurrent 
                                ? 'bg-accent-gold/[0.04] border-accent-gold/45 shadow-xs pointer-events-none'
                                : 'bg-white border-transparent hover:border-accent-gold/15 hover:bg-bg-parchment/20'
                            }`}
                          >
                            <div className="w-[85px] aspect-video rounded-lg overflow-hidden bg-black shrink-0 relative">
                              <img 
                                src={`https://i3.ytimg.com/vi/${lesson.youtube_video_id}/mqdefault.jpg`} 
                                alt={lesson.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="space-y-0.5 overflow-hidden">
                              <h4 className="text-[10px] font-serif font-bold text-text-ink leading-snug Ethiopic-font line-clamp-2 hover:text-accent-gold transition-colors">
                                {lesson.title}
                              </h4>
                              {lesson.teacher_name && (
                                <span className="block text-[8px] text-stone-450 font-medium Ethiopic-font truncate">
                                  {lesson.teacher_name}
                                </span>
                              )}
                              <span className="inline-block text-[7px] font-serif font-bold text-accent-gold bg-accent-gold/5 border border-accent-gold/20 rounded px-1 uppercase scale-90 origin-left mt-0.5">
                                {lesson.subject}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-accent-gold/15 bg-bg-alabaster/40 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-stone-500 text-[9px] tracking-wider uppercase space-y-4 md:space-y-0 font-medium">
          <p className="max-w-md text-center md:text-left leading-relaxed">
            Dedicated to preserving and learning the ancient Orthodox faith. Developed for learners and diaspora worldwide.
          </p>
          <div className="flex space-x-6 font-semibold text-text-ink/65">
            <span>© {new Date().getFullYear()} LEARN ORTHODOX</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
