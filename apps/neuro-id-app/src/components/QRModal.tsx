import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface Props {
  visible: boolean;
  qrData: string;
  title?: string;
  subtitle?: string;
  onClose: () => void;
}

export function QRModal({ visible, qrData, title = 'Wallet QR', subtitle, onClose }: Props) {
  const handleShare = () => {
    Share.share({ message: qrData, title: 'NEURO-ID Wallet QR' });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

          <View style={styles.qrContainer}>
            <QRCode
              value={qrData}
              size={220}
              color="#0A1628"
              backgroundColor="#FFFFFF"
              ecl="M"
            />
          </View>

          <Text style={styles.hint}>Muestra este QR en el sitio de NEUROTOKEN para pagos, transferencias y autorizaciones</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareTxt}>Compartir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeTxt}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(10,22,40,0.92)', justifyContent: 'center', alignItems: 'center' },
  sheet: { backgroundColor: '#132848', borderRadius: 20, padding: 24, width: 310, alignItems: 'center', borderWidth: 1, borderColor: '#1E3A5F' },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: '#8BA3C7', fontSize: 12, marginBottom: 16, textAlign: 'center' },
  qrContainer: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, marginVertical: 16 },
  hint: { color: '#8BA3C7', fontSize: 11, textAlign: 'center', lineHeight: 16, marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 10, width: '100%' },
  shareBtn: { flex: 1, backgroundColor: '#00C2FF22', borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#00C2FF' },
  shareTxt: { color: '#00C2FF', fontWeight: '600' },
  closeBtn: { flex: 1, backgroundColor: '#1E3A5F', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  closeTxt: { color: '#8BA3C7', fontWeight: '600' },
});
