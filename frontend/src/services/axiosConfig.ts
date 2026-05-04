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
    // If the request URL starts with a single slash (e.g. "/auth/login"),
    // browsers will resolve it to the origin root, which bypasses `baseURL`.
    // Many components call endpoints like "/auth/login". To avoid CORS and
    // ensure requests target the API prefix, normalize such URLs to include
    // the `/api` prefix.
    if (config.url && config.url.startsWith('/') && !config.url.startsWith('/api')) {
      config.url = `/api${config.url}`;
    }

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
