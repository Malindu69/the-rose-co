import React from 'react';
import './Header.css';

function Header({ cartCount, onCartClick, onNavigate, currentPage }) {
  return (
    <header className="header glass-panel">
      <div className="container header-container">
        <div className="logo">
          <a href="#home" className="logo-link" onClick={() => onNavigate && onNavigate('home')}>
            <img src="/logo.png" alt="The Rose Co. Logo" className="logo-img" />
            <div className="logo-text-wrap">
              <span className="logo-name">The Rose Co.</span>
              <span className="logo-tag">Bespoke Bouquets</span>
            </div>
          </a>
        </div>
        
        <nav className="nav-links">
          <a href="#bouquets" onClick={() => onNavigate && onNavigate('home')}>Browse Bouquets</a>
          <a 
            href="#custom-builder" 
            className="nav-highlight"
            onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('builder'); }}
          >
            🎨 Custom Builder
          </a>
          <a href="#stems" onClick={() => onNavigate && onNavigate('home')}>Single Stems</a>
          <a href="#voice-experience">Voice QR 🎵</a>
        </nav>
        
        <button className="cart-btn btn btn-outline" onClick={onCartClick}>
          🛒 Pre-Order {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </div>
    </header>
  );
}

export default Header;
