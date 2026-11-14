import React from 'react';

export const Toast = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: 'var(--surface)',
      color: 'var(--text)',
      border: '1px solid var(--border)',
      borderLeft: '4px solid var(--primary)',
      padding: '0.9rem 1.4rem',
      borderRadius: 'var(--radius-md)',
      boxShadow: '0 12px 32px rgba(73, 52, 60, 0.18)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '0.92rem',
      fontWeight: 500,
      animation: 'fadeIn 0.3s ease'
    }}>
      <span>{message}</span>
      <button 
        type="button" 
        onClick={onClose}
        style={{
          fontSize: '1.2rem',
          lineHeight: 1,
          color: 'var(--muted)',
          cursor: 'pointer',
          padding: '2px'
        }}
        aria-label="Close"
      >
        &times;
      </button>
    </div>
  );
};
