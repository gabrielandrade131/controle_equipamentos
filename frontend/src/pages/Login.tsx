import { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './login.css';

import img1 from '../assets/login/img1.jpg';
import img3 from '../assets/login/img3.jpg';
import img4 from '../assets/login/img4.jpg';
import img6 from '../assets/login/img6.jpg';
import img7 from '../assets/login/img7.jpg';
import logo from '../assets/login/logo.png';

const images = [img1, img3, img4, img6, img7];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/producao/ordem';

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (authService.isAuthenticated()) {
    return <Navigate to={from} replace />;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(email, senha);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email ou senha invalidos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <img
        src={images[currentIndex]}
        alt="Background"
        className="login-background"
        key={currentIndex}
      />
      <div className="login-overlay"></div>
      <form className="login-card" onSubmit={handleLogin}>
        <div className="login-logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <div className="axis-brand">
          <h2 className="axis-text">AXIS</h2>
        </div>

        <h1 className="login-title">Bem-vindo!</h1>
        <p className="login-subtitle">Acesse sua conta para continuar</p>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoComplete="current-password"
          required
        />

        <button disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        {error && <span className="error">{error}</span>}
      </form>
    </div>
  );
}
