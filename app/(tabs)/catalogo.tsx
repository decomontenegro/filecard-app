import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, Image, StyleSheet, SafeAreaView, ActivityIndicator,
  ScrollView, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Plus } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { useCatalog } from '../../hooks/useCatalog';
import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';

import { CatalogItem } from '../../lib/supabase-queries';

const YEAR_FILTERS = ['Todos', '1982', '1983', '1984', '1985', '1986', '1987', '1988', '1989', '1990', '1991', '1992', '1993', '1995'];
const RARITY_COLORS = ['', '#999', '#4CAF50', '#2196F3', '#FF9800', '#F44336'];

const formatBRL = (v: number) =>
  v > 0 ? `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}` : '—';

export default function CatalogoScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeYear, setActiveYear] = useState('Todos');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingItem, setPendingItem] = useState<CatalogItem | null>(null);
  const [selectedCondition, setSelectedCondition] = useState('C8');
  const [pricePaid, setPricePaid] = useState('');

  const CONDITIONS = ['C5', 'C6', 'C7', 'C8', 'C9', 'C10'];

  const yearFilter = activeYear === 'Todos' ? undefined : parseInt(activeYear, 10);

  const { items, loading, loadingMore, error, loadMore, refresh } = useCatalog({
    search: query.length >= 2 ? query : undefined,
    year: yearFilter,
  });

  const { add: addToCollection } = useCollection(user?.id ?? null);

  const openAddModal = useCallback((item: CatalogItem) => {
    if (!user) return;
    setPendingItem(item);
    setSelectedCondition('C8');
    setPricePaid('');
    setModalVisible(true);
  }, [user]);

  const handleConfirmAdd = useCallback(async () => {
    if (!user || !pendingItem) return;
    setModalVisible(false);
    setAddingId(pendingItem.id);
    try {
      const price = pricePaid ? parseFloat(pricePaid.replace(',', '.')) : undefined;
      await addToCollection(pendingItem.id, selectedCondition, price);
    } catch (e) {
      // silencioso na UI
    } finally {
      setAddingId(null);
      setPendingItem(null);
    }
  }, [user, pendingItem, selectedCondition, pricePaid, addToCollection]);

  const renderItem = ({ item }: { item: CatalogItem & { market_value_brl?: number } }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/catalogo/${item.id}`)}
    >
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>?</Text>
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
            onPress={() => openAddModal(item)}
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
      {/* Modal de adição à coleção */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Adicionar à Coleção</Text>
            {pendingItem && (
              <Text style={styles.modalItemName} numberOfLines={2}>{pendingItem.display_name}</Text>
            )}

            <Text style={styles.modalLabel}>Condição</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.conditionRow}>
              {CONDITIONS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.conditionChip, selectedCondition === c && styles.conditionChipActive]}
                  onPress={() => setSelectedCondition(c)}
                >
                  <Text style={[styles.conditionChipText, selectedCondition === c && styles.conditionChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>Preço pago (opcional)</Text>
            <View style={styles.priceInputRow}>
              <Text style={styles.pricePrefix}>R$</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="0,00"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={pricePaid}
                onChangeText={setPricePaid}
              />
            </View>

            <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleConfirmAdd}>
              <Text style={styles.modalConfirmText}>Adicionar à Coleção</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.header}>
        <Text style={styles.logo}>filecard</Text>
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
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#000', marginBottom: 4 },
  modalItemName: { fontSize: 14, color: '#555', marginBottom: 20 },
  modalLabel: { fontSize: 12, fontWeight: '700', color: '#666', letterSpacing: 1, marginBottom: 10 },
  conditionRow: { flexDirection: 'row', marginBottom: 20 },
  conditionChip: {
    borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8, marginRight: 8,
    backgroundColor: '#f0f0f0', borderWidth: 2, borderColor: 'transparent',
  },
  conditionChipActive: { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary },
  conditionChipText: { fontSize: 14, fontWeight: '700', color: '#666' },
  conditionChipTextActive: { color: theme.colors.primary },
  priceInputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f7f7f7',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 24,
    borderWidth: 1.5, borderColor: '#e0e0e0',
  },
  pricePrefix: { fontSize: 16, fontWeight: '700', color: '#555', marginRight: 6 },
  priceInput: { flex: 1, fontSize: 16, color: '#000' },
  modalConfirmBtn: {
    backgroundColor: theme.colors.primary, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', marginBottom: 10,
  },
  modalConfirmText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalCancelBtn: {
    backgroundColor: '#f0f0f0', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  modalCancelText: { color: '#555', fontSize: 16, fontWeight: '600' },
});
