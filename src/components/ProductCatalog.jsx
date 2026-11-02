import React, { useState } from 'react';
import './ProductCatalog.css';

function ProductCard({ product, onAddToCart, isBouquet = false }) {
  const [count, setCount] = useState(1);

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (count > 1) setCount(prev => prev - 1);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    setCount(prev => prev + 1);
  };

  const handleAdd = () => {
    onAddToCart(product, count);
  };

  return (
    <div className="product-card glass-card">
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" />
        {isBouquet && (
          <div className="card-preorder-badge">
            <span>🌸 Pre-Order</span>
          </div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {product.description && <p className="product-description">{product.description}</p>}
        
        {isBouquet && (
          <div className="bouquet-perks">
            <span className="perk-tag">🎙️ Free Voice QR Tag</span>
            <span className="perk-tag">🎀 Signature Wrap</span>
          </div>
        )}

        <div className="product-footer">
          <div className="product-price-box">
            <span className="product-price">LKR {product.price.toLocaleString()}</span>
            {!isBouquet && <span className="product-price-unit">/ stem</span>}
          </div>

          <div className="card-actions-row">
            <div className="card-qty-selector">
              <button 
                type="button" 
                className="card-qty-btn" 
                onClick={handleDecrement}
                disabled={count <= 1}
                aria-label="Decrease quantity"
              >−</button>
              <span className="card-qty-value">{count}</span>
              <button 
                type="button" 
                className="card-qty-btn" 
                onClick={handleIncrement}
                aria-label="Increase quantity"
              >+</button>
            </div>

            <button 
              className="btn btn-primary card-add-btn" 
              onClick={handleAdd}
            >
              🛒 Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCatalog({ onAddToCart, onGoToBuilder }) {

  // Our 4 curated bouquet types
  const bouquets = [
    {
      id: 201,
      name: "The Signature Blush",
      description: "Our #1 best-seller. Soft blush pink roses with white baby's breath & fresh eucalyptus. Pure elegance.",
      price: 4500,
      image: "/bouquet1-blush.jpg"
    },
    {
      id: 202,
      name: "The Grand Romance",
      description: "A showstopping 50+ deep red Ecuadorian roses wrapped in dramatic black matte paper with gold ribbon.",
      price: 8500,
      image: "/bouquet2-romance.jpg"
    },
    {
      id: 203,
      name: "Lavender Dreams",
      description: "Dreamy purple roses, white lisianthus & fragrant lavender in French frosted tissue wrapping.",
      price: 6000,
      image: "/bouquet3-lavender.jpg"
    },
    {
      id: 204,
      name: "Sunshine Morning",
      description: "Bright yellow roses & sunflowers with eucalyptus greenery wrapped in natural kraft paper.",
      price: 4000,
      image: "/bouquet4-sunshine.jpg"
    }
  ];

  const rawFlowers = [
    {
      id: 101,
      name: "Red Rose",
      description: "Fresh premium velvety long-stemmed red roses.",
      price: 250,
      image: "/flower-red-rose.jpg"
    },
    {
      id: 102,
      name: "Chrysanthemum",
      description: "Fresh, vibrant crisp chrysanthemum blooms.",
      price: 180,
      image: "/flower-chrysanthemum.jpg"
    },
    {
      id: 103,
      name: "Lily",
      description: "Elegant, fragrant oriental lilies.",
      price: 320,
      image: "/flower-lily.jpg"
    },
    {
      id: 104,
      name: "Orchid",
      description: "Exotic, long-lasting premium orchid stems.",
      price: 400,
      image: "/flower-orchid.jpg"
    },
    {
      id: 105,
      name: "Baby's Breath",
      description: "Delicate fluffy white cloud filler blooms.",
      price: 150,
      image: "/flower-babys-breath.jpg"
    }
  ];

  return (
    <section id="shop" className="catalog-section">
      <div className="container">
        
        {/* Section 1: Pre-Made Bouquets */}
        <div id="bouquets" className="catalog-category">
          <div className="catalog-header">
            <span className="category-tag">💐 Signature Collections</span>
            <h2>Browse <span className="text-gradient">Our Bouquets</span></h2>
            <p>Four signature curated bouquets, handcrafted fresh upon pre-order. Each comes with a complimentary Voice QR tag.</p>
          </div>

          <div className="product-grid bouquet-grid">
            {bouquets.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={onAddToCart}
                isBouquet={true}
              />
            ))}
          </div>

          {/* CTA to Custom Builder */}
          <div className="custom-cta-banner">
            <div className="custom-cta-content">
              <span className="custom-cta-icon">🎨</span>
              <div>
                <h3>Want something unique?</h3>
                <p>Design your own bouquet stem-by-stem, pick your wrapping & create something truly personal.</p>
              </div>
              <button className="btn btn-primary" onClick={onGoToBuilder}>
                Design Custom Bouquet →
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Single Stems (at bottom) */}
        <div id="stems" className="catalog-category stems-category">
          <div className="catalog-header">
            <span className="category-tag">🌿 Fresh Stems</span>
            <h2>Single <span className="text-gradient">Flowers & Loose Bunches</span></h2>
            <p>High-quality farm-fresh individual stems and loose bunches — perfect for a vase, DIY arranging, or a simple heartfelt gesture.</p>
          </div>
          <div className="product-grid">
            {rawFlowers.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={onAddToCart}
                isBouquet={false}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default ProductCatalog;
