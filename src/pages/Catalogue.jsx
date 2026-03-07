import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Catalogue.module.css';

// Mock data based on lacavernedupro.fr
const mockProducts = [
  { id: 1, name: 'Couteau de Chef Japonais 20cm', category: 'Coutellerie', price: 129.99, image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', description: 'Acier damas 67 couches, manche en bois d\'olivier.' },
  { id: 2, name: 'Batterie de Cuisine Inox 5 Pièces', category: 'Cuisson', price: 299.00, image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', description: 'Qualité professionnelle, compatible tous feux dont induction.' },
  { id: 3, name: 'Robot Pâtissier Multifonction', category: 'Électroménager', price: 450.00, image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', description: 'Moteur professionnel 1200W, bol inox 5L.' },
  { id: 4, name: 'Planche à Découper Billot', category: 'Accessoires', price: 89.50, image: 'https://images.unsplash.com/photo-1601001815894-ea1f16cb0c24?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', description: 'Bois de bout de noyer massif, fabrication artisanale.' },
  { id: 5, name: 'Poêle En Fonte Émaillée 28cm', category: 'Cuisson', price: 145.00, image: 'https://images.unsplash.com/photo-1546875938-16e625d97f37?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', description: 'Répartition parfaite de la chaleur, idéale pour saisir.' },
  { id: 6, name: 'Mallette Couteaux Pro 12 Pièces', category: 'Coutellerie', price: 350.00, image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', description: 'Kit complet pour apprentis et chefs confirmés.' },
];

const categories = ['Toutes', 'Coutellerie', 'Cuisson', 'Électroménager', 'Accessoires'];

const Catalogue = () => {
  const [activeCategory, setActiveCategory] = useState('Toutes');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = mockProducts.filter(product => {
    const matchesCategory = activeCategory === 'Toutes' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
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
              type="text" 
              placeholder="Chercher un équipement..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                    <button className={styles.addToCartBtn} aria-label="Ajouter au panier" onClick={(e) => e.preventDefault()}>
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path><line x1="10" y1="11" x2="18" y2="11"></line><line x1="14" y1="7" x2="14" y2="15"></line></svg>
                    </button>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className={styles.noResults}>
              <p>Aucun produit ne correspond à votre recherche.</p>
              <button 
                className="btn btn-outline" 
                onClick={() => {setSearchQuery(''); setActiveCategory('Toutes')}}
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
