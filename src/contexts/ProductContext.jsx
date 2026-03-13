import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, toCamelCase, toSnakeCase, rowsToCamel } from '../lib/supabase';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};

const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL;
const STORAGE_KEY = 'shop_products_demo';

const DEMO_PRODUCTS = [
  { id: 1, name: 'Trancheuse professionnelle inox', category: 'Boucherie / Traiteur', subcategory: 'Trancheuses', price: 489.00, stock: 5, status: true, image: '', description: 'Trancheuse professionnelle tout inox, lame 300mm, idéale pour boucheries et traiteurs.', summary: '', tags: 'trancheuse, inox, boucherie' },
  { id: 2, name: 'Crêpière électrique professionnelle Ø40cm', category: 'Forain & Crêperie', subcategory: 'Crêpières électriques', price: 215.00, stock: 8, status: true, image: '', description: 'Crêpière professionnelle 220V diamètre 40cm. Surface de cuisson antiadhésive.', summary: '', tags: 'crêpière, électrique, forain' },
  { id: 3, name: 'Table inox soudée 140x70cm', category: 'Inox', subcategory: 'Tables de travail', price: 320.00, stock: 12, status: true, image: '', description: 'Table de travail inox AISI 304 soudée, profondeur 700mm, pieds réglables.', summary: '', tags: 'table, inox, travail' },
  { id: 4, name: 'Gyros électrique kebab', category: 'Kebab', subcategory: 'Gyros électrique', price: 890.00, stock: 3, status: true, image: '', description: 'Tourne-broche électrique professionnel pour kebab. Capacité 30kg.', summary: '', tags: 'gyros, kebab, électrique' },
  { id: 5, name: 'Marmite inox 40L', category: 'Batterie de cuisine', subcategory: 'Marmite inox', price: 145.00, stock: 20, status: true, image: '', description: 'Marmite professionnelle inox 40 litres, fond thermo-diffusant, compatible induction.', summary: '', tags: 'marmite, inox, 40L' },
  { id: 6, name: 'Gaufrier électrique Bruxelles', category: 'Forain & Crêperie', subcategory: 'Gaufriers', price: 178.00, stock: 6, status: true, image: '', description: 'Gaufrier professionnel plaques Bruxelles, thermostat réglable, revêtement anti-adhésif.', summary: '', tags: 'gaufrier, bruxelles, électrique' },
];

const loadDemoProducts = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEMO_PRODUCTS;
  } catch {
    return DEMO_PRODUCTS;
  }
};

const saveDemoProducts = (products) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── Mode démo (localStorage) ─────────────────────────────────────────────
  useEffect(() => {
    if (!DEMO_MODE) return;
    setProducts(loadDemoProducts());
    setLoading(false);
  }, []);

  // ─── Mode Supabase ─────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    if (DEMO_MODE) return;
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
    if (DEMO_MODE) return;
    fetchProducts();

    const channel = supabase
      .channel('products_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchProducts]);

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  const addProduct = async (newProduct) => {
    if (DEMO_MODE) {
      const all = loadDemoProducts();
      const id = all.length > 0 ? Math.max(...all.map(p => p.id)) + 1 : 1;
      const product = { ...newProduct, id };
      const updated = [...all, product];
      saveDemoProducts(updated);
      setProducts(updated);
      return product;
    }

    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = newProduct;
    const snakeProduct = toSnakeCase(rest);
    const { data, error } = await supabase.from('products').insert(snakeProduct).select().single();
    if (error) { console.error('[ProductContext] addProduct error:', error.message); return null; }
    const product = toCamelCase(data);
    setProducts(prev => [...prev, product]);
    return product;
  };

  const updateProduct = async (id, updatedFields) => {
    if (DEMO_MODE) {
      const all = loadDemoProducts();
      const updated = all.map(p => p.id === id ? { ...p, ...updatedFields, id } : p);
      saveDemoProducts(updated);
      setProducts(updated);
      return;
    }

    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = updatedFields;
    const snakeFields = toSnakeCase(rest);
    delete snakeFields.created_at;
    delete snakeFields.updated_at;

    const { data, error } = await supabase.from('products').update(snakeFields).eq('id', id).select().single();
    if (error) { console.error('[ProductContext] updateProduct error:', error.message); return; }
    const updated = toCamelCase(data);
    setProducts(prev => prev.map(p => p.id === id ? updated : p));
  };

  const deleteProduct = async (id) => {
    if (DEMO_MODE) {
      const all = loadDemoProducts();
      const updated = all.filter(p => p.id !== id);
      saveDemoProducts(updated);
      setProducts(updated);
      return;
    }

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { console.error('[ProductContext] deleteProduct error:', error.message); return; }
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ProductContext.Provider value={{ products, loading, addProduct, updateProduct, deleteProduct, refetch: fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
};
