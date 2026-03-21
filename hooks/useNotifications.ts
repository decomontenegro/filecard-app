import { useState, useEffect, useCallback } from 'react';
import {
  getUnreadNotifications,
  markNotificationRead,
  Notification,
} from '@/lib/supabase-queries';

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getUnreadNotifications(userId);
      setNotifications(data);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [userId]);

  const markRead = useCallback(async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e: any) {
      // silencioso
    }
  }, []);

  const markAllRead = useCallback(async () => {
    for (const n of notifications) {
      await markNotificationRead(n.id).catch(() => {});
    }
    setNotifications([]);
  }, [notifications]);

  return {
    notifications,
    unreadCount: notifications.length,
    loading,
    error,
    markRead,
    markAllRead,
    refresh: load,
  };
}
