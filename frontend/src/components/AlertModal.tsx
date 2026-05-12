import React from 'react';
import './AlertModal.css';

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: 'error' | 'warning' | 'info' | 'success';
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
  type = 'warning',
}) => {
  if (!isOpen) return null;

  return (
    <div className="alert-modal-overlay">
      <div className={`alert-modal alert-modal-${type}`}>
        <div className="alert-modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="alert-modal-close">
            ✕
          </button>
        </div>
        <div className="alert-modal-body">
          <p>{message}</p>
        </div>
        <div className="alert-modal-footer">
          <button onClick={onClose} className="alert-modal-btn">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
