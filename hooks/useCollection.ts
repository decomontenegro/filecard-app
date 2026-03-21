import { useState, useEffect, useCallback } from 'react';
import {
  getCollectionItems,
  addToCollection,
  updateCollectionItem,
  removeFromCollection,
  CollectionItem,
} from '@/lib/supabase-queries';

export function useCollection(userId: string | null) {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getCollectionItems(userId);
      setItems(data);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar coleção');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [userId]);

  const add = useCallback(async (catalogItemId: string, condition = 'C8', pricePaid?: number) => {
    if (!userId) throw new Error('Usuário não autenticado');
    const item = await addToCollection(userId, catalogItemId, condition, pricePaid);
    await load(); // recarregar para pegar dados completos com joins
    return item;
  }, [userId, load]);

  const update = useCallback(async (id: string, updates: Partial<Pick<CollectionItem, 'condition_grade' | 'price_paid' | 'notes'>>) => {
    await updateCollectionItem(id, updates);
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, []);

  const remove = useCallback(async (id: string) => {
    await removeFromCollection(id);
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  // Stats derivadas
  const stats = {
    totalItems: items.length,
    totalPaid: items.reduce((acc, i) => acc + (i.price_paid ?? 0), 0),
    totalMarket: items.reduce((acc, i) => acc + (i.market_value ?? 0), 0),
    appreciation: (() => {
      const paid = items.reduce((acc, i) => acc + (i.price_paid ?? 0), 0);
      const market = items.reduce((acc, i) => acc + (i.market_value ?? 0), 0);
      return paid > 0 ? Math.round((market - paid) / paid * 100) : 0;
    })(),
  };

  return { items, loading, error, stats, add, update, remove, refresh: load };
}
