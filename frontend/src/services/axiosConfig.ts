import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const TIMEOUT = parseInt(process.env.REACT_APP_TIMEOUT || '5000', 10);

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador de Requisição - Adiciona token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptador de Resposta - Trata erros
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn('Token expirado. Fazendo logout...');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      console.warn('Sem permissão');
    }
    if (error.response?.status === 429) {
      console.warn('Muitas requisições');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
