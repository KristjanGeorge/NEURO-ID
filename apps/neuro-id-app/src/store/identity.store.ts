import { create } from 'zustand';

interface WalletData {
  balanceMicros: string;
  balanceNcn: string;
  balanceUsd: string;
  usdRate: number;
}

interface TokenHolding {
  tokenId: string;
  projectName: string;
  assetType: string;
  assetReference: string;
  quantityMicros: string;
  nominalValueMicros: string;
  currentValueMicros: string;
  status: string;
  acquiredAt: string;
}

interface IdentityState {
  wallet: WalletData | null;
  holdings: TokenHolding[];
  setWallet: (w: WalletData) => void;
  setHoldings: (h: TokenHolding[]) => void;
  clearIdentityData: () => void;
}

export const useIdentityStore = create<IdentityState>((set) => ({
  wallet: null,
  holdings: [],

  setWallet: (wallet) => set({ wallet }),
  setHoldings: (holdings) => set({ holdings }),
  clearIdentityData: () => set({ wallet: null, holdings: [] }),
}));
