import axios from 'axios';

/**
 * API base URL resolution:
 *  - Local dev  → http://localhost:5000
 *  - Vercel     → /_/backend  (same domain, backend service at that prefix)
 *  - Override   → VITE_API_URL env variable (takes highest priority)
 */
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/_/backend'
    : 'http://localhost:5000');

const API = axios.create({ baseURL: `${BASE_URL}/api` });

export const uploadDataset = (formData) =>
  API.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const runAnalysis  = (payload) => API.post('/analysis/run', payload);
export const getResult    = (id)      => API.get(`/analysis/${id}`);
export const listResults  = ()        => API.get('/analysis/');
