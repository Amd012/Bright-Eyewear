import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Breadcrumb from './components/Breadcrumb';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Collection from './pages/Collection';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ToastProvider>
      <div className="app">
        <ScrollToTop />
        <Navbar />
        <Breadcrumb />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection/:category?" element={<Collection />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </ToastProvider>
  );
}