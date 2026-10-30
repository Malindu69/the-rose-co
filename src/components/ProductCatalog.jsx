import React from 'react';
import './ProductCatalog.css';

function ProductCard({ product, onAddToCart, isBouquet = false }) {
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
          <span className="product-price">LKR {product.price.toLocaleString()}</span>
          <button 
            className="btn btn-primary" 
            onClick={() => onAddToCart(product)}
          >
            {isBouquet ? '🛒 Pre-Order' : 'Add to Cart'}
          </button>
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
      name: "Red Long-Stem Roses",
      description: "Fresh premium long-stemmed roses (per dozen).",
      price: 2400,
      image: "https://images.unsplash.com/photo-1548817292-f045dce7ebc1?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 102,
      name: "Pink Peonies Bunch",
      description: "Fresh large-bloom pink peonies (bunch of 5).",
      price: 1800,
      image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 103,
      name: "Golden Sunflowers",
      description: "Bright cheerful sunflowers (half-dozen stems).",
      price: 1200,
      image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 104,
      name: "Dutch Spring Tulips",
      description: "Vibrant assorted spring tulips (bunch of 15).",
      price: 1500,
      image: "https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 105,
      name: "White Oriental Lilies",
      description: "Fragrant pure white lilies (bunch of 5 stems).",
      price: 2000,
      image: "https://images.unsplash.com/photo-1508784411316-02b8cd4d3a3a?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 106,
      name: "Exotic Orchid Stems",
      description: "Long-lasting Phalaenopsis orchid stems (per stem).",
      price: 800,
      image: "https://images.unsplash.com/photo-1508604925763-7c8ee4bc9129?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 107,
      name: "Voluminous Hydrangeas",
      description: "Cloud-like blue & pink hydrangeas (per stem).",
      price: 600,
      image: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 108,
      name: "Baby's Breath Bunch",
      description: "Fluffy white filler flowers, beautiful on their own.",
      price: 500,
      image: "https://images.unsplash.com/photo-1613589998816-53aeb1a64f4f?auto=format&fit=crop&w=600&q=80"
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
