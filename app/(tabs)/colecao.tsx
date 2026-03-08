import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { Plus, Award, ChevronRight } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { getCollectionItems, getCollectionStats } from '../../db/database';

const formatBRL = (v: number) => `R$ ${(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;
const getAppreciation = (paid: number, market: number) => {
  if (!paid || paid === 0) return null;
  const pct = ((market - paid) / paid) * 100;
  return pct > 0 ? `+${pct.toFixed(0)}%` : `${pct.toFixed(0)}%`;
};

// Mock items para demo (até ter itens reais na coleção)
const MOCK_ITEMS = [
  { id: 1, display_name: 'Snake Eyes v1', year: 1982, condition_grade: 'C8', price_paid: 240, market_value_brl: 850, image_url: 'https://images.unsplash.com/photo-1624308188733-abcf5b36a039?w=200' },
  { id: 2, display_name: 'Duke', year: 1984, condition_grade: 'C8', price_paid: 200, market_value_brl: 635, image_url: 'https://images.unsplash.com/photo-1771947010805-24a64499c357?w=200' },
  { id: 3, display_name: 'Cobra Commander', year: 1982, condition_grade: 'C9', price_paid: 300, market_value_brl: 720, image_url: null },
  { id: 4, display_name: 'Zartan', year: 1984, condition_grade: 'C7', price_paid: 200, market_value_brl: 420, image_url: null },
  { id: 5, display_name: 'Scarlett', year: 1982, condition_grade: 'C8', price_paid: 180, market_value_brl: 590, image_url: 'https://images.unsplash.com/photo-1768969831359-c2e53759876f?w=200' },
];

export default function ColecaoScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_items: 0, total_paid: 0, total_market_value: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const dbItems = await getCollectionItems();
      setItems(dbItems.length > 0 ? dbItems : MOCK_ITEMS);
      const s = await getCollectionStats();
      if (s && s.total_items > 0) {
        setStats(s);
      } else {
        const totalPaid = MOCK_ITEMS.reduce((a, i) => a + i.price_paid, 0);
        const totalMarket = MOCK_ITEMS.reduce((a, i) => a + i.market_value_brl, 0);
        setStats({ total_items: MOCK_ITEMS.length, total_paid: totalPaid, total_market_value: totalMarket });
      }
    } catch (e) {
      setItems(MOCK_ITEMS);
    }
    setLoading(false);
  }

  const appreciation = stats.total_paid > 0
    ? Math.round((stats.total_market_value - stats.total_paid) / stats.total_paid * 100)
    : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.logo}>🎖️ filecard</Text>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Minha Coleção</Text>
            <Text style={styles.subtitle}>{stats.total_items} figuras • +{appreciation}% valorização</Text>
          </View>
          <TouchableOpacity style={styles.fab}>
            <Plus size={24} color="#fff" strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {items.map((item, index) => {
            const app = getAppreciation(item.price_paid, item.market_value_brl ?? item.market_value_brl);
            return (
              <TouchableOpacity key={item.id} style={styles.itemCard} activeOpacity={0.85}>
                <View style={styles.thumbContainer}>
                  {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={styles.thumb} resizeMode="cover" />
                  ) : (
                    <View style={[styles.thumb, styles.thumbPlaceholder]}>
                      <Text style={styles.thumbEmoji}>🎖️</Text>
                    </View>
                  )}
                </View>
                <View style={styles.itemInfo}>
                  <View style={styles.itemTop}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.display_name}</Text>
                    <View style={styles.conditionBadge}>
                      <Award size={10} color="#fff" />
                      <Text style={styles.conditionText}>{item.condition_grade}</Text>
                    </View>
                  </View>
                  <Text style={styles.itemYear}>{item.year}</Text>
                  <View style={styles.itemBottom}>
                    <Text style={styles.priceText}>
                      {formatBRL(item.price_paid)}
                      <Text style={styles.arrow}> → </Text>
                      <Text style={styles.priceMarket}>{formatBRL(item.market_value_brl)}</Text>
                    </Text>
                    {app && (
                      <View style={styles.appreciationPill}>
                        <Text style={styles.appreciationText}>{app}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <ChevronRight size={16} color="#ccc" />
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  logo: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 10 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  fab: {
    backgroundColor: theme.colors.primary, width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: theme.colors.primary, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  list: { padding: 12, gap: 10 },
  itemCard: {
    backgroundColor: '#fff', borderRadius: 16, flexDirection: 'row',
    padding: 12, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  thumbContainer: { flexShrink: 0 },
  thumb: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#f0f0f0' },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  thumbEmoji: { fontSize: 32 },
  itemInfo: { flex: 1, marginLeft: 12, marginRight: 8 },
  itemTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemName: { fontSize: 14, fontWeight: '700', color: '#000', flex: 1 },
  conditionBadge: {
    backgroundColor: theme.colors.primary, borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 3,
  },
  conditionText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  itemYear: { color: '#666', fontSize: 12, marginTop: 3 },
  itemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  priceText: { fontSize: 12, color: '#888' },
  arrow: { color: '#bbb' },
  priceMarket: { fontWeight: '700', color: '#000' },
  appreciationPill: { backgroundColor: theme.colors.appreciation, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  appreciationText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
