import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { Plus, Award, RefreshCw, Trash2, CheckCircle, AlertCircle, Circle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { useCollection } from '../../hooks/useCollection';
import { useAuth } from '../../context/AuthContext';


const formatBRL = (v: number) => `R$ ${(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;

const getAppreciation = (paid: number | undefined, market: number | undefined) => {
  if (!paid || paid === 0 || !market) return null;
  const pct = ((market - paid) / paid) * 100;
  return pct > 0 ? `+${pct.toFixed(0)}%` : `${pct.toFixed(0)}%`;
};

const CONDITION_COLORS: Record<string, string> = {
  C10: '#4CAF50', C9: '#8BC34A', C8: '#CDDC39',
  C7: '#FFC107', C6: '#FF9800', C5: '#FF5722',
};

export default function ColecaoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, stats, loading, error, remove, refresh } = useCollection(user?.id ?? null);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.logo}>filecard</Text>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Minha Coleção</Text>
            <Text style={styles.subtitle}>
              {stats.totalItems} figuras
              {stats.appreciation !== 0 && ` • ${stats.appreciation >= 0 ? '+' : ''}${stats.appreciation}%`}
            </Text>
          </View>
          <TouchableOpacity style={styles.fab} onPress={() => router.push('/(tabs)/scanner')}>
            <Plus size={24} color="#fff" strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
            <RefreshCw size={16} color="#fff" />
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>—</Text>
          <Text style={styles.emptyTitle}>Coleção vazia</Text>
          <Text style={styles.emptySubtitle}>Adicione figuras pelo catálogo ou escaneie uma</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/catalogo')}>
            <Text style={styles.emptyBtnText}>Ver Catálogo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {/* Resumo financeiro */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>INVESTIDO</Text>
              <Text style={styles.summaryValue}>{formatBRL(stats.totalPaid)}</Text>
            </View>
            <View style={styles.summarySep} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>VALOR ATUAL</Text>
              <Text style={styles.summaryValue}>{formatBRL(stats.totalMarket)}</Text>
            </View>
            <View style={styles.summarySep} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>GANHO</Text>
              <Text style={[styles.summaryValue, { color: stats.appreciation >= 0 ? '#4CAF50' : '#e53e3e' }]}>
                {stats.appreciation >= 0 ? '+' : ''}{formatBRL(stats.totalMarket - stats.totalPaid)}
              </Text>
            </View>
          </View>

          {items.map((item) => {
            const app = getAppreciation(item.price_paid, item.market_value);
            const conditionColor = CONDITION_COLORS[item.condition_grade ?? ''] ?? theme.colors.primary;
            const handleRemove = () => {
              Alert.alert(
                'Remover figura',
                `Remover ${item.catalog_item?.display_name ?? 'esta figura'} da coleção?`,
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Remover', style: 'destructive', onPress: () => remove(item.id) },
                ]
              );
            };
            return (
              <TouchableOpacity key={item.id} style={styles.itemCard} activeOpacity={0.85}>
                <View style={styles.thumbContainer}>
                  {item.primary_photo_url ? (
                    <Image source={{ uri: item.primary_photo_url }} style={styles.thumb} resizeMode="cover" />
                  ) : (
                    <View style={[styles.thumb, styles.thumbPlaceholder]}>
                      <Text style={styles.thumbEmoji}>?</Text>
                    </View>
                  )}
                </View>
                <View style={styles.itemInfo}>
                  <View style={styles.itemTop}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.catalog_item?.display_name ?? 'Figura'}
                    </Text>
                    <View style={[styles.conditionBadge, { backgroundColor: conditionColor }]}>
                      <Award size={10} color="#fff" />
                      <Text style={styles.conditionText}>{item.condition_grade ?? '—'}</Text>
                    </View>
                  </View>
                  <View style={styles.yearRow}>
                    <Text style={styles.itemYear}>{item.catalog_item?.year ?? ''}</Text>
                    {item.completeness_status && (
                      <View style={[
                        styles.completenessBadge,
                        item.completeness_status === 'complete'
                          ? styles.completeBadge
                          : item.completeness_status === 'incomplete'
                          ? styles.incompleteBadge
                          : styles.strippedBadge,
                      ]}>
                        {item.completeness_status === 'complete' ? (
                          <CheckCircle size={10} color="#fff" />
                        ) : item.completeness_status === 'incomplete' ? (
                          <AlertCircle size={10} color="#fff" />
                        ) : (
                          <Circle size={10} color="#fff" />
                        )}
                        <Text style={styles.completenessText}>
                          {item.completeness_status === 'complete'
                            ? 'Completo'
                            : item.completeness_status === 'incomplete'
                            ? 'Incompleto'
                            : 'Sem acess.'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.itemBottom}>
                    <Text style={styles.priceText}>
                      {formatBRL(item.price_paid ?? 0)}
                      <Text style={styles.arrow}> → </Text>
                      <Text style={styles.priceMarket}>{formatBRL(item.market_value ?? 0)}</Text>
                    </Text>
                    {app && (
                      <View style={[
                        styles.appreciationPill,
                        { backgroundColor: app.startsWith('+') ? theme.colors.appreciation : '#FF5722' }
                      ]}>
                        <Text style={styles.appreciationText}>{app}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <TouchableOpacity onPress={handleRemove} style={styles.removeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Trash2 size={16} color="#ccc" />
                </TouchableOpacity>
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
  header: { backgroundColor: theme.colors.primaryLight ?? theme.colors.primary, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  logo: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 10 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  fab: {
    backgroundColor: theme.colors.primary, width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: theme.colors.primary, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  summaryCard: {
    backgroundColor: '#fff', margin: 12, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: '#888', fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  summaryValue: { color: '#000', fontSize: 14, fontWeight: '700' },
  summarySep: { width: 1, height: 32, backgroundColor: '#f0f0f0', marginHorizontal: 8 },
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
    borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
    flexDirection: 'row', alignItems: 'center', gap: 3,
  },
  conditionText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  itemYear: { color: '#666', fontSize: 12 },
  yearRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  completenessBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2,
  },
  completeBadge: { backgroundColor: '#4CAF50' },
  incompleteBadge: { backgroundColor: '#FF9800' },
  strippedBadge: { backgroundColor: '#9E9E9E' },
  completenessText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  itemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  priceText: { fontSize: 12, color: '#888' },
  arrow: { color: '#bbb' },
  priceMarket: { fontWeight: '700', color: '#000' },
  appreciationPill: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  appreciationText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  emptyBtn: { backgroundColor: theme.colors.primary, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  errorText: { color: '#e53e3e', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  retryBtn: {
    backgroundColor: theme.colors.primary, borderRadius: 10,
    paddingHorizontal: 20, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  retryText: { color: '#fff', fontWeight: '700' },
  removeBtn: { padding: 4 },
});
