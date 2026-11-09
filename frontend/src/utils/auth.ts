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

export const AUTH_USER_UPDATED_EVENT = 'axis:auth-user-updated';

const ADMIN_EMAILS = [
  'lohran.victor@ambipar.com',
  'gabriel.roza@ambipar.com',
  'teste@ambipar.com',
];

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getAuthUserFromToken(): AuthUser | null {
  const token =
    sessionStorage.getItem('authToken') || localStorage.getItem('token');
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const email = typeof payload.email === 'string' ? payload.email : '';
  const id = typeof payload.sub === 'string' ? payload.sub : '';
  if (!email && !id) return null;

  return {
    id,
    nome: typeof payload.nome === 'string' ? payload.nome : '',
    email,
    ativo: true,
    precisaTrocarSenha: false,
    cSafety: typeof payload.cSafety === 'boolean' ? payload.cSafety : undefined,
    operacional:
      typeof payload.operacional === 'boolean' ? payload.operacional : undefined,
    verificado:
      typeof payload.verificado === 'boolean' ? payload.verificado : undefined,
  };
}

export const setAuthUser = (user: AuthUser): void => {
  const serialized = JSON.stringify(user);
  sessionStorage.setItem('authUser', serialized);
  localStorage.setItem('authUser', serialized);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_USER_UPDATED_EVENT));
  }
};

export const clearAuthSession = (): void => {
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('authUser');
  sessionStorage.clear();
  localStorage.removeItem('token');
  localStorage.removeItem('authUser');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_USER_UPDATED_EVENT));
  }
};

export const getAuthUser = (): AuthUser | null => {
  const storedUser =
    sessionStorage.getItem('authUser') || localStorage.getItem('authUser');
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser) as AuthUser;
      if (!sessionStorage.getItem('authUser')) {
        sessionStorage.setItem('authUser', storedUser);
      }
      if (!localStorage.getItem('authUser')) {
        localStorage.setItem('authUser', storedUser);
      }
      return parsed;
    } catch {
      // Continua para o fallback via token JWT
    }
  }

  return getAuthUserFromToken();
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

export const isMasterUser = (): boolean => {
  return isAdminUser() || isVerifiedUser();
};

export const canManageUserVerification = (): boolean =>
  isAdminUser() || isVerifiedUser();

export const isDouglasUser = (): boolean => {
  const email = getAuthUser()?.email?.toLowerCase().trim();
  return email === 'douglas.alves@ambipar.com';
};

export const canConcludeManutencao = (): boolean => {
  return isDouglasUser();
};

export const canConcludeProducao = (): boolean => {
  return isDouglasUser();
};


