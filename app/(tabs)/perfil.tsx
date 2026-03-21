import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { Settings, Share2, Star, Trophy, Heart, ChevronRight, Crown, LogOut } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';


const formatBRL = (v: number) => `R$ ${(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  pro: 'Pro 🚀',
  lifetime: 'Lifetime ♾️',
};

const PLAN_COLORS: Record<string, string> = {
  free: '#888',
  pro: theme.colors.primary,
  lifetime: '#FF9800',
};

export default function PerfilScreen() {
  const { user, signOut } = useAuth();
  const userId = user?.id ?? null;

  const { subscription, profile, loading: loadingSub, isPro, plan } = useSubscription(userId);
  const { stats, loading: loadingCol } = useCollection(userId);

  const loading = loadingSub || loadingCol;

  const displayName = profile?.username ?? user?.email?.split('@')[0] ?? 'Colecionador';
  const handle = `@${displayName.toLowerCase().replace(/\s+/g, '')} · GI Joe ARAH`;

  const STATS_DATA = [
    { label: 'Figuras', value: String(stats.totalItems) },
    { label: 'Valor', value: stats.totalMarket > 0 ? formatBRL(stats.totalMarket) : '—' },
    { label: 'Retorno', value: stats.appreciation !== 0 ? `${stats.appreciation >= 0 ? '+' : ''}${stats.appreciation}%` : '—' },
  ];

  const MENU_ITEMS = [
    { icon: <Star size={20} color={theme.colors.primary} />, label: 'Favoritos', count: '' },
    { icon: <Heart size={20} color={theme.colors.primary} />, label: 'Wishlist', count: '' },
    { icon: <Trophy size={20} color={theme.colors.primary} />, label: 'Conquistas', count: '' },
    { icon: <Share2 size={20} color={theme.colors.primary} />, label: 'Compartilhar Coleção' },
    { icon: <Settings size={20} color={theme.colors.primary} />, label: 'Configurações' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.logo}>🎖️ filecard</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Settings size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
          </View>
        ) : (
          <>
            {/* Avatar e nome */}
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>🎖️</Text>
              </View>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.handle}>{handle}</Text>

              {/* Plano atual */}
              <View style={[styles.planBadge, { borderColor: PLAN_COLORS[plan] }]}>
                {(plan === 'pro' || plan === 'lifetime') && (
                  <Crown size={14} color={PLAN_COLORS[plan]} />
                )}
                <Text style={[styles.planText, { color: PLAN_COLORS[plan] }]}>
                  {PLAN_LABELS[plan] ?? 'Free'}
                </Text>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                {STATS_DATA.map((s, i) => (
                  <View key={i} style={styles.statBox}>
                    <Text style={styles.statValue}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.shareBtn}>
                <Share2 size={16} color="#fff" />
                <Text style={styles.shareBtnText}>Compartilhar Coleção</Text>
              </TouchableOpacity>

              {/* Upgrade CTA (só se free) */}
              {!isPro && (
                <TouchableOpacity style={styles.upgradeBtn}>
                  <Crown size={16} color="#fff" />
                  <Text style={styles.upgradeBtnText}>Upgrade para Pro — R$14,90/mês</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Assinatura info (se pro/lifetime) */}
            {isPro && subscription && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ASSINATURA</Text>
                <View style={styles.subscriptionCard}>
                  <Crown size={20} color={PLAN_COLORS[plan]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subscriptionPlan}>{PLAN_LABELS[plan]}</Text>
                    {subscription.ends_at && (
                      <Text style={styles.subscriptionExpiry}>
                        {plan === 'lifetime' ? 'Para sempre ♾️' : `Renova em ${new Date(subscription.ends_at).toLocaleDateString('pt-BR')}`}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Menu */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>MINHA CONTA</Text>
              <View style={styles.menuCard}>
                {MENU_ITEMS.map((item, i) => (
                  <TouchableOpacity key={i} style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuItemBorder]}>
                    <View style={styles.menuIcon}>{item.icon}</View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <View style={styles.menuRight}>
                      {item.count ? (
                        <View style={styles.menuBadge}>
                          <Text style={styles.menuBadgeText}>{item.count}</Text>
                        </View>
                      ) : null}
                      <ChevronRight size={16} color="#ccc" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Logout */}
            {user && (
              <View style={styles.section}>
                <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
                  <LogOut size={18} color="#e53e3e" />
                  <Text style={styles.logoutText}>Sair</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: theme.colors.primary, paddingHorizontal: 16,
    paddingTop: 8, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between',
  },
  logo: { color: '#fff', fontSize: 18, fontWeight: '800' },
  settingsBtn: { padding: 4 },
  loadingContainer: { padding: 60, alignItems: 'center' },
  profileSection: { backgroundColor: '#fff', padding: 24, alignItems: 'center', marginBottom: 8 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 40 },
  name: { fontSize: 22, fontWeight: '800', color: '#000', marginBottom: 4 },
  handle: { fontSize: 14, color: '#666', marginBottom: 10 },
  planBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 20,
  },
  planText: { fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#000' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 2 },
  shareBtn: {
    backgroundColor: theme.colors.primary, borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12,
  },
  shareBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  upgradeBtn: {
    backgroundColor: '#FF9800', borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 4,
  },
  upgradeBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { color: '#666', fontSize: 11, letterSpacing: 2, fontWeight: '700', marginBottom: 10, marginTop: 8 },
  subscriptionCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  subscriptionPlan: { fontSize: 16, fontWeight: '700', color: '#000' },
  subscriptionExpiry: { fontSize: 13, color: '#666', marginTop: 2 },
  menuCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: theme.colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#000' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuBadge: { backgroundColor: theme.colors.primary + '20', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  menuBadgeText: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' },
  logoutBtn: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#e53e3e' },
});
