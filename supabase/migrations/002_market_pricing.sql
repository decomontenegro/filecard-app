-- FileCard.app — Migration 002: Market Pricing & eBay Cache
-- Tabelas para cache de preços de mercado (eBay/ML)

-- =============================================
-- PREÇOS DE MERCADO (cache eBay)
-- =============================================

CREATE TABLE IF NOT EXISTS market_prices (
  id SERIAL PRIMARY KEY,
  catalog_item_id INTEGER NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'ebay', -- 'ebay', 'mercadolivre', 'manual'
  condition_grade TEXT, -- 'C10', 'C9', 'C8', etc. NULL = média geral
  price_usd NUMERIC(10,2),
  price_brl NUMERIC(10,2),
  sample_count INTEGER DEFAULT 1,
  raw_data JSONB, -- resposta bruta da API (para auditoria)
  fetched_at TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_market_prices_item ON market_prices(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_market_prices_fetched ON market_prices(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_prices_valid ON market_prices(valid_until);

-- Tabela para log de buscas eBay (rate limit tracking)
CREATE TABLE IF NOT EXISTS ebay_search_log (
  id SERIAL PRIMARY KEY,
  search_query TEXT NOT NULL,
  catalog_item_id INTEGER REFERENCES catalog_items(id),
  status TEXT DEFAULT 'success', -- 'success', 'error', 'rate_limited'
  result_count INTEGER DEFAULT 0,
  error_message TEXT,
  searched_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: market_prices é público (leitura)
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ebay_search_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Preços públicos" ON market_prices FOR SELECT USING (true);
CREATE POLICY "eBay log service only" ON ebay_search_log FOR ALL USING (false);
