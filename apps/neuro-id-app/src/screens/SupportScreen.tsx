import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

interface SupportEntry {
  icon: string;
  title: string;
  description: string;
  email: string;
  phone?: string;
  url?: string;
}

const SUPPORT_ENTRIES: SupportEntry[] = [
  {
    icon: '🏦',
    title: 'Banco Escrow',
    description: 'Soporte para liquidaciones, cambios fiat/NCN y gestión de fondos en custodia',
    email: 'escrow@neurotoken.cl',
    phone: '+56 2 2345 6789',
    url: 'https://escrow.neurotoken.cl',
  },
  {
    icon: '🛡️',
    title: 'LynxNode Trust',
    description: 'Trust Provider oficial de NEUROTOKEN. Consultas sobre documentos legales, KYC nivel 3 y grandes inversiones',
    email: 'trust@lynxnode.io',
    phone: '+56 9 8765 4321',
    url: 'https://lynxnode.io',
  },
  {
    icon: '📋',
    title: 'CMF — Comisión para el Mercado Financiero',
    description: 'Organismo regulador. Consulta el registro de emisiones de NEUROTOKEN en CMF',
    email: 'consultas@cmfchile.cl',
    url: 'https://www.cmfchile.cl',
  },
  {
    icon: '🇨🇱',
    title: 'UAF — Unidad de Análisis Financiero',
    description: 'Unidad regulatoria AML. Para reportes de actividad sospechosa (Ley 19.913)',
    email: 'contacto@uaf.cl',
    url: 'https://www.uaf.cl',
  },
];

export function SupportScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Soporte</Text>
      <Text style={styles.subtitle}>Contacta con los proveedores de servicios y organismos reguladores del ecosistema NEUROTOKEN</Text>

      {SUPPORT_ENTRIES.map((entry, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.icon}>{entry.icon}</Text>
            <Text style={styles.title}>{entry.title}</Text>
          </View>
          <Text style={styles.description}>{entry.description}</Text>

          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(`mailto:${entry.email}`)}>
              <Text style={styles.contactTxt}>📧 {entry.email}</Text>
            </TouchableOpacity>

            {entry.phone && (
              <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(`tel:${entry.phone}`)}>
                <Text style={styles.contactTxt}>📞 {entry.phone}</Text>
              </TouchableOpacity>
            )}

            {entry.url && (
              <TouchableOpacity style={[styles.contactBtn, { borderColor: '#00C2FF' }]} onPress={() => Linking.openURL(entry.url!)}>
                <Text style={[styles.contactTxt, { color: '#00C2FF' }]}>🌐 Sitio web</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Sobre NEURO-ID</Text>
        <Text style={styles.infoText}>NEURO-ID v1.0.0 · Plataforma NEUROTOKEN · LynxNode Trust · Santiago, Chile</Text>
        <Text style={styles.infoText}>Powered by IEEE P1451.99 Federated DLT · NEUROCOIN stablecoin</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1F3C' },
  content: { padding: 16 },
  header: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: '#8BA3C7', fontSize: 12, marginBottom: 16, lineHeight: 18 },
  card: { backgroundColor: '#132848', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1E3A5F' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  icon: { fontSize: 22 },
  title: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', flex: 1 },
  description: { color: '#8BA3C7', fontSize: 12, lineHeight: 18, marginBottom: 12 },
  contactRow: { gap: 6 },
  contactBtn: { backgroundColor: '#0A1628', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#1E3A5F' },
  contactTxt: { color: '#8BA3C7', fontSize: 13 },
  infoCard: { backgroundColor: '#0A1628', borderRadius: 12, padding: 16, marginTop: 8, borderWidth: 1, borderColor: '#1E3A5F', alignItems: 'center' },
  infoTitle: { color: '#00C2FF', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  infoText: { color: '#8BA3C7', fontSize: 11, textAlign: 'center', lineHeight: 18 },
});
