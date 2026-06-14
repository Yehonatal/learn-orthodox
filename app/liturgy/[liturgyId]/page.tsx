import { createClient } from '@/lib/supabase/server';
import TrilingualReader from '@/components/liturgy/TrilingualReader';
import SectionNav from '@/components/liturgy/SectionNav';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import type { Liturgy, LiturgySection, LiturgyUnit } from '@/types/liturgy';

function pageToSection(page: number): string {
  if (page >= 1 && page <= 7) return 'opening-hymns';
  if (page >= 8 && page <= 13) return 'trisagion';
  if (page >= 14 && page <= 30) return 'prayer-of-thanksgiving';
  if (page >= 31 && page <= 46) return 'prayer-of-oblation';
  if (page >= 47 && page <= 70) return 'litany-of-intercessions';
  if (page >= 100 && page <= 114) return 'marian-hymns';
  if (page >= 115 && page <= 123) return 'sanctus';
  if (page >= 124 && page <= 203) return 'anaphora';
  if (page >= 204 && page <= 207) return 'prayer-of-fraction';
  if (page >= 208 && page <= 210) return 'lords-prayer';
  if (page >= 211 && page <= 239) return 'communion';
  return 'thanksgiving-dismissal';
}

// Local filesystem fallback loader
function getLocalFallback(slug: string): { liturgy: Liturgy; sections: LiturgySection[] } | null {
  try {
    const baseDir = path.join(process.cwd(), 'content/liturgy', slug);
    const metadataPath = path.join(baseDir, 'metadata.json');
    if (!fs.existsSync(metadataPath)) return null;

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    const sectionsJsonPath = path.join(baseDir, 'sections.json');
    if (!fs.existsSync(sectionsJsonPath)) return null;

    // Default sections according to schema
    const sectionDefinitions = [
      { slug: 'opening-hymns', nameEn: 'Opening Hymns', nameAm: 'የመክፈቻ መዝሙሮች' },
      { slug: 'trisagion', nameEn: 'Trisagion', nameAm: 'ቅዱስ ቅዱስ' },
      { slug: 'prayer-of-thanksgiving', nameEn: 'Prayer of Thanksgiving', nameAm: 'የምስጋና ጸሎት' },
      { slug: 'prayer-of-oblation', nameEn: 'Prayer of Oblation', nameAm: 'የቅዳሴ ጸሎት' },
      { slug: 'litany-of-intercessions', nameEn: 'Litany of Intercessions', nameAm: 'የምልጃ ጸሎቶች' },
      { slug: 'marian-hymns', nameEn: 'Marian Hymns', nameAm: 'የማርያም መዝሙሮች' },
      { slug: 'sanctus', nameEn: 'Sanctus', nameAm: 'ሳንክቱስ' },
      { slug: 'anaphora', nameEn: 'Anaphora', nameAm: 'አናፎራ' },
      { slug: 'prayer-of-fraction', nameEn: 'Prayer of Fraction', nameAm: 'የቁርባን ጸሎት' },
      { slug: 'lords-prayer', nameEn: 'Lord\'s Prayer', nameAm: 'አቡነ ዘበሰማያት' },
      { slug: 'communion', nameEn: 'Communion', nameAm: 'ቅዱስ ቁርባን' },
      { slug: 'thanksgiving-dismissal', nameEn: 'Thanksgiving & Dismissal', nameAm: 'የምስጋናና የመሸኛ ጸሎቶች' }
    ];

    const sections: LiturgySection[] = sectionDefinitions.map((d, index) => ({
      id: `sec-${d.slug}`,
      slug: d.slug,
      orderIndex: index + 1,
      nameEn: d.nameEn,
      nameAm: d.nameAm,
      nameGez: null,
      units: []
    }));

    const rawUnits = JSON.parse(fs.readFileSync(sectionsJsonPath, 'utf-8'));
    for (const unitRaw of rawUnits) {
      const page = unitRaw.sourcePage || 1;
      const sectionSlug = pageToSection(page);
      const section = sections.find(s => s.slug === sectionSlug) || sections[0];

      section.units.push({
        id: `unit-${unitRaw.sectionNum}`,
        sectionId: section.id,
        orderIndex: unitRaw.sectionNum,
        sourcePage: page,
        role: unitRaw.role,
        textGez: unitRaw.textGez || null,
        textAm: unitRaw.textAm || null,
        textEn: unitRaw.textEn || null,
        isResponse: false,
        notes: null
      });
    }

    const liturgy: Liturgy = {
      id: slug,
      slug: metadata.slug,
      nameEn: metadata.nameEn,
      nameAm: metadata.nameAm,
      nameGez: metadata.nameGez,
      description: metadata.description,
      saint: metadata.saint
    };

    return { liturgy, sections };
  } catch (e) {
    console.error('Failed to load local fallback content:', e);
    return null;
  }
}

const SAINT_NAMES_AM: Record<string, string> = {
  'Dioscoros': 'ዲዮስቆሮስ',
  'Apostles': 'ሐዋርያት',
  'Basil': 'ባስልዮስ',
  'Epiphanius': 'ኤጲፋንዮስ',
  'Gregory': 'ጎርጎርዮስ',
  'John Chrysostom': 'ዮሐንስ አፈወርቅ',
  'Cyril': 'ኪርሎስ'
};

interface PageProps {
  params: Promise<{ liturgyId: string }>;
  searchParams: Promise<{ section?: string; lang?: string }>;
}

export default async function LiturgyPage({ params, searchParams }: PageProps) {
  const { liturgyId } = await params;
  const { section: sectionQuery, lang: langQuery } = await searchParams;
  const lang = langQuery === 'am' ? 'am' : 'en';

  let liturgy: Liturgy | null = null;
  let sections: LiturgySection[] = [];
  let loadedFromDb = false;

  try {
    const supabase = createClient();

    // 1. Fetch Liturgy
    const { data: liturgyDb } = await supabase
      .from('liturgies')
      .select('*')
      .eq('slug', liturgyId)
      .single();

    if (liturgyDb) {
      liturgy = {
        id: liturgyDb.id,
        slug: liturgyDb.slug,
        nameEn: liturgyDb.name_en,
        nameAm: liturgyDb.name_am,
        nameGez: liturgyDb.name_gez,
        description: liturgyDb.description_en,
        saint: liturgyDb.saint
      };

      // 2. Fetch Sections
      const { data: sectionsDb } = await supabase
        .from('liturgy_sections')
        .select('*')
        .eq('liturgy_id', liturgyDb.id)
        .order('order_index');

      if (sectionsDb && sectionsDb.length > 0) {
        // 3. Fetch Units for all sections
        for (const sec of sectionsDb) {
          const { data: unitsDb } = await supabase
            .from('liturgy_units')
            .select('*')
            .eq('section_id', sec.id)
            .order('order_index');

          const units: LiturgyUnit[] = (unitsDb || []).map(u => ({
            id: u.id,
            sectionId: u.section_id,
            orderIndex: u.order_index,
            sourcePage: u.source_page,
            role: u.role,
            textGez: u.text_gez,
            textAm: u.text_am,
            textEn: u.text_en,
            isResponse: u.is_response,
            notes: u.notes
          }));

          sections.push({
            id: sec.id,
            slug: sec.slug,
            orderIndex: sec.order_index,
            nameEn: sec.name_en,
            nameAm: sec.name_am,
            nameGez: sec.name_gez,
            units
          });
        }
        loadedFromDb = true;
      }
    }
  } catch (error) {
    console.warn('Supabase fetch failed, trying local fallback...', error);
  }

  // Load fallback if DB query failed
  if (!loadedFromDb) {
    const fallback = getLocalFallback(liturgyId);
    if (fallback) {
      liturgy = fallback.liturgy;
      sections = fallback.sections;
    }
  }

  if (!liturgy || sections.length === 0) {
    notFound();
  }

  // Select active section based on query param, fallback to first section
  const activeSection = sections.find(s => s.slug === sectionQuery) || sections[0];

  const translatedSaint = liturgy.saint ? (SAINT_NAMES_AM[liturgy.saint] || liturgy.saint) : '';
  const liturgySubtitle = lang === 'am' 
    ? (translatedSaint ? `የቅዱስ ${translatedSaint} ቅዳሴ` : 'ቅዳሴ')
    : (liturgy.saint ? `Liturgy of ${liturgy.saint}` : '');

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-bg-parchment">
      {/* Decorative stained glass light glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70vw] h-[250px] bg-gradient-to-b from-accent-gold/[0.04] via-accent-blue/[0.02] to-transparent blur-[80px] pointer-events-none" />

      {/* Sticky Navigation Header */}
      <header className="border-b border-accent-gold/20 bg-bg-parchment/80 backdrop-blur-md sticky top-0 z-20 shadow-none">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/?lang=${lang}`} className="flex items-center space-x-3.5 group">
              <img src="/glasswindow.png" alt="Learn Orthodox Stained Glass Logo" className="h-8 w-auto object-contain filter drop-shadow-[0_2px_4px_rgba(197,146,70,0.1)] group-hover:scale-105 transition-transform duration-300" />
              <div className="hidden sm:block">
                <span className="block text-xs font-serif font-extrabold tracking-wider text-text-ink group-hover:text-accent-gold transition-colors">
                  {lang === 'am' ? 'ኦርቶዶክስን ይማሩ' : 'LEARN ORTHODOX'}
                </span>
                <span className="block text-[8px] tracking-widest text-stone-500 uppercase">
                  {lang === 'am' ? 'የሥርዓተ ቅዳሴ አንባቢ' : 'Divine Liturgy Reader'}
                </span>
              </div>
            </Link>
            
            <div className="hidden md:block w-[1px] h-4 bg-accent-gold/30" />
            
            <Link 
              href={`/study-space?lang=${lang}`} 
              className="hidden md:inline-block text-[10px] font-serif font-bold tracking-wider text-accent-gold hover:text-accent-gold/85 uppercase cursor-pointer"
            >
              {lang === 'am' ? 'የጥናት ክፍል' : 'Study Space'}
            </Link>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Mobile Study Space Link */}
            <Link 
              href={`/study-space?lang=${lang}`} 
              className="inline-block md:hidden px-2.5 py-1 rounded-full border border-accent-gold/25 text-[8px] font-bold text-accent-gold uppercase tracking-wider bg-bg-parchment hover:bg-bg-alabaster transition-colors"
            >
              {lang === 'am' ? 'የጥናት ክፍል' : 'Study'}
            </Link>

            <div className="text-right">
              <h1 className="text-xs md:text-sm font-serif font-extrabold text-text-ink tracking-wide uppercase">
                {lang === 'am' ? (liturgy.nameAm || liturgy.nameEn) : liturgy.nameEn}
              </h1>
              {liturgy.saint && <p className="text-[9px] text-accent-crimson font-bold uppercase tracking-wider mt-0.5">{liturgySubtitle}</p>}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto w-full px-4 py-6 flex-grow flex flex-col">
        <SectionNav sections={sections} activeSlug={activeSection?.slug} lang={lang} />
        {activeSection && <TrilingualReader units={activeSection.units} lang={lang} />}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-accent-gold/20 bg-bg-alabaster/40 text-center text-[9px] text-stone-550 tracking-widest uppercase backdrop-blur-sm">
        <span>© {new Date().getFullYear()} {lang === 'am' ? 'ኦርቶዶክስን ይማሩ' : 'LEARN ORTHODOX'}</span>
      </footer>
    </div>
  );
}

