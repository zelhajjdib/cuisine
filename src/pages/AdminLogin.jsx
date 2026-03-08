import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './AdminLogin.module.css';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (isAdmin) {
    navigate('/admin/dashboard');
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(password)) {
      navigate('/admin/dashboard');
    } else {
      setError('Mot de passe incorrect');
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.logo}>
          <span className={styles.brandName}>LA CAVERNE DU PRO</span>
          <span className={styles.adminBadge}>Administration</span>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Mot de passe Administrateur</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez votre mot de passe"
              className={error ? styles.inputError : ''}
              autoFocus
            />
            {error && <span className={styles.errorMessage}>{error}</span>}
          </div>
          
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
            Connexion au tableau de bord
          </button>
        </form>
        
        <div className={styles.backLink}>
          <button onClick={() => navigate('/')}>&larr; Retour au site public</button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
