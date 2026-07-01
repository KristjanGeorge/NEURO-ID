import { create } from 'zustand';

interface WalletState {
  balanceMicros: string;
  balanceNcn: string;
  balanceUsd: string;
  usdRate: number;
  lastUpdated: number | null;
  setBalance: (data: { balanceMicros: string; balanceNcn: string; balanceUsd: string; usdRate: number }) => void;
  clearWallet: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  balanceMicros: '0',
  balanceNcn: '0.00 NCN',
  balanceUsd: '$0.00',
  usdRate: 950,
  lastUpdated: null,

  setBalance: (data) => set({ ...data, lastUpdated: Date.now() }),
  clearWallet: () => set({ balanceMicros: '0', balanceNcn: '0.00 NCN', balanceUsd: '$0.00', lastUpdated: null }),
}));
