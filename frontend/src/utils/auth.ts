export type AuthUser = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  precisaTrocarSenha: boolean;
  cSafety?: boolean;
  operacional?: boolean;
  verificado?: boolean;
};

const ADMIN_EMAILS = [
  'lohran.victor@ambipar.com',
  'gabriel.roza@ambipar.com',
  'teste@ambipar.com',
];

export const getAuthUser = (): AuthUser | null => {
  const storedUser = sessionStorage.getItem('authUser');
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    return null;
  }
};

export const getAuthUserDisplayName = (): string => {
  const user = getAuthUser();
  return user?.nome?.trim() || user?.email?.trim() || '';
};

export const isCSafetyUser = (): boolean => Boolean(getAuthUser()?.cSafety);

export const isOperationalUser = (): boolean =>
  Boolean(getAuthUser()?.operacional);

export const isVerifiedUser = (): boolean => Boolean(getAuthUser()?.verificado);

export const isAdminUser = (): boolean => {
  const email = getAuthUser()?.email?.toLowerCase();
  return Boolean(email && ADMIN_EMAILS.includes(email));
};

export const canManageUserVerification = (): boolean =>
  isAdminUser() || isVerifiedUser();
