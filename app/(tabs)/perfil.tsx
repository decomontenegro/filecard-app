import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { Settings, Share2, Star, Trophy, Heart, ChevronRight } from 'lucide-react-native';
import { theme } from '../../constants/theme';

const STATS = [
  { label: 'Figuras', value: '47' },
  { label: 'Completas', value: '23' },
  { label: 'Linhas', value: '2' },
];

const MENU_ITEMS = [
  { icon: <Star size={20} color={theme.colors.primary} />, label: 'Favoritos', count: '8' },
  { icon: <Heart size={20} color={theme.colors.primary} />, label: 'Wishlist', count: '12' },
  { icon: <Trophy size={20} color={theme.colors.primary} />, label: 'Conquistas', count: '3' },
  { icon: <Share2 size={20} color={theme.colors.primary} />, label: 'Compartilhar Coleção' },
  { icon: <Settings size={20} color={theme.colors.primary} />, label: 'Configurações' },
];

export default function PerfilScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.logo}>🎖️ filecard</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Settings size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar e nome */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🎖️</Text>
          </View>
          <Text style={styles.name}>Colecionador</Text>
          <Text style={styles.handle}>@colecionador · GI Joe ARAH</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            {STATS.map((s, i) => (
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
        </View>

        {/* Showcase preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SHOWCASE</Text>
          <View style={styles.showcaseGrid}>
            {['🎖️', '🎖️', '🎖️', '🎖️'].map((e, i) => (
              <View key={i} style={styles.showcaseItem}>
                <Text style={styles.showcaseEmoji}>{e}</Text>
              </View>
            ))}
            <TouchableOpacity style={[styles.showcaseItem, styles.showcaseAdd]}>
              <Text style={styles.showcaseAddText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MINHA CONTA</Text>
          <View style={styles.menuCard}>
            {MENU_ITEMS.map((item, i) => (
              <TouchableOpacity key={i} style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuItemBorder]}>
                <View style={styles.menuIcon}>{item.icon}</View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <View style={styles.menuRight}>
                  {item.count && (
                    <View style={styles.menuBadge}>
                      <Text style={styles.menuBadgeText}>{item.count}</Text>
                    </View>
                  )}
                  <ChevronRight size={16} color="#ccc" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
  profileSection: { backgroundColor: '#fff', padding: 24, alignItems: 'center', marginBottom: 8 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 40 },
  name: { fontSize: 22, fontWeight: '800', color: '#000', marginBottom: 4 },
  handle: { fontSize: 14, color: '#666', marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#000' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 2 },
  shareBtn: {
    backgroundColor: theme.colors.primary, borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  shareBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { color: '#666', fontSize: 11, letterSpacing: 2, fontWeight: '700', marginBottom: 10, marginTop: 8 },
  showcaseGrid: { flexDirection: 'row', gap: 10 },
  showcaseItem: {
    width: 72, height: 72, backgroundColor: '#fff', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  showcaseEmoji: { fontSize: 32 },
  showcaseAdd: { backgroundColor: theme.colors.primary + '15', borderWidth: 2, borderStyle: 'dashed', borderColor: theme.colors.primary + '40' },
  showcaseAddText: { fontSize: 28, color: theme.colors.primary, fontWeight: '300' },
  menuCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: theme.colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#000' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuBadge: { backgroundColor: theme.colors.primary + '20', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  menuBadgeText: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' },
});
