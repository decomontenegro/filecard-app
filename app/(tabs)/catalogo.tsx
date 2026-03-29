import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, Image, StyleSheet, SafeAreaView, ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Search, Plus } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { useCatalog } from '../../hooks/useCatalog';
import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';

import { CatalogItem } from '../../lib/supabase-queries';

const YEAR_FILTERS = ['Todos', '1982', '1983', '1984', '1985', '1986', '1987', '1988'];
const RARITY_COLORS = ['', '#999', '#4CAF50', '#2196F3', '#FF9800', '#F44336'];

const formatBRL = (v: number) =>
  v > 0 ? `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}` : '—';

export default function CatalogoScreen() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [activeYear, setActiveYear] = useState('Todos');
  const [addingId, setAddingId] = useState<string | null>(null);

  const yearFilter = activeYear === 'Todos' ? undefined : parseInt(activeYear, 10);

  const { items, loading, loadingMore, error, loadMore, refresh } = useCatalog({
    search: query.length >= 2 ? query : undefined,
    year: yearFilter,
  });

  const { add: addToCollection } = useCollection(user?.id ?? null);

  const handleAdd = useCallback(async (item: CatalogItem) => {
    if (!user) return;
    setAddingId(item.id);
    try {
      await addToCollection(item.id, 'C8');
    } catch (e) {
      // silencioso na UI
    } finally {
      setAddingId(null);
    }
  }, [user, addToCollection]);

  const renderItem = ({ item }: { item: CatalogItem & { market_value_brl?: number } }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>🎖️</Text>
          </View>
        )}
        {item.rarity_level && item.rarity_level > 0 && (
          <View style={[styles.rarityDot, { backgroundColor: RARITY_COLORS[item.rarity_level] ?? '#999' }]} />
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={2}>{item.display_name}</Text>
        <View style={styles.cardBottom}>
          <View style={styles.yearPill}>
            <Text style={styles.yearText}>{item.year}</Text>
          </View>
          <Text style={styles.cardValue}>{formatBRL((item as any).market_value_brl ?? 0)}</Text>
        </View>
        {user && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => handleAdd(item)}
            disabled={addingId === item.id}
          >
            {addingId === item.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Plus size={12} color="#fff" />
                <Text style={styles.addBtnText}>Coleção</Text>
              </>
            )}
          </TouchableOpacity>
        )}
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
          {YEAR_FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, activeYear === f && styles.chipActive]}
              onPress={() => setActiveYear(f)}
            >
              <Text style={[styles.chipText, activeYear === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={theme.colors.primary} />
              </View>
            ) : null
          }
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
  grid: { padding: 12, paddingBottom: 40 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, width: '48%',
    shadowColor: '#000', shadowOpacity: 0.08,
    shadowRadius: 8, elevation: 3,
  },
  imageContainer: { width: '100%', height: 180, backgroundColor: '#f5f5f0', position: 'relative', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText: { fontSize: 40 },
  rarityDot: { position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: 5 },
  cardInfo: { padding: 10, gap: 4 },
  cardName: { fontSize: 13, fontWeight: '700', color: '#000', lineHeight: 18 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  yearPill: { backgroundColor: theme.colors.primary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  yearText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardValue: { fontSize: 13, fontWeight: '700', color: '#000' },
  addBtn: {
    backgroundColor: theme.colors.primary, borderRadius: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 6, marginTop: 4,
  },
  addBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { color: '#666', fontSize: 15 },
  errorText: { color: '#e53e3e', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  retryBtn: { backgroundColor: theme.colors.primary, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontWeight: '700' },
  footerLoader: { padding: 20, alignItems: 'center' },
});
