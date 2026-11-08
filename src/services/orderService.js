// Order Service for The Rose Co.
// Manages order persistence, admin authentication, settings, and email notifications

const STORAGE_KEY_ORDERS = 'the_rose_co_orders';
const STORAGE_KEY_SETTINGS = 'the_rose_co_settings';
const STORAGE_KEY_AUTH = 'the_rose_co_admin_auth';

// Default initial settings
const DEFAULT_SETTINGS = {
  notificationEmail: 'theroseco.orders@gmail.com', // User can update this anytime in Admin panel
  adminUsername: 'admin',
  adminPassword: 'roseco2026',
  storePhone: '+94770000000', // Owner's WhatsApp
};

// Seed sample orders if none exist, so admin dashboard has initial preview data
const INITIAL_SAMPLE_ORDERS = [
  {
    id: 'TRC-7821',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    customerName: 'Kavindi Perera',
    customerPhone: '+94 77 123 4567',
    customerEmail: 'kavindi.p@gmail.com',
    deliveryAddress: 'No. 42, Flower Road, Colombo 07',
    deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    deliveryTime: 'morning',
    recipientName: 'Amila Silva (Birthday Surprise)',
    includeVoiceNote: true,
    senderName: 'Kavindi',
    notes: 'Please call before arriving, deliver to apartment 3B.',
    items: [
      { id: 'bouquet-classic-red', name: 'Classic Crimson Romance', price: 6500, quantity: 1, image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80' },
      { id: 'stem-gypsophila', name: "Baby's Breath (Gypsophila)", price: 350, quantity: 2, image: '/stems/babys_breath.jpg' }
    ],
    subtotal: 7200,
    deliveryFee: 500,
    total: 7700,
    status: 'pending' // 'pending' | 'in_progress' | 'completed' | 'cancelled'
  },
  {
    id: 'TRC-7412',
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    customerName: 'Dhanushka Fernando',
    customerPhone: '+94 71 987 6543',
    customerEmail: 'dhanushka@outlook.com',
    deliveryAddress: '25/A, Galle Road, Mount Lavinia',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryTime: 'afternoon',
    recipientName: 'Dilani',
    includeVoiceNote: false,
    senderName: '',
    notes: 'Please wrap with Pink Matte paper if available.',
    items: [
      { id: 'bouquet-blush-whisper', name: 'Blush Velvet Whisper', price: 5800, quantity: 1, image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80' }
    ],
    subtotal: 5800,
    deliveryFee: 500,
    total: 6300,
    status: 'in_progress'
  }
];

export const getSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to read settings from localStorage', e);
    return DEFAULT_SETTINGS;
  }
};

export const updateSettings = (newSettings) => {
  try {
    const current = getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to update settings', e);
    return null;
  }
};

export const getOrders = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(INITIAL_SAMPLE_ORDERS));
      return INITIAL_SAMPLE_ORDERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load orders', e);
    return INITIAL_SAMPLE_ORDERS;
  }
};

export const saveOrder = async (orderData) => {
  const settings = getSettings();
  const orderId = `TRC-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder = {
    id: orderId,
    createdAt: new Date().toISOString(),
    status: 'pending',
    customerName: orderData.customerName || 'Anonymous Customer',
    customerPhone: orderData.customerPhone || 'Not provided',
    customerEmail: orderData.customerEmail || '',
    deliveryAddress: orderData.deliveryAddress || 'Pick-up / Not provided',
    deliveryDate: orderData.deliveryDate || '',
    deliveryTime: orderData.deliveryTime || '',
    recipientName: orderData.recipientName || '',
    includeVoiceNote: !!orderData.includeVoiceNote,
    senderName: orderData.senderName || '',
    notes: orderData.notes || '',
    items: orderData.items || [],
    subtotal: orderData.subtotal || 0,
    deliveryFee: orderData.deliveryFee || 0,
    total: orderData.total || 0
  };

  // 1. Save locally
  try {
    const existing = getOrders();
    const updated = [newOrder, ...existing];
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save order locally', e);
  }

  // 2. Dispatch Email notification via FormSubmit
  if (settings.notificationEmail) {
    try {
      await sendOrderNotificationEmail(newOrder, settings.notificationEmail);
    } catch (err) {
      console.warn('Email dispatch warning (order still saved locally):', err);
    }
  }

  return newOrder;
};

export const updateOrderStatus = (orderId, newStatus) => {
  try {
    const orders = getOrders();
    const updated = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
    );
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to update order status', e);
    return null;
  }
};

export const deleteOrder = (orderId) => {
  try {
    const orders = getOrders();
    const updated = orders.filter(order => order.id !== orderId);
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete order', e);
    return null;
  }
};

// Send real email notification using FormSubmit AJAX API
export const sendOrderNotificationEmail = async (order, targetEmail) => {
  const itemsText = order.items
    .map(i => `• ${i.quantity}x ${i.name} - LKR ${(i.price * i.quantity).toLocaleString()}`)
    .join('\n');

  const payload = {
    _subject: `🌹 [NEW PRE-ORDER] #${order.id} - ${order.customerName} (LKR ${order.total.toLocaleString()})`,
    _template: 'table',
    _captcha: 'false',
    'Order ID': order.id,
    'Customer Name': order.customerName,
    'Customer Phone (WhatsApp)': order.customerPhone,
    'Customer Email': order.customerEmail || 'None provided',
    'Delivery Address': order.deliveryAddress,
    'Pre-Order Delivery Date': order.deliveryDate,
    'Delivery Time Slot': order.deliveryTime,
    'Recipient Name': order.recipientName || '(Same as customer)',
    'Voice QR Keepsake Tag': order.includeVoiceNote 
      ? `YES - From: ${order.senderName || order.customerName} (Ask customer for voice audio on WhatsApp)` 
      : 'NO',
    'Special Instructions': order.notes || 'None',
    'Items Ordered': itemsText,
    'Subtotal': `LKR ${order.subtotal.toLocaleString()}`,
    'Delivery Fee': `LKR ${order.deliveryFee.toLocaleString()}`,
    'Grand Total': `LKR ${order.total.toLocaleString()}`,
    'Ordered At': new Date(order.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Colombo' })
  };

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail.trim())}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.warn('FormSubmit email send attempt failed:', error);
    // Don't throw so user checkout continues smoothly
    return { success: false, error: error.message };
  }
};

// Authentication state helpers
export const checkAdminAuth = () => {
  try {
    return localStorage.getItem(STORAGE_KEY_AUTH) === 'authenticated';
  } catch (e) {
    return false;
  }
};

export const loginAdmin = (username, password) => {
  const settings = getSettings();
  if (
    username.trim().toLowerCase() === settings.adminUsername.toLowerCase() &&
    password === settings.adminPassword
  ) {
    localStorage.setItem(STORAGE_KEY_AUTH, 'authenticated');
    return { success: true };
  }
  return { success: false, error: 'Invalid username or password' };
};

export const logoutAdmin = () => {
  try {
    localStorage.removeItem(STORAGE_KEY_AUTH);
  } catch (e) {
    // ignore
  }
};
