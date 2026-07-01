import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useAuthStore } from '../store/auth.store.js';
import { DocumentCard } from '../components/DocumentCard.js';
import * as pocketService from '../services/pocket.service.js';

export function NeuroPocketScreen({ navigation }: any) {
  const { identity } = useAuthStore();
  const [documents, setDocuments] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!identity) return;
    try {
      const docs = await pocketService.getDocuments(identity.did);
      setDocuments(docs);
    } catch { /* offline */ } finally { setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    Alert.alert('Eliminar documento', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        if (!identity) return;
        try { await pocketService.deleteDocument(identity.did, id); load(); }
        catch { Alert.alert('Error', 'No se pudo eliminar el documento'); }
      }},
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#00C2FF" />}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>NeuroPocket</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={() => Alert.alert('Subir documento', 'Función disponible próximamente en la app completa')}>
          <Text style={styles.uploadTxt}>+ Subir</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Bóveda personal de documentos con QR de interoperabilidad federada</Text>

      {documents.length === 0
        ? <Text style={styles.empty}>No tienes documentos. Sube tu licencia de conducir, pasaporte u otros documentos personales.</Text>
        : documents.map((d) => (
          <DocumentCard
            key={d.id}
            {...d}
            onPress={() => navigation.navigate('Document', { document: d })}
            onDelete={() => handleDelete(d.id)}
          />
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1F3C' },
  content: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  header: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  uploadBtn: { backgroundColor: '#00C2FF22', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#00C2FF' },
  uploadTxt: { color: '#00C2FF', fontWeight: '600' },
  subtitle: { color: '#8BA3C7', fontSize: 12, marginBottom: 16 },
  empty: { color: '#8BA3C7', fontSize: 13, lineHeight: 20 },
});
