import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const uploadDataset = (formData) =>
  API.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const runAnalysis = (payload) => API.post('/analysis/run', payload);

export const getResult = (id) => API.get(`/analysis/${id}`);

export const listResults = () => API.get('/analysis/');
