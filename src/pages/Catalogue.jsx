import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductContext';
import { useSearch } from '../contexts/SearchContext';
import styles from './Catalogue.module.css';

const categories = ['Toutes', 'Coutellerie', 'Cuisson', 'Électroménager', 'Accessoires'];

const Catalogue = () => {
  const { addToCart } = useCart();
  const { products } = useProducts();
  const { globalSearchQuery, setGlobalSearchQuery, shouldFocusSearch, clearSearchFocus } = useSearch();
  const [activeCategory, setActiveCategory] = useState('Toutes');
  
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (shouldFocusSearch && searchInputRef.current) {
      searchInputRef.current.focus();
      clearSearchFocus();
      // Scroll to avoid banner covering it
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  }, [shouldFocusSearch, clearSearchFocus]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'Toutes' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(globalSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={styles.catalogueContainer}>
      {/* Header Banner */}
      <div className={styles.banner}>
        <div className="container">
          <h1 className={styles.title}>Notre Collection</h1>
          <p className={styles.subtitle}>L'exigence professionnelle, pour tous.</p>
        </div>
      </div>

      <div className={`container ${styles.content}`}>
        {/* Filters Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.filterGroup}>
            <h3>Recherche</h3>
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Chercher un équipement..." 
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <h3>Catégories</h3>
            <ul className={styles.categoryList}>
              {categories.map(cat => (
                <li key={cat}>
                  <button 
                    className={`${styles.categoryBtn} ${activeCategory === cat ? styles.active : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product Grid */}
        <main className={styles.productGrid}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <Link to={`/produit/${product.id}`} key={product.id} className={styles.productCard}>
                <div 
                  className={styles.productImage} 
                  style={{ backgroundImage: `url(${product.image})` }}
                >
                  <div className={styles.productOverlay}>
                    <button className="btn btn-primary">Aperçu Rapide</button>
                  </div>
                </div>
                <div className={styles.productInfo}>
                  <span className={styles.productCategory}>{product.category}</span>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <div className={styles.productFooter}>
                    <span className={styles.productPrice}>{product.price.toFixed(2)} €</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className={styles.noResults}>
              <p>Aucun produit ne correspond à votre recherche.</p>
              <button 
                className="btn btn-outline" 
                onClick={() => {setGlobalSearchQuery(''); setActiveCategory('Toutes')}}
                style={{ marginTop: '1rem' }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Catalogue;
