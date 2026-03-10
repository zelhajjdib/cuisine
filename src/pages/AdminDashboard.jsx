import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { useOrders } from '../contexts/OrderContext';
import { CATEGORIES } from '../constants/categories';
import styles from './AdminDashboard.module.css';

// Filter out "Toutes" for the dropdown since a product cannot literally belong to "Toutes"
const productCategories = CATEGORIES.filter(c => c !== 'Toutes');

const AdminDashboard = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { orders, updateOrderStatus } = useOrders();
  
  // States
  const [activeTab, setActiveTab] = useState('Produits');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form State
  const initialFormState = {
    name: '',
    status: true,
    manufacturer: '',
    supplier: '',
    reference: '',
    supplierReference: '',
    ean13: '',
    weight: '',
    location: '',
    isPack: false,
    isDownloadable: false,
    purchasePriceHT: '',
    sellingPriceHT: '',
    taxRate: '20',
    price: '', 
    ecoTax: '0.00',
    discount: '0.00',
    availableFrom: '',
    availableTo: '',
    onSale: false,
    stock: '1', 
    inStockMessage: '',
    outOfStockMessage: '',
    summary: '',
    description: '',
    tags: '',
    accessories: '',
    category: productCategories[0],
    image: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Protected Route Check
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) return null; // Prevent flash before redirect

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      ...initialFormState,
      ...product
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Convert to proper types
    const formattedData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock) || 0,
      purchasePriceHT: parseFloat(formData.purchasePriceHT) || 0,
      sellingPriceHT: parseFloat(formData.sellingPriceHT) || 0,
      taxRate: parseFloat(formData.taxRate) || 0,
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
          <button 
            className={activeTab === 'Produits' ? styles.active : ''} 
            onClick={() => setActiveTab('Produits')}
          >
            Produits
          </button>
          <button 
            className={activeTab === 'Commandes' ? styles.active : ''} 
            onClick={() => setActiveTab('Commandes')}
          >
            Commandes
          </button>
        </nav>
        <div className={styles.sidebarFooter}>
          <button onClick={() => { logout(); navigate('/admin'); }} className={styles.logoutBtn}>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {activeTab === 'Produits' && (
          <>
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
          </>
        )}

        {activeTab === 'Commandes' && (
          <>
            <header className={styles.header}>
              <h1>Historique des Commandes</h1>
            </header>

            <div className={styles.tableContainer}>
              {orders.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  Aucune commande pour le moment.
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Ref. Commande</th>
                      <th>Date</th>
                      <th>Client</th>
                      <th>Articles</th>
                      <th>Total</th>
                      <th>Statut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td className={styles.fw500}>#{order.id.slice(0, 8).toUpperCase()}</td>
                        <td>{new Date(order.date).toLocaleDateString('fr-FR')}</td>
                        <td>
                          <div>{order.customer.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>{order.customer.email}</div>
                        </td>
                        <td>
                          {order.items.map(item => (
                            <div key={item.id} style={{ fontSize: '0.85rem' }}>
                              {item.quantity}x {item.name}
                            </div>
                          ))}
                        </td>
                        <td className={styles.fw500}>{order.totalAmount.toFixed(2)} €</td>
                        <td>
                          <span style={{
                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600,
                            backgroundColor: order.status === 'En attente' ? '#fff3cd' : '#d4edda',
                            color: order.status === 'En attente' ? '#856404' : '#155724'
                          }}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          {order.status === 'En attente' && (
                            <button 
                              className={styles.editBtn} 
                              onClick={() => updateOrderStatus(order.id, 'Expédiée')}
                            >
                              Marquer Expédiée
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
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
              {/* Informations Générales */}
              <div className={styles.formSection}>
                <h3>Informations globales</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Nom du Produit *</label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Statut</label>
                  <div className={styles.radioGroup}>
                    <label><input type="radio" name="status" value="true" checked={formData.status === true || formData.status === 'true'} onChange={() => setFormData({...formData, status: true})} /> Activé</label>
                    <label><input type="radio" name="status" value="false" checked={formData.status === false || formData.status === 'false'} onChange={() => setFormData({...formData, status: false})} /> Désactivé</label>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="manufacturer">Fabricant</label>
                    <select id="manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleChange}>
                      <option value="">-- Choisir --</option>
                      <option value="BARTCHER">BARTCHER</option>
                      <option value="SAMSUNG">SAMSUNG</option>
                      <option value="TEFAL">TEFAL</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="supplier">Fournisseur</label>
                    <select id="supplier" name="supplier" value={formData.supplier} onChange={handleChange}>
                      <option value="">-- Choisir (optionnel) --</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="reference">Référence</label>
                    <input type="text" id="reference" name="reference" value={formData.reference} onChange={handleChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="supplierReference">Référence fournisseur</label>
                    <input type="text" id="supplierReference" name="supplierReference" value={formData.supplierReference} onChange={handleChange} />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="ean13">EAN13</label>
                    <input type="text" id="ean13" name="ean13" value={formData.ean13} onChange={handleChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="weight">Poids (kg)</label>
                    <input type="number" step="0.01" id="weight" name="weight" value={formData.weight} onChange={handleChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="location">Emplacement</label>
                    <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} />
                  </div>
                </div>

                <div className={styles.checkboxGroup}>
                  <input type="checkbox" id="isPack" name="isPack" checked={formData.isPack} onChange={handleChange} />
                  <label htmlFor="isPack">Pack</label>
                </div>
                <div className={styles.checkboxGroup}>
                  <input type="checkbox" id="isDownloadable" name="isDownloadable" checked={formData.isDownloadable} onChange={handleChange} />
                  <label htmlFor="isDownloadable">Produit à télécharger</label>
                </div>
              </div>

              {/* Prix */}
              <div className={styles.formSection}>
                <h3>Prix</h3>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="purchasePriceHT">Prix d'achat HT (€)</label>
                    <input type="number" step="0.01" id="purchasePriceHT" name="purchasePriceHT" value={formData.purchasePriceHT} onChange={handleChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="sellingPriceHT">Prix de vente HT (€) *</label>
                    <input type="number" step="0.01" id="sellingPriceHT" name="sellingPriceHT" value={formData.sellingPriceHT} onChange={handleChange} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="taxRate">Taxe</label>
                    <select id="taxRate" name="taxRate" value={formData.taxRate} onChange={handleChange}>
                      <option value="0">TVA (0.000%)</option>
                      <option value="5.5">TVA (5.5%)</option>
                      <option value="20">TVA (20.00%)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="price">Prix de vente TTC (€) * (Prix Final)</label>
                    <input type="number" step="0.01" id="price" name="price" value={formData.price} onChange={handleChange} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="ecoTax">Eco-participation (€)</label>
                    <input type="number" step="0.01" id="ecoTax" name="ecoTax" value={formData.ecoTax} onChange={handleChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="discount">Réduction</label>
                    <input type="number" step="0.01" id="discount" name="discount" value={formData.discount} onChange={handleChange} placeholder="€ ou %" />
                  </div>
                </div>
                
                <div className={styles.checkboxGroup}>
                  <input type="checkbox" id="onSale" name="onSale" checked={formData.onSale} onChange={handleChange} />
                  <label htmlFor="onSale">Affiche "en solde" sur la page produit</label>
                </div>
              </div>

              {/* Quantité & SEO */}
              <div className={styles.formSection}>
                <h3>Quantité & Configuration</h3>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                     <label htmlFor="category">Catégorie Primaire *</label>
                     <select id="category" name="category" value={formData.category} onChange={handleChange}>
                       {productCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                     </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="stock">Quantité *</label>
                    <input type="number" id="stock" name="stock" min="0" value={formData.stock} onChange={handleChange} required />
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="inStockMessage">Message quand en stock</label>
                    <input type="text" id="inStockMessage" name="inStockMessage" value={formData.inStockMessage} onChange={handleChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="outOfStockMessage">Message lorsque hors-stock</label>
                    <input type="text" id="outOfStockMessage" name="outOfStockMessage" value={formData.outOfStockMessage} onChange={handleChange} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="image">URL de l'image Globale (Catalogue) *</label>
                  <input type="url" id="image" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." required />
                </div>
              </div>

              {/* Textes (SEO & Description) */}
              <div className={styles.formSection}>
                <h3>Textes (Apparaîtra dans les moteurs de recherche)</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="summary">Résumé (SEO Court)</label>
                  <textarea id="summary" name="summary" rows="2" value={formData.summary} onChange={handleChange}></textarea>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="description">Description détaillée</label>
                  <textarea id="description" name="description" rows="5" value={formData.description} onChange={handleChange}></textarea>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="tags">Tags (séparés par des virgules)</label>
                  <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleChange} placeholder="ex: dvd, lecteur dvd, hifi" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="accessories">Accessoires (Recherche auto)</label>
                  <input type="text" id="accessories" name="accessories" value={formData.accessories} onChange={handleChange} placeholder="Tapez les premières lettres..." />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={`btn btn-outline ${styles.cancelBtn}`} onClick={closeModal}>Annuler</button>
                <button type="submit" className={`btn btn-primary ${styles.saveBtn}`}>
                  {editingProduct ? 'Mettre à jour' : 'Créer et Enregistrer'}
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
