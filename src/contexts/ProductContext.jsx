import React, { createContext, useContext, useState, useEffect } from 'react';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

const defaultProducts = [
  { id: 1, name: 'Couteau de Chef Japonais 20cm', category: 'Coutellerie', price: 129.99, stock: 12, description: 'Lame forgée main en acier damas. Parfait pour les viandes et poissons.', image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Batterie de Cuisine Inox 5 Pièces', category: 'Cuisson', price: 299.00, stock: 5, description: 'Set comprenant casseroles et faitouts fond épais "triple épaisseur". Compatible tous feux dont induction.', image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Robot Pâtissier Multifonction', category: 'Électroménager', price: 450.00, stock: 3, description: 'Modèle pro avec cuve 6.9L. Fourni avec fouet, batteur plat et crochet pétrisseur.', image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 4, name: 'Planche à Découper Billot', category: 'Accessoires', price: 89.50, stock: 8, description: 'Bois debout massif de hêtre. Hautement résistante, n\'use pas rapidement les lames.', image: 'https://images.unsplash.com/photo-1580928224581-2287233261a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 5, name: 'Poêle En Fonte Émaillée 28cm', category: 'Cuisson', price: 145.00, stock: 15, description: 'Poignée ergonomique, répartition parfaite de la chaleur. Saisie parfaite des viandes.', image: 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 6, name: 'Mallette Couteaux Pro 12 Pièces', category: 'Coutellerie', price: 350.00, stock: 0, description: 'Mallette rigide de transport sécurisée incluant tous les indispensables pour un étudiant en école hôtelière.', image: 'https://images.unsplash.com/photo-1574223214495-5cb95a32adbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
];

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    // Try to load from localStorage first
    const saved = localStorage.getItem('shop_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Could not parse products from localstorage", e);
      }
    }
    // Fall back to default
    return defaultProducts;
  });

  // Save to localStorage whenever products array changes
  useEffect(() => {
    localStorage.setItem('shop_products', JSON.stringify(products));
  }, [products]);

  const addProduct = (newProduct) => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    setProducts([...products, { ...newProduct, id: newId }]);
  };

  const updateProduct = (id, updatedFields) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updatedFields } : p));
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
};
