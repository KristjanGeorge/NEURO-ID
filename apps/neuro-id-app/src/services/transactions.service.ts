import { api } from './api.js';

export async function getTransactions(did: string, page = 1, limit = 20) {
  const res = await api.get(`/v1/transactions/${encodeURIComponent(did)}`, { params: { page, limit } });
  return res.data;
}
