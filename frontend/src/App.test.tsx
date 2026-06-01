import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./components/Layout/Header', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <div>{title}</div>,
}));

jest.mock('./components/Layout/Navbar', () => ({
  __esModule: true,
  default: () => <nav>navbar</nav>,
}));

jest.mock('./pages/Producao', () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => (
    <div>
      <div>producao-page</div>
      {children}
    </div>
  ),
}));

jest.mock('./pages/OrdemProducao', () => ({
  __esModule: true,
  default: () => <div>ordem-page</div>,
}));

jest.mock('./pages/InspecaoMontagem', () => ({
  __esModule: true,
  default: () => <div>inspecao-page</div>,
}));

jest.mock('./pages/HistoricoEquipamento', () => ({
  __esModule: true,
  default: () => <div>historico-page</div>,
}));

jest.mock('./pages/Manutencao', () => ({
  __esModule: true,
  Manutencao: () => <div>manutencao-page</div>,
}));

jest.mock('./pages/NovaManutencao', () => ({
  __esModule: true,
  NovaManutencao: () => <div>nova-manutencao-page</div>,
}));

jest.mock('./pages/CadastroUsuarios', () => ({
  __esModule: true,
  default: () => <div>cadastro-usuarios-page</div>,
}));

jest.mock('./pages/ListaUsuarios', () => ({
  __esModule: true,
  default: () => <div>lista-usuarios-page</div>,
}));

jest.mock('./pages/TiposEquipamento', () => ({
  __esModule: true,
  default: () => <div>tipos-equipamento-page</div>,
}));

const renderAtPath = (path: string) => {
  window.history.pushState({}, '', path);
  return render(<App />);
};

beforeEach(() => {
  localStorage.clear();
});

test('renders login screen when unauthenticated', () => {
  renderAtPath('/');
  expect(screen.getByText(/bem-vindo/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
});

test('redirects unauthenticated user to login from protected route', () => {
  renderAtPath('/tipos-equipamento');
  expect(screen.getByText(/bem-vindo/i)).toBeInTheDocument();
  expect(screen.queryByText('tipos-equipamento-page')).not.toBeInTheDocument();
});

test('renders protected page and layout when authenticated', () => {
  localStorage.setItem('token', 'fake-token');
  renderAtPath('/tipos-equipamento');

  expect(screen.getByText(/sistema de controle de equipamentos/i)).toBeInTheDocument();
  expect(screen.getByText('navbar')).toBeInTheDocument();
  expect(screen.getByText('tipos-equipamento-page')).toBeInTheDocument();
});
