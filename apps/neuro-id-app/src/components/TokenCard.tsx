import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatNcn } from '../utils/format.js';

const ASSET_ICONS: Record<string, string> = {
  REAL_ESTATE: '🏢', INFRASTRUCTURE: '🏗️', EMISSION_RIGHT: '🌿',
  EQUIPMENT: '⚙️', FUND_UNIT: '📊', OTHER: '📦',
};

interface Props {
  tokenId: string;
  projectName: string;
  assetType: string;
  assetReference: string;
  quantityMicros: string;
  currentValueMicros: string;
  status: string;
  onPress?: () => void;
}

export function TokenCard({ tokenId, projectName, assetType, assetReference, quantityMicros, currentValueMicros, status, onPress }: Props) {
  const icon = ASSET_ICONS[assetType] ?? '📦';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.row}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{projectName}</Text>
          <Text style={styles.reference} numberOfLines={1}>{assetReference}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: status === 'ACTIVE' ? '#00E67622' : '#FFB30022' }]}>
          <Text style={[styles.badgeText, { color: status === 'ACTIVE' ? '#00E676' : '#FFB300' }]}>{status}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Cantidad</Text>
          <Text style={styles.footerValue}>{formatNcn(quantityMicros)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.footerLabel}>Valor actual</Text>
          <Text style={[styles.footerValue, { color: '#00C2FF' }]}>{formatNcn(currentValueMicros)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#132848', borderRadius: 12, padding: 14,
    marginHorizontal: 16, marginVertical: 5, borderWidth: 1, borderColor: '#1E3A5F',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { fontSize: 28 },
  info: { flex: 1 },
  name: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  reference: { color: '#8BA3C7', fontSize: 11, marginTop: 2 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#1E3A5F' },
  footerLabel: { color: '#8BA3C7', fontSize: 10, letterSpacing: 0.5 },
  footerValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginTop: 2 },
});
