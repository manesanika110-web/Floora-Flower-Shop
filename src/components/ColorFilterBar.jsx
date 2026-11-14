import React from 'react';
import { COLORS } from '../data/products';

export const ColorFilterBar = ({ selectedColor, onSelectColor }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.65rem',
      flexWrap: 'wrap',
      padding: '0.75rem 0'
    }}>
      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', marginRight: '0.25rem' }}>
        Color:
      </span>

      <button
        type="button"
        onClick={() => onSelectColor('')}
        className="btn btn-sm"
        style={{
          padding: '0.35rem 0.8rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem',
          border: '1px solid var(--border)',
          backgroundColor: !selectedColor ? 'var(--primary)' : 'var(--surface)',
          color: !selectedColor ? '#FFFFFF' : 'var(--text)'
        }}
      >
        All Colors
      </button>

      {COLORS.map(c => {
        const isSelected = selectedColor?.toLowerCase() === c.name.toLowerCase();
        return (
          <button
            key={c.name}
            type="button"
            onClick={() => onSelectColor(c.name)}
            title={`Filter by ${c.name}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
              backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--surface)',
              color: 'var(--text)',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <span 
              className="color-dot" 
              style={{ 
                backgroundColor: c.hex, 
                width: '14px', 
                height: '14px', 
                marginRight: '2px',
                border: c.name === 'White' || c.name === 'Cream' ? '1px solid #CCC' : 'none'
              }}
            />
            <span>{c.name}</span>
          </button>
        );
      })}
    </div>
  );
};
