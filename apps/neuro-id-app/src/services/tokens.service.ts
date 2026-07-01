import { api } from './api.js';

export async function getTokens(did: string) {
  const res = await api.get(`/v1/wallet/${encodeURIComponent(did)}/tokens`);
  return res.data.holdings ?? [];
}
