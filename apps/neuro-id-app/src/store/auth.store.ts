import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface Identity {
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
}

interface AuthState {
  token: string | null;
  identity: Identity | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, identity: Identity) => void;
  clearAuth: () => Promise<void>;
  setLoading: (v: boolean) => void;
  hydrateFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  identity: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (token, identity) => {
    set({ token, identity, isAuthenticated: true, isLoading: false });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync('neuro_id_jwt');
    await SecureStore.deleteItemAsync('neuro_id_identity');
    set({ token: null, identity: null, isAuthenticated: false });
  },

  setLoading: (v) => set({ isLoading: v }),

  hydrateFromStorage: async () => {
    try {
      const [token, identityJson] = await Promise.all([
        SecureStore.getItemAsync('neuro_id_jwt'),
        SecureStore.getItemAsync('neuro_id_identity'),
      ]);
      if (token && identityJson) {
        const identity = JSON.parse(identityJson) as Identity;
        set({ token, identity, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
