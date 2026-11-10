import React, { useState, useEffect } from 'react';
import { 
  getOrders, 
  toggleOrderStatus, 
  deleteOrder, 
  getSettings, 
  updateSettings, 
  checkAdminAuth, 
  loginAdmin, 
  logoutAdmin,
  sendOrderNotificationEmail
} from '../services/orderService';
import { supabase } from '../services/supabaseClient';
import './AdminDashboard.css';

function AdminDashboard({ onExit }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Orders & filter
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('active'); // 'active' | 'done' | 'all'
  
  // Email settings
  const [emailInput, setEmailInput] = useState('');
  const [emailStatus, setEmailStatus] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    const authed = checkAdminAuth();
    setIsAuthenticated(authed);
    if (authed) {
      loadData();
    }
  }, []);

  // Set up Supabase Realtime subscription when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('flower_orders_live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'flower_orders' },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  const loadData = async () => {
    setIsLoading(true);
    const data = await getOrders();
    setOrders(data);
    setIsLoading(false);
    const settings = getSettings();
    setEmailInput(settings.notificationEmail || '');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const res = loginAdmin(password);
    if (res.success) {
      setIsAuthenticated(true);
      await loadData();
    } else {
      setLoginError(res.error || 'Incorrect password');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
  };

  const handleToggleStatus = async (orderId, currentStatus) => {
    const updated = await toggleOrderStatus(orderId, currentStatus);
    if (updated) setOrders(updated);
  };

  const handleDelete = async (orderId) => {
    if (window.confirm(`Delete order #${orderId}?`)) {
      const updated = await deleteOrder(orderId);
      if (updated) setOrders(updated);
    }
  };

  const handleSaveEmail = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      alert('Please enter an email address.');
      return;
    }
    updateSettings({ notificationEmail: emailInput.trim() });
    setEmailStatus('Email saved! Click "Send Test Email" to test.');
    setTimeout(() => setEmailStatus(''), 4000);
  };

  const handleSendTestEmail = async () => {
    if (!emailInput.trim()) {
      alert('Please enter your email first and click Save.');
      return;
    }
    setIsSendingTest(true);
    setEmailStatus('Sending test notification...');
    
    updateSettings({ notificationEmail: emailInput.trim() });

    const dummyOrder = {
      id: 'TEST-101',
      customerName: 'Test Customer',
      customerPhone: '+94 77 123 4567',
      deliveryAddress: 'Boarding Place / Test Delivery Road',
      deliveryDate: new Date().toISOString().split('T')[0],
      deliveryTime: 'Morning (9 AM - 12 PM)',
      includeVoiceNote: true,
      senderName: 'Sender Name',
      notes: 'This is a test notification to activate your email inbox.',
      items: [{ name: 'Sample Red Rose Bouquet', price: 4500, quantity: 1 }],
      total: 5000
    };

    const res = await sendOrderNotificationEmail(dummyOrder, emailInput.trim());
    setIsSendingTest(false);

    if (res.message && res.message.toLowerCase().includes('activation')) {
      setEmailStatus('⚠️ ACTION REQUIRED: FormSubmit sent an activation email to ' + emailInput + '! Open your Gmail inbox (or spam) and click the "Activate Form" button once. After that, all orders will land directly in your inbox!');
    } else if (res.success === "true" || res.success === true) {
      setEmailStatus('✅ Test email delivered successfully! Check your inbox.');
    } else {
      setEmailStatus('Result: ' + (res.message || 'Notification sent. Check your inbox & spam.'));
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') return order.status === 'active';
    if (filter === 'done') return order.status === 'done';
    return true;
  });

  const activeCount = orders.filter(o => o.status === 'active').length;
  const doneCount = orders.filter(o => o.status === 'done').length;

  // 1. Password Unlock Screen
  if (!isAuthenticated) {
    return (
      <div className="admin-simple-login">
        <div className="login-box glass-panel">
          <img src="/logo.png" alt="The Rose Co." className="login-logo" />
          <h2>Florist Admin Portal</h2>
          <p>Enter password to manage orders</p>

          <form onSubmit={handleLogin}>
            {loginError && <div className="login-err">{loginError}</div>}
            <input 
              type="password" 
              placeholder="Enter password (default: roseco2026)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
            <button type="submit" className="btn btn-primary btn-block">
              Unlock Dashboard 🌸
            </button>
          </form>

          <button onClick={onExit} className="btn-back">
            ← Return to Flower Shop
          </button>
        </div>
      </div>
    );
  }

  // 2. Simple Dashboard
  return (
    <div className="admin-simple-container">
      {/* Simple Header */}
      <header className="simple-header">
        <div className="simple-brand">
          <img src="/logo.png" alt="The Rose Co." className="simple-logo" />
          <h2>The Rose Co. <span className="simple-badge">Orders</span></h2>
        </div>
        <div className="simple-header-btns">
          <button onClick={loadData} className="btn-outline-sm" title="Reload from Supabase Cloud DB">
            {isLoading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
          <button onClick={onExit} className="btn-outline-sm">🌐 View Store</button>
          <button onClick={handleLogout} className="btn-logout-sm">🚪 Logout</button>
        </div>
      </header>

      <main className="simple-content">
        {/* Email Notification Setup Box */}
        <div className="email-setup-box glass-panel">
          <div className="email-box-header">
            <strong>📬 Where should order alert emails be sent?</strong>
            <p>Every time a customer places an order on your site, details will be emailed here.</p>
          </div>

          <form onSubmit={handleSaveEmail} className="email-setup-form">
            <input 
              type="email" 
              placeholder="Enter your email (e.g. yourshop@gmail.com)" 
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary btn-sm">💾 Save</button>
            <button 
              type="button" 
              onClick={handleSendTestEmail} 
              className="btn btn-outline btn-sm"
              disabled={isSendingTest}
            >
              {isSendingTest ? 'Sending...' : '✉️ Send Test Email'}
            </button>
          </form>

          {emailStatus && (
            <div className={`email-status-banner ${emailStatus.includes('ACTION REQUIRED') ? 'warning' : 'info'}`}>
              {emailStatus}
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="simple-filter-bar">
          <div className="filter-buttons">
            <button 
              className={`simple-filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              ⏳ Active Orders ({activeCount})
            </button>
            <button 
              className={`simple-filter-btn ${filter === 'done' ? 'active' : ''}`}
              onClick={() => setFilter('done')}
            >
              ✅ Completed ({doneCount})
            </button>
            <button 
              className={`simple-filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({orders.length})
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="orders-stack">
          {filteredOrders.length === 0 ? (
            <div className="no-orders glass-card">
              <span className="no-orders-emoji">🌸</span>
              <p>No {filter === 'active' ? 'active' : ''} orders found in Supabase.</p>
            </div>
          ) : (
            filteredOrders.map(order => {
              const cleanPhone = (order.customerPhone || '').replace(/[^0-9]/g, '');
              const waLink = `https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(order.customerName)}!%20This%20is%20The%20Rose%20Co.%20regarding%20your%20order%20%23${order.id}.`;

              return (
                <div key={order.id} className={`simple-order-card glass-card ${order.status === 'done' ? 'is-done' : 'is-active'}`}>
                  {/* Card Header */}
                  <div className="order-top">
                    <div>
                      <span className="order-num">#{order.id}</span>
                      <span className="order-time">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleToggleStatus(order.id, order.status)}
                      className={`status-toggle-btn ${order.status === 'done' ? 'done' : 'active'}`}
                    >
                      {order.status === 'done' ? '✅ Completed (Click to Reopen)' : '⏳ Active (Click when Done)'}
                    </button>
                  </div>

                  {/* Delivery Highlight */}
                  <div className="order-delivery-tag">
                    <strong>📅 Deliver on:</strong> {order.deliveryDate || 'ASAP'} ({order.deliveryTime})
                  </div>

                  {/* Customer Info */}
                  <div className="order-info-row">
                    <div>
                      <strong>Customer:</strong> {order.customerName}
                    </div>
                    <div className="phone-wrap">
                      <span>📞 {order.customerPhone}</span>
                      {cleanPhone && (
                        <a 
                          href={waLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="simple-wa-btn"
                        >
                          💬 WhatsApp
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="order-info-row">
                    <div><strong>📍 Address:</strong> {order.deliveryAddress}</div>
                  </div>

                  {/* Voice Note */}
                  {order.includeVoiceNote && (
                    <div className="order-voice-badge">
                      🎙️ <strong>Voice Keepsake Tag Requested!</strong> (From: {order.senderName || order.customerName})
                    </div>
                  )}

                  {/* Items & Total */}
                  <div className="order-items-box">
                    <ul className="items-list">
                      {order.items?.map((item, idx) => (
                        <li key={idx}>
                          <span>{item.quantity}x {item.name}</span>
                          <span>LKR {(item.price * item.quantity).toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="order-total-row">
                      <span>Total:</span>
                      <strong>LKR {order.total.toLocaleString()}</strong>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="order-note-text">
                      <em>Note: "{order.notes}"</em>
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="order-bottom-actions">
                    <button 
                      onClick={() => handleDelete(order.id)} 
                      className="btn-trash"
                      title="Delete order"
                    >
                      🗑️ Delete Order
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
