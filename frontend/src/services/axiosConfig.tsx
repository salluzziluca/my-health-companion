// src/services/axiosConfig.ts
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8000'; // ✅ tu backend real

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axios;
