-- Migration 010: condition_details (granular condition per part)
CREATE TABLE IF NOT EXISTS public.condition_details (
  id BIGSERIAL PRIMARY KEY,
  user_collection_item_id BIGINT NOT NULL REFERENCES public.user_collection_items(id) ON DELETE CASCADE,
  joints_condition TEXT CHECK (joints_condition IN ('firm','loose','stuck','broken')) DEFAULT 'firm',
  thumbs_condition TEXT CHECK (thumbs_condition IN ('intact','worn','broken','missing')) DEFAULT 'intact',
  paint_condition TEXT CHECK (paint_condition IN ('excellent','good','worn','poor')) DEFAULT 'good',
  heel_condition TEXT CHECK (heel_condition IN ('intact','cracked','broken')) DEFAULT 'intact',
  cracks TEXT,
  underwear_condition TEXT CHECK (underwear_condition IN ('intact','worn','torn','missing')) DEFAULT 'intact',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.condition_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own condition_details" ON public.condition_details
  USING (
    EXISTS (
      SELECT 1 FROM public.user_collection_items uci
      JOIN public.user_collections uc ON uc.id = uci.user_collection_id
      WHERE uci.id = condition_details.user_collection_item_id
      AND uc.user_id = auth.uid()
    )
  );
