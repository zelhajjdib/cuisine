import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import styles from './CheckoutModal.module.css';

const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL;

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      fontFamily: '"Inter", sans-serif',
      color: '#1a1a1a',
      '::placeholder': { color: '#aab7c4' },
      iconColor: '#c6a87c',
    },
    invalid: { color: '#c62828', iconColor: '#c62828' },
  },
};

const CheckoutModal = ({ isOpen, onClose, cartItems, cartTotalAmount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cardError, setCardError] = useState('');
  const [formError, setFormError] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    if (!name.trim() || !email.trim()) {
      setFormError('Veuillez remplir votre nom et votre email.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Veuillez entrer une adresse email valide.');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setProcessing(true);
    setCardError('');

    // ── Mode démo : pas de paiement réel ──────────────────────────────────
    if (DEMO_MODE) {
      onSuccess({ name: name.trim(), email: email.trim(), phone: phone.trim() });
      setProcessing(false);
      return;
    }

    // ── Mode production : Stripe PaymentIntent ─────────────────────────────
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);

    let clientSecret;
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const items = cartItems.map(item => ({ id: item.id, quantity: item.quantity }));

      const res = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          items,
          customer_name: name.trim(),
          customer_email: email.trim(),
          customer_phone: phone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCardError(data.error || 'Erreur lors de la création du paiement.');
        setProcessing(false);
        return;
      }
      clientSecret = data.clientSecret;
    } catch {
      setCardError('Impossible de contacter le serveur. Vérifiez votre connexion.');
      setProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: { name: name.trim(), email: email.trim() },
      },
    });

    if (error) {
      setCardError(error.message);
      setProcessing(false);
      return;
    }

    onSuccess({ name: name.trim(), email: email.trim(), phone: phone.trim(), paymentIntentId: paymentIntent.id });
    setProcessing(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <h2>Finaliser la commande</h2>
            <p className={styles.totalLine}>
              Total : <strong>{cartTotalAmount.toFixed(2)} €</strong>
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} disabled={processing}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Récapitulatif articles */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Votre commande</h3>
            <ul className={styles.itemsList}>
              {cartItems.map(item => (
                <li key={item.id} className={styles.orderItem}>
                  <span className={styles.itemName}>{item.quantity}× {item.name}</span>
                  <span className={styles.itemPrice}>{(item.price * item.quantity).toFixed(2)} €</span>
                </li>
              ))}
            </ul>
            <div className={styles.orderTotal}>
              <span>Total TTC</span>
              <span>{cartTotalAmount.toFixed(2)} €</span>
            </div>
          </div>

          {/* Infos client */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Vos coordonnées</h3>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="checkout-name">Nom complet *</label>
                <input
                  id="checkout-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jean Dupont"
                  disabled={processing}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="checkout-phone">Téléphone</label>
                <input
                  id="checkout-phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="06 00 00 00 00"
                  disabled={processing}
                />
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="checkout-email">Adresse email *</label>
              <input
                id="checkout-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jean@exemple.fr"
                disabled={processing}
              />
            </div>
            {formError && <p className={styles.errorMsg}>{formError}</p>}
          </div>

          {/* Paiement Stripe — masqué en mode démo */}
          {!DEMO_MODE && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'middle'}}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Informations de paiement
              </h3>
              <div className={styles.cardWrapper}>
                <CardElement options={CARD_ELEMENT_OPTIONS} />
              </div>
              {cardError && <p className={styles.errorMsg}>{cardError}</p>}
              <p className={styles.secureNote}>
                Paiement 100% sécurisé · Cryptage SSL · Propulsé par Stripe
              </p>
            </div>
          )}

          {DEMO_MODE && (
            <p className={styles.secureNote} style={{textAlign:'center', padding: '0 1rem'}}>
              Mode démonstration — aucun paiement réel débité
            </p>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={processing}>
              Retour au panier
            </button>
            <button type="submit" className={styles.payBtn} disabled={processing}>
              {processing ? (
                <span className={styles.loadingDots}>Traitement<span>.</span><span>.</span><span>.</span></span>
              ) : DEMO_MODE ? (
                `Confirmer la commande · ${cartTotalAmount.toFixed(2)} €`
              ) : (
                `Payer · ${cartTotalAmount.toFixed(2)} €`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
