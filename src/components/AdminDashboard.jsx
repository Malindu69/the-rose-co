import React, { useState, useEffect } from 'react';
import { 
  getOrders, 
  updateOrderStatus, 
  deleteOrder, 
  getSettings, 
  updateSettings, 
  checkAdminAuth, 
  loginAdmin, 
  logoutAdmin,
  sendOrderNotificationEmail
} from '../services/orderService';
import './AdminDashboard.css';

function AdminDashboard({ onExit }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard state
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'settings' | 'new-order'
  
  // Settings state
  const [settings, setSettingsState] = useState(getSettings());
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');
  const [testEmailStatus, setTestEmailStatus] = useState('');

  // Manual order form state
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [manualCustomerPhone, setManualCustomerPhone] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('morning');
  const [manualItemDesc, setManualItemDesc] = useState('');
  const [manualTotal, setManualTotal] = useState('');

  useEffect(() => {
    const authed = checkAdminAuth();
    setIsAuthenticated(authed);
    if (authed) {
      loadData();
    }
  }, []);

  const loadData = () => {
    setOrders(getOrders());
    setSettingsState(getSettings());
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const res = loginAdmin(username, password);
    if (res.success) {
      setIsAuthenticated(true);
      loadData();
    } else {
      setLoginError(res.error || 'Invalid credentials');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
  };

  const handleStatusChange = (orderId, newStatus) => {
    const updated = updateOrderStatus(orderId, newStatus);
    if (updated) {
      setOrders(updated);
    }
  };

  const handleDelete = (orderId) => {
    if (window.confirm(`Are you sure you want to permanently delete order #${orderId}?`)) {
      const updated = deleteOrder(orderId);
      if (updated) {
        setOrders(updated);
      }
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const updated = updateSettings(settings);
    if (updated) {
      setSettingsState(updated);
      setSettingsSavedMsg('Settings saved successfully! ✅');
      setTimeout(() => setSettingsSavedMsg(''), 4000);
    }
  };

  const handleSendTestEmail = async () => {
    if (!settings.notificationEmail) {
      alert('Please enter an email address first.');
      return;
    }
    setTestEmailStatus('Sending test notification...');
    const dummyOrder = {
      id: 'TRC-TEST',
      createdAt: new Date().toISOString(),
      customerName: 'Test Customer',
      customerPhone: '+94 77 000 0000',
      customerEmail: settings.notificationEmail,
      deliveryAddress: 'Boarding Place / Test Delivery Road',
      deliveryDate: new Date().toISOString().split('T')[0],
      deliveryTime: 'morning (9AM-12PM)',
      recipientName: 'The Rose Co. Admin',
      includeVoiceNote: true,
      senderName: 'Antigravity Tester',
      notes: 'This is a test notification to verify your email inbox configuration.',
      items: [{ id: 'test-item', name: 'Sample Red Rose Bouquet', price: 4500, quantity: 1 }],
      subtotal: 4500,
      deliveryFee: 500,
      total: 5000
    };

    try {
      await sendOrderNotificationEmail(dummyOrder, settings.notificationEmail);
      setTestEmailStatus('Test email sent! Please check your inbox (and spam folder). Look for an activation link from FormSubmit if this is the first time.');
    } catch (err) {
      setTestEmailStatus('Error sending email: ' + err.message);
    }
  };

  const handleCreateManualOrder = (e) => {
    e.preventDefault();
    if (!manualCustomerName || !manualTotal) {
      alert('Please fill out customer name and total.');
      return;
    }
    const orderId = `TRC-M${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customerName: manualCustomerName,
      customerPhone: manualCustomerPhone || 'Not provided',
      customerEmail: '',
      deliveryAddress: manualAddress || 'Pick-up',
      deliveryDate: manualDate || new Date().toISOString().split('T')[0],
      deliveryTime: manualTime,
      recipientName: '',
      includeVoiceNote: false,
      senderName: '',
      notes: 'Manually logged from WhatsApp / Call',
      items: [
        {
          id: 'manual-item',
          name: manualItemDesc || 'Custom Bouquet / Flowers',
          price: parseInt(manualTotal, 10),
          quantity: 1,
          image: '/stems/red_rose.jpg'
        }
      ],
      subtotal: parseInt(manualTotal, 10),
      deliveryFee: 0,
      total: parseInt(manualTotal, 10),
      status: 'pending'
    };

    const existing = getOrders();
    const updated = [newOrder, ...existing];
    localStorage.setItem('the_rose_co_orders', JSON.stringify(updated));
    setOrders(updated);
    
    // Reset form
    setManualCustomerName('');
    setManualCustomerPhone('');
    setManualAddress('');
    setManualItemDesc('');
    setManualTotal('');
    setActiveTab('orders');
    alert(`Order #${orderId} created successfully!`);
  };

  const filteredOrders = orders.filter(order => {
    // Filter status
    if (filterStatus !== 'all' && order.status !== filterStatus) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchName = (order.customerName || '').toLowerCase().includes(q);
      const matchPhone = (order.customerPhone || '').toLowerCase().includes(q);
      const matchAddress = (order.deliveryAddress || '').toLowerCase().includes(q);
      return matchId || matchName || matchPhone || matchAddress;
    }
    return true;
  });

  // Calculate metrics
  const totalCount = orders.length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const inProgressCount = orders.filter(o => o.status === 'in_progress').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;
  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // 1. Render Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card glass-panel">
          <div className="admin-login-header">
            <span className="admin-badge-lock">🔒 Restricted Staff Portal</span>
            <img src="/logo.png" alt="The Rose Co." className="admin-login-logo" />
            <h2>The Rose Co. Management</h2>
            <p>Enter administrative credentials to access order management &amp; store controls.</p>
          </div>

          <form onSubmit={handleLogin} className="admin-login-form">
            {loginError && <div className="admin-alert-error">{loginError}</div>}
            
            <div className="form-group">
              <label>Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Enter username" 
                required 
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter password" 
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Unlock Admin Portal 🌸
            </button>
          </form>

          <div className="admin-login-footer">
            <small>Default credentials: <code>admin</code> / <code>roseco2026</code></small>
            <br />
            <button onClick={onExit} className="btn-link">← Return to Public Website</button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Render Main Admin Dashboard
  return (
    <div className="admin-dashboard-container">
      {/* Top Navbar */}
      <header className="admin-navbar glass-panel">
        <div className="admin-nav-brand">
          <img src="/logo.png" alt="The Rose Co." className="admin-nav-logo" />
          <div>
            <h3>The Rose Co. <span className="staff-pill">Staff Dashboard</span></h3>
            <span className="admin-status-indicator">🟢 Live Order Monitoring Active</span>
          </div>
        </div>

        <div className="admin-nav-actions">
          <button 
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📋 Orders ({pendingCount + inProgressCount} Active)
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'new-order' ? 'active' : ''}`}
            onClick={() => setActiveTab('new-order')}
          >
            ➕ Manual Order
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Email &amp; Settings
          </button>
          <button className="admin-nav-link-btn" onClick={onExit} title="Go to customer site">
            🌐 View Site
          </button>
          <button className="admin-nav-logout-btn" onClick={handleLogout} title="Log out">
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="admin-main container">

        {/* Tab 1: Orders Dashboard */}
        {activeTab === 'orders' && (
          <>
            {/* KPI Metrics */}
            <div className="admin-kpi-grid">
              <div className="kpi-card pending-kpi glass-card">
                <div className="kpi-icon">⏳</div>
                <div className="kpi-info">
                  <h4>{pendingCount}</h4>
                  <span>New Orders Pending</span>
                </div>
              </div>

              <div className="kpi-card progress-kpi glass-card">
                <div className="kpi-icon">🌸</div>
                <div className="kpi-info">
                  <h4>{inProgressCount}</h4>
                  <span>Arranging &amp; Delivery</span>
                </div>
              </div>

              <div className="kpi-card completed-kpi glass-card">
                <div className="kpi-icon">✅</div>
                <div className="kpi-info">
                  <h4>{completedCount}</h4>
                  <span>Completed Orders</span>
                </div>
              </div>

              <div className="kpi-card revenue-kpi glass-card">
                <div className="kpi-icon">💰</div>
                <div className="kpi-info">
                  <h4>LKR {totalRevenue.toLocaleString()}</h4>
                  <span>Completed Revenue</span>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="admin-controls-bar glass-panel">
              <div className="admin-search-box">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search customer name, phone, address, or #TRC-..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="clear-search" onClick={() => setSearchQuery('')}>✕</button>
                )}
              </div>

              <div className="admin-status-filters">
                <button 
                  className={`filter-chip ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('all')}
                >
                  All ({totalCount})
                </button>
                <button 
                  className={`filter-chip chip-pending ${filterStatus === 'pending' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('pending')}
                >
                  ⏳ Pending ({pendingCount})
                </button>
                <button 
                  className={`filter-chip chip-progress ${filterStatus === 'in_progress' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('in_progress')}
                >
                  🌸 In Progress ({inProgressCount})
                </button>
                <button 
                  className={`filter-chip chip-completed ${filterStatus === 'completed' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('completed')}
                >
                  ✅ Completed ({completedCount})
                </button>
                <button 
                  className={`filter-chip chip-cancelled ${filterStatus === 'cancelled' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('cancelled')}
                >
                  ❌ Cancelled
                </button>
              </div>
            </div>

            {/* Orders Feed */}
            <div className="admin-orders-list">
              {filteredOrders.length === 0 ? (
                <div className="admin-empty-state glass-card">
                  <span className="empty-emoji">🌷</span>
                  <h3>No orders found</h3>
                  <p>No orders match your filter criteria or search query.</p>
                </div>
              ) : (
                filteredOrders.map(order => {
                  const cleanPhone = (order.customerPhone || '').replace(/[^0-9+]/g, '');
                  const waLink = `https://wa.me/${cleanPhone.replace('+', '')}?text=Hi%20${encodeURIComponent(order.customerName)}!%20This%20is%20The%20Rose%20Co.%20regarding%20your%20order%20%23${order.id}.`;

                  return (
                    <div key={order.id} className={`admin-order-card glass-card status-border-${order.status}`}>
                      <div className="order-card-header">
                        <div className="order-id-group">
                          <span className="order-id-badge">#{order.id}</span>
                          <span className="order-time-placed">
                            Placed: {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="order-header-right">
                          <span className={`status-pill status-${order.status}`}>
                            {order.status === 'pending' && '⏳ New Pre-Order'}
                            {order.status === 'in_progress' && '🌸 Arranging / Delivering'}
                            {order.status === 'completed' && '✅ Completed & Delivered'}
                            {order.status === 'cancelled' && '❌ Cancelled'}
                          </span>
                        </div>
                      </div>

                      {/* Delivery Highlight Banner */}
                      <div className="order-delivery-banner">
                        <div className="delivery-timing">
                          <strong>📅 Pre-Order Delivery:</strong> {order.deliveryDate || 'Date not set'} 
                          <span className="time-slot-badge">⏰ {order.deliveryTime ? order.deliveryTime.toUpperCase() : 'FLEXIBLE'}</span>
                        </div>
                        {order.includeVoiceNote && (
                          <div className="voice-tag-alert">
                            🎙️ <strong>Voice QR Keepsake Tag Requested!</strong> (From: {order.senderName || order.customerName})
                          </div>
                        )}
                      </div>

                      {/* Customer & Delivery Details Grid */}
                      <div className="order-details-grid">
                        <div className="detail-col">
                          <h5>Customer Details</h5>
                          <p className="detail-name"><strong>{order.customerName}</strong></p>
                          <p className="detail-phone">
                            📞 {order.customerPhone} 
                            {cleanPhone && (
                              <a 
                                href={waLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="whatsapp-action-btn"
                                title="Chat on WhatsApp"
                              >
                                💬 WhatsApp Customer
                              </a>
                            )}
                          </p>
                          {order.customerEmail && (
                            <p className="detail-email">✉️ {order.customerEmail}</p>
                          )}
                        </div>

                        <div className="detail-col">
                          <h5>Delivery Address</h5>
                          <p className="detail-address">📍 {order.deliveryAddress}</p>
                          {order.recipientName && (
                            <p className="detail-recipient">
                              🎁 <strong>Recipient:</strong> {order.recipientName}
                            </p>
                          )}
                          {order.notes && (
                            <p className="detail-notes">
                              📝 <em>Note: "{order.notes}"</em>
                            </p>
                          )}
                        </div>

                        <div className="detail-col order-items-summary">
                          <h5>Items Ordered ({order.items?.length || 0})</h5>
                          <ul className="admin-items-list">
                            {order.items?.map((item, idx) => (
                              <li key={idx} className="admin-item-row">
                                <span className="item-qty-badge">{item.quantity}x</span>
                                <span className="item-name-text">{item.name}</span>
                                <span className="item-price-sub">LKR {(item.price * item.quantity).toLocaleString()}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="admin-price-breakdown">
                            <div className="pb-row">
                              <span>Delivery Fee:</span>
                              <span>LKR {(order.deliveryFee || 500).toLocaleString()}</span>
                            </div>
                            <div className="pb-row grand-total">
                              <span>Grand Total:</span>
                              <strong>LKR {order.total.toLocaleString()}</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Management Action Bar */}
                      <div className="order-actions-bar">
                        <div className="status-buttons-group">
                          {order.status !== 'in_progress' && (
                            <button 
                              className="action-btn btn-progress"
                              onClick={() => handleStatusChange(order.id, 'in_progress')}
                            >
                              🌸 Mark In Progress
                            </button>
                          )}

                          {order.status !== 'completed' && (
                            <button 
                              className="action-btn btn-complete"
                              onClick={() => handleStatusChange(order.id, 'completed')}
                            >
                              ✅ Mark Completed
                            </button>
                          )}

                          {order.status !== 'pending' && (
                            <button 
                              className="action-btn btn-reopen"
                              onClick={() => handleStatusChange(order.id, 'pending')}
                            >
                              ⏳ Revert to Pending
                            </button>
                          )}

                          {order.status !== 'cancelled' && (
                            <button 
                              className="action-btn btn-cancel"
                              onClick={() => handleStatusChange(order.id, 'cancelled')}
                            >
                              ❌ Cancel Order
                            </button>
                          )}
                        </div>

                        <button 
                          className="action-btn btn-delete"
                          onClick={() => handleDelete(order.id)}
                          title="Delete from list"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Tab 2: Manual Order Creation */}
        {activeTab === 'new-order' && (
          <div className="admin-form-card glass-panel">
            <div className="form-card-header">
              <h3>➕ Log Manual / WhatsApp Order</h3>
              <p>Received an order over phone call or WhatsApp message? Log it here to track on your dashboard.</p>
            </div>

            <form onSubmit={handleCreateManualOrder} className="manual-order-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name *</label>
                  <input 
                    type="text" 
                    value={manualCustomerName}
                    onChange={(e) => setManualCustomerName(e.target.value)}
                    placeholder="e.g. Kasun Jayawardena"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Customer Phone / WhatsApp</label>
                  <input 
                    type="text" 
                    value={manualCustomerPhone}
                    onChange={(e) => setManualCustomerPhone(e.target.value)}
                    placeholder="e.g. +94 77 123 4567"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Delivery Address</label>
                  <input 
                    type="text" 
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="Delivery address or Boarding pickup"
                  />
                </div>
                <div className="form-group">
                  <label>Delivery Date</label>
                  <input 
                    type="date" 
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Time Slot</label>
                  <select value={manualTime} onChange={(e) => setManualTime(e.target.value)}>
                    <option value="morning">Morning (9am - 12pm)</option>
                    <option value="afternoon">Afternoon (12pm - 4pm)</option>
                    <option value="evening">Evening (4pm - 8pm)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Bouquet / Item Description</label>
                  <input 
                    type="text" 
                    value={manualItemDesc}
                    onChange={(e) => setManualItemDesc(e.target.value)}
                    placeholder="e.g. 10x Red Roses with Matte Black wrapping + Ribbon"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Total Price (LKR) *</label>
                  <input 
                    type="number" 
                    value={manualTotal}
                    onChange={(e) => setManualTotal(e.target.value)}
                    placeholder="e.g. 4500"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                ➕ Add Order to Dashboard
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Settings & Email Config */}
        {activeTab === 'settings' && (
          <div className="admin-form-card glass-panel">
            <div className="form-card-header">
              <h3>⚙️ Store &amp; Notification Settings</h3>
              <p>Configure which email receives real-time pre-order alerts and change your admin credentials.</p>
            </div>

            {settingsSavedMsg && (
              <div className="settings-saved-banner">{settingsSavedMsg}</div>
            )}

            <form onSubmit={handleSaveSettings} className="settings-form">
              <div className="settings-section">
                <h4>📧 Order Notification Email</h4>
                <p className="setting-description">
                  Whenever a customer completes a pre-order on the site, an email alert with all customer details, items, delivery time, and voice note choice will be sent here immediately.
                </p>

                <div className="form-group">
                  <label>Your Notification Email Address *</label>
                  <input 
                    type="email" 
                    value={settings.notificationEmail}
                    onChange={(e) => setSettingsState({ ...settings, notificationEmail: e.target.value })}
                    placeholder="e.g. yourname@gmail.com"
                    required
                  />
                  <small className="form-hint">
                    💡 <em>Note:</em> The first time an order is sent, FormSubmit will send a one-time activation link to this inbox. Click that link once to authorize deliveries!
                  </small>
                </div>

                <div className="test-email-actions">
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm"
                    onClick={handleSendTestEmail}
                  >
                    ✉️ Send Test Notification to this Email
                  </button>
                  {testEmailStatus && (
                    <div className="test-status-msg">{testEmailStatus}</div>
                  )}
                </div>
              </div>

              <div className="settings-section">
                <h4>🔒 Admin Portal Credentials</h4>
                <p className="setting-description">Change the login username or password used to access this secret admin portal.</p>

                <div className="form-row">
                  <div className="form-group">
                    <label>Admin Username</label>
                    <input 
                      type="text" 
                      value={settings.adminUsername}
                      onChange={(e) => setSettingsState({ ...settings, adminUsername: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Admin Password</label>
                    <input 
                      type="text" 
                      value={settings.adminPassword}
                      onChange={(e) => setSettingsState({ ...settings, adminPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h4>💬 Business WhatsApp Contact</h4>
                <div className="form-group">
                  <label>Store WhatsApp Phone Number (with country code)</label>
                  <input 
                    type="text" 
                    value={settings.storePhone}
                    onChange={(e) => setSettingsState({ ...settings, storePhone: e.target.value })}
                    placeholder="e.g. +94771234567"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                💾 Save All Settings
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;
