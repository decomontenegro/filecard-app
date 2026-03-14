-- FileCard.app — Migration 007: Community & Marketplace
-- Listings de venda/troca entre colecionadores

-- =============================================
-- MARKETPLACE LISTINGS
-- =============================================

CREATE TABLE IF NOT EXISTS marketplace_listings (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_collection_item_id INTEGER REFERENCES user_collection_items(id),
  catalog_item_id INTEGER NOT NULL REFERENCES catalog_items(id),
  listing_type TEXT NOT NULL DEFAULT 'sale', -- 'sale', 'trade', 'sale_or_trade'
  asking_price_brl NUMERIC(10,2),
  condition_grade TEXT,
  completeness TEXT DEFAULT 'complete', -- 'complete', 'incomplete', 'loose'
  description TEXT,
  photos TEXT[], -- storage paths
  location_city TEXT,
  location_state TEXT,
  ships_nationwide BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active', -- 'active', 'reserved', 'sold', 'cancelled'
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  sold_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_listings_user ON marketplace_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_catalog ON marketplace_listings(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created ON marketplace_listings(created_at DESC);

-- =============================================
-- PRICE ALERTS (wishlist → notify quando aparecer)
-- =============================================

CREATE TABLE IF NOT EXISTS price_alerts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  catalog_item_id INTEGER NOT NULL REFERENCES catalog_items(id),
  target_price_brl NUMERIC(10,2), -- NULL = qualquer preço
  target_condition TEXT, -- NULL = qualquer condição
  is_active BOOLEAN DEFAULT true,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_item ON price_alerts(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(is_active) WHERE is_active = true;

-- =============================================
-- TRADE INTERESTS (trocar itens)
-- =============================================

CREATE TABLE IF NOT EXISTS trade_interests (
  id SERIAL PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id),
  listing_id INTEGER NOT NULL REFERENCES marketplace_listings(id),
  offer_item_ids INTEGER[], -- IDs dos itens da coleção do requester
  message TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_interests ENABLE ROW LEVEL SECURITY;

-- Listings ativos são públicos
CREATE POLICY "Listings ativos públicos" ON marketplace_listings
  FOR SELECT USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Usuário gerencia próprios listings" ON marketplace_listings
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Usuário gerencia próprios alertas" ON price_alerts
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Usuário vê trades relevantes" ON trade_interests
  FOR SELECT USING (
    requester_id = auth.uid() OR
    listing_id IN (
      SELECT id FROM marketplace_listings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Usuário cria trades" ON trade_interests
  FOR INSERT WITH CHECK (requester_id = auth.uid());
