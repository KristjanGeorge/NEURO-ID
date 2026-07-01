import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  balanceNcn: string;
  balanceUsd: string;
  usdRate: number;
  walletAddress: string;
}

export function WalletCard({ balanceNcn, balanceUsd, usdRate, walletAddress }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>NEUROCOIN Balance</Text>
      <Text style={styles.ncn}>{balanceNcn}</Text>
      <Text style={styles.usd}>{balanceUsd} · 1 NCN = ${(1 / usdRate).toFixed(6)} USD</Text>
      <View style={styles.divider} />
      <Text style={styles.addressLabel}>Wallet Address</Text>
      <Text style={styles.address} numberOfLines={1}>{walletAddress}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#132848',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  label: { color: '#8BA3C7', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  ncn: { color: '#00E676', fontSize: 28, fontWeight: '700', marginTop: 4 },
  usd: { color: '#8BA3C7', fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#1E3A5F', marginVertical: 10 },
  addressLabel: { color: '#8BA3C7', fontSize: 10, letterSpacing: 0.5 },
  address: { color: '#FFFFFF', fontSize: 12, fontFamily: 'monospace', marginTop: 2 },
});
