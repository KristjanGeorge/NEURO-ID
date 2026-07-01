import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/auth.store.js';
import { NeuroIDCard } from '../components/NeuroIDCard.js';
import { QRModal } from '../components/QRModal.js';
import * as identityService from '../services/identity.service.js';
import * as qrUtils from '../utils/qr.js';

export function IdentityScreen() {
  const { identity } = useAuthStore();
  const [qrVisible, setQrVisible] = useState(false);
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQRPress = async () => {
    if (!identity) return;
    setLoading(true);
    try {
      const { qr, payload } = await identityService.getQR(identity.did, 'PAYMENT');
      setQrData(JSON.stringify(payload));
      setQrVisible(true);
    } catch {
      const local = qrUtils.buildQRString('PAYMENT', identity.did, identity.walletAddress);
      setQrData(local);
      setQrVisible(true);
    } finally {
      setLoading(false);
    }
  };

  if (!identity) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <NeuroIDCard
        did={identity.did}
        fullName={identity.fullName}
        email={identity.email}
        documentType={identity.documentType}
        documentNumber={identity.documentNumber}
        countryCode={identity.countryCode}
        kycLevel={identity.kycLevel}
        selfieUrl={identity.selfieUrl}
        status={identity.status}
        onQRPress={handleQRPress}
      />

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#00C2FF" size="small" />
        </View>
      )}

      <QRModal
        visible={qrVisible}
        qrData={qrData}
        title="QR de Wallet"
        subtitle={`${identity.walletAddress}`}
        onClose={() => setQrVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1F3C' },
  content: { paddingVertical: 20 },
  loadingRow: { alignItems: 'center', marginTop: 10 },
});
