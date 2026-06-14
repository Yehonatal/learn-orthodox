-- Table for storing user study notes, reflections, and saved AI commentaries
CREATE TABLE IF NOT EXISTS study_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID REFERENCES liturgy_units(id) ON DELETE SET NULL,
  liturgy_slug TEXT NOT NULL,
  section_slug TEXT NOT NULL,
  passage_gez TEXT,
  passage_am TEXT,
  passage_en TEXT,
  title TEXT NOT NULL,
  commentary_core TEXT,
  commentary_context TEXT,
  commentary_symbolism TEXT,
  user_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security) if auth is present, but for now make it open for public insert/select/update/delete
ALTER TABLE study_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read/Write Access"
ON study_notes
AS PERMISSIVE
FOR ALL
TO public
USING (true)
WITH CHECK (true);
