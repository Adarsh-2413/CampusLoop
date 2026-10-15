import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';

// Pages
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { SellPage } from './pages/SellPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Scroll to top helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white">
              <ScrollToTop />
              <Navbar />
              
              <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/sell" element={<SellPage />} />
                  <Route path="/seller" element={<SellerDashboardPage />} />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>

              <Footer />
              <ToastContainer />
            </div>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
