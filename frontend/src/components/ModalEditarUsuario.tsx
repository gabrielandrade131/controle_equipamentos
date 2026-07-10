import React, { useState, useEffect } from 'react';
import './ModalEditarUsuario.css';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  cSafety: boolean;
  operacional: boolean;
  verificado: boolean;
}

interface ModalEditarUsuarioProps {
  isOpen: boolean;
  usuario: Usuario | null;
  onClose: () => void;
  onSave: (usuarioAtualizado: Partial<Usuario>) => void;
  loading: boolean;
  canEditAll: boolean;
  canEditVerification: boolean;
}

const ModalEditarUsuario: React.FC<ModalEditarUsuarioProps> = ({
  isOpen,
  usuario,
  onClose,
  onSave,
  loading,
  canEditAll,
  canEditVerification,
}) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [cSafety, setCSafety] = useState(false);
  const [operacional, setOperacional] = useState(false);
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome);
      setEmail(usuario.email);
      setAtivo(usuario.ativo);
      setCSafety(Boolean(usuario.cSafety));
      setOperacional(Boolean(usuario.operacional));
      setVerificado(Boolean(usuario.verificado));
    }
  }, [usuario]);

  if (!isOpen || !usuario) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: usuario.id,
      nome,
      email,
      ativo,
      cSafety,
      operacional,
      verificado,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Usuário</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {!canEditAll ? (
          <p className="modal-permission-note">
            Seu perfil pode alterar apenas o status de verificação.
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={loading || !canEditAll}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || !canEditAll}
              required
            />
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="ativo"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              disabled={loading || !canEditAll}
            />
            <label htmlFor="ativo">Usuário Ativo</label>
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="cSafety"
              checked={cSafety}
              onChange={(e) => setCSafety(e.target.checked)}
              disabled={loading || !canEditAll}
            />
            <label htmlFor="cSafety">C-Safety (acesso restrito)</label>
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="operacional"
              checked={operacional}
              onChange={(e) => setOperacional(e.target.checked)}
              disabled={loading || !canEditAll}
            />
            <label htmlFor="operacional">Operacional</label>
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="verificado"
              checked={verificado}
              onChange={(e) => setVerificado(e.target.checked)}
              disabled={loading || !canEditVerification}
            />
            <label htmlFor="verificado">Usuário verificado</label>
          </div>


          <div className="modal-actions">
            <button type="submit" className="btn-salvar" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" className="btn-cancelar" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditarUsuario;
