-- FileCard.app — Migration 003: Storage Buckets & Photo Metadata
-- Configuração de buckets e metadados de fotos

-- =============================================
-- FOTOS / STORAGE METADATA
-- =============================================

-- Tabela de metadados de fotos (o arquivo vai pro Supabase Storage)
CREATE TABLE IF NOT EXISTS item_photos (
  id SERIAL PRIMARY KEY,
  catalog_item_id INTEGER REFERENCES catalog_items(id) ON DELETE CASCADE,
  user_collection_item_id INTEGER REFERENCES user_collection_items(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL, -- caminho no bucket do Supabase Storage
  bucket_name TEXT NOT NULL DEFAULT 'item-photos',
  photo_type TEXT DEFAULT 'user', -- 'official', 'user', 'press_kit'
  is_primary BOOLEAN DEFAULT false,
  width INTEGER,
  height INTEGER,
  size_bytes INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_item_photos_catalog ON item_photos(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_item_photos_collection_item ON item_photos(user_collection_item_id);
CREATE INDEX IF NOT EXISTS idx_item_photos_user ON item_photos(uploaded_by);

-- RLS
ALTER TABLE item_photos ENABLE ROW LEVEL SECURITY;

-- Fotos públicas são visíveis a todos
CREATE POLICY "Fotos públicas visíveis" ON item_photos
  FOR SELECT USING (is_public = true OR uploaded_by = auth.uid());

-- Usuário pode inserir suas próprias fotos
CREATE POLICY "Usuário insere fotos" ON item_photos
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- Usuário pode deletar suas próprias fotos
CREATE POLICY "Usuário deleta fotos" ON item_photos
  FOR DELETE USING (uploaded_by = auth.uid());

-- =============================================
-- CRIAR BUCKETS VIA SQL (Supabase Storage API)
-- =============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'item-photos',
  'item-photos',
  false,
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Bucket público para fotos de catálogo (press kit / oficiais)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'catalog-photos',
  'catalog-photos',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies (via storage.objects)
CREATE POLICY "Usuário upload fotos pessoais"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'item-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuário lê próprias fotos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'item-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Fotos catálogo públicas"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'catalog-photos');
