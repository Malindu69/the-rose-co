import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCatalog from './components/ProductCatalog';
import CustomBuilderPage from './components/CustomBuilderPage';
import VoiceGiftBanner from './components/VoiceGiftBanner';
import Cart from './components/Cart';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Secret routing: check for /admin or #admin
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path === '/admin' || hash === '#admin') return 'admin';
    if (path === '/builder' || hash === '#builder') return 'builder';
    return 'home';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#admin') {
        setCurrentPage('admin');
      } else if (path === '/builder' || hash === '#builder') {
        setCurrentPage('builder');
      } else {
        setCurrentPage('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const handleAddToCart = (product, quantityToAdd = null) => {
    const qty = quantityToAdd || product.quantity || 1;
    setCartItems(prev => {
      if (product.isCustom) {
        return [...prev, { ...product, quantity: qty }];
      }
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(id);
      return;
    }
    setCartItems(prev => 
      prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item)
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navigateTo = (page) => {
    setCurrentPage(page);
    if (page === 'admin') {
      window.history.pushState(null, '', '/admin');
    } else if (page === 'builder') {
      window.history.pushState(null, '', '/builder');
    } else {
      window.history.pushState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Secret Admin Panel View (No public buttons/links lead here)
  if (currentPage === 'admin') {
    return <AdminDashboard onExit={() => navigateTo('home')} />;
  }

  // 2. Normal Public Customer View
  return (
    <div className="bg-gradient-mesh min-h-screen">
      <Header 
        cartCount={totalItems} 
        onCartClick={() => setIsCartOpen(true)}
        onNavigate={navigateTo}
        currentPage={currentPage}
      />
      
      <main>
        {currentPage === 'home' && (
          <>
            <Hero onGoToBuilder={() => navigateTo('builder')} />
            <ProductCatalog 
              onAddToCart={handleAddToCart} 
              onGoToBuilder={() => navigateTo('builder')}
            />
            <VoiceGiftBanner onGoToBuilder={() => navigateTo('builder')} />
          </>
        )}

        {currentPage === 'builder' && (
          <CustomBuilderPage 
            onAddToCart={handleAddToCart}
            onGoBack={() => navigateTo('home')}
          />
        )}
      </main>

      {currentPage === 'home' && (
        <footer className="footer-section">
          <div className="container footer-container">
            <div className="footer-brand">
              <img src="/logo.png" alt="The Rose Co." className="footer-logo-img" />
              <p>Bespoke custom flower bouquets, curated pre-orders &amp; free voice keepsake gifts.</p>
            </div>
            <div className="footer-links">
              <a href="#bouquets">Browse Bouquets</a>
              <a onClick={() => navigateTo('builder')} style={{cursor:'pointer'}}>Custom Builder</a>
              <a href="#stems">Single Stems</a>
              <a href="#voice-experience">Voice QR 🎵</a>
            </div>
            <div className="footer-copy">
              <p>© {new Date().getFullYear()} The Rose Co. All rights reserved. Handcrafted with love. 💐</p>
            </div>
          </div>
        </footer>
      )}

      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </div>
  );
}

export default App;
