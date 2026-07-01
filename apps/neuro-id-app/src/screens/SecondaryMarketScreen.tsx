import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useAuthStore } from '../store/auth.store.js';
import { formatNcn } from '../utils/format.js';
import * as marketService from '../services/market.service.js';

interface Listing {
  listingId: string;
  tokenId: string;
  projectName: string;
  assetType: string;
  sellerDid: string;
  priceMicros: string;
  availableQuantity: string;
  listedAt: string;
}

const ASSET_ICONS: Record<string, string> = {
  REAL_ESTATE: '🏢', INFRASTRUCTURE: '🏗️', EMISSION_RIGHT: '🌿', EQUIPMENT: '⚙️', FUND_UNIT: '📊', OTHER: '📦',
};

export function SecondaryMarketScreen() {
  const { identity } = useAuthStore();
  const [listings, setListings] = useState<Listing[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await marketService.getListings();
      setListings(data);
    } catch { /* offline */ } finally { setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const handleBuy = async (listing: Listing) => {
    Alert.alert(
      'Confirmar compra',
      `¿Comprar ${listing.projectName} por ${formatNcn(listing.priceMicros)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Comprar', onPress: async () => {
            setBuying(listing.listingId);
            try {
              await marketService.buyToken({
                listingId: listing.listingId,
                quantityMicros: listing.availableQuantity,
                grossAmountMicros: listing.priceMicros,
              });
              Alert.alert('✅ Compra exitosa', 'El token fue transferido a tu wallet NEURO-ID');
              load();
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.error ?? 'Error al procesar la compra');
            } finally {
              setBuying(null);
            }
          }
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#00C2FF" />}>
      <Text style={styles.header}>Mercado Secundario</Text>
      <Text style={styles.subtitle}>Compra y vende tokens entre usuarios NEUROTOKEN · Comisión 1.4%</Text>
      {listings.length === 0
        ? <Text style={styles.empty}>No hay ofertas disponibles en este momento</Text>
        : listings.map((l) => (
          <View key={l.listingId} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.icon}>{ASSET_ICONS[l.assetType] ?? '📦'}</Text>
              <View style={styles.info}>
                <Text style={styles.name}>{l.projectName}</Text>
                <Text style={styles.type}>{l.assetType}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.price}>{formatNcn(l.priceMicros)}</Text>
                <Text style={styles.qty}>Qty: {formatNcn(l.availableQuantity)}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.buyBtn, l.sellerDid === identity?.did && styles.buyBtnDisabled]}
              disabled={l.sellerDid === identity?.did || buying === l.listingId}
              onPress={() => handleBuy(l)}
            >
              <Text style={styles.buyTxt}>
                {l.sellerDid === identity?.did ? 'Tu oferta' : buying === l.listingId ? 'Procesando...' : 'Comprar'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1F3C' },
  content: { padding: 16 },
  header: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: '#8BA3C7', fontSize: 12, marginBottom: 16 },
  empty: { color: '#8BA3C7', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#132848', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1E3A5F' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  icon: { fontSize: 26 },
  info: { flex: 1 },
  name: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  type: { color: '#8BA3C7', fontSize: 11 },
  price: { color: '#00E676', fontSize: 14, fontWeight: '700' },
  qty: { color: '#8BA3C7', fontSize: 11 },
  buyBtn: { backgroundColor: '#00C2FF', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  buyBtnDisabled: { backgroundColor: '#1E3A5F' },
  buyTxt: { color: '#0A1628', fontWeight: '700', fontSize: 14 },
});
