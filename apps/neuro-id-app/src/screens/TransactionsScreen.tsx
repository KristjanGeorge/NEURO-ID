import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, RefreshControl } from 'react-native';
import { useAuthStore } from '../store/auth.store.js';
import { formatNcn, formatDate } from '../utils/format.js';
import * as txService from '../services/transactions.service.js';

interface Transaction {
  id: string;
  type: string;
  status: string;
  grossAmountMicros: string;
  netAmountMicros: string;
  payerDid: string;
  payeeDid: string;
  context: string;
  createdAt: string;
}

export function TransactionsScreen() {
  const { identity } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!identity) return;
    try {
      const data = await txService.getTransactions(identity.did);
      setTransactions(data.transactions ?? []);
    } catch { /* offline */ } finally { setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const TX_ICONS: Record<string, string> = {
    MARKETPLACE_PRIMARY: '🏪', MARKETPLACE_SECONDARY: '🔄',
    WALLET_TRANSFER: '💸', DEPOSIT: '⬇️', WITHDRAWAL: '⬆️',
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const isIncoming = item.payeeDid === identity?.did;
    return (
      <View style={styles.item}>
        <Text style={styles.txIcon}>{TX_ICONS[item.context] ?? '💳'}</Text>
        <View style={styles.txInfo}>
          <Text style={styles.txContext}>{item.context.replace(/_/g, ' ')}</Text>
          <Text style={styles.txDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.txAmount, { color: isIncoming ? '#00E676' : '#FF1744' }]}>
            {isIncoming ? '+' : '-'}{formatNcn(item.grossAmountMicros)}
          </Text>
          <Text style={[styles.txStatus, { color: item.status === 'COMPLETED' ? '#00E676' : '#FFB300' }]}>{item.status}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transacciones</Text>
      <FlatList
        data={transactions}
        keyExtractor={(t) => t.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#00C2FF" />}
        ListEmptyComponent={<Text style={styles.empty}>Sin transacciones registradas</Text>}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1F3C' },
  header: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', padding: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  empty: { color: '#8BA3C7', textAlign: 'center', marginTop: 40 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#132848', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#1E3A5F', gap: 10 },
  txIcon: { fontSize: 22 },
  txInfo: { flex: 1 },
  txContext: { color: '#FFFFFF', fontSize: 13, fontWeight: '500' },
  txDate: { color: '#8BA3C7', fontSize: 11, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700' },
  txStatus: { fontSize: 10, fontWeight: '600', marginTop: 2 },
});
