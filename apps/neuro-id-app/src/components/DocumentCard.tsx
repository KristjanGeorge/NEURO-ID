import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatDate } from '../utils/format.js';

const DOC_ICONS: Record<string, string> = {
  DRIVER_LICENSE: '🪪', PASSPORT: '📘', MEDICAL: '🏥',
  INSURANCE: '🛡️', PROPERTY: '🏠', CUSTOM: '📄',
};

interface Props {
  id: string;
  type: string;
  title: string;
  issuedBy: string | null;
  expiresAt: string | null;
  createdAt: string;
  onPress?: () => void;
  onDelete?: () => void;
}

export function DocumentCard({ id, type, title, issuedBy, expiresAt, createdAt, onPress, onDelete }: Props) {
  const icon = DOC_ICONS[type] ?? '📄';
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.row}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.info}>
          <Text style={styles.title}>{title}</Text>
          {issuedBy && <Text style={styles.issuer}>Emitido por: {issuedBy}</Text>}
          <Text style={styles.date}>
            {expiresAt
              ? `Vence: ${formatDate(expiresAt)}`
              : `Subido: ${formatDate(createdAt)}`}
          </Text>
        </View>
        {isExpired && (
          <View style={styles.expiredBadge}>
            <Text style={styles.expiredText}>VENCIDO</Text>
          </View>
        )}
      </View>
      {onDelete && (
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Text style={styles.deleteTxt}>Eliminar</Text>
        </TouchableOpacity>
      )}
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
  title: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  issuer: { color: '#8BA3C7', fontSize: 11, marginTop: 2 },
  date: { color: '#8BA3C7', fontSize: 11, marginTop: 2 },
  expiredBadge: { backgroundColor: '#FF174422', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  expiredText: { color: '#FF1744', fontSize: 9, fontWeight: '700' },
  deleteBtn: { marginTop: 10, alignItems: 'flex-end' },
  deleteTxt: { color: '#FF1744', fontSize: 12 },
});
