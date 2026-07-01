import * as SecureStore from 'expo-secure-store';
import { api } from './api.js';

export interface LoginResult {
  token: string;
  identity: Identity;
}

export interface Identity {
  id: string;
  did: string;
  fullName: string;
  email: string;
  selfieUrl: string | null;
  documentType: string;
  documentNumber: string;
  countryCode: string;
  kycLevel: number;
  walletAddress: string;
  status: string;
  createdAt: string;
}

export async function register(input: {
  fullName: string;
  email: string;
  password: string;
  documentType: string;
  documentNumber: string;
  countryCode?: string;
}): Promise<LoginResult> {
  const res = await api.post('/v1/auth/register', input);
  await SecureStore.setItemAsync('neuro_id_jwt', res.data.token);
  return res.data;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const res = await api.post('/v1/auth/login', { email, password });
  await SecureStore.setItemAsync('neuro_id_jwt', res.data.token);
  return res.data;
}

export async function biometricChallenge(): Promise<{ nonce: string; expiresIn: number }> {
  const res = await api.post('/v1/auth/biometric/challenge');
  return res.data;
}

export async function biometricVerify(nonce: string): Promise<{ token: string }> {
  const res = await api.post('/v1/auth/biometric/verify', { nonce });
  await SecureStore.setItemAsync('neuro_id_jwt', res.data.token);
  return res.data;
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync('neuro_id_jwt');
}

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync('neuro_id_jwt');
}
