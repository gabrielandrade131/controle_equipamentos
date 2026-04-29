import { useState, useEffect } from "react";
import axios from "axios";
import "./login.css";

import img1 from "../assets/login/img1.jpg";
import img3 from "../assets/login/img3.jpg";
import img4 from "../assets/login/img4.jpg";
import img6 from "../assets/login/img6.jpg";
import img7 from "../assets/login/img7.jpg";
import logo from "../assets/login/logo.png";

// ✅ FORA do componente
const images = [img1, img3, img4, img6, img7];

export default function Login() {
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
      const response = await axios.post(
        "http://localhost:3000/login",
        { email, password }
      );

      localStorage.setItem("token", response.data.token);

      window.location.href = "/";
    } catch (err) {
      setError("Email ou senha inválidos");
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