import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Header from './components/Layout/Header';
import OrdemProducao from './pages/OrdemProducao';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header title="Sistema de Controle de Equipamentos" />
        
        <nav className="navbar">
          <ul>
            <li><Link to="/">Ordem de Produção</Link></li>
            <li><Link to="/inspecao">Inspeção de Montagem</Link></li>
            <li><Link to="/manutencao">Manutenção</Link></li>
            <li><Link to="/historico">Histórico</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<OrdemProducao />} />
          <Route path="/inspecao" element={<div>Inspeção de Montagem (em desenvolvimento)</div>} />
          <Route path="/manutencao" element={<div>Manutenção (em desenvolvimento)</div>} />
          <Route path="/historico" element={<div>Histórico (em desenvolvimento)</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

