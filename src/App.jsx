import React, { useState, useEffect } from 'react';
import AnnouncementBar from './components/AnnouncementBar';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCatalog from './components/ProductCatalog';
import CustomBuilderPage from './components/CustomBuilderPage';
import VoiceGiftBanner from './components/VoiceGiftBanner';
import Cart from './components/Cart';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    return window.location.pathname === '/builder' || window.location.hash === '#builder' ? 'builder' : 'home';
  });

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/builder' || window.location.hash === '#builder') {
        setCurrentPage('builder');
      } else {
        setCurrentPage('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleAddToCart = (product) => {
    setCartItems(prev => {
      if (product.isCustom) {
        return [...prev, { ...product, quantity: 1 }];
      }
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
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

  const handleCheckout = (orderData) => {
    const voiceMsg = orderData.includeVoiceNote 
      ? `\nVoice QR Keepsake: Yes (From: ${orderData.senderName || 'Anonymous'})\n*Send your voice note to our WhatsApp to link it!*`
      : '';

    alert(
      `💐 Thank you for your Pre-Order with The Rose Co.!\n\n` +
      `Total: LKR ${orderData.total.toLocaleString()}\n` +
      `Delivery Date: ${orderData.deliveryDate}\n` +
      `Time Slot: ${orderData.deliveryTime}\n` +
      `Recipient: ${orderData.recipientName || 'Not specified'}` +
      voiceMsg +
      `\n\nOur florist team will handcraft your bouquet fresh!`
    );
    setCartItems([]);
    setIsCartOpen(false);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navigateTo = (page) => {
    setCurrentPage(page);
    if (page === 'builder') {
      window.history.pushState(null, '', '/builder');
    } else {
      window.history.pushState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-gradient-mesh min-h-screen">
      <AnnouncementBar />
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
        onCheckout={handleCheckout}
      />
    </div>
  );
}

export default App;
