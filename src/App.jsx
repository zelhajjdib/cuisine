import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';
import { SearchProvider } from './contexts/SearchContext';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <SearchProvider>
        <CartProvider>
        <HashRouter>
          <ScrollToTop />
          <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="catalogue" element={<Catalogue />} />
            <Route path="produit/:id" element={<ProductDetail />} />
            <Route path="panier" element={<Cart />} />
            <Route path="contact" element={<Contact />} />
          </Route>
          
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
        </Routes>
        </HashRouter>
        </CartProvider>
        </SearchProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
