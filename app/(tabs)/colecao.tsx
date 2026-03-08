import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet, SafeAreaView,
} from 'react-native';
import { Plus, Award, ChevronLeft } from 'lucide-react-native';
import { theme } from '../../constants/theme';

const MOCK_ITEMS = [
  { id: 1, name: 'Snake Eyes v1', year: '1982', condition: 'C8', pricePaid: 240, marketValue: 850, image: 'https://images.unsplash.com/photo-1624308188733-abcf5b36a039?w=200' },
  { id: 2, name: 'Duke', year: '1982', condition: 'C8', pricePaid: 200, marketValue: 635, image: 'https://images.unsplash.com/photo-1771947010805-24a64499c357?w=200' },
  { id: 3, name: 'Zartan', year: '1984', condition: 'C9', pricePaid: 200, marketValue: 420, image: 'https://images.unsplash.com/photo-1769765756589-dea631ec8b0c?w=200' },
  { id: 4, name: 'Roadblock', year: '1983', condition: 'C7', pricePaid: 150, marketValue: 380, image: 'https://images.unsplash.com/photo-1762088420661-3579852c1eb2?w=200' },
  { id: 5, name: 'Scarlett', year: '1982', condition: 'C8', pricePaid: 180, marketValue: 590, image: 'https://images.unsplash.com/photo-1768969831359-c2e53759876f?w=200' },
];

const formatBRL = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;
const getAppreciation = (paid: number, market: number) => {
  const pct = ((market - paid) / paid) * 100;
  return `+${pct.toFixed(0)}%`;
};

export default function ColecaoScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.logo}>🎖️ filecard</Text>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Minha Coleção</Text>
            <Text style={styles.subtitle}>47 figuras</Text>
          </View>
          <TouchableOpacity style={styles.fab}>
            <Plus size={24} color="#fff" strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {MOCK_ITEMS.map((item, index) => (
          <View key={item.id} style={styles.itemCard}>
            <Image source={{ uri: item.image }} style={styles.thumb} resizeMode="cover" />
            <View style={styles.itemInfo}>
              <View style={styles.itemTop}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.conditionBadge}>
                  <Award size={11} color="#fff" />
                  <Text style={styles.conditionText}>{item.condition}</Text>
                </View>
              </View>
              <Text style={styles.itemYear}>{item.year}</Text>
              <View style={styles.itemBottom}>
                <Text style={styles.priceText}>
                  {formatBRL(item.pricePaid)}{' '}
                  <Text style={styles.pricePaid}>→ </Text>
                  <Text style={styles.priceMarket}>{formatBRL(item.marketValue)}</Text>
                </Text>
                <View style={styles.appreciationPill}>
                  <Text style={styles.appreciationText}>{getAppreciation(item.pricePaid, item.marketValue)}</Text>
                </View>
              </View>
            </View>
            {index === 0 && (
              <View style={styles.swipeHint}>
                <ChevronLeft size={14} color="#fff" />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16,
  },
  logo: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 10 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 },
  fab: {
    backgroundColor: theme.colors.primary, width: 44, height: 44,
    borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    shadowColor: theme.colors.primary, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  list: { padding: 12, gap: 10 },
  itemCard: {
    backgroundColor: '#fff', borderRadius: 16, flexDirection: 'row',
    padding: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    position: 'relative', overflow: 'visible',
  },
  thumb: { width: 88, height: 88, borderRadius: 12, backgroundColor: '#f0f0f0', flexShrink: 0 },
  itemInfo: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  itemTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemName: { fontSize: 15, fontWeight: '700', color: '#000', flex: 1 },
  conditionBadge: {
    backgroundColor: theme.colors.primary, borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 3,
    flexDirection: 'row', alignItems: 'center', gap: 3,
  },
  conditionText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  itemYear: { color: '#666', fontSize: 13, fontWeight: '500', marginTop: 2 },
  itemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  priceText: { fontSize: 13, color: '#888', fontWeight: '500' },
  pricePaid: { color: '#888' },
  priceMarket: { color: '#000', fontWeight: '700' },
  appreciationPill: {
    backgroundColor: theme.colors.appreciation, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  appreciationText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  swipeHint: {
    position: 'absolute', right: -8, top: '50%',
    backgroundColor: theme.colors.primary, borderRadius: 8,
    padding: 6, transform: [{ translateY: -14 }],
  },
});
