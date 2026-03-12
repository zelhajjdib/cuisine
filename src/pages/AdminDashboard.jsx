import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { useOrders } from '../contexts/OrderContext';
import { CATEGORIES } from '../constants/categories';
import styles from './AdminDashboard.module.css';

const productCategories = CATEGORIES.filter(c => c !== 'Toutes');

const loadFromStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const AdminDashboard = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { orders, updateOrderStatus } = useOrders();

  const [activeTab, setActiveTab] = useState('Produits');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Fabricants & Fournisseurs dynamiques
  const [manufacturers, setManufacturers] = useState(() =>
    loadFromStorage('shop_manufacturers', ['BARTCHER', 'SAMSUNG', 'TEFAL'])
  );
  const [suppliers, setSuppliers] = useState(() =>
    loadFromStorage('shop_suppliers', [])
  );
  const [showCreateManufacturer, setShowCreateManufacturer] = useState(false);
  const [newManufacturerName, setNewManufacturerName] = useState('');
  const [showCreateSupplier, setShowCreateSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');

  useEffect(() => {
    localStorage.setItem('shop_manufacturers', JSON.stringify(manufacturers));
  }, [manufacturers]);

  useEffect(() => {
    localStorage.setItem('shop_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  const handleAddManufacturer = () => {
    const name = newManufacturerName.trim().toUpperCase();
    if (!name || manufacturers.includes(name)) return;
    const updated = [...manufacturers, name];
    setManufacturers(updated);
    setFormData(prev => ({ ...prev, manufacturer: name }));
    setNewManufacturerName('');
    setShowCreateManufacturer(false);
  };

  const handleAddSupplier = () => {
    const name = newSupplierName.trim();
    if (!name || suppliers.includes(name)) return;
    const updated = [...suppliers, name];
    setSuppliers(updated);
    setFormData(prev => ({ ...prev, supplier: name }));
    setNewSupplierName('');
    setShowCreateSupplier(false);
  };

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
    discountPercent: '0',
    availableFrom: '',
    availableTo: '',
    onSale: false,
    outOfStockBehavior: 'default',
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
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (!isAdmin) navigate('/admin');
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const computedPriceTTC = () => {
    const ht = parseFloat(formData.sellingPriceHT) || 0;
    const tax = parseFloat(formData.taxRate) || 0;
    return (ht * (1 + tax / 100)).toFixed(2);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(initialFormState);
    setImagePreview('');
    setShowCreateManufacturer(false);
    setShowCreateSupplier(false);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({ ...initialFormState, ...product });
    setImagePreview(product.image || '');
    setShowCreateManufacturer(false);
    setShowCreateSupplier(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowCreateManufacturer(false);
    setShowCreateSupplier(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      // Auto-calcul du prix TTC quand HT ou taxe change
      if (name === 'sellingPriceHT' || name === 'taxRate') {
        const ht = parseFloat(name === 'sellingPriceHT' ? newValue : prev.sellingPriceHT) || 0;
        const tax = parseFloat(name === 'taxRate' ? newValue : prev.taxRate) || 0;
        updated.price = (ht * (1 + tax / 100)).toFixed(2);
      }
      return updated;
    });
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
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
                    <th>Prix TTC</th>
                    <th>Stock</th>
                    <th>Statut</th>
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
                        <span className={product.status === false ? styles.statusOff : styles.statusOn}>
                          {product.status === false ? 'Désactivé' : 'Activé'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.editBtn}
                            onClick={() => openEditModal(product)}
                          >
                            Éditer
                          </button>
                          <button
                            className={styles.deleteBtn}
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
                          <div className={styles.fw500}>{order.customer.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>{order.customer.email}</div>
                          {order.customer.phone && (
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{order.customer.phone}</div>
                          )}
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

      {/* Modal Ajout / Édition */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingProduct ? 'Modifier le produit' : 'Nouveau Produit'}</h2>
              <button className={styles.closeBtn} onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSave} className={styles.modalForm}>

              {/* ── Informations Générales ── */}
              <div className={styles.formSection}>
                <h3>Informations globales</h3>

                <div className={styles.formGroup}>
                  <label htmlFor="name">Nom du Produit *</label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div className={styles.formGroup}>
                  <label>Statut</label>
                  <div className={styles.radioGroup}>
                    <label>
                      <input type="radio" name="status" checked={formData.status === true || formData.status === 'true'} onChange={() => setFormData(p => ({ ...p, status: true }))} />
                      ✔ Activé
                    </label>
                    <label>
                      <input type="radio" name="status" checked={formData.status === false || formData.status === 'false'} onChange={() => setFormData(p => ({ ...p, status: false }))} />
                      ✖ Désactivé
                    </label>
                  </div>
                </div>

                {/* Fabricant avec bouton Créer */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="manufacturer">Fabricant</label>
                    <div className={styles.fieldWithCreate}>
                      <select id="manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleChange}>
                        <option value="">-- Choisir --</option>
                        {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <button type="button" className={styles.createBtn} onClick={() => { setShowCreateManufacturer(v => !v); setShowCreateSupplier(false); }}>
                        + Créer
                      </button>
                    </div>
                    {showCreateManufacturer && (
                      <div className={styles.inlineCreate}>
                        <input
                          type="text"
                          placeholder="Nom du fabricant"
                          value={newManufacturerName}
                          onChange={e => setNewManufacturerName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddManufacturer())}
                          autoFocus
                        />
                        <button type="button" className={styles.createConfirmBtn} onClick={handleAddManufacturer}>Ajouter</button>
                        <button type="button" className={styles.createCancelBtn} onClick={() => setShowCreateManufacturer(false)}>Annuler</button>
                      </div>
                    )}
                  </div>

                  {/* Fournisseur avec bouton Créer */}
                  <div className={styles.formGroup}>
                    <label htmlFor="supplier">Fournisseur</label>
                    <div className={styles.fieldWithCreate}>
                      <select id="supplier" name="supplier" value={formData.supplier} onChange={handleChange}>
                        <option value="">-- Choisir (optionnel) --</option>
                        {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button type="button" className={styles.createBtn} onClick={() => { setShowCreateSupplier(v => !v); setShowCreateManufacturer(false); }}>
                        + Créer
                      </button>
                    </div>
                    {showCreateSupplier && (
                      <div className={styles.inlineCreate}>
                        <input
                          type="text"
                          placeholder="Nom du fournisseur"
                          value={newSupplierName}
                          onChange={e => setNewSupplierName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSupplier())}
                          autoFocus
                        />
                        <button type="button" className={styles.createConfirmBtn} onClick={handleAddSupplier}>Ajouter</button>
                        <button type="button" className={styles.createCancelBtn} onClick={() => setShowCreateSupplier(false)}>Annuler</button>
                      </div>
                    )}
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

              {/* ── Prix ── */}
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
                    <label htmlFor="price">Prix de vente TTC (€) * <span style={{fontWeight:'normal',fontSize:'0.8rem'}}>(auto-calculé)</span></label>
                    <input type="number" step="0.01" id="price" name="price" value={formData.price} onChange={handleChange} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="ecoTax">Eco-participation (€)</label>
                    <input type="number" step="0.01" id="ecoTax" name="ecoTax" value={formData.ecoTax} onChange={handleChange} />
                    <span className={styles.helpText}>(Déjà incluse dans le prix)</span>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Réduction</label>
                    <div className={styles.discountRow}>
                      <input type="number" step="0.01" name="discount" value={formData.discount} onChange={handleChange} placeholder="€" />
                      <span>OU</span>
                      <input type="number" step="1" name="discountPercent" value={formData.discountPercent} onChange={handleChange} placeholder="%" />
                      <span>%</span>
                    </div>
                  </div>
                </div>

                {/* Dates de disponibilité */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="availableFrom">Dispo depuis</label>
                    <input type="datetime-local" id="availableFrom" name="availableFrom" value={formData.availableFrom} onChange={handleChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="availableTo">Jusque</label>
                    <input type="datetime-local" id="availableTo" name="availableTo" value={formData.availableTo} onChange={handleChange} />
                  </div>
                </div>

                <div className={styles.checkboxGroup}>
                  <input type="checkbox" id="onSale" name="onSale" checked={formData.onSale} onChange={handleChange} />
                  <label htmlFor="onSale">Affiche "en solde" sur la page produit et dans les catégories</label>
                </div>

                {/* Prix de vente final calculé */}
                {formData.sellingPriceHT && (
                  <div className={styles.priceFinalDisplay}>
                    <strong>Prix de vente final :</strong>
                    &nbsp;{computedPriceTTC()} € (TTC) / {(parseFloat(formData.sellingPriceHT) || 0).toFixed(2)} € (HT)
                  </div>
                )}
              </div>

              {/* ── Quantité & Configuration ── */}
              <div className={styles.formSection}>
                <h3>Quantité & Configuration</h3>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="category">Catégorie Primaire *</label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange}>
                      {productCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
                    <input type="text" id="inStockMessage" name="inStockMessage" value={formData.inStockMessage} onChange={handleChange} placeholder="En stock" />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="outOfStockMessage">Message hors-stock mais commandable</label>
                    <input type="text" id="outOfStockMessage" name="outOfStockMessage" value={formData.outOfStockMessage} onChange={handleChange} placeholder="ex: 8 JOURS" />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Si rupture de stock :</label>
                  <div className={styles.radioGroup}>
                    <label>
                      <input type="radio" name="outOfStockBehavior" value="deny" checked={formData.outOfStockBehavior === 'deny'} onChange={handleChange} />
                      Refuser les commandes
                    </label>
                    <label>
                      <input type="radio" name="outOfStockBehavior" value="accept" checked={formData.outOfStockBehavior === 'accept'} onChange={handleChange} />
                      Accepter les commandes
                    </label>
                    <label>
                      <input type="radio" name="outOfStockBehavior" value="default" checked={formData.outOfStockBehavior === 'default'} onChange={handleChange} />
                      Par défaut
                    </label>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Image du Produit (Catalogue) *</label>
                  <div
                    className={styles.imageUploadZone}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {imagePreview ? (
                      <div className={styles.imagePreviewContainer}>
                        <img src={imagePreview} alt="Aperçu" className={styles.imagePreview} />
                        <button
                          type="button"
                          className={styles.removeImageBtn}
                          onClick={() => { setImagePreview(''); setFormData(p => ({ ...p, image: '' })); }}
                        >
                          Changer d'image
                        </button>
                      </div>
                    ) : (
                      <div className={styles.uploadPrompt}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ccc', marginBottom: '10px' }}>
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                          <circle cx="9" cy="9" r="2"/>
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                        </svg>
                        <p>Glissez et déposez une image ici</p>
                        <span style={{ margin: '10px 0', fontSize: '0.9rem', color: '#666' }}>OU</span>
                        <label htmlFor="imageUpload" className={`btn btn-outline ${styles.browseBtn}`}>
                          Parcourir vos fichiers
                        </label>
                        <input
                          type="file"
                          id="imageUpload"
                          accept="image/*"
                          onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }}
                          style={{ display: 'none' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Textes / SEO ── */}
              <div className={styles.formSection}>
                <h3>Textes (Apparaîtra dans les moteurs de recherche)</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="summary">Résumé (apparaîtra dans les moteurs de recherche)</label>
                  <textarea id="summary" name="summary" rows="2" value={formData.summary} onChange={handleChange}></textarea>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="description">Description détaillée</label>
                  <textarea id="description" name="description" rows="5" value={formData.description} onChange={handleChange}></textarea>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="tags">Tags (séparés par des virgules)</label>
                  <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleChange} placeholder="ex: vitrine, chauffante, présentoir" />
                  <span className={styles.helpText}>Caractères interdits : &lt; &gt; ; = # &#123; &#125;</span>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="accessories">Accessoires (N'oubliez pas d'enregistrer le produit ensuite)</label>
                  <input type="text" id="accessories" name="accessories" value={formData.accessories} onChange={handleChange} placeholder="Tapez les premières lettres du nom du produit..." />
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
