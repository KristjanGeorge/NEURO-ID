import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

interface Props {
  onSuccess: (nonce?: string) => void;
  onError?: (reason: string) => void;
  label?: string;
}

export function BiometricButton({ onSuccess, onError, label = 'Iniciar con huella / Face ID' }: Props) {
  const handlePress = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      onError?.('Biometría no disponible en este dispositivo');
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verifica tu identidad',
      fallbackLabel: 'Usar PIN',
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false,
    });

    if (result.success) {
      onSuccess();
    } else {
      onError?.(result.error ?? 'Autenticación fallida');
    }
  };

  return (
    <TouchableOpacity style={styles.btn} onPress={handlePress} activeOpacity={0.8}>
      <Text style={styles.icon}>🔐</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#132848', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20,
    borderWidth: 1, borderColor: '#00C2FF', gap: 10,
  },
  icon: { fontSize: 20 },
  label: { color: '#00C2FF', fontSize: 15, fontWeight: '600' },
});
