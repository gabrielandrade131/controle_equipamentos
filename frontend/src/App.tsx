import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
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
import Login from './pages/Login';
import { isAuthenticated } from './services/authService';

const PrivateLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <Header title="Sistema de Controle de Equipamentos" />
      <Navbar />
      {children}
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/producao"
            element={
              <PrivateLayout>
                <Producao><Outlet /></Producao>
              </PrivateLayout>
            }
          >
            <Route path="ordem" element={<OrdemProducao />} />
            <Route path="inspecao" element={<InspecaoMontagem />} />
            <Route path="historico" element={<HistoricoEquipamento />} />
            <Route index element={<Navigate to="/producao/ordem" replace />} />
          </Route>

          <Route
            path="/manutencao"
            element={
              <PrivateLayout>
                <Manutencao />
              </PrivateLayout>
            }
          />
          <Route
            path="/manutencao/criar"
            element={
              <PrivateLayout>
                <NovaManutencao />
              </PrivateLayout>
            }
          />

          <Route path="/" element={<Navigate to={isAuthenticated() ? '/producao/ordem' : '/login'} replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

