import React from 'react';

export function LoadingCards() {
  return (
    <div className="loading-container animate-fade-in">
      <div className="loading-text-new">Assembling your critics...</div>
      <div className="loading-dots">
        <div className="loading-dot"></div>
        <div className="loading-dot"></div>
        <div className="loading-dot"></div>
      </div>
      <div className="cards-grid">
        <div className="skeleton-card-new" />
        <div className="skeleton-card-new" />
        <div className="skeleton-card-new" />
      </div>
    </div>
  );
}
