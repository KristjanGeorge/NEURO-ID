import { api } from './api.js';

export async function getWallet(did: string) {
  const res = await api.get(`/v1/wallet/${encodeURIComponent(did)}`);
  return res.data;
}

export async function getRate(did: string) {
  const res = await api.get(`/v1/wallet/${encodeURIComponent(did)}/rate`);
  return res.data;
}

export async function getTokenHoldings(did: string) {
  const res = await api.get(`/v1/wallet/${encodeURIComponent(did)}/tokens`);
  return res.data.holdings;
}
