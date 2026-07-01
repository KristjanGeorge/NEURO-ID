import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuthStore } from '../store/auth.store.js';
import * as identityService from '../services/identity.service.js';
import { buildQRString } from '../utils/qr.js';

export function QRScreen() {
  const { identity } = useAuthStore();
  const [qrData, setQrData] = useState('');
  const [qrType, setQrType] = useState<'PAYMENT' | 'AUTH' | 'TRANSFER'>('AUTH');
  const [loading, setLoading] = useState(false);

  const loadQR = async (type: typeof qrType) => {
    if (!identity) return;
    setLoading(true);
    try {
      const { payload } = await identityService.getQR(identity.did, type);
      setQrData(JSON.stringify(payload));
    } catch {
      setQrData(buildQRString(type, identity.did, identity.walletAddress));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQR(qrType); }, [qrType]);

  const handleShare = () => {
    Share.share({ message: qrData, title: 'NEURO-ID Wallet QR' });
  };

  const labels: Record<typeof qrType, string> = {
    AUTH: 'Autorización',
    PAYMENT: 'Pago',
    TRANSFER: 'Transferencia',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>QR de Wallet</Text>
      <Text style={styles.subtitle}>{identity?.walletAddress}</Text>

      <View style={styles.tabRow}>
        {(['AUTH', 'PAYMENT', 'TRANSFER'] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, qrType === t && styles.tabActive]} onPress={() => setQrType(t)}>
            <Text style={[styles.tabText, qrType === t && styles.tabTextActive]}>{labels[t]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.qrContainer}>
        {loading ? (
          <ActivityIndicator color="#00C2FF" size="large" />
        ) : (
          <QRCode value={qrData || 'neuro-id-loading'} size={240} color="#0A1628" backgroundColor="#FFFFFF" ecl="M" />
        )}
      </View>

      <Text style={styles.hint}>
        {qrType === 'PAYMENT' && 'Muestra este QR para recibir pagos en NEUROTOKEN'}
        {qrType === 'AUTH' && 'Muestra este QR para autenticarte en el sitio de NEUROTOKEN'}
        {qrType === 'TRANSFER' && 'Muestra este QR para recibir transferencias de otros usuarios'}
      </Text>

      <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
        <Text style={styles.shareTxt}>Compartir QR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1F3C', padding: 20, alignItems: 'center' },
  header: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginTop: 10 },
  subtitle: { color: '#8BA3C7', fontSize: 11, fontFamily: 'monospace', marginTop: 4, marginBottom: 20 },
  tabRow: { flexDirection: 'row', backgroundColor: '#132848', borderRadius: 10, padding: 3, marginBottom: 24, gap: 2 },
  tab: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  tabActive: { backgroundColor: '#00C2FF' },
  tabText: { color: '#8BA3C7', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#0A1628' },
  qrContainer: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 20, alignItems: 'center', justifyContent: 'center', minHeight: 270 },
  hint: { color: '#8BA3C7', fontSize: 13, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  shareBtn: { backgroundColor: '#00C2FF', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40 },
  shareTxt: { color: '#0A1628', fontWeight: '700', fontSize: 16 },
});
