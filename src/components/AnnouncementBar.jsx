import React, { useState } from 'react';
import './AnnouncementBar.css';

function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="announcement-bar">
      <div className="announcement-inner">
        <span className="ann-icon">🎙️</span>
        <span className="ann-text">
          <strong>FREE Voice QR Tag</strong> included with every bouquet — scan &amp; hear a personal voice message on your flowers!
        </span>
        <a href="#voice-experience" className="ann-cta">Learn More →</a>
        <button className="ann-close" onClick={() => setVisible(false)} aria-label="Close announcement">✕</button>
      </div>
    </div>
  );
}

export default AnnouncementBar;
