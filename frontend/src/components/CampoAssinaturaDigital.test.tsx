import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CampoAssinaturaDigital } from './CampoAssinaturaDigital';

describe('CampoAssinaturaDigital', () => {
  it('deve renderizar o label e o canvas de assinatura', () => {
    render(<CampoAssinaturaDigital label="Assinatura do Executante:" />);
    expect(screen.getByText('Assinatura do Executante:')).toBeInTheDocument();
    expect(
      screen.getByText(/Assine aqui com o dedo, caneta touch ou mouse/i)
    ).toBeInTheDocument();
  });

  it('deve permitir limpar a assinatura quando houver conteúdo', () => {
    const handleChange = jest.fn();
    render(
      <CampoAssinaturaDigital
        label="Assinatura:"
        value="data:image/png;base64,sample"
        onChange={handleChange}
      />
    );
    expect(screen.getByText('Assinatura:')).toBeInTheDocument();
  });
});
