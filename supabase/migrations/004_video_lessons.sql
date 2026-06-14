-- Table for storing video lessons
CREATE TABLE IF NOT EXISTS video_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  youtube_video_id TEXT NOT NULL,
  start_time INTEGER DEFAULT 0,
  title TEXT NOT NULL,
  teacher_name TEXT,
  priority INTEGER DEFAULT 0,
  subject TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for video_lessons
ALTER TABLE video_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Access for Video Lessons"
ON video_lessons FOR SELECT TO public USING (true);

CREATE POLICY "Public Write Access for Video Lessons"
ON video_lessons FOR ALL TO public USING (true) WITH CHECK (true);

-- Table for storing user notes on video lessons
CREATE TABLE IF NOT EXISTS video_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES video_lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  user_notes TEXT,
  timestamp_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for video_notes
ALTER TABLE video_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Access for Video Notes"
ON video_notes FOR SELECT TO public USING (true);

CREATE POLICY "Public Write Access for Video Notes"
ON video_notes FOR ALL TO public USING (true) WITH CHECK (true);
