import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ProductDetail.module.css';

// We reuse the same mock data for now. In a real app this would come from a Supabase fetch
const mockProducts = [
  { id: 1, name: 'Couteau de Chef Japonais 20cm', category: 'Coutellerie', price: 129.99, image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', description: 'Acier damas 67 couches, manche en bois d\'olivier. Idéal pour toutes les découpes de précision en cuisine professionnelle.', stock: 12 },
  { id: 2, name: 'Batterie de Cuisine Inox 5 Pièces', category: 'Cuisson', price: 299.00, image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', description: 'Qualité professionnelle, compatible tous feux dont induction. Acier inoxydable 18/10 pour une durabilité exceptionnelle.', stock: 5 },
  { id: 3, name: 'Robot Pâtissier Multifonction', category: 'Électroménager', price: 450.00, image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', description: 'Moteur professionnel 1200W, bol inox 5L. Le compagnon indispensable pour des pâtisseries réussies à tous les coups.', stock: 3 },
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  // In real life, find would be replaced by an API call based on ID
  const product = mockProducts.find(p => p.id === parseInt(id || '1')) || mockProducts[0];

  const handleDecrease = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  const handleIncrease = () => setQuantity(prev => (prev < product.stock ? prev + 1 : prev));

  return (
    <div className={styles.productContainer}>
      <div className="container">
        
        <button onClick={() => navigate('/catalogue')} className={styles.backBtn}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Retour au catalogue
        </button>

        <div className={styles.grid}>
          {/* Image Gallery Column */}
          <div className={styles.imageColumn}>
            <div 
              className={styles.mainImage}
              style={{ backgroundImage: `url(${product.image})` }}
            ></div>
          </div>

          {/* Product Info Column */}
          <div className={styles.infoColumn}>
            <div className={styles.categoryBadge}>{product.category}</div>
            <h1 className={styles.title}>{product.name}</h1>
            <div className={styles.price}>{product.price.toFixed(2)} €</div>
            
            <p className={styles.description}>
              {product.description}
            </p>

            <div className={styles.stockStatus}>
              {product.stock > 0 ? (
                <span className={styles.inStock}>En stock ({product.stock} disponibles)</span>
              ) : (
                <span className={styles.outOfStock}>Rupture de stock temporaire</span>
              )}
            </div>

            <div className={styles.actionsBox}>
              <div className={styles.quantitySelector}>
                <button onClick={handleDecrease} disabled={quantity <= 1}>-</button>
                <span>{quantity}</span>
                <button onClick={handleIncrease} disabled={quantity >= product.stock}>+</button>
              </div>
              
              <button 
                className={`btn btn-accent ${styles.addToCartBtn}`}
                disabled={product.stock === 0}
              >
                Ajouter au panier
              </button>
            </div>
            
            <div className={styles.securityPromises}>
              <div className={styles.promise}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Paiement ultra-sécurisé (Stripe)
              </div>
              <div className={styles.promise}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Expédition sous 24/48h
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
