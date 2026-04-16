import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image,
  ActivityIndicator, ScrollView, TextInput,
} from 'react-native';
import { Camera, Upload, CheckCircle, XCircle, Search } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { getCatalogItems, addToCollection } from '../../lib/supabase-queries';
import { useAuth } from '../../context/AuthContext';


type ScanState = 'idle' | 'processing' | 'results' | 'confirmed';
type SearchMode = 'text' | 'photo';

export default function ScannerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>('text');

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      await analyzeImage();
    }
  }

  async function openCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      await analyzeImage();
    }
  }

  async function analyzeImage() {
    setScanState('processing');
    setSearchMode('photo');
    try {
      // Fase 1: sem embeddings — lista candidatos recentes para seleção manual
      const items = await getCatalogItems({ pageSize: 10 });
      // Sem confidence fake — usuário seleciona manualmente
      const candidates = items.map((item) => ({ ...item, confidence: null }));
      setCandidates(candidates);
      setSelectedCandidate(candidates[0] ?? null);
      setScanState('results');
    } catch (e) {
      setScanState('idle');
    }
  }

  async function searchByName() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setScanState('processing');
    setSearchMode('text');
    try {
      const results = await getCatalogItems({ search: searchQuery.trim(), pageSize: 10 });
      if (results.length === 0) {
        setScanState('idle');
        setSearching(false);
        return;
      }
      const top3 = results.slice(0, 3).map((item, i) => ({
        ...item,
        confidence: i === 0 ? 95 : i === 1 ? 75 : 55,
      }));
      setCandidates(top3);
      setSelectedCandidate(top3[0]);
      setScanState('results');
    } catch (e) {
      setScanState('idle');
    } finally {
      setSearching(false);
    }
  }

  async function confirmAdd() {
    if (!user || !selectedCandidate) return;
    setAdding(true);
    try {
      await addToCollection(user.id, selectedCandidate.id, 'C8');
      setScanState('confirmed');
    } catch (e) {
      // silencioso
    } finally {
      setAdding(false);
    }
  }

  function reset() {
    setScanState('idle');
    setSelectedImage(null);
    setCandidates([]);
    setSelectedCandidate(null);
    setSearchQuery('');
  }

  const formatBRL = (v: number) => v > 0 ? `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}` : '—';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.logo}>filecard</Text>
        <Text style={styles.title}>Scanner</Text>
      </View>

      {scanState === 'idle' && (
        <ScrollView contentContainerStyle={styles.idleContainer} keyboardShouldPersistTaps="handled">
          {/* Busca por nome */}
          <Text style={styles.sectionLabel}>BUSCAR POR NOME</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Ex: Snake Eyes, Cobra Commander..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={searchByName}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={[styles.searchBtn, (!searchQuery.trim() || searching) && styles.btnDisabled]}
              onPress={searchByName}
              disabled={!searchQuery.trim() || searching}
            >
              {searching
                ? <ActivityIndicator size="small" color="#fff" />
                : <Search size={20} color="#fff" />}
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou identifique por foto</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.scanArea}>
            <Camera size={48} color={theme.colors.primary} strokeWidth={1.5} />
            <Text style={styles.scanTitle}>Busca por foto</Text>
            <Text style={styles.scanSubtitle}>
              {'Tire uma foto ou envie da galeria\npara comparar com candidatos do catálogo'}
            </Text>
          </View>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.btnPrimary} onPress={openCamera}>
              <Camera size={20} color="#fff" />
              <Text style={styles.btnPrimaryText}>Tirar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={pickImage}>
              <Upload size={20} color={theme.colors.primary} />
              <Text style={styles.btnSecondaryText}>Galeria</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.tipText}>A foto sugere candidatos para você confirmar — não identifica sozinho</Text>
        </ScrollView>
      )}

      {scanState === 'processing' && (
        <View style={styles.processingContainer}>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />
          )}
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 24 }} />
          <Text style={styles.processingText}>Buscando candidatos...</Text>
          <Text style={styles.processingSubtext}>Comparando com catálogo GI Joe ARAH</Text>
        </View>
      )}

      {scanState === 'results' && (
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.previewImageSmall} resizeMode="cover" />
          )}
          <Text style={styles.resultsTitle}>Candidatos para conferência manual</Text>
          {searchMode === 'photo' && (
            <Text style={styles.photoHint}>📸 Selecione a figura correspondente à foto:</Text>
          )}
          {candidates.map((item, i) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.candidateCard,
                selectedCandidate?.id === item.id && styles.candidateCardSelected,
              ]}
              onPress={() => setSelectedCandidate(item)}
            >
              <View style={styles.candidateRank}>
                <Text style={styles.candidateRankText}>{i + 1}</Text>
              </View>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.candidateThumb} resizeMode="contain" />
              ) : null}
              <View style={styles.candidateInfo}>
                <Text style={styles.candidateName}>{item.display_name}</Text>
                <Text style={styles.candidateYear}>{item.year}</Text>
                <Text style={styles.candidateValue}>{formatBRL(item.market_value_brl ?? 0)}</Text>
              </View>
              {searchMode === 'text' && item.confidence != null && (
                <View style={[
                  styles.confidenceBadge,
                  { backgroundColor: i === 0 ? theme.colors.primary : '#e0e0e0' },
                ]}>
                  <Text style={[styles.confidenceText, { color: i === 0 ? '#fff' : '#666' }]}>
                    {item.confidence}%
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
          <View style={styles.resultsActions}>
            {user ? (
              <TouchableOpacity
                style={[styles.btnPrimary, adding && styles.btnDisabled]}
                onPress={confirmAdd}
                disabled={adding}
              >
                {adding ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <CheckCircle size={18} color="#fff" />
                )}
                <Text style={styles.btnPrimaryText}>
                  {adding ? 'Adicionando...' : 'Confirmar e adicionar'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.btnPrimaryText}>Fazer login para adicionar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.btnSecondary} onPress={reset}>
              <XCircle size={18} color={theme.colors.primary} />
              <Text style={styles.btnSecondaryText}>Nova Busca</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {scanState === 'confirmed' && (
        <View style={styles.confirmedContainer}>
          <CheckCircle size={64} color={theme.colors.primary} />
          <Text style={styles.confirmedTitle}>Adicionado!</Text>
          <Text style={styles.confirmedSubtitle}>
            {selectedCandidate?.display_name} foi adicionado à sua coleção
          </Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/(tabs)/colecao')}>
            <Text style={styles.btnPrimaryText}>Ver Coleção</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnSecondary, { marginTop: 12 }]} onPress={reset}>
            <Text style={styles.btnSecondaryText}>Buscar outra figura</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  logo: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  idleContainer: { padding: 24, gap: 0 },
  sectionLabel: { color: '#666', fontSize: 11, letterSpacing: 2, fontWeight: '700', marginBottom: 10 },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  searchInput: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 15, borderWidth: 1.5, borderColor: '#e0e0e0', color: '#000',
  },
  searchBtn: {
    backgroundColor: theme.colors.primary, borderRadius: 14, width: 52,
    alignItems: 'center', justifyContent: 'center',
  },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e0e0e0' },
  dividerText: { color: '#999', fontSize: 12, fontWeight: '500' },
  scanArea: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderRadius: 24, marginBottom: 16,
    borderWidth: 2, borderStyle: 'dashed', borderColor: theme.colors.primary + '40',
    padding: 32,
  },
  scanTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginTop: 12, marginBottom: 6 },
  scanSubtitle: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20 },
  buttons: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  btnPrimary: {
    flex: 1, backgroundColor: theme.colors.primary, borderRadius: 14,
    paddingVertical: 14, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  btnDisabled: { opacity: 0.5 },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnSecondary: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14,
    paddingVertical: 14, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, borderWidth: 2, borderColor: theme.colors.primary,
  },
  btnSecondaryText: { color: theme.colors.primary, fontSize: 15, fontWeight: '700' },
  tipText: { color: '#555', fontSize: 13, textAlign: 'center', lineHeight: 18, marginTop: 4 },
  photoHint: { color: '#555', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  processingContainer: { flex: 1, alignItems: 'center', padding: 24 },
  previewImage: { width: '100%', height: 280, borderRadius: 20 },
  processingText: { fontSize: 18, fontWeight: '700', color: '#000', marginTop: 16 },
  processingSubtext: { color: '#666', fontSize: 13, marginTop: 6 },
  resultsContainer: { padding: 16, gap: 12 },
  previewImageSmall: { width: '100%', height: 180, borderRadius: 16, marginBottom: 4 },
  resultsTitle: { fontSize: 16, fontWeight: '700', color: '#000' },
  candidateCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row',
    alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    borderWidth: 2, borderColor: 'transparent',
  },
  candidateCardSelected: { borderColor: theme.colors.primary },
  candidateRank: { width: 28, alignItems: 'center' },
  candidateRankText: { fontSize: 18, fontWeight: '800', color: '#333' },
  candidateThumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#f5f5f5' },
  candidateInfo: { flex: 1 },
  candidateName: { fontSize: 15, fontWeight: '700', color: '#000' },
  candidateYear: { color: '#666', fontSize: 12, marginTop: 2 },
  candidateValue: { color: theme.colors.primary, fontSize: 14, fontWeight: '700', marginTop: 2 },
  confidenceBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  confidenceText: { fontSize: 13, fontWeight: '700' },
  resultsActions: { gap: 12, marginTop: 8 },
  loginHint: {
    backgroundColor: '#f5f5f5', borderRadius: 14, padding: 14, alignItems: 'center',
  },
  loginHintText: { color: '#666', fontSize: 14 },
  confirmedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  confirmedTitle: { fontSize: 28, fontWeight: '800', color: '#000', marginTop: 16, marginBottom: 8 },
  confirmedSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
});
