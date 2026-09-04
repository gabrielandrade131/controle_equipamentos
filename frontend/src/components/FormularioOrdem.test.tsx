import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormularioOrdem } from './FormularioOrdem';
import { Producao } from '../types/producao';
import * as authUtils from '../utils/auth';

jest.mock('../hooks/useTiposEquipamento', () => ({
  useTiposEquipamento: () => ({ tiposEquipamento: [] }),
}));

describe('FormularioOrdem', () => {
  const producaoBase: Producao = {
    id: 'prod-1',
    numeroOrdem: '1',
    numeroLote: 1,
    numeroSerie: 'CSEX-1-1',
    tag: '',
    statusProducao: 'EM_ANDAMENTO',
    tipoEquipamentoNome: 'Exaustor',
    modelo: 'CSEX420ACM',
    descricao: 'Exaustor 420',
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('desabilita a opção Concluída quando o usuário não é o Douglas', () => {
    jest.spyOn(authUtils, 'isDouglasUser').mockReturnValue(false);

    render(
      <FormularioOrdem
        producao={producaoBase}
        onSalvar={jest.fn()}
        onCancelar={jest.fn()}
        isEditing
      />,
    );

    const optionConcluida = screen.getByRole('option', {
      name: /Concluída \(Sem autorização\)/i,
    });
    expect(optionConcluida).toBeDisabled();
  });

  it('habilita a opção Concluída quando o usuário é o Douglas', () => {
    jest.spyOn(authUtils, 'isDouglasUser').mockReturnValue(true);

    render(
      <FormularioOrdem
        producao={producaoBase}
        onSalvar={jest.fn()}
        onCancelar={jest.fn()}
        isEditing
      />,
    );

    const optionConcluida = screen.getByRole('option', {
      name: /^Concluída$/i,
    });
    expect(optionConcluida).toBeEnabled();
  });
});
