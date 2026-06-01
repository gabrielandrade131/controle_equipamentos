import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import { isCSafetyUser } from '../../utils/auth';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const isCSafety = isCSafetyUser();

  const handleNavigate = (path: string) => {
    navigate(path, { replace: true });
  };

  return (
    <nav className="navbar">
      <ul>
        <li>
          <button onClick={() => handleNavigate('/producao')} className="nav-link">
            Produção
          </button>
        </li>
        {!isCSafety && (
          <>
            <li>
              <button onClick={() => handleNavigate('/manutencao')} className="nav-link">
                Manutenção
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigate('/usuarios')} className="nav-link">
                Usuários
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigate('/tipos-equipamento')} className="nav-link">
                Tipos de Equipamento
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
