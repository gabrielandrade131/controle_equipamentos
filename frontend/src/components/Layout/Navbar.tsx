import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import { isCSafetyUser } from '../../utils/auth';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const isCSafety = isCSafetyUser();
  const menuItems = [
    { label: 'Produção', path: '/producao', icon: 'precision_manufacturing', hiddenForCSafety: false },
    { label: 'Manutenção', path: '/manutencao', icon: 'build', hiddenForCSafety: true },
    { label: 'Validades', path: '/validade-equipamentos', icon: 'event_upcoming', hiddenForCSafety: true },
    { label: 'Usuários', path: '/usuarios', icon: 'group', hiddenForCSafety: true },
    { label: 'Tipos de Equipamento', path: '/tipos-equipamento', icon: 'category', hiddenForCSafety: true },
  ];

  const handleNavigate = (path: string) => {
    navigate(path, { replace: true });
  };

  return (
    <nav className="navbar">
      <ul>
        {menuItems
          .filter((item) => !(isCSafety && item.hiddenForCSafety))
          .map((item) => (
            <li key={item.path}>
              <button onClick={() => handleNavigate(item.path)} className="nav-link">
                <span className="material-symbols-outlined nav-link-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
      </ul>
    </nav>
  );
};

export default Navbar;
