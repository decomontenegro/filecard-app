import React from 'react';
import {
  View, Text, ActivityIndicator, StyleSheet,
} from 'react-native';
import { theme } from '@/constants/theme';
import type { MarketPriceEntry } from '@/hooks/useMarketPrices';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MarketPriceCardProps {
  prices: MarketPriceEntry[];
  loading: boolean;
  error: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DISPLAY_GRADES = ['C10', 'C9', 'C8', 'C7', 'C6', 'C5'];

function formatBRL(value: number): string {
  return value > 0
    ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
    : '—';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MarketPriceCard({ prices, loading, error }: MarketPriceCardProps) {
  // Filter to grades C5–C10 only, build a quick lookup map
  const priceMap = new Map<string, MarketPriceEntry>();
  for (const entry of prices) {
    if (DISPLAY_GRADES.includes(entry.condition_grade)) {
      // Keep the most recently fetched entry per grade
      const existing = priceMap.get(entry.condition_grade);
      if (!existing || new Date(entry.fetched_at) > new Date(existing.fetched_at)) {
        priceMap.set(entry.condition_grade, entry);
      }
    }
  }

  const mostRecentFetch = prices.length > 0
    ? prices.reduce((latest, row) =>
        new Date(row.fetched_at) > new Date(latest.fetched_at) ? row : latest
      )
    : null;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator color={theme.colors.primary} size="small" />
        <Text style={styles.stateText}>Buscando preços de mercado...</Text>
      </View>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error && priceMap.size === 0) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.errorText}>Precos indisponiveis agora</Text>
      </View>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (priceMap.size === 0) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateText}>Sem dados de mercado ainda</Text>
      </View>
    );
  }

  // ── Price grid ─────────────────────────────────────────────────────────────
  return (
    <View>
      <View style={styles.grid}>
        {DISPLAY_GRADES.map((grade) => {
          const entry = priceMap.get(grade);
          const isTop = grade === 'C10';
          return (
            <View
              key={grade}
              style={[
                styles.cell,
                isTop && styles.cellHighlight,
              ]}
            >
              <Text style={[styles.cellGrade, isTop && styles.cellGradeHighlight]}>
                {grade}
              </Text>
              <Text style={[styles.cellPrice, isTop && styles.cellPriceHighlight]}>
                {entry ? formatBRL(entry.price_brl) : '—'}
              </Text>
            </View>
          );
        })}
      </View>

      {mostRecentFetch && (
        <Text style={styles.source}>
          via eBay · {formatDate(mostRecentFetch.fetched_at)}
        </Text>
      )}

      {error && (
        <Text style={styles.staleBanner}>Dados podem estar desatualizados</Text>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  stateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  stateText: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  errorText: {
    fontSize: 13,
    color: '#c0392b',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cell: {
    backgroundColor: '#f5f5f0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 80,
    // Soft shadow
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  cellHighlight: {
    backgroundColor: theme.colors.primary,
  },
  cellGrade: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  cellGradeHighlight: {
    color: '#fff',
  },
  cellPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
    marginTop: 2,
  },
  cellPriceHighlight: {
    color: '#fff',
  },
  source: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 8,
  },
  staleBanner: {
    fontSize: 11,
    color: '#e67e22',
    marginTop: 4,
  },
});
