import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, toCamelCase, rowsToCamel } from '../lib/supabase';

const OrderContext = createContext();

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within an OrderProvider');
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  // ─── Chargement des commandes (admin seulement via RLS) ───────────────────
  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      // Erreur RLS normale si non connecté (client côté public) — silencieux
      return;
    }

    // Normalise : convertit la commande et ses items en camelCase
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
    fetchOrders();

    // Temps réel : nouvelles commandes apparaissent automatiquement dans le dashboard
    const channel = supabase
      .channel('orders_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchOrders]);

  // ─── Créer une commande (client invité) ───────────────────────────────────
  const addOrder = async ({ items, totalAmount, customer, stripePaymentIntentId = '' }) => {
    // 1. Insérer la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone || '',
        total_amount: totalAmount,
        status: 'En attente',
        stripe_payment_intent_id: stripePaymentIntentId,
      })
      .select()
      .single();

    if (orderError) {
      console.error('[OrderContext] addOrder error:', orderError.message);
      return null;
    }

    // 2. Insérer les articles de la commande
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('[OrderContext] addOrder items error:', itemsError.message);
    }

    // 3. Déduire le stock pour chaque article
    for (const item of items) {
      await supabase.rpc('decrement_stock', {
        p_product_id: item.id,
        p_quantity: item.quantity,
      }).catch(() => {
        // Fallback si la fonction RPC n'est pas encore créée
        supabase
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .single()
          .then(({ data: p }) => {
            if (p) {
              supabase.from('products')
                .update({ stock: Math.max(0, p.stock - item.quantity) })
                .eq('id', item.id);
            }
          });
      });
    }

    // 4. Ajout optimiste en local pour l'admin connecté
    const newOrder = {
      ...toCamelCase(order),
      items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
    };
    setOrders(prev => [newOrder, ...prev]);

    return newOrder;
  };

  // ─── Modifier le statut d'une commande ────────────────────────────────────
  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('[OrderContext] updateOrderStatus error:', error.message);
      return;
    }

    setOrders(prev =>
      prev.map(order => order.id === orderId ? { ...order, status: newStatus } : order)
    );
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, refetch: fetchOrders }}>
      {children}
    </OrderContext.Provider>
  );
};
