import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import './pages/Producao.css';
import Header from './components/Layout/Header';
import Navbar from './components/Layout/Navbar';
import Producao from './pages/Producao';
import OrdemProducao from './pages/OrdemProducao';
import InspecaoMontagem from './pages/InspecaoMontagem';
import HistoricoEquipamento from './pages/HistoricoEquipamento';
import { Manutencao } from './pages/Manutencao';
import { NovaManutencao } from './pages/NovaManutencao';
import Login from './pages/login';
import CadastroUsuarios from './pages/CadastroUsuarios';
import ListaUsuarios from './pages/ListaUsuarios';
import TiposEquipamentoPage from './pages/TiposEquipamento';
import ValidadeEquipamentos from './pages/ValidadeEquipamentos';
import { isCSafetyUser, isOperationalUser } from './utils/auth';

function AppContent() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isAuthenticated = () => {
  return !!localStorage.getItem("token");
  };
  const GuardedRoute = ({
    children,
    allowCSafety = true,
    allowOperational = false,
  }: {
    children: React.ReactElement;
    allowCSafety?: boolean;
    allowOperational?: boolean;
  }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    if (!allowCSafety && isCSafetyUser()) {
      return <Navigate to="/producao/ordem" replace />;
    }
    if (!allowOperational && isOperationalUser()) {
      return <Navigate to="/producao/ordem" replace />;
    }
    return children;
  };
  
  return (
    <div className="App">
      {location.pathname !== "/login" ? (
        <>
          <Header
            title="Sistema de Controle de Equipamentos"
            isMenuOpen={isMenuOpen}
            onToggleMenu={() => setIsMenuOpen((current) => !current)}
          />
          <Navbar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
          {isMenuOpen ? (
            <button
              type="button"
              className="app-drawer-backdrop"
              aria-label="Fechar menu"
              onClick={() => setIsMenuOpen(false)}
            />
          ) : null}
        </>
      ) : null}
      <Routes>

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* PROTEGIDO - PRODUÇÃO */}
        <Route
          path="/producao"
          element={
            <GuardedRoute allowOperational>
              <Producao>
                <Outlet />
              </Producao>
            </GuardedRoute>
          }
        >
          <Route path="ordem" element={<OrdemProducao />} />
          <Route
            path="inspecao"
            element={
              <GuardedRoute allowCSafety={false} allowOperational>
                <InspecaoMontagem />
              </GuardedRoute>
            }
          />
          <Route
            path="historico"
            element={
              <GuardedRoute allowCSafety={false}>
                <HistoricoEquipamento />
              </GuardedRoute>
            }
          />

          <Route index element={<Navigate to="/producao/ordem" replace />} />
        </Route>

        {/* RAIZ */}
        <Route
          path="/"
          element={
            <GuardedRoute allowOperational>
              <Producao>
                <Outlet />
              </Producao>
            </GuardedRoute>
          }
        >
          <Route index element={<Navigate to="/producao/ordem" replace />} />
        </Route>

        {/* MANUTENÇÃO */}
        <Route
          path="/manutencao"
          element={
            <GuardedRoute allowCSafety={false} allowOperational>
              <Manutencao />
            </GuardedRoute>
          }
        />

        <Route
          path="/manutencao/criar"
          element={
            <GuardedRoute allowCSafety={false}>
              <NovaManutencao />
            </GuardedRoute>
          }
        />

        {/* CADASTRO DE USUÁRIOS */}
        <Route
          path="/usuarios/cadastro"
          element={
            <GuardedRoute allowCSafety={false}>
              <CadastroUsuarios />
            </GuardedRoute>
          }
        />

        {/* LISTA DE USUÁRIOS */}
        <Route
          path="/usuarios"
          element={
            <GuardedRoute allowCSafety={false}>
              <ListaUsuarios />
            </GuardedRoute>
          }
        />

        <Route
          path="/tipos-equipamento"
          element={
            <GuardedRoute allowCSafety={false}>
              <TiposEquipamentoPage />
            </GuardedRoute>
          }
        />

        <Route
          path="/validade-equipamentos"
          element={
            <GuardedRoute allowCSafety={false}>
              <ValidadeEquipamentos />
            </GuardedRoute>
          }
        />

      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
