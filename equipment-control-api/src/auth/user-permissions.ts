import { ForbiddenException } from '@nestjs/common';

export type AuthenticatedUser = {
  id: string;
  email: string;
  verificado?: boolean;
};

export const ADMIN_EMAILS = [
  'lohran.victor@ambipar.com',
  'gabriel.roza@ambipar.com',
];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) {
    return false;
  }

  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export function isAdminUser(user?: AuthenticatedUser | null): boolean {
  return isAdminEmail(user?.email);
}

export function canManageUserVerification(
  user?: AuthenticatedUser | null,
): boolean {
  return isAdminUser(user) || Boolean(user?.verificado);
}

export function assertAdminUser(user?: AuthenticatedUser | null): void {
  if (!isAdminUser(user)) {
    throw new ForbiddenException(
      'Apenas administradores podem realizar esta ação.',
    );
  }
}

export function assertCanManageUserVerification(
  user?: AuthenticatedUser | null,
): void {
  if (!canManageUserVerification(user)) {
    throw new ForbiddenException(
      'Apenas usuários verificados podem alterar o status de verificação.',
    );
  }
}
