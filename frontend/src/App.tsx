import React from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import './App.css';
import './pages/Producao.css';
import Header from './components/Layout/Header';
import Producao from './pages/Producao';
import OrdemProducao from './pages/OrdemProducao';
import InspecaoMontagem from './pages/InspecaoMontagem';
import HistoricoEquipamento from './pages/HistoricoEquipamento';
import { Manutencao } from './pages/Manutencao';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header title="Sistema de Controle de Equipamentos" />
        
        <nav className="navbar">
          <ul>
            <li><Link to="/producao">Produção</Link></li>
            <li><Link to="/manutencao">Manutenção</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/producao" element={<Producao><Outlet /></Producao>}>
            <Route path="ordem" element={<OrdemProducao />} />
            <Route path="inspecao" element={<InspecaoMontagem />} />
            <Route path="historico" element={<HistoricoEquipamento />} />
            <Route index element={<OrdemProducao />} />
          </Route>
          <Route path="/" element={<Producao><Outlet /></Producao>}>
            <Route index element={<OrdemProducao />} />
          </Route>
          <Route path="/manutencao" element={<Manutencao />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

