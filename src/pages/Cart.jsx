import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductContext';
import { useOrders } from '../contexts/OrderContext';
import CheckoutModal from '../components/CheckoutModal/CheckoutModal';
import styles from './Cart.module.css';

// Remplacer par votre clé publique Stripe (tableau de bord Stripe > Développeurs > Clés API)
const stripePromise = loadStripe('pk_test_VOTRE_CLE_PUBLIQUE_STRIPE_ICI');

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotalAmount, clearCart } = useCart();
  const { products, updateProduct } = useProducts();
  const { addOrder } = useOrders();
  const navigate = useNavigate();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleCheckoutSuccess = (customerInfo) => {
    const orderData = {
      items: [...cartItems],
      totalAmount: cartTotalAmount,
      status: 'En attente',
      customer: customerInfo,
    };

    cartItems.forEach(cartItem => {
      const realProduct = products.find(p => p.id === cartItem.id);
      if (realProduct) {
        const newStock = Math.max(0, realProduct.stock - cartItem.quantity);
        updateProduct(realProduct.id, { stock: newStock });
      }
    });

    addOrder(orderData);
    setIsCheckoutOpen(false);
    clearCart();
    navigate('/');
    setTimeout(() => {
      alert(`Commande confirmée ! Vous recevrez un email de confirmation à ${customerInfo.email}.\nL'administrateur va traiter votre commande.`);
    }, 100);
  };

  if (cartItems.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <div className="container">
          <h2>Votre panier est vide</h2>
          <p>Découvrez notre sélection de matériel professionnel pour trouver votre bonheur.</p>
          <button className="btn btn-primary" onClick={() => navigate('/catalogue')}>
            Retour au catalogue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartPage}>
      <div className="container">
        <h1 className={styles.title}>Votre Panier</h1>

        <div className={styles.cartLayout}>
          {/* Liste des articles */}
          <div className={styles.itemsSection}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div
                  className={styles.itemImage}
                  style={{ backgroundImage: `url(${item.image})` }}
                  onClick={() => navigate(`/produit/${item.id}`)}
                ></div>

                <div className={styles.itemDetails}>
                  <div className={styles.itemHeader}>
                    <h3 onClick={() => navigate(`/produit/${item.id}`)}>{item.name}</h3>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Supprimer l'article"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>

                  <div className={styles.itemCategory}>{item.category}</div>

                  <div className={styles.itemFooter}>
                    <div className={styles.quantitySelector}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <div className={styles.itemPrice}>
                      {(item.price * item.quantity).toFixed(2)} €
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Résumé commande */}
          <div className={styles.summarySection}>
            <div className={styles.summaryCard}>
              <h3>Récapitulatif</h3>

              <div className={styles.summaryRow}>
                <span>Sous-total</span>
                <span>{cartTotalAmount.toFixed(2)} €</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Livraison</span>
                <span>Calculé à l'étape suivante</span>
              </div>

              <div className={styles.summaryTotal}>
                <span>Total estimé</span>
                <span>{cartTotalAmount.toFixed(2)} €</span>
              </div>

              <button
                className="btn btn-accent"
                style={{ width: '100%' }}
                onClick={() => setIsCheckoutOpen(true)}
              >
                Procéder au paiement
              </button>

              <div className={styles.securePayment}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Paiement sécurisé par Stripe
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de paiement Stripe */}
      <Elements stripe={stripePromise}>
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cartItems}
          cartTotalAmount={cartTotalAmount}
          onSuccess={handleCheckoutSuccess}
        />
      </Elements>
    </div>
  );
};

export default Cart;
