export type LiturgicalRole =
  | 'priest' | 'asst_priest' | 'deacon'
  | 'congregation' | 'rubric' | 'cantor' | 'all';

export interface LiturgyUnit {
  id: string;
  sectionId: string;
  orderIndex: number;
  sourcePage: number;
  role: LiturgicalRole;
  textGez: string | null;
  textAm: string | null;
  textEn: string | null;
  isResponse: boolean;
  notes: string | null;
}

export interface LiturgySection {
  id: string;
  slug: string;
  orderIndex: number;
  nameEn: string;
  nameAm: string | null;
  nameGez: string | null;
  units: LiturgyUnit[];
}

export interface Liturgy {
  id: string;
  slug: string;
  nameEn: string;
  nameAm: string | null;
  nameGez: string | null;
  description: string | null;
  saint?: string;
}

export type Language = 'en' | 'am' | 'gez';

export interface LiturgyReaderState {
  activeSectionId: string | null;
  activeUnitId: string | null;
  languages: Language[];
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
}
