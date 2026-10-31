import React, { useState } from 'react';
import './Header.css';

function Header({ cartCount, onCartClick, onNavigate, currentPage }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLinkClick = (target, anchor) => {
    setMenuOpen(false);
    if (onNavigate) onNavigate(target);
    if (anchor) {
      setTimeout(() => {
        const el = document.querySelector(anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  return (
    <header className="header glass-panel">
      <div className="container header-container">
        <div className="logo">
          <a href="#home" className="logo-link" onClick={() => handleLinkClick('home')}>
            <img src="/logo.png" alt="The Rose Co. Logo" className="logo-img" />
            <div className="logo-text-wrap">
              <span className="logo-name">The Rose Co.</span>
              <span className="logo-tag">Bespoke Bouquets</span>
            </div>
          </a>
        </div>
        
        <nav className="nav-links desktop-nav">
          <a href="#bouquets" onClick={() => handleLinkClick('home', '#bouquets')}>Browse Bouquets</a>
          <a 
            href="#custom-builder" 
            className="nav-highlight"
            onClick={(e) => { e.preventDefault(); handleLinkClick('builder'); }}
          >
            🎨 Custom Builder
          </a>
          <a href="#stems" onClick={() => handleLinkClick('home', '#stems')}>Single Stems</a>
          <a href="#voice-experience" onClick={() => handleLinkClick('home', '#voice-experience')}>Voice QR 🎵</a>
        </nav>
        
        <div className="header-actions">
          <button className="cart-btn btn btn-outline" onClick={onCartClick} aria-label="Cart">
            🛒 <span className="cart-label">Pre-Order</span> {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          <button 
            className="mobile-menu-toggle" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-nav-menu">
          <a href="#bouquets" onClick={() => handleLinkClick('home', '#bouquets')}>
            💐 Browse Bouquets
          </a>
          <a 
            href="#custom-builder" 
            className="mobile-nav-highlight"
            onClick={(e) => { e.preventDefault(); handleLinkClick('builder'); }}
          >
            🎨 Custom Bouquet Builder
          </a>
          <a href="#stems" onClick={() => handleLinkClick('home', '#stems')}>
            🌿 Single Flowers & Loose Bunches
          </a>
          <a href="#voice-experience" onClick={() => handleLinkClick('home', '#voice-experience')}>
            🎵 Voice QR Experience
          </a>
        </div>
      )}
    </header>
  );
}

export default Header;
