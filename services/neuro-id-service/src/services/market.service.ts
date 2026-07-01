import axios from 'axios';
import { config } from '../config.js';

export interface MarketListing {
  listingId: string;
  tokenId: string;
  projectName: string;
  assetType: string;
  sellerDid: string;
  priceMicros: string;
  availableQuantity: string;
  listedAt: string;
}

export interface BuyOrder {
  buyerDid: string;
  listingId: string;
  quantityMicros: string;
  grossAmountMicros: string;
}

export interface SellOrder {
  sellerDid: string;
  tokenId: string;
  priceMicros: string;
  quantityMicros: string;
}

export async function getListings(filter?: { assetType?: string; minPrice?: string; maxPrice?: string }): Promise<MarketListing[]> {
  const params = new URLSearchParams();
  if (filter?.assetType) params.set('assetType', filter.assetType);
  if (filter?.minPrice) params.set('minPrice', filter.minPrice);
  if (filter?.maxPrice) params.set('maxPrice', filter.maxPrice);

  try {
    const res = await axios.get(`${config.smartlabServiceUrl}/v1/marketplace/listings?${params.toString()}`, {
      timeout: 8000,
    });
    return res.data?.listings ?? [];
  } catch {
    return [];
  }
}

export async function buyToken(order: BuyOrder): Promise<{ contractId: string; paymentId: string; netMicros: string }> {
  const res = await axios.post(`${config.smartlabServiceUrl}/v1/marketplace/secondary/trade`, {
    buyerDid: order.buyerDid,
    listingId: order.listingId,
    quantityMicros: order.quantityMicros,
    grossAmountMicros: order.grossAmountMicros,
  }, { timeout: 15000 });

  return {
    contractId: res.data.contractId,
    paymentId: res.data.neuropayPaymentId,
    netMicros: res.data.netMicros,
  };
}

export async function listToken(order: SellOrder): Promise<{ listingId: string }> {
  const res = await axios.post(`${config.smartlabServiceUrl}/v1/marketplace/listings`, {
    sellerDid: order.sellerDid,
    tokenId: order.tokenId,
    priceMicros: order.priceMicros,
    quantityMicros: order.quantityMicros,
  }, { timeout: 10000 });

  return { listingId: res.data.listingId };
}
