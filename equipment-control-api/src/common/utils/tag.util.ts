/**
 * Normaliza uma TAG para manter sempre maiúscula e sem espaços nas extremidades (upper e strip).
 * Retorna null caso o valor seja vazio ou nulo.
 */
export function normalizarTag(tag?: string | null): string | null {
  if (tag === null || tag === undefined) {
    return null;
  }
  const normalizado = String(tag).trim().toUpperCase();
  return normalizado.length > 0 ? normalizado : null;
}
