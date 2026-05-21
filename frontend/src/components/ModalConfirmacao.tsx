import React from 'react';
import './ModalConfirmacao.css';

interface ModalConfirmacaoProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  buttonConfirmText?: string;
  buttonCancelText?: string;
  isDanger?: boolean;
}

const ModalConfirmacao: React.FC<ModalConfirmacaoProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
  buttonConfirmText = 'Confirmar',
  buttonCancelText = 'Cancelar',
  isDanger = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header ${isDanger ? 'danger' : ''}`}>
          <h2>{title}</h2>
          <button className="modal-close" onClick={onCancel}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p>{message}</p>
        </div>

        <div className="modal-actions">
          <button
            className={isDanger ? 'btn-confirmar-danger' : 'btn-confirmar'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processando...' : buttonConfirmText}
          </button>
          <button className="btn-cancelar" onClick={onCancel} disabled={loading}>
            {buttonCancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacao;
