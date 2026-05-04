import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axiosInstance from "../services/axiosConfig";
import "./login.css";

import img1 from "../assets/login/img1.jpg";
import img2 from "../assets/login/img2.jpg";
import img3 from "../assets/login/img3.jpg";
import img4 from "../assets/login/img4.jpg";
import logo from "../assets/login/logo.png";

// ✅ FORA do componente
const images = [img1, img2, img3, img4];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post(
        "/auth/login",
        { email, senha: password }
      );

      localStorage.setItem("token", response.data.access_token);
      sessionStorage.setItem("authToken", response.data.access_token);
      sessionStorage.setItem("authUser", JSON.stringify(response.data.usuario));

      navigate('/producao/ordem', { replace: true });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Não foi possível entrar. Verifique a conexão com a API.";
      setError(Array.isArray(message) ? message.join(" ") : String(message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div
        className="login-background"
        style={{ backgroundImage: `url(${images[currentIndex]})` }}
        aria-hidden="true"
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
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {error && <span className="error">{error}</span>}
      </form>
    </div>
  );
}
