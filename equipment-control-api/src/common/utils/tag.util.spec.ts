import { normalizarTag } from './tag.util';

describe('normalizarTag', () => {
  it('retorna null para valores nulos ou indefinidos', () => {
    expect(normalizarTag(null)).toBeNull();
    expect(normalizarTag(undefined)).toBeNull();
  });

  it('retorna null para strings vazias ou apenas com espaços', () => {
    expect(normalizarTag('')).toBeNull();
    expect(normalizarTag('   ')).toBeNull();
  });

  it('converte para uppercase e remove espaços nas pontas (strip)', () => {
    expect(normalizarTag('tag-001')).toBe('TAG-001');
    expect(normalizarTag('  tag-001  ')).toBe('TAG-001');
    expect(normalizarTag('  Tag-ABC-123 \t\n ')).toBe('TAG-ABC-123');
    expect(normalizarTag('exaustor 420')).toBe('EXAUSTOR 420');
  });
});
