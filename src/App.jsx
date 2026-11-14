import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { OrdersProvider } from './context/OrdersContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProfilePage } from './pages/ProfilePage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { AuthPage } from './pages/AuthPage';
import { AdminPage } from './pages/AdminPage';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname, search } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}


// Global Scroll Reveal Manager: Smoothly Fades In and Slides Up sections while scrolling
function ScrollRevealManager() {
  const location = useLocation();

  React.useEffect(() => {
    // Observe sections and scroll-reveal targets
    const targets = document.querySelectorAll('section, .scroll-reveal-target, .blooming-flower-container');
    targets.forEach(el => {
      if (!el.classList.contains('scroll-reveal')) {
        el.classList.add('scroll-reveal');
      }
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    const elementsToObserve = document.querySelectorAll('.scroll-reveal');
    elementsToObserve.forEach(el => observer.observe(el));

    return () => {
      elementsToObserve.forEach(el => observer.unobserve(el));
      observer.disconnect();
    };
  }, [location.pathname, location.search]);

  return null;
}

function AppLayout({ showToast, toastMessage, setToastMessage }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isHome = location.pathname === '/';

  return (
    <>
      <ScrollToTop />
      <ScrollRevealManager />
      {!isAdmin && <Navbar />}
      
      <main className={!isAdmin && !isHome ? 'floral-watercolor-bg' : ''}>
        <Routes>
          <Route path="/" element={<HomePage onShowToast={showToast} />} />
          <Route path="/shop" element={<ShopPage onShowToast={showToast} />} />
          <Route path="/product/:id" element={<ProductDetailPage onShowToast={showToast} />} />
          <Route path="/cart" element={<CartPage onShowToast={showToast} />} />
          <Route path="/wishlist" element={<WishlistPage onShowToast={showToast} />} />
          <Route path="/checkout" element={<CheckoutPage onShowToast={showToast} />} />
          <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage onShowToast={showToast} />} />
          <Route path="/dashboard" element={<UserDashboardPage onShowToast={showToast} />} />
          <Route path="/user-dashboard" element={<UserDashboardPage onShowToast={showToast} />} />
          <Route path="/auth" element={<AuthPage onShowToast={showToast} />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAdmin && <Footer />}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </>
  );
}

export function App() {
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <OrdersProvider>
            <Router>
              <AppLayout
                showToast={showToast}
                toastMessage={toastMessage}
                setToastMessage={setToastMessage}
              />
            </Router>
          </OrdersProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
