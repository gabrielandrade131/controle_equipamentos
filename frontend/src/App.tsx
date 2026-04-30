import React from 'react';
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

function AppContent() {
  const location = useLocation();
  
  const isAuthenticated = () => {
  return !!localStorage.getItem("token");
  };
  const ProtectedRoute = ({ children }: { children: React.ReactElement}) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
  };
  
  return (
    <div className="App">
      {location.pathname !== "/login" ? (
        <>
          <Header title="Sistema de Controle de Equipamentos" />
          <Navbar />
        </>
      ) : null}
      <Routes>

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* PROTEGIDO - PRODUÇÃO */}
        <Route
          path="/producao"
          element={
            <ProtectedRoute>
              <Producao>
                <Outlet />
              </Producao>
            </ProtectedRoute>
          }
        >
          <Route path="ordem" element={<OrdemProducao />} />
          <Route path="inspecao" element={<InspecaoMontagem />} />
          <Route path="historico" element={<HistoricoEquipamento />} />

          <Route index element={<Navigate to="/producao/ordem" replace />} />
        </Route>

        {/* RAIZ */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Producao>
                <Outlet />
              </Producao>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/producao/ordem" replace />} />
        </Route>

        {/* MANUTENÇÃO */}
        <Route
          path="/manutencao"
          element={
            <ProtectedRoute>
              <Manutencao />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manutencao/criar"
          element={
            <ProtectedRoute>
              <NovaManutencao />
            </ProtectedRoute>
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

