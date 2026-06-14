CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE liturgy_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID REFERENCES liturgy_units(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('en', 'am', 'gez')),
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(unit_id, language)
);

-- ANN index (tune `lists` after data load: sqrt of row count is a good starting point)
CREATE INDEX ON liturgy_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Semantic search helper function
CREATE OR REPLACE FUNCTION search_liturgy(
  query_embedding vector(1536),
  match_language TEXT DEFAULT 'en',
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  unit_id UUID,
  text_en TEXT,
  text_am TEXT,
  text_gez TEXT,
  role TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE AS $$
  SELECT
    lu.id, lu.text_en, lu.text_am, lu.text_gez, lu.role,
    1 - (le.embedding <=> query_embedding) AS similarity
  FROM liturgy_embeddings le
  JOIN liturgy_units lu ON lu.id = le.unit_id
  WHERE le.language = match_language
  ORDER BY le.embedding <=> query_embedding
  LIMIT match_count;
$$;
