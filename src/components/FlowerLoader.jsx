import React from 'react';

export const FlowerLoader = ({ size = 36, text = 'Loading fresh blooms...' }) => {
  return (
    <div className="flower-loader-container" role="status" aria-label="Loading products">
      <div className="flower-loader-spinner" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 6 colorful petals */}
          <circle cx="20" cy="9" r="6.2" fill="#E88EAA" />
          <circle cx="29.5" cy="14.5" r="6.2" fill="#F4B942" />
          <circle cx="29.5" cy="25.5" r="6.2" fill="#E88EAA" />
          <circle cx="20" cy="31" r="6.2" fill="#F4B942" />
          <circle cx="10.5" cy="25.5" r="6.2" fill="#E88EAA" />
          <circle cx="10.5" cy="14.5" r="6.2" fill="#F4B942" />
          {/* Flower Center */}
          <circle cx="20" cy="20" r="6" fill="#1C3728" />
          <circle cx="20" cy="20" r="2.5" fill="#FDF4E5" />
        </svg>
      </div>
      {text && <p className="flower-loader-text">{text}</p>}
    </div>
  );
};
