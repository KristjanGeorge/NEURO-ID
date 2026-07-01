import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { IIoTStatusBadge } from '../components/IIoTStatusBadge.js';
import { formatNcn, formatDate } from '../utils/format.js';

export function TokenDetailScreen({ route, navigation }: any) {
  const { token } = route.params;

  const ASSET_ICONS: Record<string, string> = {
    REAL_ESTATE: '🏢', INFRASTRUCTURE: '🏗️', EMISSION_RIGHT: '🌿',
    EQUIPMENT: '⚙️', FUND_UNIT: '📊', OTHER: '📦',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.icon}>{ASSET_ICONS[token.assetType] ?? '📦'}</Text>
        <Text style={styles.name}>{token.projectName}</Text>
        <Text style={styles.type}>{token.assetType}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Detalles del Activo</Text>
        <Row label="Referencia" value={token.assetReference} />
        <Row label="Token ID" value={token.tokenId} mono />
        <Row label="Cantidad" value={formatNcn(token.quantityMicros)} />
        <Row label="Valor nominal" value={formatNcn(token.nominalValueMicros)} />
        <Row label="Valor actual" value={formatNcn(token.currentValueMicros)} accent />
        <Row label="Adquirido" value={formatDate(token.acquiredAt)} />
        <Row label="Estado" value={token.status} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Conexión IIoT (IEEE P1451.99)</Text>
        <IIoTStatusBadge status="CONNECTED" />
        <Text style={styles.hint}>El activo físico reporta telemetría vía XMPP/ejabberd</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Documentos Legales</Text>
        <Text style={styles.hint}>Documentación provista por LynxNode Trust. Disponible en NeuroPocket.</Text>
        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('NeuroPocket')}>
          <Text style={styles.linkTxt}>Ver NeuroPocket →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Acciones</Text>
        <TouchableOpacity style={styles.sellBtn} onPress={() => Alert.alert('Vender', 'Se abrirá el formulario de venta en el mercado secundario.')}>
          <Text style={styles.sellTxt}>Vender en mercado secundario</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.escrowBtn} onPress={() => navigation.navigate('Support')}>
          <Text style={styles.escrowTxt}>Solicitar liquidación con escrow</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Row({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={[rowStyles.value, mono && rowStyles.mono, accent && rowStyles.accent]}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#1E3A5F' },
  label: { color: '#8BA3C7', fontSize: 12 },
  value: { color: '#FFFFFF', fontSize: 12, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  mono: { fontFamily: 'monospace' },
  accent: { color: '#00C2FF', fontWeight: '700' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1F3C' },
  content: { padding: 16 },
  hero: { alignItems: 'center', marginVertical: 20 },
  icon: { fontSize: 48, marginBottom: 8 },
  name: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  type: { color: '#8BA3C7', fontSize: 13, marginTop: 4 },
  card: { backgroundColor: '#132848', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1E3A5F' },
  cardTitle: { color: '#00C2FF', fontSize: 13, fontWeight: '700', marginBottom: 12, letterSpacing: 0.5 },
  hint: { color: '#8BA3C7', fontSize: 12, marginTop: 8, lineHeight: 18 },
  linkBtn: { marginTop: 8 },
  linkTxt: { color: '#00C2FF', fontSize: 13 },
  sellBtn: { backgroundColor: '#00C2FF22', borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#00C2FF', marginBottom: 8 },
  sellTxt: { color: '#00C2FF', fontWeight: '600' },
  escrowBtn: { backgroundColor: '#FFB30022', borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FFB300' },
  escrowTxt: { color: '#FFB300', fontWeight: '600' },
});
