-- FileCard.app — Migration 008: Analytics & Notifications
-- Eventos de uso + sistema de notificações push

-- =============================================
-- ANALYTICS EVENTS (anon-safe)
-- =============================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_name TEXT NOT NULL, -- 'item_viewed', 'collection_added', 'scanner_used', etc.
  event_properties JSONB,
  platform TEXT, -- 'ios', 'android'
  app_version TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_created ON analytics_events(created_at DESC);

-- =============================================
-- PUSH NOTIFICATION TOKENS
-- =============================================

CREATE TABLE IF NOT EXISTS push_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  token TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'ios', 'android'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON push_tokens(is_active) WHERE is_active = true;

-- =============================================
-- NOTIFICATIONS LOG
-- =============================================

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'price_alert', 'marketplace_offer', 'trade_update', 'system'
  title TEXT NOT NULL,
  body TEXT,
  data JSONB, -- payload adicional (item_id, listing_id, etc.)
  is_read BOOLEAN DEFAULT false,
  sent_via_push BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- =============================================
-- PATRIMÔNIO SNAPSHOT (para gráfico de evolução)
-- =============================================

CREATE TABLE IF NOT EXISTS patrimonio_snapshots (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_brl NUMERIC(12,2) NOT NULL,
  item_count INTEGER NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_user ON patrimonio_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_date ON patrimonio_snapshots(snapshot_date DESC);

-- RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrimonio_snapshots ENABLE ROW LEVEL SECURITY;

-- Analytics: usuário vê próprios eventos; anon insere
CREATE POLICY "Analytics insert" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Usuário vê próprios eventos" ON analytics_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Usuário gerencia próprios tokens" ON push_tokens
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Usuário vê próprias notificações" ON notifications
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Usuário vê próprio patrimônio" ON patrimonio_snapshots
  FOR ALL USING (user_id = auth.uid());

-- =============================================
-- FUNÇÃO: calcular patrimônio atual do usuário
-- =============================================

CREATE OR REPLACE FUNCTION get_user_patrimonio(p_user_id UUID)
RETURNS TABLE (
  total_brl NUMERIC,
  item_count BIGINT,
  top_item_name TEXT,
  top_item_value NUMERIC
) AS $$
  WITH base AS (
    SELECT
      ci.display_name,
      ci.market_value_brl
    FROM user_collection_items uci
    JOIN user_collections uc ON uc.id = uci.user_collection_id
    JOIN catalog_items ci ON ci.id = uci.catalog_item_id
    WHERE uc.user_id = p_user_id
      AND uci.deleted_at IS NULL
  ),
  top_item AS (
    SELECT display_name, market_value_brl
    FROM base
    ORDER BY market_value_brl DESC NULLS LAST
    LIMIT 1
  )
  SELECT
    COALESCE((SELECT SUM(market_value_brl) FROM base), 0) AS total_brl,
    (SELECT COUNT(*) FROM base) AS item_count,
    (SELECT display_name FROM top_item) AS top_item_name,
    (SELECT market_value_brl FROM top_item) AS top_item_value;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =============================================
-- FUNÇÃO: snapshot diário automático (chamado via cron/Edge Function)
-- =============================================

CREATE OR REPLACE FUNCTION take_patrimonio_snapshot(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_total NUMERIC;
  v_count INTEGER;
BEGIN
  SELECT
    COALESCE(SUM(ci.market_value_brl), 0),
    COUNT(uci.id)
  INTO v_total, v_count
  FROM user_collection_items uci
  JOIN user_collections uc ON uc.id = uci.user_collection_id
  JOIN catalog_items ci ON ci.id = uci.catalog_item_id
  WHERE uc.user_id = p_user_id AND uci.deleted_at IS NULL;

  INSERT INTO patrimonio_snapshots (user_id, total_brl, item_count)
    VALUES (p_user_id, v_total, v_count)
    ON CONFLICT (user_id, snapshot_date) DO UPDATE
      SET total_brl = EXCLUDED.total_brl,
          item_count = EXCLUDED.item_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
