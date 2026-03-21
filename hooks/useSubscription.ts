import { useState, useEffect, useCallback } from 'react';
import { getUserSubscription, getUserProfile, UserSubscription, UserProfile } from '@/lib/supabase-queries';

export function useSubscription(userId: string | null) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
      const [sub, prof] = await Promise.all([
        getUserSubscription(userId),
        getUserProfile(userId),
      ]);
      setSubscription(sub);
      setProfile(prof);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar assinatura');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [userId]);

  const isPro = subscription?.plan === 'pro' || subscription?.plan === 'lifetime';
  const isLifetime = subscription?.plan === 'lifetime';
  const plan = subscription?.plan ?? 'free';

  return {
    subscription,
    profile,
    loading,
    error,
    isPro,
    isLifetime,
    plan,
    refresh: load,
  };
}
