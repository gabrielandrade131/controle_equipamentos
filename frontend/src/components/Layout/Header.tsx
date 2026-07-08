import { useNavigate } from 'react-router-dom';
import logo from '../../assets/login/logo_interno.png';
import './Header.css';

interface HeaderProps {
    title: string;
    isMenuOpen: boolean;
    onToggleMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, isMenuOpen, onToggleMenu }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.clear();
        navigate('/login');
    };

    return (
        <header className="app-header">
            <button
                type="button"
                className="app-header-menu-button"
                aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={isMenuOpen}
                onClick={onToggleMenu}
            >
                <span className="material-symbols-outlined" aria-hidden="true">
                    menu
                </span>
            </button>
            <div className="app-header-brand" aria-label={title}>
                <img src={logo} alt="Logo Ambipar Axis" className="app-header-logo" />
            </div>
            <button
                onClick={handleLogout}
                className="app-header-logout"
            >
                Sair
            </button>
        </header>
    );
};

export default Header;
