import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  FlatList, Image, StyleSheet, SafeAreaView,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import figuras from '../../db/seed/gijoe-arah.json';

const FILTERS = ['ARAH', '1982', '1983', '1984', '1985'];

const IMAGES: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1624308188733-abcf5b36a039?w=400',
  2: 'https://images.unsplash.com/photo-1771947010805-24a64499c357?w=400',
  3: 'https://images.unsplash.com/photo-1771667176932-55f9829a04f5?w=400',
  4: 'https://images.unsplash.com/photo-1769765756589-dea631ec8b0c?w=400',
  5: 'https://images.unsplash.com/photo-1768969831359-c2e53759876f?w=400',
};

const formatBRL = (v: number) =>
  `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;

export default function CatalogScreen() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ARAH');

  const filtered = figuras.filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase()) ||
    f.character.toLowerCase().includes(query.toLowerCase())
  );

  const renderFigura = ({ item, index }: { item: typeof figuras[0]; index: number }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: IMAGES[item.id] || `https://picsum.photos/seed/${item.id}/400/400` }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <View style={styles.cardBottom}>
          <View style={styles.yearPill}>
            <Text style={styles.yearText}>{item.year}</Text>
          </View>
          <Text style={styles.cardValue}>{formatBRL(item.marketValueBRL)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.topBar}>
          <Text style={styles.logo}>🎖️ filecard</Text>
          <TouchableOpacity style={styles.searchIcon}>
            <Search size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchBar}>
          <Search size={16} color="#999" style={{ marginRight: 8 }} />
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
      <FlatList
        data={filtered}
        renderItem={renderFigura}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  logo: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  searchIcon: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
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
  imageContainer: { width: '100%', aspectRatio: 1, backgroundColor: '#f0f0f0' },
  image: { width: '100%', height: '100%' },
  cardInfo: { padding: 10 },
  cardName: { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 6 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  yearPill: {
    backgroundColor: theme.colors.primary, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  yearText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardValue: { fontSize: 14, fontWeight: '700', color: '#000' },
});
