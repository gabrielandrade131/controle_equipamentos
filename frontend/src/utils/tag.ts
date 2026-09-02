/**
 * Normaliza uma TAG para manter sempre maiúscula e sem espaços nas extremidades (upper e strip).
 */
export const normalizeTag = (tag?: string | null): string => {
  if (tag === null || tag === undefined) {
    return '';
  }
  return String(tag).trim().toUpperCase();
};
