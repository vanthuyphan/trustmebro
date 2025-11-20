import React from 'react';
import { Modal } from './Modal';

export const AboutModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="About" size="small">
      <div style={{ lineHeight: '1.7', color: '#4b5563', fontSize: '15px' }}>
        <p style={{ marginTop: 0, marginBottom: '16px' }}>
          This tool tracks your writing process to verify that your work is authentically yours.
          It records keystrokes, typing patterns, and paste events to create cryptographic certificates.
        </p>

        <p style={{ marginBottom: '16px' }}>
          You might find it useful if you need to prove your work wasn't AI-generated.
        </p>

        <p style={{ marginBottom: 0, fontSize: '14px', color: '#6b7280' }}>
          <strong>Feedback:</strong>{' '}
          <a
            href="mailto:vanthuyphan@gmail.com?subject=TrustMeBro%20Feedback"
            style={{ color: '#3b82f6', textDecoration: 'none' }}
          >
            vanthuyphan@gmail.com
          </a>
        </p>
      </div>
    </Modal>
  );
};
