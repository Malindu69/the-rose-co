import React from 'react';
import './Hero.css';

function Hero({ onGoToBuilder }) {
  return (
    <section id="home" className="hero">
      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-pill">
            <span className="pill-dot"></span> Pre-Orders &amp; Custom Floral Studio
          </div>
          <h1 className="hero-title">
            Bespoke <span className="text-gradient">Custom Bouquets</span> &amp; Fresh Pre-Orders
          </h1>
          <p className="hero-subtitle">
            Every bouquet is handcrafted fresh to order for your special date. 
            Choose from our curated bouquets, build your own stem-by-stem, or order single fresh blooms.
          </p>

          <div className="hero-actions">
            <a href="#bouquets" className="btn btn-primary">
              💐 Browse Bouquets
            </a>
            <button className="btn btn-secondary-custom" onClick={onGoToBuilder}>
              🎨 Build Custom Bouquet
            </button>
            <a href="#stems" className="btn btn-outline">
              🌿 Single Stems
            </a>
          </div>

          <div className="hero-features-bar">
            <div className="feature-item">
              <span className="feature-icon">📅</span>
              <div>
                <strong>Handcrafted to Pre-Order</strong>
                <p>Peak freshness for your special date</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎨</span>
              <div>
                <strong>100% Custom Bouquets</strong>
                <p>Tailored size, palette &amp; wrapping</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎵</span>
              <div>
                <strong>Free Voice QR Tag</strong>
                <p>Scan bouquet to hear your voice note</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hero-image-wrapper">
          <div className="hero-image-blob"></div>
          <img 
            src="/bouquet1-blush.jpg"
            alt="Handcrafted Luxury Bouquet — The Signature Blush" 
            className="hero-image"
          />
          <div className="floating-badge hero-badge-top">
            <span className="badge-icon">🌸</span>
            <div>
              <strong>Pre-Order Fresh</strong>
              <small>Never pre-cut in advance</small>
            </div>
          </div>
          <div className="floating-badge hero-badge-bottom">
            <span className="badge-icon">🎙️</span>
            <div>
              <strong>Voice QR Included</strong>
              <small>Scan &amp; listen on flowers</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
