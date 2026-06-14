'use client';

import Link from 'next/link';
import type { LiturgySection } from '@/types/liturgy';

interface SectionNavProps {
  sections: LiturgySection[];
  activeSlug?: string;
  lang?: 'en' | 'am';
}

export default function SectionNav({ sections, activeSlug, lang = 'en' }: SectionNavProps) {
  return (
    <div className="sticky top-[68px] z-10 bg-bg-parchment/95 backdrop-blur-md pb-2 border-b border-accent-gold/20">
      {/* Horizontal Nav Bar */}
      <nav className="flex gap-2 overflow-x-auto py-2.5 px-1 scrollbar-none">
        {sections.map(section => {
          const isActive = section.slug === activeSlug;
          return (
            <Link
              key={section.id}
              href={`?section=${section.slug}&lang=${lang}`}
              prefetch={false}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-350 cursor-pointer active:scale-95 border ${
                isActive
                  ? 'bg-accent-gold/15 text-accent-gold border-accent-gold shadow-sm font-bold'
                  : 'bg-transparent border-accent-gold/20 text-text-ink/70 hover:text-text-ink hover:border-accent-gold/50'
              }`}
            >
              {lang === 'am' ? (section.nameAm || section.nameEn) : section.nameEn}
            </Link>
          );
        })}
      </nav>

      {/* Subtle, modern line-art SVG "Haräg" motif separator */}
      <div className="w-full h-3 text-accent-gold/35 mt-1 overflow-hidden select-none flex justify-center items-center">
        <svg className="w-full h-full max-w-4xl" viewBox="0 0 600 12" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          {/* Repeating elegant interlace wave representing modern Haräg design */}
          <path 
            d="M0 6 L600 6 M10 6 C20 0, 30 12, 40 6 S50 0, 60 6 S70 0, 80 6 S90 0, 100 6 S110 0, 120 6 S130 0, 140 6 S150 0, 160 6 S170 0, 180 6 S190 0, 200 6 S210 0, 220 6 S230 0, 240 6 S250 0, 260 6 S270 0, 280 6 S290 0, 300 6 S310 0, 320 6 S330 0, 340 6 S350 0, 360 6 S370 0, 380 6 S390 0, 400 6 S410 0, 420 6 S430 0, 440 6 S450 0, 460 6 S470 0, 480 6 S490 0, 500 6 S510 0, 520 6 S530 0, 540 6 S550 0, 560 6 S570 0, 580 6 S590 0, 600 6" 
            stroke="currentColor" 
            strokeWidth="0.75" 
            strokeLinecap="round"
          />
          <path d="M0 2 H600 M0 10 H600" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        </svg>
      </div>
    </div>
  );
}
