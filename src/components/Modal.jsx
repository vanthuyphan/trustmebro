import React, { useEffect } from 'react';
import '../styles/Modal.css';

export const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="modal-header">
            <h3>{title}</h3>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', danger = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <p className="confirm-message">{message}</p>
      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          {cancelText}
        </button>
        <button
          className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export const PromptModal = ({ isOpen, onClose, onSubmit, title, message, placeholder = '', defaultValue = '' }) => {
  const [value, setValue] = React.useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(value);
    onClose();
    setValue('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <form onSubmit={handleSubmit}>
        {message && <p className="prompt-message">{message}</p>}
        <input
          type="text"
          className="prompt-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
      </form>
    </Modal>
  );
};

export const AlertModal = ({ isOpen, onClose, title, message, type = 'info' }) => {
  const icons = {
    info: 'ℹ️',
    success: '✓',
    warning: '⚠️',
    error: '✗',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <div className={`alert-content alert-${type}`}>
        <span className="alert-icon">{icons[type]}</span>
        <p className="alert-message">{message}</p>
      </div>
      <div className="modal-actions">
        <button className="btn btn-primary" onClick={onClose}>
          OK
        </button>
      </div>
    </Modal>
  );
};
