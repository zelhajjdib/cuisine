import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './AdminDashboard.module.css';

// We reuse the same mock data for now. In a real app this would come from a Supabase fetch
const initialProducts = [
  { id: 1, name: 'Couteau de Chef Japonais 20cm', category: 'Coutellerie', price: 129.99, stock: 12 },
  { id: 2, name: 'Batterie de Cuisine Inox 5 Pièces', category: 'Cuisson', price: 299.00, stock: 5 },
  { id: 3, name: 'Robot Pâtissier Multifonction', category: 'Électroménager', price: 450.00, stock: 3 },
  { id: 4, name: 'Planche à Découper Billot', category: 'Accessoires', price: 89.50, stock: 8 },
  { id: 5, name: 'Poêle En Fonte Émaillée 28cm', category: 'Cuisson', price: 145.00, stock: 15 },
  { id: 6, name: 'Mallette Couteaux Pro 12 Pièces', category: 'Coutellerie', price: 350.00, stock: 0 },
];

const AdminDashboard = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState(initialProducts);

  // Protected Route Check
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) return null; // Prevent flash before redirect

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      // In real app: supabase.from('products').delete().eq('id', id)
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>La Caverne Admin</h2>
        </div>
        <nav className={styles.sidebarNav}>
          <a href="#" className={styles.active}>Produits</a>
          <a href="#">Catégories</a>
          <a href="#">Commandes</a>
          <a href="#">Clients</a>
        </nav>
        <div className={styles.sidebarFooter}>
          <button onClick={() => { logout(); navigate('/admin'); }} className={styles.logoutBtn}>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>Gestion des Produits</h1>
          <button className={`btn btn-primary ${styles.addBtn}`}>
            + Ajouter un Produit
          </button>
        </header>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom du Produit</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>#{product.id}</td>
                  <td className={styles.fw500}>{product.name}</td>
                  <td>
                    <span className={styles.categoryTag}>{product.category}</span>
                  </td>
                  <td>{product.price.toFixed(2)} €</td>
                  <td>
                    <span className={product.stock > 0 ? styles.stockOk : styles.stockOut}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className={styles.editBtn} aria-label="Modifier">
                        Éditer
                      </button>
                      <button 
                        className={styles.deleteBtn} 
                        aria-label="Supprimer"
                        onClick={() => handleDelete(product.id)}
                      >
                        Suppr.
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
