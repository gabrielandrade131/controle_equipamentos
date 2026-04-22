import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Producao.css';

interface ProdutoItem {
  id: string;
  label: string;
  route: string;
}

const Producao: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const subitems: ProdutoItem[] = [
    { id: 'ordem', label: 'Ordem de Produção', route: '/producao/ordem' },
    { id: 'inspecao', label: 'Inspeção de Montagem', route: '/producao/inspecao' },
    { id: 'historico', label: 'Histórico do Equipamento', route: '/producao/historico' }
  ];

  const getCurrentSubpage = () => {
    const path = location.pathname;
    if (path.includes('ordem')) return 'ordem';
    if (path.includes('inspecao')) return 'inspecao';
    if (path.includes('historico')) return 'historico';
    return 'ordem';
  };

  const currentSubpage = getCurrentSubpage();

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  return (
    <div className="producao-container">
      <div className="producao-header">
        <h1>Produção</h1>
        <div className="producao-tabs">
          {subitems.map((item) => (
            <button
              key={item.id}
              className={`tab-button ${currentSubpage === item.id ? 'active' : ''}`}
              onClick={() => handleNavigate(item.route)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="producao-content">
        {children}
      </div>
    </div>
  );
};

export default Producao;
