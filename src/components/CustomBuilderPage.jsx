import React, { useState } from 'react';
import './CustomBuilderPage.css';

// Flower types with exact images
const FLOWERS = [
  { id: 'rose-red',     name: 'Red Rose',        emoji: '🌹', image: '/flower-red-rose.jpg',        priceEach: 250 },
  { id: 'chrysanthemum',name: 'Chrysanthemum',   emoji: '🌼', image: '/flower-chrysanthemum.jpg',   priceEach: 180 },
  { id: 'lily',         name: 'Lily',             emoji: '🌷', image: '/flower-lily.jpg',            priceEach: 320 },
  { id: 'orchid',       name: 'Orchid',           emoji: '🌺', image: '/flower-orchid.jpg',          priceEach: 400 },
  { id: 'gypsophila',   name: "Baby's Breath",    emoji: '🤍', image: '/flower-babys-breath.jpg',    priceEach: 150 },
];

// ── WRAPPING PAPERS (materials/colors — photos of the actual paper texture) ──
const WRAPPING_PAPERS = [
  {
    id: 'ivory-tissue',
    name: 'Ivory Tissue',
    desc: 'Soft & classic',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=300&q=80',
    badge: '🤍 Most Popular'
  },
  {
    id: 'blush-pink',
    name: 'Blush Pink',
    desc: 'Romantic & dreamy',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=300&q=80',
    badge: '🩷 Romantic'
  },
  {
    id: 'kraft-rustic',
    name: 'Kraft Brown',
    desc: 'Natural & earthy',
    image: 'https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?auto=format&fit=crop&w=300&q=80',
    badge: '🤎 Eco-Chic'
  },
  {
    id: 'black-matte',
    name: 'Black Matte',
    desc: 'Bold & luxurious',
    image: 'https://images.unsplash.com/photo-1574620134890-3498f55c9bb0?auto=format&fit=crop&w=300&q=80',
    badge: '🖤 Luxury'
  },
  {
    id: 'lavender-frost',
    name: 'Lavender Frost',
    desc: 'Delicate & feminine',
    image: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=300&q=80',
    badge: '💜 Dreamy'
  },
  {
    id: 'gold-foil',
    name: 'Gold Shimmer',
    desc: 'Premium & celebratory',
    image: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=300&q=80',
    badge: '✨ Premium'
  },
];

// ── WRAPPING TYPES (bouquet style/shape — how it's arranged & tied) ──
const WRAPPING_TYPES = [
  {
    id: 'round-korean',
    name: 'Korean Style',
    desc: 'Full wrapped round dome — trending & modern',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55ef6?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'french-open',
    name: 'French Open',
    desc: 'Loosely wrapped, stems visible, elegant & airy',
    image: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cone-classic',
    name: 'Classic Cone',
    desc: 'Traditional cone wrap — timeless & easy to hold',
    image: 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'flat-bouquet',
    name: 'Flat Fan',
    desc: 'Flat, wide fan shape — great for photographs',
    image: 'https://images.unsplash.com/photo-1548517638-de57d8e3b1db?auto=format&fit=crop&w=300&q=80',
  },
];

// ── Flower Picker Component ──────────────────────────────────────────────────
function FlowerPicker({ flowers, quantities, onChange }) {
  return (
    <div className="flower-picker">
      {flowers.map(flower => {
        const qty = quantities[flower.id] || 0;
        return (
          <div key={flower.id} className={`flower-card ${qty > 0 ? 'selected' : ''}`}>
            <div className="flower-img-wrap">
              <img src={flower.image} alt={flower.name} className="flower-img" />
              {qty > 0 && <span className="flower-qty-badge">{qty}</span>}
            </div>
            <div className="flower-info">
              <span className="flower-name">{flower.name}</span>
              <span className="flower-price">LKR {flower.priceEach}/stem</span>
            </div>
            <div className="flower-controls">
              <button
                className="qty-btn"
                onClick={() => onChange(flower.id, Math.max(0, qty - 1))}
                disabled={qty === 0}
                aria-label="Decrease"
              >−</button>
              <span className="qty-count">{qty}</span>
              <button
                className="qty-btn add"
                onClick={() => onChange(flower.id, qty + 1)}
                aria-label="Increase"
              >+</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Wrapping Photo Selector (paper material) ─────────────────────────────────
function PaperSelector({ papers, selected, onSelect }) {
  return (
    <div className="wrap-photo-grid">
      {papers.map(p => (
        <button
          key={p.id}
          className={`wrap-photo-card ${selected === p.id ? 'selected' : ''}`}
          onClick={() => onSelect(p.id)}
        >
          <div className="wrap-photo-img-wrap">
            <img src={p.image} alt={p.name} className="wrap-photo-img" />
            {p.badge && <span className="wrap-photo-badge">{p.badge}</span>}
            {selected === p.id && <div className="wrap-selected-overlay">✓</div>}
          </div>
          <span className="wrap-photo-name">{p.name}</span>
          <span className="wrap-photo-desc">{p.desc}</span>
        </button>
      ))}
    </div>
  );
}

// ── Wrapping Type Selector (bouquet style) ────────────────────────────────────
function TypeSelector({ types, selected, onSelect }) {
  return (
    <div className="wrap-type-grid">
      {types.map(t => (
        <button
          key={t.id}
          className={`wrap-type-card ${selected === t.id ? 'selected' : ''}`}
          onClick={() => onSelect(t.id)}
        >
          <div className="wrap-type-img-wrap">
            <img src={t.image} alt={t.name} className="wrap-type-img" />
            {selected === t.id && <div className="wrap-selected-overlay">✓</div>}
          </div>
          <div className="wrap-type-info">
            <span className="wrap-type-name">{t.name}</span>
            <span className="wrap-type-desc">{t.desc}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function CustomBuilderPage({ onAddToCart, onGoBack }) {
  const [quantities, setQuantities] = useState({});
  const [selectedPaper, setSelectedPaper] = useState('ivory-tissue');
  const [selectedType, setSelectedType] = useState('round-korean');
  const [note, setNote] = useState('');
  const [step, setStep] = useState(1);

  const handleQuantityChange = (flowerId, qty) => {
    setQuantities(prev => ({ ...prev, [flowerId]: qty }));
  };

  const totalStems = Object.values(quantities).reduce((s, q) => s + q, 0);
  const stemCost = FLOWERS.reduce((sum, f) => sum + (quantities[f.id] || 0) * f.priceEach, 0);
  const wrappingCost = 500;
  const total = stemCost + wrappingCost;

  const selectedFlowersText = FLOWERS
    .filter(f => (quantities[f.id] || 0) > 0)
    .map(f => `${quantities[f.id]}× ${f.name}`)
    .join(', ');

  const paperName = WRAPPING_PAPERS.find(p => p.id === selectedPaper)?.name || '';
  const typeName = WRAPPING_TYPES.find(t => t.id === selectedType)?.name || '';

  const handleAddToCart = () => {
    if (totalStems === 0) {
      alert('Please add at least one flower stem to your bouquet!');
      return;
    }
    const customProduct = {
      id: `custom-${Date.now()}`,
      isCustom: true,
      name: `Custom Bouquet (${totalStems} stems)`,
      description: `${selectedFlowersText} — ${paperName} paper, ${typeName} style`,
      price: total,
      image: '/bouquet1-blush.jpg',
    };
    onAddToCart(customProduct);
  };

  return (
    <div className="builder-page">
      {/* Page Header */}
      <div className="builder-header">
        <button className="back-btn" onClick={onGoBack}>← Back to Bouquets</button>
        <div className="builder-title-wrap">
          <span className="builder-badge">🎨 Custom Studio</span>
          <h1>Design Your <span className="text-gradient">Custom Bouquet</span></h1>
          <p>Pick your flowers stem-by-stem, choose your wrapping paper &amp; bouquet style — we'll craft it fresh for your date.</p>
        </div>
      </div>

      <div className="builder-layout">
        {/* ── Left: Steps ── */}
        <div className="builder-steps">

          {/* Step 1: Flowers */}
          <div className={`builder-step ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}>
            <div className="step-header" onClick={() => setStep(1)}>
              <span className="step-number">{step > 1 ? '✓' : '1'}</span>
              <div>
                <h2>Choose Your Flowers</h2>
                <p>Select how many stems of each flower type</p>
              </div>
            </div>
            {step === 1 && (
              <div className="step-content">
                <FlowerPicker flowers={FLOWERS} quantities={quantities} onChange={handleQuantityChange} />
                {totalStems > 0 && (
                  <div className="stems-summary">
                    🌸 {totalStems} stem{totalStems !== 1 ? 's' : ''} selected: {selectedFlowersText}
                  </div>
                )}
                <button
                  className="btn btn-primary step-next-btn"
                  onClick={() => setStep(2)}
                  disabled={totalStems === 0}
                >
                  Next: Choose Wrapping →
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Wrapping Paper + Type */}
          <div className={`builder-step ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>
            <div className="step-header" onClick={() => step > 1 && setStep(2)}>
              <span className="step-number">{step > 2 ? '✓' : '2'}</span>
              <div>
                <h2>Wrapping Paper &amp; Style</h2>
                <p>Pick the paper colour &amp; the bouquet wrapping style</p>
              </div>
            </div>
            {step === 2 && (
              <div className="step-content">

                {/* Sub-section A: Wrapping Paper */}
                <div className="wrapping-subsection">
                  <div className="wrapping-sub-label">
                    <span className="wsub-icon">🎁</span>
                    <div>
                      <strong>Wrapping Paper</strong>
                      <span>Choose the colour &amp; material</span>
                    </div>
                  </div>
                  <PaperSelector
                    papers={WRAPPING_PAPERS}
                    selected={selectedPaper}
                    onSelect={setSelectedPaper}
                  />
                </div>

                {/* Sub-section B: Wrapping Type */}
                <div className="wrapping-subsection" style={{ marginTop: '32px' }}>
                  <div className="wrapping-sub-label">
                    <span className="wsub-icon">💐</span>
                    <div>
                      <strong>Bouquet Style</strong>
                      <span>How your flowers are arranged &amp; wrapped</span>
                    </div>
                  </div>
                  <TypeSelector
                    types={WRAPPING_TYPES}
                    selected={selectedType}
                    onSelect={setSelectedType}
                  />
                </div>

                <button
                  className="btn btn-primary step-next-btn"
                  onClick={() => setStep(3)}
                >
                  Next: Add a Note →
                </button>
              </div>
            )}
          </div>

          {/* Step 3: Personal Note */}
          <div className={`builder-step ${step === 3 ? 'active' : ''}`}>
            <div className="step-header" onClick={() => step > 2 && setStep(3)}>
              <span className="step-number">3</span>
              <div>
                <h2>Personal Note</h2>
                <p>Optional message for the recipient (printed on card)</p>
              </div>
            </div>
            {step === 3 && (
              <div className="step-content">
                <textarea
                  className="note-textarea"
                  placeholder="e.g. Happy Birthday! With all my love..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={4}
                />
                <div className="voice-qr-notice">
                  <span>🎙️</span>
                  <p>A <strong>FREE Voice QR Tag</strong> will be included! Send your voice note to our WhatsApp after ordering to link it to your bouquet.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Live Summary ── */}
        <div className="builder-summary glass-card">
          <h3>Your Bouquet Summary</h3>

          <div className="summary-section">
            <h4>Flowers</h4>
            {totalStems === 0 ? (
              <p className="summary-empty">No flowers selected yet</p>
            ) : (
              FLOWERS.filter(f => (quantities[f.id] || 0) > 0).map(f => (
                <div key={f.id} className="summary-row">
                  <span>{f.emoji} {f.name} × {quantities[f.id]}</span>
                  <span>LKR {(quantities[f.id] * f.priceEach).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>

          <div className="summary-section">
            <h4>Wrapping</h4>
            <div className="summary-row">
              <span>📄 {paperName}</span>
              <span className="summary-small">paper</span>
            </div>
            <div className="summary-row">
              <span>💐 {typeName}</span>
              <span className="summary-small">style</span>
            </div>
            <div className="summary-row" style={{ marginTop: '4px' }}>
              <span>Wrapping total</span>
              <span>LKR {wrappingCost.toLocaleString()}</span>
            </div>
          </div>

          <div className="summary-section">
            <h4>Add-ons</h4>
            <div className="summary-row perk">
              <span>🎙️ Voice QR Tag</span>
              <span className="free-badge">FREE</span>
            </div>
            <div className="summary-row perk">
              <span>🎀 Signature Ribbon</span>
              <span className="free-badge">FREE</span>
            </div>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <span>LKR {total.toLocaleString()}</span>
          </div>

          <div className="summary-stems-count">
            {totalStems} flower stem{totalStems !== 1 ? 's' : ''}
          </div>

          <button
            className="btn btn-primary summary-add-btn"
            onClick={handleAddToCart}
            disabled={totalStems === 0}
          >
            🛒 Add Custom Bouquet to Pre-Order
          </button>

          <p className="summary-note">Handcrafted fresh on your chosen date</p>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="builder-mobile-bar">
        <div className="mobile-bar-info">
          <span className="mobile-bar-total">LKR {total.toLocaleString()}</span>
          <span className="mobile-bar-stems">{totalStems} stem{totalStems !== 1 ? 's' : ''}</span>
        </div>
        <button
          className="btn btn-primary mobile-bar-btn"
          onClick={handleAddToCart}
          disabled={totalStems === 0}
        >
          {totalStems === 0 ? 'Pick Flowers' : 'Pre-Order 🛒'}
        </button>
      </div>
    </div>
  );
}

export default CustomBuilderPage;
