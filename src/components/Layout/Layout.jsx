import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

const Layout = () => {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={`container ${styles.headerContent}`}>
          <div className={styles.logo}>
            {/* The user will provide the logo. For now, an elegant text fallback */}
            <span className={styles.brandName}>LA CAVERNE DU PRO</span>
          </div>
          
          <nav className={styles.nav}>
            <ul className={styles.navList}>
              <li><a href="/" className={styles.navLink}>Accueil</a></li>
              <li><a href="/catalogue" className={styles.navLink}>Catalogue</a></li>
              <li><a href="/contact" className={styles.navLink}>Contact</a></li>
            </ul>
          </nav>

          <div className={styles.actions}>
            <button className={styles.iconButton} aria-label="Recherche">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
            <button className={styles.iconButton} aria-label="Panier">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span className={styles.cartBadge}>0</span>
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={`container ${styles.footerGrid}`}>
          <div>
            <h3 className={styles.footerTitle}>La Caverne du Pro</h3>
            <p className={styles.footerText}>
              Équipement de cuisine professionnel pour les passionnés et les experts de la gastronomie.
            </p>
          </div>
          <div>
            <h4 className={styles.footerSubtitle}>Liens Rapides</h4>
            <ul className={styles.footerLinks}>
              <li><a href="/">Accueil</a></li>
              <li><a href="/catalogue">Catalogue complet</a></li>
              <li><a href="/cgv">CGV</a></li>
            </ul>
          </div>
          <div>
            <h4 className={styles.footerSubtitle}>Contact</h4>
            <ul className={styles.footerLinks}>
              <li>contact@lacavernedupro.fr</li>
              <li>01 23 45 67 89</li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} La Caverne du Pro. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
