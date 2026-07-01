import { api } from './api.js';

export async function getDocuments(did: string) {
  const res = await api.get(`/v1/pocket/${encodeURIComponent(did)}/documents`);
  return res.data.documents ?? [];
}

export async function getDocument(did: string, id: string) {
  const res = await api.get(`/v1/pocket/${encodeURIComponent(did)}/documents/${id}`);
  return res.data.document;
}

export async function deleteDocument(did: string, id: string): Promise<void> {
  await api.delete(`/v1/pocket/${encodeURIComponent(did)}/documents/${id}`);
}
