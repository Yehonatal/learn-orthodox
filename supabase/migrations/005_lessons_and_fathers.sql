-- Create table for orthodox basic lessons
CREATE TABLE IF NOT EXISTS orthodox_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for orthodox_lessons
ALTER TABLE orthodox_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Access for Orthodox Lessons"
ON orthodox_lessons FOR SELECT TO public USING (true);

CREATE POLICY "Public Write Access for Orthodox Lessons"
ON orthodox_lessons FOR ALL TO public USING (true) WITH CHECK (true);


-- Create table for church fathers
CREATE TABLE IF NOT EXISTS church_fathers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  pdf_link TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for church_fathers
ALTER TABLE church_fathers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Access for Church Fathers"
ON church_fathers FOR SELECT TO public USING (true);

CREATE POLICY "Public Write Access for Church Fathers"
ON church_fathers FOR ALL TO public USING (true) WITH CHECK (true);
