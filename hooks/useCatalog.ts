import { useState, useEffect, useCallback } from 'react';
import { getCatalogItems, CatalogItem } from '@/lib/supabase-queries';

interface UseCatalogOptions {
  search?: string;
  year?: number;
  franchise?: string;
  pageSize?: number;
}

export function useCatalog(options: UseCatalogOptions = {}) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const pageSize = options.pageSize ?? 20;

  const load = useCallback(async (reset = false) => {
    const currentPage = reset ? 0 : page;
    if (reset) {
      setLoading(true);
      setPage(0);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const data = await getCatalogItems({
        search: options.search,
        year: options.year,
        franchise: options.franchise,
        page: currentPage,
        pageSize,
      });

      if (reset) {
        setItems(data);
      } else {
        setItems(prev => [...prev, ...data]);
      }
      setHasMore(data.length === pageSize);
      if (!reset) setPage(p => p + 1);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar catálogo');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [options.search, options.year, options.franchise, page, pageSize]);

  // Reload when filters change
  useEffect(() => {
    load(true);
  }, [options.search, options.year, options.franchise]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) load(false);
  }, [loadingMore, hasMore, load]);

  const refresh = useCallback(() => load(true), [load]);

  return { items, loading, loadingMore, error, hasMore, loadMore, refresh };
}
