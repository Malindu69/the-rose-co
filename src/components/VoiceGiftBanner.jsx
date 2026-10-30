import React from 'react';
import './VoiceGiftBanner.css';

function VoiceGiftBanner({ onGoToBuilder }) {
  return (
    <section id="voice-experience" className="voice-banner-section">
      <div className="container">
        <div className="voice-banner-card glass-panel">
          
          <div className="voice-banner-content">
            <span className="voice-pill">🎙️ The Rose Co. Signature Experience</span>
            <h2>Flowers That <span className="text-gradient">Speak</span> To Their Heart</h2>
            <p className="voice-desc">
              Every pre-ordered bouquet can include our complimentary <strong>Voice Keepsake QR Tag</strong>. 
              Record your voice message (or send us a WhatsApp voice note) and we attach an elegant QR tag directly to the bouquet ribbon.
            </p>

            <div className="voice-steps">
              <div className="v-step">
                <span className="v-num">1</span>
                <div>
                  <strong>Record Your Voice</strong>
                  <p>Send your love, wish, or memories</p>
                </div>
              </div>
              <div className="v-step">
                <span className="v-num">2</span>
                <div>
                  <strong>We Print QR Tag</strong>
                  <p>Tied with silk ribbon to flowers</p>
                </div>
              </div>
              <div className="v-step">
                <span className="v-num">3</span>
                <div>
                  <strong>Scan & Listen</strong>
                  <p>Recipient hears you with soft piano</p>
                </div>
              </div>
            </div>

            <div className="voice-actions">
              <a 
                href="http://localhost:5173/?from=Someone+Special" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary"
              >
                🎵 Test The Live Voice Player
              </a>
              <button className="btn btn-outline" onClick={onGoToBuilder}>
                🎨 Pre-Order With Voice Note
              </button>
            </div>
          </div>

          <div className="voice-visual">
            <div className="voice-phone-mockup">
              <div className="mockup-header">
                <span className="mockup-badge">🌸 The Rose Co. Voice Player</span>
              </div>
              <div className="mockup-card">
                <img 
                  src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=300&q=80" 
                  alt="Bouquet" 
                  className="mockup-rose-img"
                />
                <h4>"Playing Message... 🎶"</h4>
                <p>From <strong>Someone Special</strong></p>
                
                <div className="mockup-visualizer">
                  <span className="m-bar"></span>
                  <span className="m-bar"></span>
                  <span className="m-bar"></span>
                  <span className="m-bar"></span>
                  <span className="m-bar"></span>
                </div>
                
                <div className="mockup-tag">
                  ✨ Studio Voice Clarity & Romantic Piano
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default VoiceGiftBanner;
