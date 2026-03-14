-- FileCard.app — Migration 005: Offline Sync Tracking
-- Controle de sincronização SQLite ↔ Supabase

-- =============================================
-- SYNC LOG (rastrear o que foi sincronizado)
-- =============================================

CREATE TABLE IF NOT EXISTS sync_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  sync_type TEXT NOT NULL, -- 'push', 'pull', 'full'
  tables_synced TEXT[], -- quais tabelas foram sincronizadas
  records_pushed INTEGER DEFAULT 0,
  records_pulled INTEGER DEFAULT 0,
  conflicts_resolved INTEGER DEFAULT 0,
  status TEXT DEFAULT 'success', -- 'success', 'partial', 'failed'
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_user ON sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_device ON sync_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created ON sync_logs(created_at DESC);

-- =============================================
-- DEVICE REGISTRY
-- =============================================

CREATE TABLE IF NOT EXISTS user_devices (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_name TEXT,
  platform TEXT, -- 'ios', 'android'
  app_version TEXT,
  last_sync_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_devices_user ON user_devices(user_id);

-- =============================================
-- COLLECTION SYNC CHECKPOINTS
-- Para saber de onde retomar sync sem reprocessar tudo
-- =============================================

CREATE TABLE IF NOT EXISTS sync_checkpoints (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  table_name TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ,
  last_remote_version BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, device_id, table_name)
);

-- Adicionar coluna version nas tabelas de coleção do usuário para sync
ALTER TABLE user_collection_items ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 1;
ALTER TABLE user_collection_items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ; -- soft delete para sync
ALTER TABLE user_item_accessories ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 1;
ALTER TABLE user_item_accessories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 1;
ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- RLS
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_checkpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê próprios sync logs" ON sync_logs FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Usuário vê próprios devices" ON user_devices FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Usuário vê próprios checkpoints" ON sync_checkpoints FOR ALL USING (user_id = auth.uid());

-- Trigger: auto-incrementar version em user_collection_items
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = COALESCE(OLD.version, 0) + 1;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_collection_items_version
  BEFORE UPDATE ON user_collection_items
  FOR EACH ROW EXECUTE PROCEDURE increment_version();
