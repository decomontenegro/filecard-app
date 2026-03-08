import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { TrendingUp, Trophy, RefreshCw } from 'lucide-react-native';
import { theme } from '../../constants/theme';

const TOP_VALORIZADAS = [
  { rank: 1, name: 'Snake Eyes v1', appreciation: '+254%' },
  { rank: 2, name: 'Scarlett 1982', appreciation: '+228%' },
  { rank: 3, name: 'Zartan 1984', appreciation: '+110%' },
];

const TROPHY_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const MEDAL = ['🥇', '🥈', '🥉'];

export default function ValorScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.logo}>🎖️ filecard</Text>
        <View style={styles.titleRow}>
          <TrendingUp size={20} color="#fff" />
          <Text style={styles.title}>Patrimônio</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>SUA COLEÇÃO VALE</Text>
          <Text style={styles.heroValue}>R$ 12.840</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>INVESTIDO</Text>
              <Text style={styles.statValue}>R$ 4.200</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>VALORIZAÇÃO</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                <Text style={styles.statValue}>+205%</Text>
                <TrendingUp size={18} color="#fff" />
              </View>
            </View>
          </View>
        </View>

        {/* Top Valorizadas */}
        <Text style={styles.sectionLabel}>TOP VALORIZADAS</Text>
        <View style={styles.topList}>
          {TOP_VALORIZADAS.map((item) => (
            <View key={item.rank} style={styles.topItem}>
              <View style={styles.topLeft}>
                <Text style={styles.medal}>{MEDAL[item.rank - 1]}</Text>
                <Text style={styles.topName}>{item.name}</Text>
              </View>
              <View style={styles.topPill}>
                <Text style={styles.topPillText}>{item.appreciation}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <TouchableOpacity style={styles.footer}>
          <View style={styles.statusDot} />
          <Text style={styles.footerText}>Atualizado agora via eBay</Text>
          <RefreshCw size={14} color="#999" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16,
  },
  logo: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  content: { padding: 16, gap: 16 },
  heroCard: {
    backgroundColor: theme.colors.primary, borderRadius: 20,
    padding: 28, alignItems: 'center',
    shadowColor: theme.colors.primary, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.75)', fontSize: 11,
    letterSpacing: 2, fontWeight: '600', marginBottom: 8,
  },
  heroValue: {
    color: '#fff', fontSize: 52, fontWeight: '800',
    letterSpacing: -2, lineHeight: 60, marginBottom: 24,
  },
  statsRow: { flexDirection: 'row', gap: 12, width: '100%' },
  statBox: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14, padding: 14, alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)', fontSize: 10,
    letterSpacing: 1, fontWeight: '600', marginBottom: 6,
  },
  statValue: { color: '#fff', fontSize: 20, fontWeight: '700' },
  sectionLabel: {
    color: '#666', fontSize: 11, letterSpacing: 2,
    fontWeight: '700', marginTop: 4,
  },
  topList: { gap: 10 },
  topItem: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  medal: { fontSize: 22 },
  topName: { fontSize: 15, fontWeight: '700', color: '#000' },
  topPill: {
    backgroundColor: theme.colors.appreciation, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  topPillText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 8, gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.success },
  footerText: { color: '#999', fontSize: 13, fontWeight: '500' },
});
