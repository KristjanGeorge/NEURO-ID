import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, RefreshControl } from 'react-native';
import { useAuthStore } from '../store/auth.store.js';
import { IIoTStatusBadge } from '../components/IIoTStatusBadge.js';
import { api } from '../services/api.js';

interface Connection {
  id: string;
  tokenId: string;
  assetDid: string;
  assetName: string;
  assetType: string;
  protocol: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastSeenAt: string | null;
  telemetry: Record<string, unknown> | null;
}

const ASSET_ICONS: Record<string, string> = {
  REAL_ESTATE: '🏢', INFRASTRUCTURE: '🏗️', EMISSION_RIGHT: '🌿', EQUIPMENT: '⚙️', FUND_UNIT: '📊', OTHER: '📦',
};

export function IIoTScreen() {
  const { identity } = useAuthStore();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!identity) return;
    try {
      const res = await api.get(`/v1/iiot/${encodeURIComponent(identity.did)}/connections`);
      setConnections(res.data.connections ?? []);
    } catch { /* offline */ } finally { setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const renderItem = ({ item }: { item: Connection }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.icon}>{ASSET_ICONS[item.assetType] ?? '📦'}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{item.assetName}</Text>
          <Text style={styles.did} numberOfLines={1}>{item.assetDid}</Text>
        </View>
        <Text style={styles.protocol}>{item.protocol}</Text>
      </View>
      <View style={styles.footer}>
        <IIoTStatusBadge status={item.status} lastSeenAt={item.lastSeenAt} />
        {item.telemetry && (
          <Text style={styles.telemetry}>
            {Object.entries(item.telemetry).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(' · ')}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Activos IIoT</Text>
      <Text style={styles.subtitle}>Conexiones IEEE P1451.99 a activos físicos tokenizados</Text>
      <FlatList
        data={connections}
        keyExtractor={(c) => c.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#00C2FF" />}
        ListEmptyComponent={<Text style={styles.empty}>Sin conexiones IIoT. Adquiere tokens de activos físicos para ver sus datos en tiempo real.</Text>}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1F3C' },
  header: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', paddingHorizontal: 16, paddingTop: 20 },
  subtitle: { color: '#8BA3C7', fontSize: 12, paddingHorizontal: 16, marginBottom: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  empty: { color: '#8BA3C7', textAlign: 'center', marginTop: 40, lineHeight: 20 },
  card: { backgroundColor: '#132848', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#1E3A5F' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  icon: { fontSize: 22 },
  info: { flex: 1 },
  name: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  did: { color: '#8BA3C7', fontSize: 10, fontFamily: 'monospace' },
  protocol: { color: '#00C2FF', fontSize: 11, fontWeight: '600' },
  footer: { gap: 4 },
  telemetry: { color: '#8BA3C7', fontSize: 11 },
});
