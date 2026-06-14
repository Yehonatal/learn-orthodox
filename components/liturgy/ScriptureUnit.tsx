import type { LiturgyUnit, LiturgicalRole } from '@/types/liturgy';
import IlluminatedLetter from './IlluminatedLetter';

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
    ? 'grid-cols-1 md:grid-cols-[4fr_3fr_3fr]' 
    : activeColsCount === 2 
      ? (showGez && showAm ? 'grid-cols-1 md:grid-cols-[5.5fr_4.5fr]' : (showGez && showEn ? 'grid-cols-1 md:grid-cols-[5.5fr_4.5fr]' : 'grid-cols-1 md:grid-cols-[1fr_1fr]')) 
      : 'grid-cols-1';

  // Selected container classes
  const containerClasses = isSelected
    ? 'bg-bg-alabaster/65 border-accent-gold shadow-none'
    : 'bg-transparent border-accent-gold/20 hover:bg-bg-alabaster/30 hover:border-accent-gold/45';

  const firstLetter = unit.textGez ? unit.textGez.trim().charAt(0) : '';
  const restOfGezText = unit.textGez ? unit.textGez.trim().slice(1) : '';

  return (
    <div
      onClick={onSelect}
      data-aos="fade-up"
      data-aos-delay={(index % 4) * 120} // progressive stagger delay
      data-aos-duration="900"
      data-aos-easing="ease-out-quad"
      className={`group relative manuscript-card pl-[42px] pr-3 py-3 md:py-2.5 cursor-pointer transition-all duration-300 ${containerClasses}`}
      style={{ borderRadius: 0 }}
    >
      {/* Four Corner Crosses */}
      <span className="corner-cross top-[-7px] left-[-5px]">✦</span>
      <span className="corner-cross top-[-7px] right-[-5px]">✦</span>
      <span className="corner-cross bottom-[-7px] left-[-5px]">✦</span>
      <span className="corner-cross bottom-[-7px] right-[-5px]">✦</span>

      {/* Speaker Tag in left margin */}
      <div className="absolute left-0 top-0 bottom-0 w-8 border-r border-accent-gold/15 flex items-center justify-center bg-bg-alabaster/40 select-none">
        <span className="ui-label text-[7.5px] font-bold tracking-[0.14em] text-accent-gold [writing-mode:vertical-lr] rotate-180 uppercase">
          {label}
        </span>
      </div>

      {/* Active Gold Left Indicator strip */}
      {isSelected && (
        <div className="absolute top-0 bottom-0 left-8 w-[2px] bg-accent-gold" />
      )}

      {/* Page Reference in Incense Smoke */}
      <span className="text-[7px] ui-label font-bold text-accent-grey tracking-widest absolute top-1.5 right-2 select-none">
        {lang === 'am' ? `ገጽ ${unit.sourcePage}` : `P. ${unit.sourcePage}`}
      </span>

      {/* Liturgical Passages in Asymmetric Columns */}
      <div className={`grid ${gridClass} gap-4 md:gap-5`}>
        {/* Column 1: Ge'ez */}
        {showGez && (
          <div className="flex flex-col justify-start">
            <span className="text-[7.5px] ui-label tracking-[0.1em] text-accent-grey font-bold mb-1.5 uppercase">
              {lang === 'am' ? 'ግዕዝ' : 'GE\'EZ'}
            </span>
            <div className="clearfix">
              {firstLetter && <IlluminatedLetter letter={firstLetter} />}
              <p 
                className="text-base md:text-lg leading-[1.6] text-accent-indigo font-normal Ethiopic-font transition-colors"
                style={{ fontFamily: "var(--font-noto-serif-ethiopic), serif" }}
              >
                {restOfGezText}
              </p>
            </div>
          </div>
        )}

        {/* Column 2: Amharic */}
        {showAm && (
          <div className={`flex flex-col justify-start ${(showGez) ? 'pl-0 md:pl-4 border-l-0 md:border-l-[0.5px] border-accent-gold/20' : ''}`}>
            <span className="text-[7.5px] ui-label tracking-[0.1em] text-accent-grey font-bold mb-1.5 uppercase">
              {lang === 'am' ? 'አማርኛ' : 'AMHARIC'}
            </span>
            <p 
              className="text-xs md:text-sm leading-[1.5] text-text-ink font-semibold Ethiopic-font transition-colors"
              style={{ fontFamily: "var(--font-noto-serif-ethiopic), serif" }}
            >
              {unit.textAm}
            </p>
          </div>
        )}

        {/* Column 3: English */}
        {showEn && (
          <div className={`flex flex-col justify-start ${(showGez || showAm) ? 'pl-0 md:pl-4 border-l-0 md:border-l-[0.5px] border-accent-gold/20' : ''}`}>
            <span className="text-[7.5px] ui-label tracking-[0.1em] text-accent-grey font-bold mb-1.5 uppercase">
              {lang === 'am' ? 'እንግሊዝኛ' : 'ENGLISH'}
            </span>
            <p className="text-xs md:text-sm leading-normal text-stone-600 font-light font-serif">
              {unit.textEn}
            </p>
          </div>
        )}
      </div>

      {/* Prompt click overlay indicator on hover */}
      <div className="absolute right-3 bottom-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-[7px] ui-label tracking-widest text-accent-gold font-bold uppercase">
          {lang === 'am' ? 'በ AI ለመማር ይጫኑ' : 'Click for AI'}
        </span>
      </div>
    </div>
  );
}
