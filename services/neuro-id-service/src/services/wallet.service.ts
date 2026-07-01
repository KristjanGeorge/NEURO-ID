import axios from 'axios';
import { config } from '../config.js';

export interface WalletBalance {
  did: string;
  walletAddress: string;
  balanceMicros: string;
  balanceNcn: string;
  balanceUsd: string;
  usdRate: number;
  currency: string;
}

export interface TokenHolding {
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

let cachedUsdRate: { rate: number; fetchedAt: number } | null = null;

export async function getUsdRate(): Promise<number> {
  const TTL = 5 * 60 * 1000; // 5 minutes
  if (cachedUsdRate && Date.now() - cachedUsdRate.fetchedAt < TTL) {
    return cachedUsdRate.rate;
  }
  try {
    const res = await axios.get(config.usdRateApiUrl, { timeout: 5000 });
    const rate: number = res.data?.rates?.CLP ?? 950;
    cachedUsdRate = { rate, fetchedAt: Date.now() };
    return rate;
  } catch {
    return cachedUsdRate?.rate ?? 950;
  }
}

export async function getBalance(did: string): Promise<{ balanceMicros: string }> {
  try {
    const res = await axios.get(`${config.neurocoinServiceUrl}/v1/balance/${encodeURIComponent(did)}`, {
      timeout: 5000,
    });
    return { balanceMicros: String(res.data?.balanceMicros ?? '0') };
  } catch {
    return { balanceMicros: '0' };
  }
}

export async function getTokenHoldings(did: string): Promise<TokenHolding[]> {
  try {
    const res = await axios.get(`${config.smartlabServiceUrl}/v1/token/holdings/${encodeURIComponent(did)}`, {
      timeout: 8000,
    });
    return res.data?.holdings ?? [];
  } catch {
    return [];
  }
}

export function formatNcn(micros: string): string {
  const n = BigInt(micros);
  const whole = n / 1_000_000n;
  const frac = n % 1_000_000n;
  const fracStr = frac.toString().padStart(6, '0').slice(0, 2);
  return `${whole.toLocaleString('en-US')}.${fracStr} NCN`;
}

export function ncnToUsd(micros: string, usdRate: number): string {
  const n = Number(BigInt(micros)) / 1_000_000;
  return `$${(n / usdRate).toFixed(2)} USD`;
}
