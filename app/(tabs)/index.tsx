import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { TrendingUp, Package, Plus, BookOpen, Camera, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { usePatrimonio } from '../../hooks/usePatrimonio';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useSubscription } from '../../hooks/useSubscription';


const formatBRL = (v: number) =>
  `R$ ${(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const { totalMarket, totalPaid, itemCount, appreciation, topValorizadas, loading } = usePatrimonio(userId);
  const { unreadCount } = useNotifications(userId);
  const { plan } = useSubscription(userId);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>filecard</Text>
          <View style={styles.headerRight}>
            {plan === 'pro' || plan === 'lifetime' ? (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            ) : null}
            {unreadCount > 0 && (
              <View style={styles.bellContainer}>
                <Bell size={20} color="#fff" />
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
          </View>
        ) : (
          <>
            {/* Hero patrimônio */}
            {itemCount > 0 && (
              <View style={styles.heroCard}>
                <Text style={styles.heroLabel}>SUA COLEÇÃO VALE</Text>
                <Text style={styles.heroValue}>{formatBRL(totalMarket)}</Text>
                <View style={styles.heroStats}>
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatLabel}>INVESTIDO</Text>
                    <Text style={styles.heroStatValue}>{formatBRL(totalPaid)}</Text>
                  </View>
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatLabel}>VALORIZAÇÃO</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={styles.heroStatValue}>{appreciation >= 0 ? '+' : ''}{appreciation}%</Text>
                      <TrendingUp size={16} color="#fff" />
                    </View>
                  </View>
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatLabel}>FIGURAS</Text>
                    <Text style={styles.heroStatValue}>{itemCount}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Atalhos rápidos */}
            <Text style={styles.sectionLabel}>AÇÕES RÁPIDAS</Text>
            <View style={styles.shortcuts}>
              <TouchableOpacity style={styles.shortcut} onPress={() => router.push('/(tabs)/scanner')}>
                <Camera size={24} color={theme.colors.primary} />
                <Text style={styles.shortcutText}>Escanear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shortcut} onPress={() => router.push('/(tabs)/catalogo')}>
                <BookOpen size={24} color={theme.colors.primary} />
                <Text style={styles.shortcutText}>Catálogo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shortcut} onPress={() => router.push('/(tabs)/colecao')}>
                <Package size={24} color={theme.colors.primary} />
                <Text style={styles.shortcutText}>Coleção</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shortcut} onPress={() => router.push('/(tabs)/scanner')}>
                <Plus size={24} color={theme.colors.primary} />
                <Text style={styles.shortcutText}>Adicionar</Text>
              </TouchableOpacity>
            </View>

            {/* Top valorizadas */}
            {topValorizadas.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>TOP VALORIZADAS</Text>
                <View style={styles.topList}>
                  {topValorizadas.map((item, i) => (
                    <View key={item.id} style={styles.topItem}>
                      <Text style={styles.topMedal}>{['1','2','3','4','5'][i]}</Text>
                      <Text style={styles.topName} numberOfLines={1}>
                        {item.catalog_item?.display_name ?? 'Figura'}
                      </Text>
                      <View style={styles.appreciationPill}>
                        <Text style={styles.appreciationText}>+{item.appreciation_pct}%</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Empty state */}
            {itemCount === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>*</Text>
                <Text style={styles.emptyTitle}>Comece sua coleção</Text>
                <Text style={styles.emptySubtitle}>Escaneie uma figura ou busque no catálogo</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/catalogo')}>
                  <Text style={styles.emptyBtnText}>Ver Catálogo</Text>
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
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  logo: { color: '#fff', fontSize: 20, fontWeight: '800' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  proBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  proBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  bellContainer: { position: 'relative' },
  bellBadge: {
    position: 'absolute', top: -6, right: -6,
    backgroundColor: '#FF4444', borderRadius: 8, minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  bellBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  loadingContainer: { padding: 60, alignItems: 'center' },
  heroCard: {
    backgroundColor: theme.colors.primary, margin: 16, borderRadius: 20, padding: 24,
    shadowColor: theme.colors.primary, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  heroLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, letterSpacing: 2, fontWeight: '600', marginBottom: 6 },
  heroValue: { color: '#fff', fontSize: 44, fontWeight: '800', letterSpacing: -2, lineHeight: 52, marginBottom: 16 },
  heroStats: { flexDirection: 'row', gap: 8 },
  heroStat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 10, alignItems: 'center' },
  heroStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 9, letterSpacing: 1, fontWeight: '600', marginBottom: 4 },
  heroStatValue: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sectionLabel: { color: '#666', fontSize: 11, letterSpacing: 2, fontWeight: '700', marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
  shortcuts: { flexDirection: 'row', marginHorizontal: 16, gap: 10 },
  shortcut: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14,
    alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  shortcutText: { fontSize: 11, fontWeight: '600', color: '#333' },
  topList: { marginHorizontal: 16, gap: 10 },
  topItem: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  topMedal: { fontSize: 20 },
  topName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#000' },
  appreciationPill: { backgroundColor: theme.colors.appreciation, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  appreciationText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  emptyBtn: { backgroundColor: theme.colors.primary, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
