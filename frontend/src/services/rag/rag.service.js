/**
 * rag.service.js
 * All API calls related to the RAG Knowledge Base (PDF library).
 *
 * CONFIRMED shapes (from rag.controller.js):
 *   searchInDocument -> GET /api/rag/documents/:documentId/search?query=&k=
 *     -> { success, data: [{ chunkId, content, score }] }
 *   queryDocument -> POST /api/rag/documents/:documentId/query { query }
 *     -> { success, data: { answer, sources: [{ content, score }] } }
 *
 * UNCONFIRMED shapes (backend not built yet) — built against the task spec.
 * Adjust field names here once T-22/T-24 controllers are shared.
 */

import { apiClient } from '../core/api.client';

/** GET /api/rag/documents — list all PDFs uploaded by the user */
export async function listDocuments() {
  const res = await apiClient.get('/api/rag/documents');
  return res.data.data ?? res.data.documents ?? [];
}

/** POST /api/rag/documents — upload + process a PDF (multipart/form-data) */
export async function uploadPdf(file, { onUploadProgress } = {}) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post('/api/rag/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
  return res.data.data ?? res.data;
}

/** GET /api/rag/documents/:documentId — metadata + processing status */
export async function getDocumentMeta(documentId) {
  const res = await apiClient.get(`/api/rag/documents/${documentId}`);
  return res.data.data ?? res.data;
}

/** DELETE /api/rag/documents/:documentId */
export async function deleteDocument(documentId) {
  const res = await apiClient.delete(`/api/rag/documents/${documentId}`);
  return res.data;
}

/** GET /api/rag/documents/:documentId/search?query=&k= — confirmed shape */
export async function searchInDocument(documentId, query, { k = 5 } = {}) {
  const res = await apiClient.get(`/api/rag/documents/${documentId}/search`, {
    params: { query, k },
  });
  return res.data.data ?? [];
}

/** POST /api/rag/documents/:documentId/query { query } — confirmed shape */
export async function queryDocument(documentId, query) {
  const res = await apiClient.post(`/api/rag/documents/${documentId}/query`, { query });
  return res.data.data ?? res.data;
}

/**
 * GET /api/rag/documents/:documentId/file — fetch the PDF as a blob and
 * return an object URL for use in an <iframe>. Caller MUST revoke this URL
 * (URL.revokeObjectURL) on cleanup/unmount to avoid memory leaks.
 */
export async function fetchPdfObjectUrl(documentId) {
  const res = await apiClient.get(`/api/rag/documents/${documentId}/file`, {
    responseType: 'blob',
  });
  return URL.createObjectURL(res.data);
}