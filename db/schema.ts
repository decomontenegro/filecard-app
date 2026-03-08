// FileCard — Database Schema
// Separação crítica: catálogo global ≠ posse individual do usuário

export const CREATE_TABLES = `
  PRAGMA journal_mode=WAL;
  PRAGMA foreign_keys=ON;

  -- =============================================
  -- CATÁLOGO GLOBAL
  -- =============================================

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    parent_id INTEGER REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS franchises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    country_code TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS product_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    franchise_id INTEGER REFERENCES franchises(id),
    brand_id INTEGER REFERENCES brands(id),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    start_year INTEGER,
    end_year INTEGER,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS releases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_line_id INTEGER NOT NULL REFERENCES product_lines(id),
    name TEXT NOT NULL,
    release_type TEXT DEFAULT 'wave',
    year INTEGER,
    sequence INTEGER,
    region TEXT DEFAULT 'US',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS catalog_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    market_value_brl REAL,
    image_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS item_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    catalog_item_id INTEGER NOT NULL REFERENCES catalog_items(id),
    variant_name TEXT NOT NULL,
    variant_type TEXT,
    region TEXT,
    distinguishing_features TEXT,
    notes TEXT,
    confidence_level INTEGER DEFAULT 3,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS accessories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    catalog_item_id INTEGER NOT NULL REFERENCES catalog_items(id),
    name TEXT NOT NULL,
    accessory_type TEXT,
    required_for_complete INTEGER DEFAULT 1,
    rarity_level INTEGER DEFAULT 3,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- =============================================
  -- COLEÇÃO DO USUÁRIO
  -- =============================================

  CREATE TABLE IF NOT EXISTS user_collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL DEFAULT 'Minha Coleção',
    description TEXT,
    visibility TEXT DEFAULT 'private',
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_collection_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_collection_id INTEGER NOT NULL REFERENCES user_collections(id),
    catalog_item_id INTEGER NOT NULL REFERENCES catalog_items(id),
    variant_id INTEGER REFERENCES item_variants(id),
    condition_grade TEXT DEFAULT 'C5',
    completeness_status TEXT DEFAULT 'incomplete',
    acquisition_type TEXT DEFAULT 'purchased',
    acquisition_date TEXT,
    price_paid REAL DEFAULT 0,
    storage_location TEXT,
    private_notes TEXT,
    provenance_notes TEXT,
    is_duplicate INTEGER DEFAULT 0,
    is_favorite INTEGER DEFAULT 0,
    is_public INTEGER DEFAULT 0,
    photo_url TEXT,
    synced_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_item_accessories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_collection_item_id INTEGER NOT NULL REFERENCES user_collection_items(id),
    accessory_id INTEGER NOT NULL REFERENCES accessories(id),
    status TEXT DEFAULT 'unknown',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- =============================================
  -- WISHLIST
  -- =============================================

  CREATE TABLE IF NOT EXISTS wishlist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    catalog_item_id INTEGER NOT NULL REFERENCES catalog_items(id),
    variant_id INTEGER REFERENCES item_variants(id),
    priority INTEGER DEFAULT 3,
    target_condition TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- =============================================
  -- AI RECOGNITION (preparar estrutura)
  -- =============================================

  CREATE TABLE IF NOT EXISTS ai_recognition_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT DEFAULT 'queued',
    input_image_uri TEXT,
    model_version TEXT,
    raw_output TEXT,
    top_candidate_id INTEGER REFERENCES catalog_items(id),
    confidence_score REAL,
    confirmed_item_id INTEGER REFERENCES user_collection_items(id),
    created_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
  );

  -- =============================================
  -- ÍNDICES
  -- =============================================

  CREATE INDEX IF NOT EXISTS idx_catalog_items_product_line ON catalog_items(product_line_id);
  CREATE INDEX IF NOT EXISTS idx_catalog_items_year ON catalog_items(year);
  CREATE INDEX IF NOT EXISTS idx_user_collection_items_catalog ON user_collection_items(catalog_item_id);
  CREATE INDEX IF NOT EXISTS idx_user_collection_items_collection ON user_collection_items(user_collection_id);
  CREATE INDEX IF NOT EXISTS idx_accessories_item ON accessories(catalog_item_id);
  CREATE INDEX IF NOT EXISTS idx_item_variants_item ON item_variants(catalog_item_id);
`;

export const SEED_DATA = `
  -- Categorias
  INSERT OR IGNORE INTO categories (id, name, slug) VALUES
    (1, 'Action Figures', 'action-figures'),
    (2, 'Cards', 'cards'),
    (3, 'Veículos', 'veiculos');

  -- Franquias
  INSERT OR IGNORE INTO franchises (id, name, slug, description) VALUES
    (1, 'G.I. Joe', 'gi-joe', 'G.I. Joe: A Real American Hero — linha da Hasbro de 1982');

  -- Marcas
  INSERT OR IGNORE INTO brands (id, name, slug, country_code) VALUES
    (1, 'Hasbro', 'hasbro', 'US'),
    (2, 'Estrela', 'estrela', 'BR');

  -- Linha
  INSERT OR IGNORE INTO product_lines (id, category_id, franchise_id, brand_id, name, slug, start_year, end_year) VALUES
    (1, 1, 1, 1, 'G.I. Joe A Real American Hero', 'gi-joe-arah', 1982, 1994);

  -- Releases/waves
  INSERT OR IGNORE INTO releases (id, product_line_id, name, year, sequence) VALUES
    (1, 1, 'ARAH Wave 1', 1982, 1),
    (2, 1, 'ARAH Wave 2', 1983, 2),
    (3, 1, 'ARAH Wave 3', 1984, 3),
    (4, 1, 'ARAH Wave 4', 1985, 4),
    (5, 1, 'ARAH Wave 5', 1986, 5);

  -- Coleção padrão
  INSERT OR IGNORE INTO user_collections (id, name, visibility) VALUES
    (1, 'Minha Coleção', 'private');
`;
