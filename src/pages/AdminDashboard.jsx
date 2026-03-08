import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  
  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Coutellerie',
    price: '',
    stock: '',
    description: '',
    image: ''
  });

  // Protected Route Check
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) return null; // Prevent flash before redirect

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', category: 'Coutellerie', price: '', stock: '', description: '', image: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description || '',
      image: product.image || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Convert to proper types
    const formattedData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock)
    };
    
    if (editingProduct) {
      updateProduct(editingProduct.id, formattedData);
    } else {
      addProduct(formattedData);
    }
    
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      deleteProduct(id);
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
          <button className={`btn btn-primary ${styles.addBtn}`} onClick={openAddModal}>
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
                      <button 
                        className={styles.editBtn} 
                        aria-label="Modifier"
                        onClick={() => openEditModal(product)}
                      >
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

      {/* Modal Reusable for Add / Edit */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingProduct ? 'Modifier le produit' : 'Nouveau Produit'}</h2>
              <button className={styles.closeBtn} onClick={closeModal}>×</button>
            </div>
            
            <form onSubmit={handleSave} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Nom du Produit</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="category">Catégorie</label>
                <select 
                  id="category" 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange}
                >
                  <option value="Coutellerie">Coutellerie</option>
                  <option value="Cuisson">Cuisson</option>
                  <option value="Électroménager">Électroménager</option>
                  <option value="Accessoires">Accessoires</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Description Rapide</label>
                <textarea 
                  id="description" 
                  name="description" 
                  rows="3"
                  value={formData.description} 
                  onChange={handleChange}
                  placeholder="Décrivez brièvement le produit..."
                  required 
                ></textarea>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="image">URL de l'image</label>
                <input 
                  type="url" 
                  id="image" 
                  name="image" 
                  value={formData.image} 
                  onChange={handleChange}
                  placeholder="https://..."
                  required 
                />
                <span className={styles.helpText}>Pour l'instant, collez un lien d'image externe.</span>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="price">Prix (€)</label>
                  <input 
                    type="number" 
                    id="price" 
                    name="price" 
                    min="0"
                    step="0.01"
                    value={formData.price} 
                    onChange={handleChange}
                    required 
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="stock">Quantité en Stock</label>
                  <input 
                    type="number" 
                    id="stock" 
                    name="stock" 
                    min="0"
                    value={formData.stock} 
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={`btn btn-outline ${styles.cancelBtn}`} onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className={`btn btn-primary ${styles.saveBtn}`}>
                  {editingProduct ? 'Mettre à jour' : 'Créer le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
