import React, { useEffect, useState } from 'react';
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
import ListaEquipamentos from './pages/ListaEquipamentos';
import axiosInstance from './services/axiosConfig';
import {
  AUTH_USER_UPDATED_EVENT,
  AuthUser,
  isCSafetyUser,
  isOperationalUser,
  isMasterUser,
  setAuthUser,
} from './utils/auth';

function AppContent() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, setAuthRevision] = useState(0);

  const isAuthenticated = () => {
    return Boolean(
      sessionStorage.getItem("authToken") || localStorage.getItem("token"),
    );
  };

  useEffect(() => {
    const syncAuthState = () => {
      setAuthRevision((prev) => prev + 1);
    };

    window.addEventListener(AUTH_USER_UPDATED_EVENT, syncAuthState);
    window.addEventListener('storage', syncAuthState);
    return () => {
      window.removeEventListener(AUTH_USER_UPDATED_EVENT, syncAuthState);
      window.removeEventListener('storage', syncAuthState);
    };
  }, []);

  useEffect(() => {
    if (location.pathname === '/login' || !isAuthenticated()) {
      return;
    }

    let active = true;

    const refreshCurrentUser = async () => {
      if (!isAuthenticated()) return;
      try {
        const response = await axiosInstance.get<AuthUser>('/auth/me');
        if (active && response.data) {
          setAuthUser(response.data);
        }
      } catch {
        // Erros de autenticação (401) já são tratados pelo interceptor do axios
      }
    };

    refreshCurrentUser();

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        refreshCurrentUser();
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      active = false;
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [location.pathname]);
  const GuardedRoute = ({
    children,
    allowCSafety = true,
    allowOperational = false,
    requireMaster = false,
  }: {
    children: React.ReactElement;
    allowCSafety?: boolean;
    allowOperational?: boolean;
    requireMaster?: boolean;
  }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    if (requireMaster && !isMasterUser()) {
      return <Navigate to="/producao/ordem" replace />;
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

        <Route
          path="/equipamentos"
          element={
            <GuardedRoute allowCSafety={false} requireMaster>
              <ListaEquipamentos />
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
