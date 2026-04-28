import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, saveSession } from '../services/authService';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const response = await login({ email, senha });
      saveSession(response);
      navigate('/producao', { replace: true });
    } catch (error: any) {
      const mensagem =
        error?.response?.data?.message || 'E-mail ou senha inválidos.';
      setErro(Array.isArray(mensagem) ? mensagem.join(' ') : mensagem);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <h1>Sistema de Controle de Equipamentos</h1>
          <p>Faça login para continuar</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {erro && <div className="login-error">{erro}</div>}

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={carregando || !email || !senha}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
