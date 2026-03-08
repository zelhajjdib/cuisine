import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductContext';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products } = useProducts();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Find the dynamically populated product instead of mocked
  const product = products.find(p => p.id === parseInt(id || '1'));

  if (!product) {
    return <div className="container" style={{padding: '100px 0'}}>Produit introuvable.</div>;
  }

  const handleDecrease = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  const handleIncrease = () => setQuantity(prev => (prev < product.stock ? prev + 1 : prev));

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

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
                onClick={handleAddToCart}
              >
                {added ? 'Ajouté !' : 'Ajouter au panier'}
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
