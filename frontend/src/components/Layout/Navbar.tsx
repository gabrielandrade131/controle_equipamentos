import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { isCSafetyUser } from '../../utils/auth';

interface NavbarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
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
    onClose();
  };

  return (
    <nav className={`navbar-drawer${isOpen ? ' is-open' : ''}`} aria-hidden={!isOpen}>
      <div className="navbar-drawer-header">
        <span className="navbar-drawer-title">Menu</span>
        <button type="button" className="navbar-drawer-close" aria-label="Fechar menu" onClick={onClose}>
          <span className="material-symbols-outlined" aria-hidden="true">
            close
          </span>
        </button>
      </div>
      <ul>
        {menuItems
          .filter((item) => !(isCSafety && item.hiddenForCSafety))
          .map((item) => (
            <li key={item.path}>
              <button
                onClick={() => handleNavigate(item.path)}
                className={`nav-link${location.pathname.startsWith(item.path) ? ' is-active' : ''}`}
              >
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
