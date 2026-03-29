-- Migration 011: Add required_for_complete and display_order to accessories
ALTER TABLE public.accessories ADD COLUMN IF NOT EXISTS required_for_complete BOOLEAN DEFAULT TRUE;
ALTER TABLE public.accessories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
