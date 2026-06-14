import type { LiturgyUnit, LiturgicalRole } from '@/types/liturgy';

const ROLE_LABELS_EN: Record<LiturgicalRole, string> = {
  priest: 'Priest',
  asst_priest: 'Asst. Priest',
  deacon: 'Deacon',
  congregation: 'People',
  cantor: 'Cantor',
  all: 'All',
  rubric: 'Rubric'
};

const ROLE_LABELS_AM: Record<LiturgicalRole, string> = {
  priest: 'ካህን',
  asst_priest: 'ረዳት ካህን',
  deacon: 'ዲያቆን',
  congregation: 'ሕዝብ',
  cantor: 'ዘማሪ',
  all: 'ሁሉም',
  rubric: 'መመሪያ'
};

interface Props {
  unit: LiturgyUnit;
  index: number;
  langPref: 'all' | 'en' | 'am' | 'gez';
  isSelected: boolean;
  onSelect: () => void;
  lang: 'en' | 'am';
}

export default function ScriptureUnit({ unit, index, langPref, isSelected, onSelect, lang }: Props) {
  const label = lang === 'am' ? (ROLE_LABELS_AM[unit.role] || unit.role) : (ROLE_LABELS_EN[unit.role] || unit.role);

  const showGez = (langPref === 'all' || langPref === 'gez') && unit.textGez;
  const showAm  = (langPref === 'all' || langPref === 'am')  && unit.textAm;
  const showEn  = (langPref === 'all' || langPref === 'en')  && unit.textEn;

  // Count active columns to adjust grid dynamically
  const activeColsCount = (showGez ? 1 : 0) + (showAm ? 1 : 0) + (showEn ? 1 : 0);
  const gridClass = activeColsCount === 3 
    ? 'grid-cols-1 md:grid-cols-3' 
    : activeColsCount === 2 
      ? 'grid-cols-1 md:grid-cols-2' 
      : 'grid-cols-1';

  // Selected container classes
  const containerClasses = isSelected
    ? 'bg-bg-alabaster/65 border-accent-gold shadow-none'
    : 'bg-transparent border-accent-gold/20 hover:bg-bg-alabaster/30 hover:border-accent-gold/45';

  return (
    <div
      onClick={onSelect}
      data-aos="fade-up"
      data-aos-delay={(index % 4) * 120} // progressive stagger delay
      data-aos-duration="900"
      data-aos-easing="ease-out-quad"
      className={`group relative rounded-xl border p-5 md:p-6 cursor-pointer transition-all duration-300 ${containerClasses}`}
    >
      {/* Active Gold Left Indicator strip */}
      {isSelected && (
        <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-accent-gold" />
      )}

      {/* Header Metadata with clean crimson borders & tiny serif lettering */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-accent-gold/10">
        <span className="inline-block text-[9px] font-serif uppercase tracking-widest font-semibold px-2 py-0.5 rounded border border-accent-crimson/30 text-accent-crimson bg-accent-crimson/[0.03]">
          {label}
        </span>
        <span className="text-[9px] font-serif text-accent-crimson/80 font-medium border border-accent-crimson/20 rounded px-2 py-0.5 bg-accent-crimson/[0.01]">
          {lang === 'am' ? `ገጽ ${unit.sourcePage}` : `Page ${unit.sourcePage}`}
        </span>
      </div>

      {/* Liturgical Passages in Columns */}
      <div className={`grid ${gridClass} gap-5 md:gap-6`}>
        {/* Column 1: Ge'ez */}
        {showGez && (
          <div className="flex flex-col justify-start">
            <span className="text-[8px] tracking-widest text-stone-400 font-semibold mb-2 uppercase">
              {lang === 'am' ? 'ግዕዝ' : 'ግዕዝ (Original)'}
            </span>
            <p 
              className="text-xl md:text-2xl leading-relaxed text-accent-blue font-serif font-semibold Ethiopic-font transition-colors"
              style={{ fontFamily: "var(--font-noto-serif-ethiopic), serif" }}
            >
              {unit.textGez}
            </p>
          </div>
        )}

        {/* Column 2: Amharic */}
        {showAm && (
          <div className={`flex flex-col justify-start ${showGez ? 'pl-0 md:pl-5 border-l-0 md:border-l-[0.5px] border-accent-gold/20' : ''}`}>
            <span className="text-[8px] tracking-widest text-stone-400 font-semibold mb-2 uppercase">
              {lang === 'am' ? 'አማርኛ' : 'አማርኛ (Amharic)'}
            </span>
            <p 
              className="text-sm md:text-[15px] leading-relaxed text-text-ink font-medium Ethiopic-font transition-colors"
              style={{ fontFamily: "var(--font-noto-serif-ethiopic), serif" }}
            >
              {unit.textAm}
            </p>
          </div>
        )}

        {/* Column 3: English */}
        {showEn && (
          <div className={`flex flex-col justify-start ${(showGez || showAm) ? 'pl-0 md:pl-5 border-l-0 md:border-l-[0.5px] border-accent-gold/20' : ''}`}>
            <span className="text-[8px] tracking-widest text-stone-400 font-semibold mb-2 uppercase">
              {lang === 'am' ? 'እንግሊዝኛ' : 'English (Translation)'}
            </span>
            <p className="text-xs md:text-sm leading-relaxed text-stone-600 font-light font-sans">
              {unit.textEn}
            </p>
          </div>
        )}
      </div>

      {/* Prompt click overlay indicator on hover */}
      <div className="absolute right-4 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-[8px] tracking-widest text-accent-gold font-bold uppercase font-serif">
          {lang === 'am' ? 'ስለ ጥቅሱ በ AI ለመማር ይጫኑ' : 'Click for AI Explainer'}
        </span>
      </div>
    </div>
  );
}
