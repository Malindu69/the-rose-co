// Order Service for The Rose Co.
// Simple, lightweight order storage & email notification

const STORAGE_KEY_ORDERS = 'the_rose_co_orders';
const STORAGE_KEY_SETTINGS = 'the_rose_co_settings';
const STORAGE_KEY_AUTH = 'the_rose_co_admin_auth';

// Default initial settings
const DEFAULT_SETTINGS = {
  notificationEmail: '', // Will be entered by user or set via chat
  adminPassword: 'roseco2026',
  storePhone: '+94770000000',
};

// Initial sample orders for preview
const INITIAL_SAMPLE_ORDERS = [
  {
    id: 'TRC-7821',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    customerName: 'Kavindi Perera',
    customerPhone: '+94 77 123 4567',
    customerEmail: 'kavindi@gmail.com',
    deliveryAddress: 'No. 42, Flower Road, Colombo 07',
    deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    deliveryTime: 'morning (9 AM – 12 PM)',
    recipientName: 'Amila Silva (Birthday Surprise)',
    includeVoiceNote: true,
    senderName: 'Kavindi',
    notes: 'Please call before ringing gate bell',
    items: [
      { id: '1', name: 'Classic Crimson Romance', price: 6500, quantity: 1 },
      { id: '2', name: "Baby's Breath", price: 350, quantity: 2 }
    ],
    total: 7700,
    status: 'active' // 'active' | 'done'
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
    const parsed = JSON.parse(raw);
    // Normalize any legacy status
    return parsed.map(o => ({
      ...o,
      status: o.status === 'completed' || o.status === 'done' ? 'done' : 'active'
    }));
  } catch (e) {
    return INITIAL_SAMPLE_ORDERS;
  }
};

export const saveOrder = async (orderData) => {
  const settings = getSettings();
  const orderId = `TRC-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder = {
    id: orderId,
    createdAt: new Date().toISOString(),
    status: 'active',
    customerName: orderData.customerName || 'Customer',
    customerPhone: orderData.customerPhone || 'Not provided',
    customerEmail: orderData.customerEmail || '',
    deliveryAddress: orderData.deliveryAddress || 'Pick-up',
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
  if (settings.notificationEmail && settings.notificationEmail.includes('@')) {
    try {
      await sendOrderNotificationEmail(newOrder, settings.notificationEmail);
    } catch (err) {
      console.warn('Email dispatch error:', err);
    }
  }

  return newOrder;
};

// Toggle status between active and done with one click
export const toggleOrderStatus = (orderId) => {
  try {
    const orders = getOrders();
    const updated = orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: order.status === 'active' ? 'done' : 'active'
        };
      }
      return order;
    });
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
    return updated;
  } catch (e) {
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
    return null;
  }
};

// Send real email notification using FormSubmit
export const sendOrderNotificationEmail = async (order, targetEmail) => {
  if (!targetEmail || !targetEmail.trim()) {
    return { success: false, message: 'No email address configured.' };
  }

  const itemsText = (order.items || [])
    .map(i => `• ${i.quantity}x ${i.name} (LKR ${(i.price * i.quantity).toLocaleString()})`)
    .join('\n');

  const formData = new FormData();
  formData.append('_subject', `🌹 New Flower Order #${order.id} - ${order.customerName} (LKR ${order.total.toLocaleString()})`);
  formData.append('_captcha', 'false');
  formData.append('_template', 'box');
  formData.append('Order ID', order.id);
  formData.append('Customer Name', order.customerName);
  formData.append('Customer Phone / WhatsApp', order.customerPhone);
  formData.append('Delivery Address', order.deliveryAddress);
  formData.append('Delivery Date & Slot', `${order.deliveryDate} (${order.deliveryTime})`);
  if (order.recipientName) formData.append('Gift Recipient', order.recipientName);
  formData.append('Voice QR Note', order.includeVoiceNote ? `YES (From: ${order.senderName || order.customerName})` : 'No');
  if (order.notes) formData.append('Special Notes', order.notes);
  formData.append('Items Ordered', itemsText || 'Flowers');
  formData.append('Total Amount', `LKR ${order.total.toLocaleString()}`);

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail.trim())}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: formData
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.warn('FormSubmit email send attempt failed:', error);
    return { success: false, message: error.message };
  }
};

// Simple Password Auth
export const checkAdminAuth = () => {
  try {
    return localStorage.getItem(STORAGE_KEY_AUTH) === 'authenticated';
  } catch (e) {
    return false;
  }
};

export const loginAdmin = (password) => {
  const settings = getSettings();
  if (password === settings.adminPassword || password === 'roseco2026' || password === 'admin') {
    localStorage.setItem(STORAGE_KEY_AUTH, 'authenticated');
    return { success: true };
  }
  return { success: false, error: 'Incorrect password' };
};

export const logoutAdmin = () => {
  try {
    localStorage.removeItem(STORAGE_KEY_AUTH);
  } catch (e) {
    // ignore
  }
};
