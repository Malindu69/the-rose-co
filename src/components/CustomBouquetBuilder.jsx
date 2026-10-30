import React, { useState } from 'react';
import './CustomBouquetBuilder.css';

const SIZES = [
  { id: 'petite', name: 'Petite Bloom', stems: '10–12 Fresh Stems', price: 55, tag: 'Sweet & Compact' },
  { id: 'classic', name: 'Classic Signature', stems: '18–24 Fresh Stems', price: 85, tag: 'Most Popular ⭐' },
  { id: 'grand', name: 'Grand Luxury', stems: '35–40 Fresh Stems', price: 145, tag: 'Statement Bouquet' },
  { id: 'royal', name: 'Royal Prestige', stems: '50+ Premium Stems', price: 210, tag: 'Showstopper' },
];

const PALETTES = [
  { id: 'blush', name: 'Romantic Blush', desc: 'Soft pinks, dusty roses & pastel creams', color: '#ffb6c1' },
  { id: 'passion', name: 'Passion Velvet', desc: 'Deep crimson, rich red & burgundy roses', color: '#c41e3a' },
  { id: 'white', name: 'Pure Elegance', desc: 'Snow white roses, lilies & baby’s breath', color: '#f5f5f5' },
  { id: 'sunset', name: 'Golden Sunset', desc: 'Warm yellow roses, peach & coral blooms', color: '#ffa07a' },
  { id: 'lavender', name: 'Lavender Mist', desc: 'Lilac, soft purple & gentle violet tones', color: '#d8b4e2' },
  { id: 'wildflower', name: 'Boho Wildflower', desc: 'Colorful textured seasonal flora mix', color: '#85bb65' },
];

const WRAPPINGS = [
  { id: 'black', name: 'Matte Black & Gold', desc: 'Moody, modern & ultra-luxurious' },
  { id: 'blush', name: 'Blush Pink & Silk Ribbon', desc: 'Soft, feminine & romantic' },
  { id: 'kraft', name: 'Parisian Rustic Kraft', desc: 'Eco-friendly natural craft paper' },
  { id: 'organza', name: 'Pearl White & Silk', desc: 'Clean, bridal & graceful' },
];

const ADDONS = [
  { id: 'voice_qr', name: '🎵 Voice Message QR Tag', price: 0, desc: 'Recipient scans bouquet to hear your voice note (FREE!)' },
  { id: 'wax_card', name: '💌 Wax-Sealed Handwritten Card', price: 5, desc: 'Handwritten calligraphy card sealed with wax' },
  { id: 'chocolates', name: '🍫 Artisan Chocolates Box', price: 12, desc: 'Luxury Belgian assorted truffles' },
];

function CustomBouquetBuilder({ onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState(SIZES[1]); // Classic
  const [selectedPalette, setSelectedPalette] = useState(PALETTES[0]); // Blush
  const [selectedWrapping, setSelectedWrapping] = useState(WRAPPINGS[0]); // Black
  const [selectedAddons, setSelectedAddons] = useState(['voice_qr']); // Voice QR free by default
  const [customNotes, setCustomNotes] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(false);

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const addon = ADDONS.find(a => a.id === id);
    return sum + (addon ? addon.price : 0);
  }, 0);

  const totalPrice = selectedSize.price + addonsTotal;

  const handleAddCustomBouquet = () => {
    const customProduct = {
      id: Date.now(), // unique id
      name: `Custom Bouquet: ${selectedSize.name}`,
      description: `${selectedPalette.name} palette with ${selectedWrapping.name} wrap (${selectedSize.stems})${customNotes ? ` — Note: "${customNotes}"` : ''}`,
      price: totalPrice,
      image: "https://images.unsplash.com/photo-1561181286-d3fee7d55ef6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      isCustom: true,
      customDetails: {
        size: selectedSize.name,
        stems: selectedSize.stems,
        palette: selectedPalette.name,
        wrapping: selectedWrapping.name,
        addons: selectedAddons.map(id => ADDONS.find(a => a.id === id)?.name),
        notes: customNotes
      }
    };

    onAddToCart(customProduct);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  return (
    <section id="custom-builder" className="builder-section">
      <div className="container">
        
        <div className="builder-header text-center">
          <div className="builder-pill">
            <span>🎨 Bespoke Floristry</span>
          </div>
          <h2>Design Your <span className="text-gradient">Custom Bouquet</span></h2>
          <p className="builder-subtitle">
            Need something uniquely tailored? Select your size, color mood, wrapping, and keepsakes. 
            Our master florists handcraft it fresh for your chosen pre-order date.
          </p>
        </div>

        <div className="builder-grid">
          
          {/* Options Column */}
          <div className="builder-controls">
            
            {/* Step 1: Size */}
            <div className="builder-step">
              <div className="step-title">
                <span className="step-number">1</span>
                <h3>Choose Bouquet Size</h3>
              </div>
              <div className="options-grid size-grid">
                {SIZES.map(size => (
                  <button 
                    key={size.id} 
                    type="button"
                    className={`option-card ${selectedSize.id === size.id ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    <span className="option-badge">{size.tag}</span>
                    <span className="option-name">{size.name}</span>
                    <span className="option-detail">{size.stems}</span>
                    <span className="option-price">${size.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Color Palette */}
            <div className="builder-step">
              <div className="step-title">
                <span className="step-number">2</span>
                <h3>Select Color Mood & Palette</h3>
              </div>
              <div className="options-grid palette-grid">
                {PALETTES.map(palette => (
                  <button 
                    key={palette.id}
                    type="button"
                    className={`option-card palette-card ${selectedPalette.id === palette.id ? 'active' : ''}`}
                    onClick={() => setSelectedPalette(palette)}
                  >
                    <span className="palette-color-swatch" style={{ backgroundColor: palette.color }}></span>
                    <span className="option-name">{palette.name}</span>
                    <span className="option-detail">{palette.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Wrapping Style */}
            <div className="builder-step">
              <div className="step-title">
                <span className="step-number">3</span>
                <h3>Choose Wrapping & Presentation</h3>
              </div>
              <div className="options-grid wrapping-grid">
                {WRAPPINGS.map(wrapping => (
                  <button 
                    key={wrapping.id}
                    type="button"
                    className={`option-card ${selectedWrapping.id === wrapping.id ? 'active' : ''}`}
                    onClick={() => setSelectedWrapping(wrapping)}
                  >
                    <span className="option-name">{wrapping.name}</span>
                    <span className="option-detail">{wrapping.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Keepsakes & Add-ons */}
            <div className="builder-step">
              <div className="step-title">
                <span className="step-number">4</span>
                <h3>Add Keepsakes & Surprises</h3>
              </div>
              <div className="addons-list">
                {ADDONS.map(addon => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <div 
                      key={addon.id} 
                      className={`addon-row ${isChecked ? 'active' : ''}`}
                      onClick={() => toggleAddon(addon.id)}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => toggleAddon(addon.id)} 
                      />
                      <div className="addon-info">
                        <strong>{addon.name}</strong>
                        <p>{addon.desc}</p>
                      </div>
                      <span className="addon-price">
                        {addon.price === 0 ? 'FREE' : `+$${addon.price}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="builder-step">
              <div className="step-title">
                <span className="step-number">5</span>
                <h3>Special Florist Requests (Optional)</h3>
              </div>
              <textarea 
                className="builder-textarea"
                rows="3"
                placeholder="e.g., 'Please include extra peonies and baby's breath. It's for our 5th anniversary!'"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
              />
            </div>

          </div>

          {/* Sticky Summary Card */}
          <div className="builder-summary-col">
            <div className="builder-summary-card glass-panel sticky-summary">
              <h3>Your Custom Bouquet</h3>
              <p className="summary-subtitle">Handcrafted upon pre-order</p>

              <div className="summary-divider"></div>

              <div className="summary-specs">
                <div className="spec-item">
                  <span className="spec-label">Size:</span>
                  <strong>{selectedSize.name} ({selectedSize.stems})</strong>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Palette:</span>
                  <strong>{selectedPalette.name}</strong>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Wrapping:</span>
                  <strong>{selectedWrapping.name}</strong>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Keepsakes:</span>
                  <strong>
                    {selectedAddons.length > 0 
                      ? selectedAddons.map(id => ADDONS.find(a => a.id === id)?.name).join(', ')
                      : 'None'}
                  </strong>
                </div>
                {customNotes && (
                  <div className="spec-item">
                    <span className="spec-label">Notes:</span>
                    <em className="spec-note">"{customNotes}"</em>
                  </div>
                )}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-price-row">
                <span>Estimated Pre-Order Total</span>
                <span className="summary-total-price">${totalPrice.toFixed(2)}</span>
              </div>

              <button 
                type="button" 
                className={`btn btn-primary btn-block ${addedAnimation ? 'btn-added' : ''}`}
                onClick={handleAddCustomBouquet}
              >
                {addedAnimation ? '✓ Added to Pre-Order Cart!' : '💐 Pre-Order This Custom Bouquet'}
              </button>

              <div className="builder-guarantee">
                <span>✨ Guaranteed fresh blooms sourced upon pre-order</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default CustomBouquetBuilder;
