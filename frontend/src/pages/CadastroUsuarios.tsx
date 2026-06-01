import React, { useState } from 'react';
import axiosInstance from '../services/axiosConfig';
import './CadastroUsuarios.css';
import AlertModal from '../components/AlertModal';

interface CreateUserDto {
  nome: string;
  email: string;
  senha: string;
  cSafety: boolean;
}

interface AlertState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const CadastroUsuarios: React.FC = () => {
  const [formData, setFormData] = useState<CreateUserDto>({
    nome: '',
    email: '',
    senha: '',
    cSafety: false,
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const titles: Record<string, string> = {
      success: 'Sucesso',
      error: 'Erro',
      warning: 'Aviso',
      info: 'Informação',
    };

    setAlert({
      isOpen: true,
      title: titles[type],
      message,
      type,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.nome.trim()) {
      showAlert('Nome é obrigatório', 'warning');
      return false;
    }

    if (!formData.email.trim()) {
      showAlert('Email é obrigatório', 'warning');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showAlert('Email inválido', 'warning');
      return false;
    }

    if (!formData.senha.trim()) {
      showAlert('Senha é obrigatória', 'warning');
      return false;
    }

    if (formData.senha.length < 5) {
      showAlert('Senha deve ter no mínimo 5 caracteres', 'warning');
      return false;
    }

    if (formData.senha !== confirmPassword) {
      showAlert('Senhas não correspondem', 'warning');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post('/auth/register', {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        cSafety: formData.cSafety,
      });

      showAlert('Usuário cadastrado com sucesso!', 'success');

      setFormData({
        nome: '',
        email: '',
        senha: '',
        cSafety: false,
      });
      setConfirmPassword('');

      setTimeout(() => {
        window.location.href = '/usuarios';
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Erro ao cadastrar usuário';
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastro-usuarios-container">
      <div className="cadastro-form-wrapper">
        <h1 className="cadastro-titulo">Cadastro de Usuário</h1>

        <form onSubmit={handleSubmit} className="cadastro-form">
          <div className="form-group">
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Digite o nome completo"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Digite o email"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleInputChange}
              placeholder="Digite a senha (mínimo 5 caracteres)"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Confirme a senha"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="cSafety"
              name="cSafety"
              checked={formData.cSafety}
              onChange={handleCheckboxChange}
              disabled={loading}
            />
            <label htmlFor="cSafety">C-Safety (acesso restrito)</label>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => window.history.back()}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
    </div>
  );
};

export default CadastroUsuarios;
