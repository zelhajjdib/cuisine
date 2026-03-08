import React, { useState } from 'react';
import styles from './Contact.module.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate sending an email
    setStatus('sending');
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.contactContainer}>
      <div className={styles.banner}>
        <div className="container">
          <h1 className={styles.title}>Contactez-nous</h1>
          <p className={styles.subtitle}>Notre équipe d'experts est à votre disposition.</p>
        </div>
      </div>

      <div className={`container ${styles.content}`}>
        <div className={styles.grid}>
          {/* Info Column */}
          <div className={styles.infoColumn}>
            <h2>La Caverne Du Pro</h2>
            <p className={styles.description}>
              Besoin de renseignements sur un produit ? Un conseil d'équipement pour votre nouvelle cuisine ? 
              Notre service de professionnels vous répond sous 24h.
            </p>

            <div className={styles.contactDetails}>
              <div className={styles.detailItem}>
                <div className={styles.iconWrapper}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <div>
                  <h3>Téléphone</h3>
                  <p>01 23 45 67 89</p>
                  <span className={styles.subtext}>Lun-Ven, 9h-18h</span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.iconWrapper}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div>
                  <h3>Email</h3>
                  <p>contact@lacavernedupro.fr</p>
                  <span className={styles.subtext}>Nous répondons sous 24h</span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.iconWrapper}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div>
                  <h3>Siège Social</h3>
                  <p>15 Rue des Chefs Étoilés</p>
                  <p>75008 Paris, France</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className={styles.formColumn}>
            <div className={styles.formCard}>
              <h2>Envoyez-nous un message</h2>
              
              {status === 'success' ? (
                <div className={styles.successMessage}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <h3>Message envoyé !</h3>
                  <p>Notre équipe vous répondra dans les plus brefs délais.</p>
                  <button onClick={() => setStatus(null)} className="btn btn-primary" style={{marginTop: '1rem'}}>
                    Nouveau message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Nom complet</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Chef Gordon"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email">Adresse Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="gordon@restaurant.com"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="subject">Sujet</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>Sélectionnez un motif</option>
                      <option value="Devis">Demande de devis</option>
                      <option value="Info Produit">Question sur un équipement</option>
                      <option value="SAV">Service Après Vente</option>
                      <option value="Partenariat">Partenariat B2B</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      placeholder="Votre message ici..."
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{width: '100%', marginTop: '0.5rem'}}
                    disabled={status === 'sending'}
                  >
                    {status === 'sending' ? 'Envoi en cours...' : 'Envoyer le message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
