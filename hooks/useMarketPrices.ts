import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MarketPriceEntry {
  condition_grade: string;
  price_brl: number;
  source: string;
  fetched_at: string;
}

interface UseMarketPricesResult {
  prices: MarketPriceEntry[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Cache TTL ────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function isFresh(fetchedAt: string): boolean {
  return Date.now() - new Date(fetchedAt).getTime() < CACHE_TTL_MS;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMarketPrices(
  catalogItemId: string | null,
  itemName: string = ''
): UseMarketPricesResult {
  const [prices, setPrices] = useState<MarketPriceEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!catalogItemId) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Check local cache in market_prices table
      const { data: cached, error: cacheError } = await supabase
        .from('market_prices')
        .select('condition_grade, price_brl, source, fetched_at')
        .eq('catalog_item_id', catalogItemId)
        .order('condition_grade', { ascending: false });

      if (cacheError) throw cacheError;

      const cachedRows: MarketPriceEntry[] = cached ?? [];

      // If we have results and the most recent one is still fresh, use the cache
      if (cachedRows.length > 0) {
        const mostRecent = cachedRows.reduce((latest, row) =>
          new Date(row.fetched_at) > new Date(latest.fetched_at) ? row : latest
        );

        if (isFresh(mostRecent.fetched_at)) {
          setPrices(cachedRows);
          setLoading(false);
          return;
        }
      }

      // 2. Cache is stale or empty — call the Edge Function
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke(
        'ebay-prices',
        {
          body: {
            catalog_item_id: catalogItemId,
            name: itemName,
          },
        }
      );

      if (edgeError) throw edgeError;

      // 3. Re-read fresh data from the table (Edge Function writes to it)
      const { data: fresh, error: freshError } = await supabase
        .from('market_prices')
        .select('condition_grade, price_brl, source, fetched_at')
        .eq('catalog_item_id', catalogItemId)
        .order('condition_grade', { ascending: false });

      if (freshError) throw freshError;

      setPrices(fresh ?? []);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao buscar preços';
      setError(message);
      // On error, still show whatever was cached (possibly stale)
      try {
        const { data: fallback } = await supabase
          .from('market_prices')
          .select('condition_grade, price_brl, source, fetched_at')
          .eq('catalog_item_id', catalogItemId)
          .order('condition_grade', { ascending: false });
        if (fallback && fallback.length > 0) {
          setPrices(fallback);
        }
      } catch {
        // no-op — already set the error above
      }
    } finally {
      setLoading(false);
    }
  }, [catalogItemId, itemName]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { prices, loading, error, refetch: fetch };
}
