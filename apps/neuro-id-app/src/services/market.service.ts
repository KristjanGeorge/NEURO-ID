import { api } from './api.js';

export async function getListings(filter?: { assetType?: string }) {
  const res = await api.get('/v1/market/listings', { params: filter });
  return res.data.listings ?? [];
}

export async function buyToken(order: { listingId: string; quantityMicros: string; grossAmountMicros: string }) {
  const res = await api.post('/v1/market/buy', order);
  return res.data;
}

export async function sellToken(order: { tokenId: string; priceMicros: string; quantityMicros: string }) {
  const res = await api.post('/v1/market/sell', order);
  return res.data;
}
