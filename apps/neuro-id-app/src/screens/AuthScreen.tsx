import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { BiometricButton } from '../components/BiometricButton.js';
import * as authService from '../services/auth.service.js';
import { useAuthStore } from '../store/auth.store.js';

export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [documentType, setDocumentType] = useState('RUT');
  const [documentNumber, setDocumentNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Ingresa email y contraseña'); return; }
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      await SecureStore.setItemAsync('neuro_id_identity', JSON.stringify(result.identity));
      setAuth(result.token, result.identity);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !fullName || !documentNumber) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      const result = await authService.register({ fullName, email, password, documentType, documentNumber });
      await SecureStore.setItemAsync('neuro_id_identity', JSON.stringify(result.identity));
      setAuth(result.token, result.identity);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometric = async () => {
    try {
      const stored = await SecureStore.getItemAsync('neuro_id_jwt');
      if (!stored) { Alert.alert('Error', 'Inicia sesión primero para activar la biometría'); return; }
      const { nonce } = await authService.biometricChallenge();
      const { token } = await authService.biometricVerify(nonce);
      const identityJson = await SecureStore.getItemAsync('neuro_id_identity');
      if (identityJson) {
        const identity = JSON.parse(identityJson);
        setAuth(token, identity);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Autenticación biométrica fallida');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>NEURO<Text style={styles.logoAccent}>ID</Text></Text>
        <Text style={styles.tagline}>Identidad Digital de NEUROTOKEN</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.tabRow}>
          {(['login', 'register'] as const).map((m) => (
            <TouchableOpacity key={m} style={[styles.tab, mode === m && styles.tabActive]} onPress={() => setMode(m)}>
              <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                {m === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {mode === 'register' && (
          <>
            <TextInput style={styles.input} placeholder="Nombre completo" placeholderTextColor="#8BA3C7" value={fullName} onChangeText={setFullName} />
            <View style={styles.docRow}>
              {(['RUT', 'PASSPORT', 'NATIONAL_ID'].map((dt) => (
                <TouchableOpacity key={dt} style={[styles.docTab, documentType === dt && styles.docTabActive]} onPress={() => setDocumentType(dt)}>
                  <Text style={[styles.docTabText, documentType === dt && styles.docTabTextActive]}>{dt}</Text>
                </TouchableOpacity>
              )))}
            </View>
            <TextInput style={styles.input} placeholder={`Número de ${documentType}`} placeholderTextColor="#8BA3C7" value={documentNumber} onChangeText={setDocumentNumber} autoCapitalize="characters" />
          </>
        )}

        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#8BA3C7" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor="#8BA3C7" value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity style={styles.primaryBtn} onPress={mode === 'login' ? handleLogin : handleRegister} disabled={loading} activeOpacity={0.8}>
          {loading ? <ActivityIndicator color="#0A1628" /> : <Text style={styles.primaryBtnText}>{mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</Text>}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.divLine} /><Text style={styles.divText}>o</Text><View style={styles.divLine} />
        </View>

        <BiometricButton onSuccess={handleBiometric} onError={(msg) => Alert.alert('Biometría', msg)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1F3C' },
  content: { padding: 20, paddingTop: 60 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logo: { color: '#FFFFFF', fontSize: 42, fontWeight: '800', letterSpacing: 2 },
  logoAccent: { color: '#00C2FF' },
  tagline: { color: '#8BA3C7', fontSize: 13, marginTop: 6 },
  card: { backgroundColor: '#132848', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#1E3A5F' },
  tabRow: { flexDirection: 'row', backgroundColor: '#0A1628', borderRadius: 10, padding: 3, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#00C2FF' },
  tabText: { color: '#8BA3C7', fontWeight: '600' },
  tabTextActive: { color: '#0A1628' },
  docRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  docTab: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 6, borderWidth: 1, borderColor: '#1E3A5F' },
  docTabActive: { borderColor: '#00C2FF', backgroundColor: '#00C2FF22' },
  docTabText: { color: '#8BA3C7', fontSize: 11, fontWeight: '600' },
  docTabTextActive: { color: '#00C2FF' },
  input: { backgroundColor: '#0A1628', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#FFFFFF', fontSize: 15, marginBottom: 12, borderWidth: 1, borderColor: '#1E3A5F' },
  primaryBtn: { backgroundColor: '#00C2FF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  primaryBtnText: { color: '#0A1628', fontSize: 16, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  divLine: { flex: 1, height: 1, backgroundColor: '#1E3A5F' },
  divText: { color: '#8BA3C7', fontSize: 13 },
});
