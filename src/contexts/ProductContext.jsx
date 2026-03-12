import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, toCamelCase, toSnakeCase, rowsToCamel } from '../lib/supabase';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── Chargement initial ────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('[ProductContext] fetchProducts error:', error.message);
      setLoading(false);
      return;
    }
    setProducts(rowsToCamel(data));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();

    // Temps réel : mise à jour automatique si l'admin modifie depuis un autre onglet
    const channel = supabase
      .channel('products_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchProducts]);

  // ─── Ajouter un produit ────────────────────────────────────────────────────
  const addProduct = async (newProduct) => {
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = newProduct;
    const snakeProduct = toSnakeCase(rest);

    const { data, error } = await supabase
      .from('products')
      .insert(snakeProduct)
      .select()
      .single();

    if (error) {
      console.error('[ProductContext] addProduct error:', error.message);
      return null;
    }

    const product = toCamelCase(data);
    setProducts(prev => [...prev, product]);
    return product;
  };

  // ─── Modifier un produit ───────────────────────────────────────────────────
  const updateProduct = async (id, updatedFields) => {
    // Retire les champs auto-gérés par Supabase
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = updatedFields;
    const snakeFields = toSnakeCase(rest);
    // Supprime les clés snake déjà auto-gérées si présentes
    delete snakeFields.created_at;
    delete snakeFields.updated_at;

    const { data, error } = await supabase
      .from('products')
      .update(snakeFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[ProductContext] updateProduct error:', error.message);
      return;
    }

    const updated = toCamelCase(data);
    setProducts(prev => prev.map(p => p.id === id ? updated : p));
  };

  // ─── Supprimer un produit ──────────────────────────────────────────────────
  const deleteProduct = async (id) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[ProductContext] deleteProduct error:', error.message);
      return;
    }

    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ProductContext.Provider value={{ products, loading, addProduct, updateProduct, deleteProduct, refetch: fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
};
