-- Migration 009: Add unique constraint on market_prices for upsert support
-- Needed by ebay-prices Edge Function to upsert without duplicates

-- Remove duplicate rows first (keep most recent per item+condition)
DELETE FROM market_prices
WHERE id NOT IN (
  SELECT DISTINCT ON (catalog_item_id, condition_grade) id
  FROM market_prices
  ORDER BY catalog_item_id, condition_grade, fetched_at DESC
);

-- Add unique constraint
ALTER TABLE market_prices
  ADD CONSTRAINT market_prices_item_condition_unique
  UNIQUE (catalog_item_id, condition_grade);
