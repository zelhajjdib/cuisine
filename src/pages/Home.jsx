import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import styles from './Home.module.css';
import { ArrowRight } from 'lucide-react';

const Home = () => {
  const { products } = useProducts();
  
  // Get 3 best sellers (mock logic: first 3 products for now)
  const bestSellers = products.slice(0, 3);

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <span className={`${styles.subtitle} animate-fade-in`}>La perfection à portée de main</span>
          <h1 className={`${styles.title} animate-fade-in`} style={{ animationDelay: '0.2s' }}>
            L'Équipement des<br />Grands Chefs
          </h1>
          <p className={`${styles.description} animate-fade-in`} style={{ animationDelay: '0.4s' }}>
            Découvrez notre sélection de matériel de cuisine haut de gamme pour sublimer vos créations culinaires.
          </p>
          <div className={`${styles.actions} animate-fade-in`} style={{ animationDelay: '0.6s' }}>
            <Link to="/catalogue" className="btn btn-accent">
              Découvrir le catalogue <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories Placeholder */}
      <section className={styles.categories}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>L'Excellence Culinaire</h2>
            <p>Tout ce dont vous avez besoin pour équiper votre cuisine avec le plus grand soin.</p>
          </div>
          <div className={styles.grid}>
            <Link to="/catalogue" className={styles.card}>
              <div className={styles.cardImage}></div>
              <div className={styles.cardContent}>
                <h3>Coutellerie d'Exception</h3>
                <span className={styles.link}>Explorer</span>
              </div>
            </Link>
            <Link to="/catalogue" className={styles.card}>
              <div className={styles.cardImage}></div>
              <div className={styles.cardContent}>
                <h3>Cuisson & Inox</h3>
                <span className={styles.link}>Explorer</span>
              </div>
            </Link>
            <Link to="/catalogue" className={styles.card}>
              <div className={styles.cardImage}></div>
              <div className={styles.cardContent}>
                <h3>Matériel Électrique</h3>
                <span className={styles.link}>Explorer</span>
              </div>
            </Link>
            <Link to="/catalogue" className={styles.card}>
              <div className={styles.cardImage}></div>
              <div className={styles.cardContent}>
                <h3>Plonge & Entretien</h3>
                <span className={styles.link}>Explorer</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products / Best Sellers */}
      <section className={styles.bestSellers}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Les Indispensables du Chef</h2>
            <p>Nos meilleures ventes, sélectionnées et approuvées par les professionnels.</p>
          </div>
          
          <div className={styles.productCarousel}>
            {bestSellers.map(product => (
              <Link to={`/produit/${product.id}`} key={product.id} className={styles.productCard}>
                <div 
                  className={styles.productImage} 
                  style={{ backgroundImage: `url(${product.image})` }}
                ></div>
                <div className={styles.productInfo}>
                  <span className={styles.productCategory}>{product.category}</span>
                  <h4>{product.name}</h4>
                  <span className={styles.productPrice}>{product.price.toFixed(2)} €</span>
                </div>
              </Link>
            ))}
          </div>
          
          <div className={styles.centerAction}>
            <Link to="/catalogue" className="btn btn-outline">Voir tout le catalogue</Link>
          </div>
        </div>
      </section>

      {/* Reassurance Banner */}
      <section className={styles.reassurance}>
        <div className="container">
          <div className={styles.reassuranceGrid}>
            <div className={styles.reassuranceItem}>
              <div className={styles.iconCircle}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              </div>
              <h3>Livraison Rapide</h3>
              <p>Expédition sous 24/48h pour les professionnels.</p>
            </div>
            
            <div className={styles.reassuranceItem}>
              <div className={styles.iconCircle}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <h3>Paiement Sécurisé</h3>
              <p>Transactions 100% sécurisées via Stripe.</p>
            </div>
            
            <div className={styles.reassuranceItem}>
              <div className={styles.iconCircle}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <h3>Qualité Pro</h3>
              <p>Matériel garanti et approuvé par les chefs.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
