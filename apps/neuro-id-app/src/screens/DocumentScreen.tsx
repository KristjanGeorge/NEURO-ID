import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Share, Linking } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { formatDate } from '../utils/format.js';

const DOC_ICONS: Record<string, string> = {
  DRIVER_LICENSE: '🪪', PASSPORT: '📘', MEDICAL: '🏥',
  INSURANCE: '🛡️', PROPERTY: '🏠', CUSTOM: '📄',
};

export function DocumentScreen({ route }: any) {
  const { document: doc } = route.params;
  const [showQR, setShowQR] = useState(false);
  const qrPayload = typeof doc.qrPayload === 'string' ? doc.qrPayload : JSON.stringify(doc.qrPayload);

  const handleShare = () => {
    Share.share({ message: qrPayload, title: `NEURO-ID Doc: ${doc.title}` });
  };

  const handleDownload = () => {
    if (doc.downloadUrl) Linking.openURL(doc.downloadUrl);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.icon}>{DOC_ICONS[doc.type] ?? '📄'}</Text>
        <Text style={styles.title}>{doc.title}</Text>
        <Text style={styles.type}>{doc.type.replace(/_/g, ' ')}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Información</Text>
        {doc.issuedBy && <Row label="Emitido por" value={doc.issuedBy} />}
        {doc.validFrom && <Row label="Válido desde" value={formatDate(doc.validFrom)} />}
        {doc.expiresAt && <Row label="Vence" value={formatDate(doc.expiresAt)} />}
        <Row label="Subido" value={formatDate(doc.createdAt)} />
        <Row label="Hash SHA-256" value={`${doc.contentHash.slice(0, 16)}...`} mono />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>QR de Interoperabilidad</Text>
        <Text style={styles.hint}>Usa este QR para compartir este documento con sistemas externos federados</Text>
        {showQR ? (
          <View style={styles.qrWrapper}>
            <QRCode value={qrPayload} size={200} color="#0A1628" backgroundColor="#FFFFFF" ecl="M" />
          </View>
        ) : (
          <TouchableOpacity style={styles.showQRBtn} onPress={() => setShowQR(true)}>
            <Text style={styles.showQRTxt}>Mostrar QR</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
          <Text style={styles.actionTxt}>📤 Compartir QR</Text>
        </TouchableOpacity>
        {doc.downloadUrl && (
          <TouchableOpacity style={[styles.actionBtn, { borderColor: '#00E676' }]} onPress={handleDownload}>
            <Text style={[styles.actionTxt, { color: '#00E676' }]}>⬇️ Descargar</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={[rowStyles.value, mono && rowStyles.mono]}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#1E3A5F' },
  label: { color: '#8BA3C7', fontSize: 12 },
  value: { color: '#FFFFFF', fontSize: 12, fontWeight: '500', maxWidth: '55%', textAlign: 'right' },
  mono: { fontFamily: 'monospace', fontSize: 10 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1F3C' },
  content: { padding: 16 },
  hero: { alignItems: 'center', marginVertical: 20 },
  icon: { fontSize: 48, marginBottom: 8 },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  type: { color: '#8BA3C7', fontSize: 13, marginTop: 4 },
  card: { backgroundColor: '#132848', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1E3A5F' },
  cardTitle: { color: '#00C2FF', fontSize: 13, fontWeight: '700', marginBottom: 12, letterSpacing: 0.5 },
  hint: { color: '#8BA3C7', fontSize: 12, marginBottom: 12, lineHeight: 18 },
  qrWrapper: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, alignSelf: 'center', marginTop: 8 },
  showQRBtn: { backgroundColor: '#00C2FF22', borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#00C2FF' },
  showQRTxt: { color: '#00C2FF', fontWeight: '600' },
  actions: { gap: 8 },
  actionBtn: { backgroundColor: '#00C2FF22', borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#00C2FF' },
  actionTxt: { color: '#00C2FF', fontWeight: '600' },
});
