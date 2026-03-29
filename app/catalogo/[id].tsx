import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Plus, Star, Package } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { getCatalogItemById, getPublicPhotoUrl } from '../../lib/supabase-queries';
import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';

const CONDITION_LABELS: Record<string, string> = {
  C10: 'C10 — Mint',
  C9:  'C9 — Near Mint',
  C8:  'C8 — Very Fine',
  C7:  'C7 — Fine',
  C6:  'C6 — Very Good',
  C5:  'C5 — Good',
};

const formatBRL = (v: number) =>
  v > 0 ? `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}` : '—';

export default function CatalogoItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { add: addToCollection } = useCollection(user?.id ?? null);

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    getCatalogItemById(id)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async (condition: string = 'C8') => {
    if (!user) {
      Alert.alert('Login necessário', 'Faça login para adicionar à coleção.');
      return;
    }
    setAdding(true);
    try {
      await addToCollection(id!, condition);
      Alert.alert('Adicionado', `${item?.display_name} adicionado à sua coleção!`);
    } catch {
      Alert.alert('Erro', 'Não foi possível adicionar. Tente novamente.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.center}>
          <Text style={styles.errorText}>Figura não encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Resolve photo: item_photos first, then image_url
  const primaryPhoto = item.item_photos?.find((p: any) => p.is_primary) ?? item.item_photos?.[0];
  const photoUrl = primaryPhoto
    ? getPublicPhotoUrl(primaryPhoto.storage_path, primaryPhoto.bucket_name)
    : item.image_url;

  // Market prices — pick C8 as default
  const prices: any[] = item.market_prices ?? [];
  const priceC8 = prices.find((p: any) => p.condition_grade === 'C8');
  const priceC10 = prices.find((p: any) => p.condition_grade === 'C10');

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{item.display_name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={styles.imageContainer}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.imagePlaceholderText}>?</Text>
            </View>
          )}
        </View>

        {/* Main info */}
        <View style={styles.section}>
          <Text style={styles.name}>{item.display_name}</Text>
          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.year}</Text>
            </View>
            {item.rarity_level > 0 && (
              <View style={[styles.tag, styles.tagRarity]}>
                <Star size={10} color="#fff" />
                <Text style={styles.tagText}>Raridade {item.rarity_level}</Text>
              </View>
            )}
          </View>

          {item.description ? (
            <Text style={styles.description}>{item.description}</Text>
          ) : null}
        </View>

        {/* Market prices */}
        {prices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preços de Mercado</Text>
            <View style={styles.priceGrid}>
              {prices.slice(0, 6).map((p: any) => (
                <View key={p.condition_grade} style={styles.priceCard}>
                  <Text style={styles.priceCondition}>{p.condition_grade}</Text>
                  <Text style={styles.priceValue}>{formatBRL(p.price_brl ?? 0)}</Text>
                </View>
              ))}
            </View>
            {prices[0]?.fetched_at && (
              <Text style={styles.priceSource}>
                via eBay · {new Date(prices[0].fetched_at).toLocaleDateString('pt-BR')}
              </Text>
            )}
          </View>
        )}

        {/* Variants */}
        {item.item_variants?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Variantes</Text>
            {item.item_variants.map((v: any) => (
              <View key={v.id} style={styles.variantRow}>
                <Package size={14} color={theme.colors.primary} />
                <Text style={styles.variantText}>{v.variant_name}{v.variant_type ? ` (${v.variant_type})` : ''}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Add to collection */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Adicionar à Coleção</Text>
            <View style={styles.conditionGrid}>
              {Object.entries(CONDITION_LABELS).map(([grade, label]) => (
                <TouchableOpacity
                  key={grade}
                  style={styles.conditionBtn}
                  onPress={() => handleAdd(grade)}
                  disabled={adding}
                >
                  <Text style={styles.conditionBtnGrade}>{grade}</Text>
                  <Text style={styles.conditionBtnLabel} numberOfLines={1}>
                    {label.split(' — ')[1]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* FAB — quick add C8 */}
      {user && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => handleAdd('C8')}
          disabled={adding}
        >
          {adding ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Plus size={20} color="#fff" />
              <Text style={styles.fabText}>Adicionar C8</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '700' },
  scroll: { paddingBottom: 100 },
  imageContainer: {
    width: '100%', height: 280,
    backgroundColor: '#f5f5f0',
    alignItems: 'center', justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText: { fontSize: 80 },
  section: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12,
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  name: { fontSize: 22, fontWeight: '800', color: '#000', marginBottom: 8 },
  tags: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 10 },
  tag: {
    backgroundColor: theme.colors.primary, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  tagRarity: { backgroundColor: '#FF9800' },
  tagText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  description: { fontSize: 14, color: '#555', lineHeight: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 12 },
  priceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  priceCard: {
    backgroundColor: '#f5f5f0', borderRadius: 10,
    padding: 10, minWidth: 80, alignItems: 'center',
  },
  priceCondition: { fontSize: 12, fontWeight: '700', color: theme.colors.primary },
  priceValue: { fontSize: 14, fontWeight: '800', color: '#000', marginTop: 2 },
  priceSource: { fontSize: 11, color: '#999', marginTop: 8 },
  variantRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  variantText: { fontSize: 14, color: '#333' },
  conditionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  conditionBtn: {
    backgroundColor: '#f5f5f0', borderRadius: 10, padding: 10,
    minWidth: 90, alignItems: 'center',
  },
  conditionBtnGrade: { fontSize: 14, fontWeight: '800', color: theme.colors.primary },
  conditionBtnLabel: { fontSize: 11, color: '#666', marginTop: 2 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  errorText: { fontSize: 16, color: '#666' },
});
