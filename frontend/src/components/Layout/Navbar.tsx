import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

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
        <li>
          <button onClick={() => handleNavigate('/manutencao')} className="nav-link">
            Manutenção
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
