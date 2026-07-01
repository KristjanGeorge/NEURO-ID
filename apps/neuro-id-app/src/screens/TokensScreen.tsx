import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, RefreshControl } from 'react-native';
import { useAuthStore } from '../store/auth.store.js';
import { TokenCard } from '../components/TokenCard.js';
import * as tokensService from '../services/tokens.service.js';

export function TokensScreen({ navigation }: any) {
  const { identity } = useAuthStore();
  const [holdings, setHoldings] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!identity) return;
    try {
      const h = await tokensService.getTokens(identity.did);
      setHoldings(h);
    } catch { /* offline */ } finally { setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#00C2FF" />}>
      <Text style={styles.header}>Mis Tokens</Text>
      {holdings.length === 0
        ? <Text style={styles.empty}>No tienes tokens adquiridos. Visita el Mercado para comprar.</Text>
        : holdings.map((h: any) => (
          <TokenCard key={h.tokenId} {...h} onPress={() => navigation.navigate('TokenDetail', { token: h })} />
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1F3C' },
  content: { paddingVertical: 20 },
  header: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', paddingHorizontal: 16, marginBottom: 12 },
  empty: { color: '#8BA3C7', fontSize: 13, paddingHorizontal: 16, lineHeight: 20 },
});
