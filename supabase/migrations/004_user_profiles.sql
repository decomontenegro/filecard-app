-- FileCard.app — Migration 004: User Profiles & Settings
-- Perfil público do colecionador + preferências

-- =============================================
-- PERFIL DO USUÁRIO
-- =============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  collecting_since INTEGER, -- ano que começou a colecionar
  favorite_franchise TEXT,
  is_public BOOLEAN DEFAULT false,
  showcase_collection_id INTEGER REFERENCES user_collections(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- =============================================
-- PREFERÊNCIAS DO USUÁRIO
-- =============================================

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  currency TEXT DEFAULT 'BRL', -- 'BRL', 'USD'
  language TEXT DEFAULT 'pt-BR',
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  notify_price_alerts BOOLEAN DEFAULT true,
  notify_wishlist_available BOOLEAN DEFAULT true,
  default_condition TEXT DEFAULT 'C8',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SUBSCRIPTION / PLANO
-- =============================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free', -- 'free', 'pro', 'lifetime'
  status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'trialing'
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON user_subscriptions(user_id);

-- RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Perfis públicos visíveis a todos
CREATE POLICY "Perfil público visível" ON user_profiles
  FOR SELECT USING (is_public = true OR id = auth.uid());

CREATE POLICY "Usuário edita próprio perfil" ON user_profiles
  FOR ALL USING (id = auth.uid());

CREATE POLICY "Usuário vê próprias preferências" ON user_preferences
  FOR ALL USING (id = auth.uid());

CREATE POLICY "Usuário vê própria assinatura" ON user_subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- =============================================
-- TRIGGER: criar perfil ao registrar
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name)
    VALUES (new.id, new.raw_user_meta_data->>'display_name');
  INSERT INTO user_preferences (id)
    VALUES (new.id);
  INSERT INTO user_subscriptions (user_id, plan, status)
    VALUES (new.id, 'free', 'active');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
