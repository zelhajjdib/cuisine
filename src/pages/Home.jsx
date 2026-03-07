import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';
import { ArrowRight } from 'lucide-react';

const Home = () => {
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
            {/* These will be replaced by dynamic categories */}
            <div className={styles.card}>
              <div className={styles.cardImage}></div>
              <div className={styles.cardContent}>
                <h3>Coutellerie d'Exception</h3>
                <Link to="/catalogue" className={styles.link}>Explorer</Link>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardImage}></div>
              <div className={styles.cardContent}>
                <h3>Cuisson Haute Performance</h3>
                <Link to="/catalogue" className={styles.link}>Explorer</Link>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardImage}></div>
              <div className={styles.cardContent}>
                <h3>Petit Électroménager</h3>
                <Link to="/catalogue" className={styles.link}>Explorer</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
