import React, { useState } from 'react';
import { saveOrder, getSettings } from '../services/orderService';
import './Cart.css';

function Cart({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onClearCart }) {
  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [includeVoiceNote, setIncludeVoiceNote] = useState(true);
  const [senderName, setSenderName] = useState('');
  const [notes, setNotes] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 0 ? 500 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Please enter your name and phone/WhatsApp number so we can confirm your order.");
      return;
    }

    if (!deliveryAddress.trim()) {
      alert("Please enter a delivery address or city.");
      return;
    }

    if (!deliveryDate || !deliveryTime) {
      alert("Please select a pre-order delivery date and time slot for your fresh flowers.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        deliveryAddress: deliveryAddress.trim(),
        deliveryDate,
        deliveryTime,
        recipientName: recipientName.trim(),
        includeVoiceNote,
        senderName: senderName.trim(),
        notes: notes.trim(),
        items: cartItems,
        subtotal,
        deliveryFee,
        total
      };

      const placedOrder = await saveOrder(orderPayload);
      setCompletedOrder(placedOrder);
      if (onClearCart) onClearCart();
    } catch (err) {
      console.error('Order checkout error:', err);
      alert('There was a slight error placing your order. Please try again or WhatsApp us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setCompletedOrder(null);
    onClose();
  };

  // Build WhatsApp confirmation link
  const settings = getSettings();
  const cleanStorePhone = (settings.storePhone || '94770000000').replace(/[^0-9]/g, '');
  const waText = completedOrder 
    ? encodeURIComponent(
        `Hi The Rose Co.! 🌸 I just placed pre-order #${completedOrder.id} on your website for LKR ${completedOrder.total.toLocaleString()} on ${completedOrder.deliveryDate}.\n` +
        (completedOrder.includeVoiceNote ? `🎙️ Here is my voice note for the QR tag!` : '')
      )
    : '';
  const waLink = `https://wa.me/${cleanStorePhone}?text=${waText}`;

  return (
    <div className="cart-overlay" onClick={handleCloseModal}>
      <div className="cart-modal glass-panel" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h2>
            {completedOrder ? 'Order ' : 'Your Pre-Order '}
            <span className="text-gradient">{completedOrder ? 'Confirmed! 🎉' : 'Cart'}</span>
          </h2>
          <button className="close-btn" onClick={handleCloseModal}>&times;</button>
        </div>

        {/* 1. Success Screen after order is placed */}
        {completedOrder ? (
          <div className="order-success-view">
            <div className="success-icon-badge">💐</div>
            <h3>Thank You, {completedOrder.customerName}!</h3>
            <div className="order-id-tag">Order #{completedOrder.id}</div>
            
            <p className="success-desc">
              Your fresh flower pre-order has been received! Our florist will source the freshest blooms and handcraft your arrangement for <strong>{completedOrder.deliveryDate}</strong> ({completedOrder.deliveryTime} slot).
            </p>

            <div className="success-details-box glass-card">
              <div className="success-row">
                <span>Total Amount:</span>
                <strong>LKR {completedOrder.total.toLocaleString()}</strong>
              </div>
              <div className="success-row">
                <span>Delivery To:</span>
                <span>{completedOrder.deliveryAddress}</span>
              </div>
              {completedOrder.includeVoiceNote && (
                <div className="success-row voice-alert-row">
                  <span>🎙️ Voice Keepsake:</span>
                  <strong>Free QR Tag Included</strong>
                </div>
              )}
            </div>

            {completedOrder.includeVoiceNote && (
              <div className="voice-submission-notice">
                <span className="notice-icon">💡</span>
                <p>
                  <strong>Send your voice recording:</strong> Tap the button below to message our WhatsApp and send the audio note you want attached to the flowers!
                </p>
              </div>
            )}

            <div className="success-actions">
              <a 
                href={waLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary btn-block whatsapp-confirm-btn"
              >
                💬 Confirm / Chat on WhatsApp
              </a>
              <button className="btn btn-outline btn-block" onClick={handleCloseModal}>
                Continue Browsing
              </button>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          /* 2. Empty Cart */
          <div className="empty-cart">
            <p>Your pre-order cart is blooming empty!</p>
            <a href="#custom-builder" className="btn btn-primary" onClick={onClose}>
              🎨 Build a Custom Bouquet
            </a>
          </div>
        ) : (
          /* 3. Cart with items & checkout form */
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
              <h3>Pre-Order &amp; Delivery Details</h3>
              
              <div className="form-group">
                <label>Your Full Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Kasun Jayawardena"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone / WhatsApp Number *</label>
                <input 
                  type="tel" 
                  placeholder="e.g. 077 123 4567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
                <small className="field-hint">We will send delivery updates via WhatsApp</small>
              </div>

              <div className="form-group">
                <label>Delivery Address &amp; City *</label>
                <input 
                  type="text" 
                  placeholder="e.g. No 15, Station Road, Colombo 03"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address (Optional)</label>
                <input 
                  type="email" 
                  placeholder="To receive order confirmation receipt"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Pre-Order Date *</label>
                  <input 
                    type="date" 
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label>Preferred Time Slot *</label>
                  <select 
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    required
                  >
                    <option value="">Select time slot</option>
                    <option value="morning">Morning (9 AM – 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM – 4 PM)</option>
                    <option value="evening">Evening (4 PM – 8 PM)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Recipient's Name (If delivering as a surprise gift)</label>
                <input 
                  type="text" 
                  placeholder="Leave empty if receiving yourself"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Special Notes / Delivery Instructions</label>
                <input 
                  type="text" 
                  placeholder="e.g. Call before ringing bell, leave with security"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                      placeholder="Who is this voice note from? (e.g. Your Name)"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                    />
                    <small className="voice-instruction-hint">
                      💡 You can record &amp; send your voice note via WhatsApp right after placing your order!
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

              <button 
                type="submit" 
                className="btn btn-primary checkout-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? '🌸 Placing Your Pre-Order...' : `Confirm Pre-Order (LKR ${total.toLocaleString()})`}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
