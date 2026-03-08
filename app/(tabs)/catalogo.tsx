import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  FlatList, Image, StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { Search, Star } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { getCatalogItems } from '../../db/database';

const FILTERS = ['Todos', '1982', '1983', '1984', '1985', '1986'];

const formatBRL = (v: number) =>
  `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;

const RARITY_COLORS = ['', '#999', '#4CAF50', '#2196F3', '#FF9800', '#F44336'];

export default function CatalogoScreen() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, [query]);

  async function loadItems() {
    setLoading(true);
    try {
      const data = await getCatalogItems(query || undefined);
      setItems(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const filtered = activeFilter === 'Todos'
    ? items
    : items.filter(i => String(i.year) === activeFilter);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>🎖️</Text>
          </View>
        )}
        <View style={[styles.rarityDot, { backgroundColor: RARITY_COLORS[item.rarity_level] || '#999' }]} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={2}>{item.display_name}</Text>
        <View style={styles.cardBottom}>
          <View style={styles.yearPill}>
            <Text style={styles.yearText}>{item.year}</Text>
          </View>
          <Text style={styles.cardValue}>{formatBRL(item.market_value_brl)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.logo}>🎖️ filecard</Text>
        <View style={styles.searchBar}>
          <Search size={16} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar figuras..."
            placeholderTextColor="#999"
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Nenhuma figura encontrada</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  logo: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#000' },
  filterRow: { flexDirection: 'row' },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8,
  },
  chipActive: { backgroundColor: '#fff' },
  chipText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: theme.colors.primary },
  grid: { padding: 12 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, width: '48%',
    overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08,
    shadowRadius: 8, elevation: 3,
  },
  imageContainer: { width: '100%', aspectRatio: 1, backgroundColor: '#f0f0f0', position: 'relative' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText: { fontSize: 40 },
  rarityDot: { position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: 5 },
  cardInfo: { padding: 10 },
  cardName: { fontSize: 13, fontWeight: '700', color: '#000', marginBottom: 6, lineHeight: 18 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  yearPill: { backgroundColor: theme.colors.primary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  yearText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardValue: { fontSize: 13, fontWeight: '700', color: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { color: '#666', fontSize: 15 },
});
