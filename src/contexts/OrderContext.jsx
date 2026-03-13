import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, toCamelCase, rowsToCamel } from '../lib/supabase';

const OrderContext = createContext();

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within an OrderProvider');
  return context;
};

const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL;
const STORAGE_KEY = 'shop_orders_demo';

const loadDemoOrders = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const saveDemoOrders = (orders) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  // ─── Mode démo ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!DEMO_MODE) return;
    setOrders(loadDemoOrders());
  }, []);

  // ─── Mode Supabase ─────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    if (DEMO_MODE) return;
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) return;

    const normalized = data.map(order => ({
      ...toCamelCase(order),
      items: (order.order_items || []).map(item => ({
        id: item.product_id,
        name: item.product_name,
        price: parseFloat(item.product_price),
        quantity: item.quantity,
      })),
    }));

    setOrders(normalized);
  }, []);

  useEffect(() => {
    if (DEMO_MODE) return;
    fetchOrders();

    const channel = supabase
      .channel('orders_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchOrders]);

  // ─── Créer une commande ────────────────────────────────────────────────────
  const addOrder = async ({ items, totalAmount, customer }) => {
    if (DEMO_MODE) {
      const all = loadDemoOrders();
      const newOrder = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        customer: { name: customer.name, email: customer.email, phone: customer.phone || '' },
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        totalAmount,
        status: 'En attente',
      };
      const updated = [newOrder, ...all];
      saveDemoOrders(updated);
      setOrders(updated);
      return newOrder;
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone || '',
        total_amount: totalAmount,
        status: 'En attente',
        stripe_payment_intent_id: customer.paymentIntentId || '',
      })
      .select()
      .single();

    if (orderError) {
      console.error('[OrderContext] addOrder error:', orderError.message);
      return null;
    }

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity,
    }));

    await supabase.from('order_items').insert(orderItems);

    for (const item of items) {
      await supabase.rpc('decrement_stock', { p_product_id: item.id, p_quantity: item.quantity })
        .catch(() => {
          supabase.from('products').select('stock').eq('id', item.id).single()
            .then(({ data: p }) => {
              if (p) supabase.from('products').update({ stock: Math.max(0, p.stock - item.quantity) }).eq('id', item.id);
            });
        });
    }

    const newOrder = {
      ...toCamelCase(order),
      items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  // ─── Modifier le statut ────────────────────────────────────────────────────
  const updateOrderStatus = async (orderId, newStatus) => {
    if (DEMO_MODE) {
      const all = loadDemoOrders();
      const updated = all.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      saveDemoOrders(updated);
      setOrders(updated);
      return;
    }

    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) { console.error('[OrderContext] updateOrderStatus error:', error.message); return; }
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, refetch: fetchOrders }}>
      {children}
    </OrderContext.Provider>
  );
};
