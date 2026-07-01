import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { formatDid } from '../utils/format.js';

const KYC_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Sin verificar', color: '#FFB300' },
  1: { label: 'KYC Nivel 1', color: '#00C2FF' },
  2: { label: 'KYC Nivel 2', color: '#00E676' },
  3: { label: 'KYC Nivel 3', color: '#7C4DFF' },
};

interface Props {
  did: string;
  fullName: string;
  email: string;
  documentType: string;
  documentNumber: string;
  countryCode: string;
  kycLevel: number;
  selfieUrl: string | null;
  status: string;
  onQRPress?: () => void;
}

export function NeuroIDCard({
  did, fullName, email, documentType, documentNumber,
  countryCode, kycLevel, selfieUrl, status, onQRPress,
}: Props) {
  const kyc = KYC_LABELS[kycLevel] ?? KYC_LABELS[0];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>NEURO</Text>
          <Text style={styles.logoAccent}>ID</Text>
        </View>
        <View style={[styles.statusBadge, { borderColor: status === 'ACTIVE' ? '#00E676' : '#FFB300' }]}>
          <Text style={[styles.statusText, { color: status === 'ACTIVE' ? '#00E676' : '#FFB300' }]}>
            {status}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.selfieContainer}>
          {selfieUrl ? (
            <Image source={{ uri: selfieUrl }} style={styles.selfie} />
          ) : (
            <View style={styles.selfiePlaceholder}>
              <Text style={styles.selfieInitial}>{fullName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={[styles.kycBadge, { backgroundColor: kyc.color }]}>
            <Text style={styles.kycText}>{kyc.label}</Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{email}</Text>
          <View style={styles.divider} />
          <Text style={styles.fieldLabel}>DID</Text>
          <Text style={styles.fieldValue}>{formatDid(did)}</Text>
          <Text style={styles.fieldLabel}>{documentType}</Text>
          <Text style={styles.fieldValue}>{documentNumber} · {countryCode}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.qrButton} onPress={onQRPress} activeOpacity={0.8}>
        <Text style={styles.qrButtonText}>📲  Ver QR de Wallet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#132848',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    shadowColor: '#00C2FF',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoRow: { flexDirection: 'row' },
  logoText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', letterSpacing: 1 },
  logoAccent: { color: '#00C2FF', fontSize: 18, fontWeight: '700' },
  statusBadge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  body: { flexDirection: 'row', gap: 14 },
  selfieContainer: { alignItems: 'center' },
  selfie: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: '#00C2FF' },
  selfiePlaceholder: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#1E3A5F', borderWidth: 2, borderColor: '#00C2FF',
    alignItems: 'center', justifyContent: 'center',
  },
  selfieInitial: { color: '#00C2FF', fontSize: 28, fontWeight: '700' },
  kycBadge: { marginTop: 6, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  kycText: { color: '#0A1628', fontSize: 9, fontWeight: '700' },
  info: { flex: 1 },
  name: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  email: { color: '#8BA3C7', fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#1E3A5F', marginVertical: 8 },
  fieldLabel: { color: '#8BA3C7', fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginTop: 4 },
  fieldValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '500', fontFamily: 'monospace' },
  qrButton: {
    marginTop: 14, backgroundColor: '#0A1628', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: '#00C2FF',
  },
  qrButtonText: { color: '#00C2FF', fontSize: 14, fontWeight: '600' },
});
