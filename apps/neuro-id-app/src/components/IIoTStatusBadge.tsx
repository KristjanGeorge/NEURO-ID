import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props { status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR'; lastSeenAt?: string | null; }

export function IIoTStatusBadge({ status, lastSeenAt }: Props) {
  const config = {
    CONNECTED: { color: '#00E676', dot: '#00E676', label: 'Conectado' },
    DISCONNECTED: { color: '#8BA3C7', dot: '#8BA3C7', label: 'Desconectado' },
    ERROR: { color: '#FF1744', dot: '#FF1744', label: 'Error' },
  }[status];

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
      {lastSeenAt && <Text style={styles.time}> · {new Date(lastSeenAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 12, fontWeight: '600' },
  time: { color: '#8BA3C7', fontSize: 11 },
});
