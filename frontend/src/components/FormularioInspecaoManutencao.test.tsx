import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormularioInspecaoManutencao } from './FormularioInspecaoManutencao';
import { criarInspecaoVazia } from '../constants/inspecaoManutencao';
import { InspecaoManutencao } from '../types/manutencao';

jest.mock('../utils/auth', () => ({
  getAuthUserDisplayName: () => 'Técnico Teste',
}));

describe('FormularioInspecaoManutencao', () => {
  it('permite preenchimento e salvamento quando o status é EM_MANUTENCAO', () => {
    const inspecaoEmManutencao: InspecaoManutencao = {
      ...criarInspecaoVazia(),
      statusManutencao: 'EM_MANUTENCAO',
      responsavel: 'Técnico Teste',
      validade: '2026-12-31',
      tipoEquipamento: 'Bomba',
    };
    const onSalvar = jest.fn();

    render(
      <FormularioInspecaoManutencao
        inspecaoInicial={inspecaoEmManutencao}
        onSalvar={onSalvar}
        isEditing
      />,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    const btnSalvar = screen.getByRole('button', { name: /Salvar Inspeção/i });
    expect(btnSalvar).toBeInTheDocument();

    fireEvent.click(btnSalvar);
    expect(onSalvar).toHaveBeenCalledTimes(1);
    expect(onSalvar).toHaveBeenCalledWith(
      expect.objectContaining({
        statusManutencao: 'EM_MANUTENCAO',
        responsavel: 'Técnico Teste',
      }),
    );
  });

  it('bloqueia preenchimento e oculta botão salvar quando o status é CONCLUIDA', () => {
    const inspecaoConcluida: InspecaoManutencao = {
      ...criarInspecaoVazia(),
      statusManutencao: 'CONCLUIDA',
      responsavel: 'Técnico Teste',
      validade: '2026-12-31',
    };
    const onSalvar = jest.fn();

    render(
      <FormularioInspecaoManutencao
        inspecaoInicial={inspecaoConcluida}
        onSalvar={onSalvar}
      />,
    );

    expect(
      screen.getByText(/Esta manutenção já foi concluída/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Salvar Inspeção/i }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByDisplayValue('Douglas Moreira Alves'),
    ).toBeInTheDocument();

    const radios = screen.getAllByRole('radio');
    radios.forEach((radio) => {
      expect(radio).toBeDisabled();
    });
  });

  it('bloqueia preenchimento quando status é PENDENTE ou EM_QUARENTENA', () => {
    const inspecaoPendente: InspecaoManutencao = {
      ...criarInspecaoVazia(),
      statusManutencao: 'PENDENTE',
    };

    render(
      <FormularioInspecaoManutencao inspecaoInicial={inspecaoPendente} />,
    );

    expect(
      screen.getByText(
        /A inspeção de manutenção só pode ser preenchida e alterada quando o status for "Em manutenção"/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Salvar Inspeção/i }),
    ).not.toBeInTheDocument();
  });
});
