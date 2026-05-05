import axios, { AxiosInstance, AxiosError } from 'axios';

// Build the API base from the current origin so the deployed frontend always
// talks to the same host that served the page.
const API_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api');
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
    // Removido ajuste automático de prefixo '/api' para evitar duplicidade.

    const token = sessionStorage.getItem('authToken') || localStorage.getItem('token');
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
      sessionStorage.clear();
      localStorage.removeItem('token');
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
