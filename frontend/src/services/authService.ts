import axiosInstance from './axiosConfig';

export interface LoginData {
  email: string;
  senha: string;
}

export interface LoginResponse {
  access_token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    ativo: boolean;
    precisaTrocarSenha: boolean;
  };
}

export async function login(data: LoginData): Promise<LoginResponse> {
  const response = await axiosInstance.post<LoginResponse>('/auth/login', data);
  return response.data;
}

export function saveSession(response: LoginResponse): void {
  sessionStorage.setItem('authToken', response.access_token);
  sessionStorage.setItem('usuario', JSON.stringify(response.usuario));
}

export function logout(): void {
  sessionStorage.clear();
  window.location.href = '/login';
}

export function isAuthenticated(): boolean {
  return !!sessionStorage.getItem('authToken');
}
