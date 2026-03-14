-- FileCard.app — Migration 006: AI Recognition Enhanced
-- Melhorar a tabela de jobs de reconhecimento com embeddings e feedback

-- =============================================
-- Habilitar extensão pgvector (para embeddings futuros)
-- =============================================

CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================
-- MELHORAR AI_RECOGNITION_JOBS
-- =============================================

-- Adicionar colunas à tabela existente
ALTER TABLE ai_recognition_jobs
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS image_storage_path TEXT, -- caminho no Storage
  ADD COLUMN IF NOT EXISTS candidates JSONB, -- top 5 candidatos com scores
  ADD COLUMN IF NOT EXISTS user_confirmed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS feedback_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS processing_time_ms INTEGER,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_ai_jobs_user ON ai_recognition_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON ai_recognition_jobs(status);

-- =============================================
-- EMBEDDINGS DE ITENS (Fase 2 — Scanner IA real)
-- Para busca por similaridade visual
-- =============================================

CREATE TABLE IF NOT EXISTS item_embeddings (
  id SERIAL PRIMARY KEY,
  catalog_item_id INTEGER NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
  embedding vector(1536), -- OpenAI ada-002 ou similar
  embedding_model TEXT DEFAULT 'openai/text-embedding-3-small',
  source_type TEXT DEFAULT 'description', -- 'description', 'photo', 'combined'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_embeddings_item ON item_embeddings(catalog_item_id);
-- Índice HNSW para busca vetorial aproximada
CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON item_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- =============================================
-- FUNÇÃO: buscar itens similares por embedding
-- =============================================

CREATE OR REPLACE FUNCTION match_catalog_items(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.75,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id INTEGER,
  catalog_item_id INTEGER,
  similarity FLOAT
)
LANGUAGE sql STABLE AS $$
  SELECT
    ie.id,
    ie.catalog_item_id,
    1 - (ie.embedding <=> query_embedding) AS similarity
  FROM item_embeddings ie
  WHERE 1 - (ie.embedding <=> query_embedding) > match_threshold
  ORDER BY ie.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- RLS
ALTER TABLE item_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recognition_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Embeddings públicos" ON item_embeddings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuário vê próprios jobs AI" ON ai_recognition_jobs;
CREATE POLICY "Usuário vê próprios jobs AI" ON ai_recognition_jobs
  FOR ALL USING (user_id = auth.uid());
