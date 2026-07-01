import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/auth.store.js';
import { useWalletStore } from '../store/wallet.store.js';
import { WalletCard } from '../components/WalletCard.js';
import { TokenCard } from '../components/TokenCard.js';
import * as walletService from '../services/wallet.service.js';

export function WalletScreen({ navigation }: any) {
  const { identity } = useAuthStore();
  const { setBalance } = useWalletStore();
  const [wallet, setWallet] = useState<any>(null);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!identity) return;
    try {
      const [w, h] = await Promise.all([
        walletService.getWallet(identity.did),
        walletService.getTokenHoldings(identity.did),
      ]);
      setWallet(w);
      setHoldings(h);
      setBalance({ balanceMicros: w.balanceMicros, balanceNcn: w.balanceNcn, balanceUsd: w.balanceUsd, usdRate: w.usdRate });
    } catch {
      // offline graceful
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [identity]);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#00C2FF" size="large" /></View>;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#00C2FF" />}
    >
      <Text style={styles.header}>Wallet</Text>

      {wallet && (
        <WalletCard
          balanceNcn={wallet.balanceNcn}
          balanceUsd={wallet.balanceUsd}
          usdRate={wallet.usdRate}
          walletAddress={wallet.walletAddress}
        />
      )}

      <Text style={styles.sectionTitle}>Tokens Adquiridos ({holdings.length})</Text>
      {holdings.length === 0 ? (
        <Text style={styles.empty}>No tienes tokens aún. Explora el mercado para adquirir activos tokenizados.</Text>
      ) : (
        holdings.map((h: any) => (
          <TokenCard
            key={h.tokenId}
            {...h}
            onPress={() => navigation.navigate('TokenDetail', { token: h })}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1F3C' },
  content: { paddingVertical: 20 },
  center: { flex: 1, backgroundColor: '#0D1F3C', justifyContent: 'center', alignItems: 'center' },
  header: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { color: '#8BA3C7', fontSize: 13, fontWeight: '600', paddingHorizontal: 16, marginTop: 20, marginBottom: 8 },
  empty: { color: '#8BA3C7', fontSize: 13, paddingHorizontal: 16, lineHeight: 20 },
});
