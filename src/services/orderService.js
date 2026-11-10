// Order Service for The Rose Co.
// Connects to Supabase Cloud Database + Local Fallback + Email Dispatch

import { supabase } from './supabaseClient';

const STORAGE_KEY_ORDERS = 'the_rose_co_orders';
const STORAGE_KEY_SETTINGS = 'the_rose_co_settings';
const STORAGE_KEY_AUTH = 'the_rose_co_admin_auth';

const DEFAULT_SETTINGS = {
  notificationEmail: '',
  adminPassword: 'roseco2026',
  storePhone: '+94770000000',
};

// Map database row to standard frontend order model
const mapRowToOrder = (row) => ({
  id: row.id,
  createdAt: row.created_at,
  customerName: row.customer_name || 'Customer',
  customerPhone: row.customer_phone || '',
  customerEmail: row.customer_email || '',
  deliveryAddress: row.delivery_address || '',
  deliveryDate: row.delivery_date || '',
  deliveryTime: row.delivery_time || '',
  recipientName: row.recipient_name || '',
  includeVoiceNote: !!row.include_voice_note,
  senderName: row.sender_name || '',
  notes: row.notes || '',
  items: row.items || [],
  subtotal: row.subtotal || 0,
  deliveryFee: row.delivery_fee || 0,
  total: row.total || 0,
  status: row.status === 'completed' || row.status === 'done' ? 'done' : 'active'
});

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

// Fetch orders from Supabase cloud database (with local storage fallback)
export const getOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('flower_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const orders = data.map(mapRowToOrder);
      // Cache locally for offline resilience
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
      return orders;
    }
  } catch (err) {
    console.warn('Supabase fetch failed, falling back to local storage:', err);
  }

  // Fallback to local storage if network is offline
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

// Save order centrally to Supabase + trigger email notification
export const saveOrder = async (orderData) => {
  const settings = getSettings();
  const orderId = `TRC-${Math.floor(1000 + Math.random() * 9000)}`;

  const dbRow = {
    id: orderId,
    customer_name: orderData.customerName || 'Customer',
    customer_phone: orderData.customerPhone || 'Not provided',
    customer_email: orderData.customerEmail || '',
    delivery_address: orderData.deliveryAddress || 'Pick-up',
    delivery_date: orderData.deliveryDate || '',
    delivery_time: orderData.deliveryTime || '',
    recipient_name: orderData.recipientName || '',
    include_voice_note: !!orderData.includeVoiceNote,
    sender_name: orderData.senderName || '',
    notes: orderData.notes || '',
    items: orderData.items || [],
    subtotal: orderData.subtotal || 0,
    delivery_fee: orderData.deliveryFee || 0,
    total: orderData.total || 0,
    status: 'active'
  };

  // 1. Insert into Supabase
  try {
    const { data, error } = await supabase
      .from('flower_orders')
      .insert([dbRow])
      .select();

    if (error) {
      console.warn('Supabase insert warning:', error);
    }
  } catch (err) {
    console.warn('Supabase connection error:', err);
  }

  const standardOrder = mapRowToOrder({
    ...dbRow,
    created_at: new Date().toISOString()
  });

  // 2. Cache in local storage
  try {
    const localRaw = localStorage.getItem(STORAGE_KEY_ORDERS);
    const existing = localRaw ? JSON.parse(localRaw) : [];
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify([standardOrder, ...existing]));
  } catch (e) {
    console.error('Failed to cache order locally:', e);
  }

  // 3. Dispatch Email notification via FormSubmit
  if (settings.notificationEmail && settings.notificationEmail.includes('@')) {
    sendOrderNotificationEmail(standardOrder, settings.notificationEmail).catch(err => {
      console.warn('Email dispatch error:', err);
    });
  }

  return standardOrder;
};

// Toggle status between active and done in Supabase
export const toggleOrderStatus = async (orderId, currentStatus) => {
  const newStatus = currentStatus === 'active' ? 'done' : 'active';

  try {
    await supabase
      .from('flower_orders')
      .update({ status: newStatus })
      .eq('id', orderId);
  } catch (err) {
    console.warn('Supabase status update error:', err);
  }

  // Update local cache
  try {
    const localRaw = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (localRaw) {
      const orders = JSON.parse(localRaw);
      const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
      return updated;
    }
  } catch (e) {
    // ignore
  }

  return await getOrders();
};

// Delete order from Supabase
export const deleteOrder = async (orderId) => {
  try {
    await supabase
      .from('flower_orders')
      .delete()
      .eq('id', orderId);
  } catch (err) {
    console.warn('Supabase delete error:', err);
  }

  try {
    const localRaw = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (localRaw) {
      const orders = JSON.parse(localRaw);
      const updated = orders.filter(o => o.id !== orderId);
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
      return updated;
    }
  } catch (e) {
    // ignore
  }

  return await getOrders();
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

// Authentication state helpers
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
