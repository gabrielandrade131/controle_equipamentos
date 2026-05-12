import { useNavigate } from 'react-router-dom';
import logo from '../../assets/login/logo_interno.png';

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.clear();
        navigate('/login');
    };

    return (
        <header style={{
            backgroundColor: '#B2CC21',
            color: 'white',
            padding: '10px 20px',
            minHeight: 60,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <img src={logo} alt="Logo" style={{ width: 200, height: 'auto', marginBottom: 0 }} />
                </div>
            </div>
            <button
                onClick={handleLogout}
                style={{
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#b71c1c';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#d32f2f';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                Sair
            </button>
        </header>
    );
};

export default Header;
