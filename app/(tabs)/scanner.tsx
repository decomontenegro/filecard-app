import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { Camera, Upload, CheckCircle, XCircle, ChevronRight } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../constants/theme';
import { getCatalogItems } from '../../db/database';

type ScanState = 'idle' | 'processing' | 'results' | 'confirmed';

export default function ScannerScreen() {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);

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
    // Simula análise AI (fase 1: top match simples do catálogo)
    await new Promise(r => setTimeout(r, 2000));
    const allItems = await getCatalogItems();
    // Simula candidatos (fase 1: retorna top 3 por market value)
    const top3 = allItems
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((item, i) => ({ ...item, confidence: Math.round(90 - i * 18) }));
    setCandidates(top3);
    setScanState('results');
  }

  function reset() {
    setScanState('idle');
    setSelectedImage(null);
    setCandidates([]);
  }

  const formatBRL = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.logo}>🎖️ filecard</Text>
        <Text style={styles.title}>Scanner</Text>
      </View>

      {scanState === 'idle' && (
        <View style={styles.idleContainer}>
          <View style={styles.scanArea}>
            <Camera size={64} color={theme.colors.primary} strokeWidth={1.5} />
            <Text style={styles.scanTitle}>Identifique sua figura</Text>
            <Text style={styles.scanSubtitle}>Tire uma foto ou envie da galeria{'\n'}para identificar a figura automaticamente</Text>
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
          <Text style={styles.tipText}>💡 Dica: foto com fundo neutro e boa iluminação dá resultados melhores</Text>
        </View>
      )}

      {scanState === 'processing' && (
        <View style={styles.processingContainer}>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />
          )}
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 24 }} />
          <Text style={styles.processingText}>Analisando figura...</Text>
          <Text style={styles.processingSubtext}>Comparando com catálogo de 20 figuras ARAH</Text>
        </View>
      )}

      {scanState === 'results' && (
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.previewImageSmall} resizeMode="cover" />
          )}
          <Text style={styles.resultsTitle}>Candidatos encontrados</Text>
          {candidates.map((item, i) => (
            <TouchableOpacity key={item.id} style={[styles.candidateCard, i === 0 && styles.candidateCardTop]}>
              <View style={styles.candidateRank}>
                <Text style={styles.candidateRankText}>{'🥇🥈🥉'[i]}</Text>
              </View>
              <View style={styles.candidateInfo}>
                <Text style={styles.candidateName}>{item.display_name}</Text>
                <Text style={styles.candidateYear}>{item.year} • {item.line_name}</Text>
                <Text style={styles.candidateValue}>{formatBRL(item.market_value_brl)}</Text>
              </View>
              <View style={[styles.confidenceBadge, { backgroundColor: i === 0 ? theme.colors.success : '#e0e0e0' }]}>
                <Text style={[styles.confidenceText, { color: i === 0 ? '#fff' : '#666' }]}>{item.confidence}%</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={styles.resultsActions}>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => setScanState('confirmed')}>
              <CheckCircle size={18} color="#fff" />
              <Text style={styles.btnPrimaryText}>Adicionar à Coleção</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={reset}>
              <XCircle size={18} color={theme.colors.primary} />
              <Text style={styles.btnSecondaryText}>Nova Foto</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {scanState === 'confirmed' && (
        <View style={styles.confirmedContainer}>
          <Text style={styles.confirmedEmoji}>✅</Text>
          <Text style={styles.confirmedTitle}>Adicionado!</Text>
          <Text style={styles.confirmedSubtitle}>{candidates[0]?.display_name} foi adicionado à sua coleção</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={reset}>
            <Text style={styles.btnPrimaryText}>Escanear outra figura</Text>
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
  idleContainer: { flex: 1, padding: 24 },
  scanArea: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderRadius: 24, marginBottom: 24,
    borderWidth: 2, borderStyle: 'dashed', borderColor: theme.colors.primary + '40',
    padding: 40,
  },
  scanTitle: { fontSize: 20, fontWeight: '700', color: '#000', marginTop: 16, marginBottom: 8 },
  scanSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },
  buttons: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  btnPrimary: {
    flex: 1, backgroundColor: theme.colors.primary, borderRadius: 14,
    paddingVertical: 14, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnSecondary: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14,
    paddingVertical: 14, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, borderWidth: 2, borderColor: theme.colors.primary,
  },
  btnSecondaryText: { color: theme.colors.primary, fontSize: 15, fontWeight: '700' },
  tipText: { color: '#888', fontSize: 13, textAlign: 'center', lineHeight: 18 },
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
  },
  candidateCardTop: { borderWidth: 2, borderColor: theme.colors.primary },
  candidateRank: { width: 32, alignItems: 'center' },
  candidateRankText: { fontSize: 22 },
  candidateInfo: { flex: 1 },
  candidateName: { fontSize: 15, fontWeight: '700', color: '#000' },
  candidateYear: { color: '#666', fontSize: 12, marginTop: 2 },
  candidateValue: { color: theme.colors.primary, fontSize: 14, fontWeight: '700', marginTop: 2 },
  confidenceBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  confidenceText: { fontSize: 13, fontWeight: '700' },
  resultsActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  confirmedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  confirmedEmoji: { fontSize: 64, marginBottom: 16 },
  confirmedTitle: { fontSize: 28, fontWeight: '800', color: '#000', marginBottom: 8 },
  confirmedSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
});
