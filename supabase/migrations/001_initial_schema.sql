-- FileCard.app — Initial Schema (Supabase/PostgreSQL)
-- Espelha o schema SQLite local para sync

-- =============================================
-- CATÁLOGO GLOBAL
-- =============================================

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id INTEGER REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS franchises (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  country_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_lines (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  franchise_id INTEGER REFERENCES franchises(id),
  brand_id INTEGER REFERENCES brands(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  start_year INTEGER,
  end_year INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS releases (
  id SERIAL PRIMARY KEY,
  product_line_id INTEGER NOT NULL REFERENCES product_lines(id),
  name TEXT NOT NULL,
  release_type TEXT DEFAULT 'wave',
  year INTEGER,
  sequence INTEGER,
  region TEXT DEFAULT 'US',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalog_items (
  id SERIAL PRIMARY KEY,
  product_line_id INTEGER NOT NULL REFERENCES product_lines(id),
  release_id INTEGER REFERENCES releases(id),
  canonical_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  reference_code TEXT,
  year INTEGER,
  era TEXT,
  description TEXT,
  rarity_level INTEGER DEFAULT 3,
  complexity_score INTEGER DEFAULT 3,
  market_value_brl NUMERIC(10,2),
  image_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS item_variants (
  id SERIAL PRIMARY KEY,
  catalog_item_id INTEGER NOT NULL REFERENCES catalog_items(id),
  variant_name TEXT NOT NULL,
  variant_type TEXT,
  region TEXT,
  distinguishing_features TEXT,
  notes TEXT,
  confidence_level INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accessories (
  id SERIAL PRIMARY KEY,
  catalog_item_id INTEGER NOT NULL REFERENCES catalog_items(id),
  name TEXT NOT NULL,
  accessory_type TEXT,
  required_for_complete BOOLEAN DEFAULT true,
  rarity_level INTEGER DEFAULT 3,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- COLEÇÃO DO USUÁRIO (vinculada ao auth.users)
-- =============================================

CREATE TABLE IF NOT EXISTS user_collections (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Minha Coleção',
  description TEXT,
  visibility TEXT DEFAULT 'private',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_collection_items (
  id SERIAL PRIMARY KEY,
  user_collection_id INTEGER NOT NULL REFERENCES user_collections(id) ON DELETE CASCADE,
  catalog_item_id INTEGER NOT NULL REFERENCES catalog_items(id),
  variant_id INTEGER REFERENCES item_variants(id),
  condition_grade TEXT DEFAULT 'C5',
  completeness_status TEXT DEFAULT 'incomplete',
  acquisition_type TEXT DEFAULT 'purchased',
  acquisition_date DATE,
  price_paid NUMERIC(10,2) DEFAULT 0,
  storage_location TEXT,
  private_notes TEXT,
  provenance_notes TEXT,
  is_duplicate BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  photo_url TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_item_accessories (
  id SERIAL PRIMARY KEY,
  user_collection_item_id INTEGER NOT NULL REFERENCES user_collection_items(id) ON DELETE CASCADE,
  accessory_id INTEGER NOT NULL REFERENCES accessories(id),
  status TEXT DEFAULT 'unknown',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- WISHLIST
-- =============================================

CREATE TABLE IF NOT EXISTS wishlist_items (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  catalog_item_id INTEGER NOT NULL REFERENCES catalog_items(id),
  variant_id INTEGER REFERENCES item_variants(id),
  priority INTEGER DEFAULT 3,
  target_condition TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- AI RECOGNITION
-- =============================================

CREATE TABLE IF NOT EXISTS ai_recognition_jobs (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'queued',
  input_image_uri TEXT,
  model_version TEXT,
  raw_output JSONB,
  top_candidate_id INTEGER REFERENCES catalog_items(id),
  confidence_score NUMERIC(5,4),
  confirmed_item_id INTEGER REFERENCES user_collection_items(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- =============================================
-- ÍNDICES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_catalog_items_product_line ON catalog_items(product_line_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_year ON catalog_items(year);
CREATE INDEX IF NOT EXISTS idx_catalog_items_slug ON catalog_items(slug);
CREATE INDEX IF NOT EXISTS idx_user_collection_items_catalog ON user_collection_items(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_user_collection_items_collection ON user_collection_items(user_collection_id);
CREATE INDEX IF NOT EXISTS idx_accessories_item ON accessories(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_item_variants_item ON item_variants(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_user ON user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id);

-- =============================================
-- RLS (Row Level Security)
-- =============================================

ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_item_accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recognition_jobs ENABLE ROW LEVEL SECURITY;

-- Catálogo é público (leitura)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessories ENABLE ROW LEVEL SECURITY;

-- Policies: catálogo = leitura pública
CREATE POLICY "Catálogo público" ON categories FOR SELECT USING (true);
CREATE POLICY "Catálogo público" ON franchises FOR SELECT USING (true);
CREATE POLICY "Catálogo público" ON brands FOR SELECT USING (true);
CREATE POLICY "Catálogo público" ON product_lines FOR SELECT USING (true);
CREATE POLICY "Catálogo público" ON releases FOR SELECT USING (true);
CREATE POLICY "Catálogo público" ON catalog_items FOR SELECT USING (true);
CREATE POLICY "Catálogo público" ON item_variants FOR SELECT USING (true);
CREATE POLICY "Catálogo público" ON accessories FOR SELECT USING (true);

-- Policies: dados do usuário = só o dono
CREATE POLICY "Usuário vê própria coleção" ON user_collections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuário vê próprios itens" ON user_collection_items
  FOR ALL USING (
    user_collection_id IN (
      SELECT id FROM user_collections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Usuário vê próprios acessórios" ON user_item_accessories
  FOR ALL USING (
    user_collection_item_id IN (
      SELECT uci.id FROM user_collection_items uci
      JOIN user_collections uc ON uc.id = uci.user_collection_id
      WHERE uc.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuário vê própria wishlist" ON wishlist_items
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuário vê próprios jobs AI" ON ai_recognition_jobs
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- SEED DATA
-- =============================================

INSERT INTO categories (name, slug) VALUES
  ('Action Figures', 'action-figures'),
  ('Cards', 'cards'),
  ('Veículos', 'veiculos')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO franchises (name, slug, description) VALUES
  ('G.I. Joe', 'gi-joe', 'G.I. Joe: A Real American Hero — linha da Hasbro de 1982')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO brands (name, slug, country_code) VALUES
  ('Hasbro', 'hasbro', 'US'),
  ('Estrela', 'estrela', 'BR')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_lines (category_id, franchise_id, brand_id, name, slug, start_year, end_year) VALUES
  (1, 1, 1, 'G.I. Joe A Real American Hero', 'gi-joe-arah', 1982, 1994)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO releases (product_line_id, name, year, sequence) VALUES
  (1, 'ARAH Wave 1', 1982, 1),
  (1, 'ARAH Wave 2', 1983, 2),
  (1, 'ARAH Wave 3', 1984, 3),
  (1, 'ARAH Wave 4', 1985, 4),
  (1, 'ARAH Wave 5', 1986, 5)
ON CONFLICT DO NOTHING;
