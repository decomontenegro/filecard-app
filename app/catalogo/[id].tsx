import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft, Plus, Star, Package, Check,
  X, ShoppingBag, Sword, Backpack, CreditCard,
} from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { getCatalogItemById, getPublicPhotoUrl } from '../../lib/supabase-queries';
import { supabase, SUPABASE_ANON_KEY, SUPABASE_URL } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Accessory {
  id: string;
  name: string;
  accessory_type: 'weapon' | 'gear' | 'vehicle_part' | 'file_card' | 'other';
  required_for_complete: boolean;
  display_order: number;
}

interface ItemVariant {
  id: string;
  variant_name: string;
  variant_type?: string;
  region?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CONDITION_GRADES = ['C1','C2','C3','C4','C5','C6','C7','C8','C9','C10'];

const JOINTS_OPTIONS = [
  { value: 'firm',    label: 'Firmes' },
  { value: 'loose',   label: 'Frouxas' },
  { value: 'stuck',   label: 'Travadas' },
  { value: 'broken',  label: 'Quebradas' },
];
const THUMBS_OPTIONS = [
  { value: 'intact',   label: 'Íntegros' },
  { value: 'worn',     label: 'Desgastados' },
  { value: 'broken',   label: 'Quebrados' },
  { value: 'missing',  label: 'Faltando' },
];
const PAINT_OPTIONS = [
  { value: 'excellent', label: 'Ótima' },
  { value: 'good',      label: 'Boa' },
  { value: 'worn',      label: 'Desgastada' },
  { value: 'poor',      label: 'Péssima' },
];
const HEEL_OPTIONS = [
  { value: 'intact',   label: 'Íntegro' },
  { value: 'cracked',  label: 'Trincado' },
  { value: 'broken',   label: 'Quebrado' },
];
const UNDERWEAR_OPTIONS = [
  { value: 'intact',   label: 'Íntegra' },
  { value: 'worn',     label: 'Desgastada' },
  { value: 'torn',     label: 'Rasgada' },
  { value: 'missing',  label: 'Faltando' },
];

const formatBRL = (v: number) =>
  v > 0 ? `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}` : '—';

const CATEGORY_ICONS: Record<string, React.ReactElement> = {
  weapon: <Sword size={14} color={theme.colors.primary} />,
  gear: <Backpack size={14} color={theme.colors.primary} />,
  file_card: <CreditCard size={14} color={theme.colors.primary} />,
  vehicle_part: <Package size={14} color={theme.colors.primary} />,
  other: <ShoppingBag size={14} color={theme.colors.primary} />,
};

// ─── Pill Selector ────────────────────────────────────────────────────────────

function PillSelector({
  options, selected, onSelect,
}: {
  options: { value: string; label: string }[];
  selected: string | null;
  onSelect: (val: string) => void;
}) {
  return (
    <View style={pillStyles.row}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt.value}
          style={[pillStyles.pill, selected === opt.value && pillStyles.pillActive]}
          onPress={() => onSelect(opt.value)}
        >
          <Text style={[pillStyles.pillText, selected === opt.value && pillStyles.pillTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const pillStyles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderWidth: 1.5, borderColor: '#e0e0e0',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: '#fff',
  },
  pillActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  pillText: { fontSize: 13, color: '#555', fontWeight: '500' },
  pillTextActive: { color: '#fff', fontWeight: '700' },
});

// ─── Add to Collection Modal ──────────────────────────────────────────────────

function AddToCollectionModal({
  visible, onClose, onAdded, item, accessories,
}: {
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
  item: any;
  accessories: Accessory[];
}) {
  const { user } = useAuth();
  const { add: addToCollection } = useCollection(user?.id ?? null);

  const [conditionGrade, setConditionGrade] = useState('C8');
  const [joints, setJoints] = useState<string | null>(null);
  const [thumbs, setThumbs] = useState<string | null>(null);
  const [paint, setPaint] = useState<string | null>(null);
  const [heel, setHeel] = useState<string | null>(null);
  const [underwear, setUnderwear] = useState<string | null>(null);
  const [cracks, setCracks] = useState('');
  const [checkedAccessories, setCheckedAccessories] = useState<Set<string>>(new Set());
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  // Calculate completeness based on required accessories
  const requiredIds = accessories.filter(a => a.required_for_complete).map(a => a.id);
  const checkedRequired = requiredIds.filter(id => checkedAccessories.has(id));
  const completenessStatus: 'complete' | 'incomplete' | 'stripped' = (() => {
    if (requiredIds.length === 0) return 'complete';
    if (checkedRequired.length === requiredIds.length) return 'complete';
    if (checkedAccessories.size === 0) return 'stripped';
    return 'incomplete';
  })();

  const toggleAccessory = (id: string) => {
    setCheckedAccessories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const pricePaid = price ? parseFloat(price.replace(',', '.')) : undefined;
      const collectionItem = await addToCollection(item.id, conditionGrade, pricePaid);

      // Create condition_details if any detail was filled
      if (joints || thumbs || paint || heel || underwear || cracks) {
        try {
          await supabase.from('condition_details').insert({
            user_collection_item_id: collectionItem.id,
            joints_condition: joints,
            thumbs_condition: thumbs,
            paint_condition: paint,
            heel_condition: heel,
            underwear_condition: underwear,
            cracks: cracks || null,
          });
        } catch {
          // condition_details table may not exist yet — non-fatal
        }
      }

      // Update completeness_status on the collection item
      if (accessories.length > 0) {
        await supabase
          .from('user_collection_items')
          .update({ completeness_status: completenessStatus })
          .eq('id', collectionItem.id);
      }

      onAdded();
      onClose();
      Alert.alert('Adicionado! 🎉', `${item?.display_name} adicionado à sua coleção!`);
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível adicionar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const completenessColor = completenessStatus === 'complete'
    ? '#4CAF50' : completenessStatus === 'incomplete' ? '#FF9800' : '#9E9E9E';
  const completenessLabel = completenessStatus === 'complete'
    ? 'Completo' : completenessStatus === 'incomplete' ? 'Incompleto' : 'Sem acessórios';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={modal.safe}>
          {/* Header */}
          <View style={modal.header}>
            <Text style={modal.headerTitle}>Adicionar à Coleção</Text>
            <TouchableOpacity onPress={onClose} style={modal.closeBtn}>
              <X size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={modal.scroll} showsVerticalScrollIndicator={false}>
            {/* Figure name */}
            <View style={modal.card}>
              <Text style={modal.figureName}>{item?.display_name}</Text>
              <Text style={modal.figureYear}>{item?.year}</Text>
            </View>

            {/* Condition grade */}
            <View style={modal.card}>
              <Text style={modal.sectionTitle}>Grau de Condição</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
                <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4 }}>
                  {CONDITION_GRADES.map(g => (
                    <TouchableOpacity
                      key={g}
                      style={[modal.gradeBtn, conditionGrade === g && modal.gradeBtnActive]}
                      onPress={() => setConditionGrade(g)}
                    >
                      <Text style={[modal.gradeBtnText, conditionGrade === g && modal.gradeBtnTextActive]}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Physical condition */}
            <View style={modal.card}>
              <Text style={modal.sectionTitle}>Estado do Boneco</Text>

              <Text style={modal.fieldLabel}>Articulações</Text>
              <PillSelector options={JOINTS_OPTIONS} selected={joints} onSelect={setJoints} />

              <Text style={[modal.fieldLabel, { marginTop: 14 }]}>Polegares</Text>
              <PillSelector options={THUMBS_OPTIONS} selected={thumbs} onSelect={setThumbs} />

              <Text style={[modal.fieldLabel, { marginTop: 14 }]}>Pintura</Text>
              <PillSelector options={PAINT_OPTIONS} selected={paint} onSelect={setPaint} />

              <Text style={[modal.fieldLabel, { marginTop: 14 }]}>Calcanhar</Text>
              <PillSelector options={HEEL_OPTIONS} selected={heel} onSelect={setHeel} />

              <Text style={[modal.fieldLabel, { marginTop: 14 }]}>Sunga</Text>
              <PillSelector options={UNDERWEAR_OPTIONS} selected={underwear} onSelect={setUnderwear} />

              <Text style={[modal.fieldLabel, { marginTop: 14 }]}>Trincas</Text>
              <TextInput
                style={modal.textInput}
                placeholder="Onde tem trincas? (ex: pescoço, cintura...)"
                placeholderTextColor="#bbb"
                value={cracks}
                onChangeText={setCracks}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Accessories checklist */}
            {accessories.length > 0 && (
              <View style={modal.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={modal.sectionTitle}>Acessórios</Text>
                  <View style={[modal.completenessBadge, { backgroundColor: completenessColor }]}>
                    <Text style={modal.completenessText}>{completenessLabel}</Text>
                  </View>
                </View>
                {accessories.map(acc => (
                  <TouchableOpacity
                    key={acc.id}
                    style={[modal.accRow, checkedAccessories.has(acc.id) && modal.accRowChecked]}
                    onPress={() => toggleAccessory(acc.id)}
                  >
                    <View style={[modal.checkbox, checkedAccessories.has(acc.id) && modal.checkboxChecked]}>
                      {checkedAccessories.has(acc.id) && <Check size={12} color="#fff" />}
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {CATEGORY_ICONS[acc.accessory_type] ?? CATEGORY_ICONS.other}
                      <Text style={modal.accName}>{acc.name}</Text>
                      {acc.required_for_complete && (
                        <View style={modal.requiredBadge}>
                          <Text style={modal.requiredText}>★</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
                <Text style={modal.accHint}>★ = obrigatório para completude</Text>
              </View>
            )}

            {/* Price paid */}
            <View style={modal.card}>
              <Text style={modal.sectionTitle}>Preço Pago</Text>
              <View style={modal.priceRow}>
                <Text style={modal.priceCurrency}>R$</Text>
                <TextInput
                  style={modal.priceInput}
                  placeholder="0,00"
                  placeholderTextColor="#bbb"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Add button */}
          <View style={modal.footer}>
            <TouchableOpacity
              style={[modal.addBtn, saving && { opacity: 0.6 }]}
              onPress={handleAdd}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Plus size={18} color="#fff" />
                  <Text style={modal.addBtnText}>Adicionar à Coleção</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const modal = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#000' },
  closeBtn: { padding: 4 },
  scroll: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  figureName: { fontSize: 18, fontWeight: '800', color: '#000' },
  figureYear: { fontSize: 13, color: '#888', marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8 },
  gradeBtn: {
    width: 48, height: 48, borderRadius: 12, borderWidth: 1.5,
    borderColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
  },
  gradeBtnActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary },
  gradeBtnText: { fontSize: 13, fontWeight: '700', color: '#555' },
  gradeBtnTextActive: { color: '#fff' },
  textInput: {
    borderWidth: 1.5, borderColor: '#e8e8e8', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: '#333', minHeight: 50,
    textAlignVertical: 'top',
  },
  accRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  accRowChecked: { backgroundColor: 'rgba(107, 123, 90, 0.04)', borderRadius: 8 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: '#ccc', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  accName: { fontSize: 14, color: '#333', flex: 1 },
  requiredBadge: {
    backgroundColor: '#FF9800', borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  requiredText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  accHint: { fontSize: 11, color: '#bbb', marginTop: 8 },
  completenessBadge: {
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
  },
  completenessText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  priceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderColor: '#e8e8e8', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  priceCurrency: { fontSize: 16, fontWeight: '700', color: '#555' },
  priceInput: { flex: 1, fontSize: 18, fontWeight: '600', color: '#000', paddingVertical: 8 },
  footer: {
    padding: 16, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  addBtn: {
    backgroundColor: theme.colors.primary, borderRadius: 16,
    paddingVertical: 16, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CatalogoItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [variants, setVariants] = useState<ItemVariant[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchAccessoriesAndVariants = useCallback(async (catalogId: string) => {
    try {
      const [accRes, varRes] = await Promise.all([
        fetch(
          `${SUPABASE_URL}/rest/v1/accessories?catalog_item_id=eq.${catalogId}&select=id,name,accessory_type,required_for_complete,display_order&order=display_order`,
          { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
        ),
        fetch(
          `${SUPABASE_URL}/rest/v1/item_variants?catalog_item_id=eq.${catalogId}&select=id,variant_name,variant_type,region`,
          { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
        ),
      ]);
      if (accRes.ok) setAccessories(await accRes.json());
      if (varRes.ok) setVariants(await varRes.json());
    } catch {
      // non-fatal
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    getCatalogItemById(id)
      .then(data => {
        setItem(data);
        // Also fetch accessories and variants (item_variants from getCatalogItemById may miss region)
        fetchAccessoriesAndVariants(id);
      })
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id, refreshKey]);

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

  const primaryPhoto = item.item_photos?.find((p: any) => p.is_primary) ?? item.item_photos?.[0];
  const photoUrl = primaryPhoto
    ? getPublicPhotoUrl(primaryPhoto.storage_path, primaryPhoto.bucket_name)
    : item.image_url;

  const prices: any[] = item.market_prices ?? [];

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

        {/* ── Versões (item_variants) ── */}
        {variants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Versões</Text>
            {variants.map((v) => (
              <View key={v.id} style={styles.variantRow}>
                <View style={styles.variantIcon}>
                  <Package size={13} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.variantName}>{v.variant_name}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
                    {v.variant_type && (
                      <View style={styles.variantTag}>
                        <Text style={styles.variantTagText}>{v.variant_type}</Text>
                      </View>
                    )}
                    {v.region && (
                      <View style={[styles.variantTag, styles.variantTagRegion]}>
                        <Text style={styles.variantTagText}>{v.region}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Acessórios ── */}
        {accessories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acessórios</Text>
            {accessories.map((acc) => (
              <View key={acc.id} style={styles.accRow}>
                <View style={styles.accIconWrap}>
                  {CATEGORY_ICONS[acc.accessory_type] ?? CATEGORY_ICONS.other}
                </View>
                <Text style={styles.accName}>{acc.name}</Text>
                {acc.required_for_complete && (
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredBadgeText}>Obrigatório</Text>
                  </View>
                )}
              </View>
            ))}
            <Text style={styles.accFootnote}>
              Itens "Obrigatório" contam para completude da figura
            </Text>
          </View>
        )}

        {/* Add to collection — trigger modal */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Adicionar à Coleção</Text>
            <TouchableOpacity
              style={styles.addModalBtn}
              onPress={() => setShowAddModal(true)}
            >
              <Plus size={18} color="#fff" />
              <Text style={styles.addModalBtnText}>Adicionar com Detalhes</Text>
            </TouchableOpacity>
            <Text style={styles.addHint}>
              Configure condição, acessórios e preço pago
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* FAB — opens modal */}
      {user && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.fabText}>Adicionar</Text>
        </TouchableOpacity>
      )}

      {/* Granular Add Modal */}
      {showAddModal && item && (
        <AddToCollectionModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdded={() => setRefreshKey(k => k + 1)}
          item={item}
          accessories={accessories}
        />
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

  // Versões
  variantRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  variantIcon: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(107,123,90,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  variantName: { fontSize: 14, fontWeight: '600', color: '#222' },
  variantTag: {
    backgroundColor: theme.colors.primary, borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  variantTagRegion: { backgroundColor: '#8B7355' },
  variantTagText: { color: '#fff', fontSize: 10, fontWeight: '600' },

  // Acessórios
  accRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  accIconWrap: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(107,123,90,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  accName: { flex: 1, fontSize: 14, color: '#333' },
  requiredBadge: {
    backgroundColor: theme.colors.primary, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  requiredBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  accFootnote: { fontSize: 11, color: '#bbb', marginTop: 10 },

  // Add section
  addModalBtn: {
    backgroundColor: theme.colors.primary, borderRadius: 14,
    paddingVertical: 14, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  addModalBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  addHint: { fontSize: 12, color: '#999', marginTop: 8, textAlign: 'center' },

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
