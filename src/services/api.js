import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const documentAPI = {
  create: async (document) => {
    const response = await api.post('/documents', document);
    return response.data;
  },

  get: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  sign: async (id) => {
    const response = await api.post(`/documents/${id}/sign`);
    return response.data;
  },

  generateCertificate: async (id) => {
    const response = await api.post(`/documents/${id}/certificate`);
    return response.data;
  },
};

export const verificationAPI = {
  verify: async (certificateId) => {
    const response = await api.get(`/verify/${certificateId}`);
    return response.data;
  },
};

export const aiDetectionAPI = {
  detect: async (content) => {
    const response = await api.post('/ai-detect', { content });
    return response.data;
  },
};

export default api;
