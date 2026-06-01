export type AuthUser = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  precisaTrocarSenha: boolean;
  cSafety?: boolean;
};

export const getAuthUser = (): AuthUser | null => {
  const storedUser = sessionStorage.getItem('authUser');
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    return null;
  }
};

export const isCSafetyUser = (): boolean => Boolean(getAuthUser()?.cSafety);
