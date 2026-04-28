import axios from 'axios';

// In production, set VITE_API_URL to your deployed backend URL (e.g. https://fairsight-api.vercel.app)
// In local dev this falls back to localhost:5000
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const API = axios.create({ baseURL: `${BASE_URL}/api` });

export const uploadDataset = (formData) =>
  API.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const runAnalysis = (payload) => API.post('/analysis/run', payload);

export const getResult = (id) => API.get(`/analysis/${id}`);

export const listResults = () => API.get('/analysis/');
