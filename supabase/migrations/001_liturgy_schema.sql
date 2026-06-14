CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Top-level liturgy (Qiddase, Sa'atat, etc.)
CREATE TABLE liturgies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_am TEXT,
  name_gez TEXT,
  description_en TEXT,
  saint TEXT,
  source_pdf_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Major liturgical divisions
CREATE TABLE liturgy_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  liturgy_id UUID REFERENCES liturgies(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  name_en TEXT NOT NULL,
  name_am TEXT,
  name_gez TEXT,
  description_en TEXT,
  UNIQUE(liturgy_id, order_index)
);

-- One unit = one liturgical exchange (one PDF page)
CREATE TABLE liturgy_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES liturgy_sections(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  source_page INTEGER,
  role TEXT CHECK (role IN (
    'priest', 'asst_priest', 'deacon', 'congregation',
    'rubric', 'cantor', 'all'
  )),
  text_gez TEXT,
  text_am TEXT,
  text_en TEXT,
  is_response BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section_id, order_index)
);

-- Seed: Qiddase of St. Dioscoros
INSERT INTO liturgies (slug, name_en, name_am, saint, source_pdf_path)
VALUES (
  'qiddase-dioscoros',
  'The Divine Liturgy of St. Dioscoros',
  'ቅዳሴ ዲዮስቆሮስ',
  'St. Dioscoros',
  'liturgy-pdfs/kidasse_Dioscoros.pdf'
) ON CONFLICT (slug) DO NOTHING;

-- Seed: sections
INSERT INTO liturgy_sections (liturgy_id, slug, order_index, name_en, name_am)
SELECT
  id,
  unnest(ARRAY[
    'opening-hymns','trisagion','prayer-of-thanksgiving',
    'prayer-of-oblation','litany-of-intercessions','marian-hymns',
    'sanctus','anaphora','prayer-of-fraction','lords-prayer',
    'communion','thanksgiving-dismissal'
  ]),
  generate_series(1,12),
  unnest(ARRAY[
    'Opening Hymns','Trisagion','Prayer of Thanksgiving',
    'Prayer of Oblation','Litany of Intercessions','Marian Hymns',
    'Sanctus','Anaphora','Prayer of Fraction','Lord''s Prayer',
    'Communion','Thanksgiving & Dismissal'
  ]),
  unnest(ARRAY[
    'የመክፈቻ መዝሙሮች','ቅዱስ ቅዱስ','የምስጋና ጸሎት',
    'የቅዳሴ ጸሎት','የምልጃ ጸሎቶች','የማርያም መዝሙሮች',
    'ሳንክቱስ','አናፎራ','የቁርባን ጸሎት','አቡነ ዘበሰማያት',
    'ቅዱስ ቁርባን','የምስጋናና የመሸኛ ጸሎቶች'
  ])
FROM liturgies WHERE slug = 'qiddase-dioscoros'
ON CONFLICT (liturgy_id, order_index) DO NOTHING;
