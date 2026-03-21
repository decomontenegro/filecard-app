import { useState, useEffect, useCallback } from 'react';
import {
  getPatrimonioSnapshot,
  savePatrimonioSnapshot,
  getTopValorizadas,
  calcPatrimonioLive,
  PatrimonioSnapshot,
} from '@/lib/supabase-queries';

export interface TopItem {
  id: string;
  catalog_item?: { display_name: string; year: number; image_url?: string };
  price_paid?: number;
  market_value?: number;
  appreciation_pct: number;
  appreciation_brl: number;
  primary_photo_url?: string;
}

export function usePatrimonio(userId: string | null) {
  const [snapshot, setSnapshot] = useState<PatrimonioSnapshot | null>(null);
  const [live, setLive] = useState<{ totalPaid: number; totalMarket: number; itemCount: number } | null>(null);
  const [topValorizadas, setTopValorizadas] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [snap, liveData, top] = await Promise.all([
        getPatrimonioSnapshot(userId),
        calcPatrimonioLive(userId),
        getTopValorizadas(userId, 5),
      ]);
      setSnapshot(snap);
      setLive(liveData);
      setTopValorizadas(top as TopItem[]);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar patrimônio');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [userId]);

  const takeSnapshot = useCallback(async () => {
    if (!userId) return;
    try {
      await savePatrimonioSnapshot(userId);
      const snap = await getPatrimonioSnapshot(userId);
      setSnapshot(snap);
    } catch (e: any) {
      // silencioso — snapshot é best-effort
    }
  }, [userId]);

  // Dados consolidados: preferir live (mais atualizado) mas fallback pro snapshot
  const totalMarket = live?.totalMarket ?? snapshot?.total_value_brl ?? 0;
  const totalPaid = live?.totalPaid ?? 0;
  const itemCount = live?.itemCount ?? snapshot?.item_count ?? 0;
  const appreciation = totalPaid > 0 ? Math.round((totalMarket - totalPaid) / totalPaid * 100) : 0;

  return {
    snapshot,
    live,
    topValorizadas,
    loading,
    error,
    totalMarket,
    totalPaid,
    itemCount,
    appreciation,
    takeSnapshot,
    refresh: load,
  };
}
