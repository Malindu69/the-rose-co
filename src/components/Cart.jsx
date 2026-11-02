import React, { useState } from 'react';
import './Cart.css';

function Cart({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onCheckout }) {
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [includeVoiceNote, setIncludeVoiceNote] = useState(true);
  const [senderName, setSenderName] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 0 ? 500 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!deliveryDate || !deliveryTime) {
      alert("Please select a pre-order delivery date and time for your fresh flowers.");
      return;
    }
    onCheckout({ 
      items: cartItems, 
      total, 
      deliveryDate, 
      deliveryTime, 
      recipientName, 
      includeVoiceNote, 
      senderName 
    });
  };

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-modal glass-panel" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Your Pre-Order <span className="text-gradient">Cart</span></h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your pre-order cart is blooming empty!</p>
            <a href="#custom-builder" className="btn btn-primary" onClick={onClose}>
              🎨 Build a Custom Bouquet
            </a>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p className="cart-item-desc">{item.description}</p>
                    <span className="cart-item-price">LKR {item.price.toLocaleString()}</span>
                  </div>
                  <div className="cart-item-actions">
                    <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button className="remove-btn" onClick={() => onRemoveItem(item.id)}>🗑</button>
                </div>
              ))}
            </div>

            <form className="checkout-form" onSubmit={handleCheckout}>
              <h3>Pre-Order & Delivery Details</h3>
              
              <div className="form-group">
                <label>Pre-Order Delivery Date *</label>
                <input 
                  type="date" 
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>Preferred Delivery Time Slot *</label>
                <select 
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  required
                >
                  <option value="">Select a time slot</option>
                  <option value="morning">Morning (9:00 AM – 12:00 PM)</option>
                  <option value="afternoon">Afternoon (12:00 PM – 4:00 PM)</option>
                  <option value="evening">Evening (4:00 PM – 8:00 PM)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Recipient's Name (Optional)</label>
                <input 
                  type="text" 
                  placeholder="Enter recipient's name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>

              {/* Free Voice Note QR Tag Option */}
              <div className="voice-checkout-card">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={includeVoiceNote} 
                    onChange={(e) => setIncludeVoiceNote(e.target.checked)} 
                  />
                  <span>
                    <strong>🎙️ Include Free Voice Message QR Tag</strong>
                    <small>We attach an elegant QR tag to your bouquet ribbon.</small>
                  </span>
                </label>

                {includeVoiceNote && (
                  <div className="voice-extra-fields">
                    <input 
                      type="text" 
                      placeholder="Enter your name"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                    />
                    <small className="voice-instruction-hint">
                      💡 You can record & send your voice note via WhatsApp right after placing your order!
                    </small>
                  </div>
                )}
              </div>

              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>LKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Handcrafted Pre-Order Delivery</span>
                  <span>LKR {deliveryFee.toLocaleString()}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>LKR {total.toLocaleString()}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary checkout-btn">
                Confirm Pre-Order (LKR {total.toLocaleString()})
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
