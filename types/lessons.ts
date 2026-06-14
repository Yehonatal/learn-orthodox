export interface OrthodoxLesson {
  id: string;
  slug: string;
  title: string;
  description: string;
  created_at?: string;
}

export interface ChurchFather {
  id: string;
  name: string;
  category: 'Apostolic Fathers' | 'Church Fathers' | string;
  pdf_link: string;
  created_at?: string;
}
