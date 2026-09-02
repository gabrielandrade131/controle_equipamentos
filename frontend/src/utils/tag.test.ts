import { normalizeTag } from './tag';

describe('normalizeTag', () => {
  it('retorna string vazia para nulo ou indefinido', () => {
    expect(normalizeTag(null)).toBe('');
    expect(normalizeTag(undefined)).toBe('');
  });

  it('retorna string vazia para strings em branco', () => {
    expect(normalizeTag('')).toBe('');
    expect(normalizeTag('   ')).toBe('');
  });

  it('converte para uppercase e remove espaços nas pontas (strip)', () => {
    expect(normalizeTag('tag-001')).toBe('TAG-001');
    expect(normalizeTag('  tag-001  ')).toBe('TAG-001');
    expect(normalizeTag('  csex420ac-01  ')).toBe('CSEX420AC-01');
  });
});
