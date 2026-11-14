import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  MapPin,
  Sparkles,
  Calendar,
  Truck,
  RotateCcw,
  Headphones,
  ChevronRight,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  Clock,
  Package,
  Eye,
  X,
  Plus,
  AlertCircle,
  CreditCard,
  User,
  Gift,
  Trash2,
  Phone,
  Mail,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getStoredProducts } from '../services/productsService';

export const UserDashboardPage = ({ onShowToast }) => {
  const { currentUser, logout } = useAuth();
  const { orders, deleteOrder } = useOrders();
  const { wishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);

  const handleConfirmDeleteOrder = async () => {
    if (!orderToDelete || isDeletingOrder) return;
    setIsDeletingOrder(true);
    try {
      await deleteOrder(orderToDelete.orderId);
      if (onShowToast) {
        onShowToast(`Order #${orderToDelete.orderId} cancelled and removed.`);
      }
      setOrderToDelete(null);
    } catch (err) {
      if (onShowToast) {
        onShowToast(err?.message || 'Could not delete order. Please try again.');
      }
    } finally {
      setIsDeletingOrder(false);
    }
  };

  // Auth Guard: redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'wishlist' | 'addresses' | 'reminders'
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    title: '',
    occasion: 'Birthday',
    date: '',
    flowerPreference: 'Rose Bouquet'
  });

  // Upcoming occasions list (customizable by user)
  const [occasionsList, setOccasionsList] = useState([
    {
      id: 'occ-1',
      title: "Mom's Birthday",
      occasion: 'Birthday',
      date: 'Next Saturday (Oct 18)',
      flowerPreference: 'Pink Rose Bouquet',
      link: '/shop?flower=Roses'
    },
    {
      id: 'occ-2',
      title: 'Wedding Anniversary',
      occasion: 'Anniversary',
      date: 'In 2 Weeks (Nov 02)',
      flowerPreference: 'Royal White Orchids & Lilies',
      link: '/shop?occasion=Anniversary'
    },
    {
      id: 'occ-3',
      title: "Best Friend's Housewarming",
      occasion: 'Housewarming',
      date: 'Next Month (Nov 24)',
      flowerPreference: 'Lotus Trio & Indoor Pot',
      link: '/shop?occasion=Housewarming'
    }
  ]);

  // Load all products to resolve wishlist previews
  const allProducts = useMemo(() => getStoredProducts(), []);

  // Filter wishlist products
  const wishlistProducts = useMemo(() => {
    if (!wishlist || wishlist.length === 0) return [];
    return allProducts.filter(p => wishlist.includes(p.id));
  }, [wishlist, allProducts]);

  if (!currentUser) {
    return null;
  }

  const userName = currentUser.fullName || currentUser.displayName || 'Flower Lover';
  const userInitial = (userName[0] || 'A').toUpperCase();
  const userEmail = currentUser.email || 'user@example.com';
  const userPhone = currentUser.phoneNumber || '+91 98765 43210';
  const addresses = currentUser.addresses || [];
  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0] || {
    label: 'Home',
    name: userName,
    phone: userPhone,
    addressLine: 'Flat 402, Lotus Residency, Link Road',
    city: currentUser.city || 'Mumbai',
    pincode: currentUser.pincode || '400053',
    state: currentUser.state || 'Maharashtra'
  };

  // Stats
  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const wishlistCount = wishlist.length;
  const savedAddressesCount = addresses.length > 0 ? addresses.length : 1;
  const rewardPoints = 250; // ₹250 Floora Rewards

  // Handle 1-click Reorder
  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;
    order.items.forEach(item => {
      // Find full product details or fallback
      const prod = allProducts.find(p => p.id === item.id) || {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: 'Bouquets'
      };
      addToCart(prod, item.quantity || 1);
    });
    if (onShowToast) onShowToast(`Added items from order ${order.orderId} to your cart! 🌸`);
    navigate('/cart');
  };

  // Handle Add Reminder
  const handleSaveReminder = (e) => {
    e.preventDefault();
    if (!reminderForm.title || !reminderForm.date) return;
    const newRem = {
      id: `occ-${Date.now()}`,
      title: reminderForm.title,
      occasion: reminderForm.occasion,
      date: reminderForm.date,
      flowerPreference: reminderForm.flowerPreference,
      link: `/shop?occasion=${encodeURIComponent(reminderForm.occasion)}`
    };
    setOccasionsList([newRem, ...occasionsList]);
    setShowAddReminderModal(false);
    setReminderForm({ title: '', occasion: 'Birthday', date: '', flowerPreference: 'Rose Bouquet' });
    if (onShowToast) onShowToast(`Reminder for "${newRem.title}" added successfully! 🎂`);
  };

  // Helper status badge styles
  const getStatusBadge = (status) => {
    const s = (status || 'Placed').toLowerCase();
    if (s.includes('delivered')) {
      return { bg: '#E8F5E9', color: '#2E7D32', border: '#C8E6C9', text: 'Delivered' };
    }
    if (s.includes('out for delivery') || s.includes('transit')) {
      return { bg: '#FFF8E1', color: '#B8860B', border: '#FFE082', text: 'Out for Delivery' };
    }
    if (s.includes('packed') || s.includes('processing')) {
      return { bg: '#FFF3E0', color: '#E65100', border: '#FFCC80', text: 'Packed & Ready' };
    }
    if (s.includes('cancelled')) {
      return { bg: '#FFEBEE', color: '#C62828', border: '#FFCDD2', text: 'Cancelled' };
    }
    return { bg: '#E3F2FD', color: '#1565C0', border: '#BBDEFB', text: 'Placed' };
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem 5rem', maxWidth: '1160px' }}>
      
      {/* 1. BREADCRUMB NAVIGATION */}
      <nav 
        aria-label="Breadcrumb"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.88rem',
          color: 'var(--text-muted)',
          marginBottom: '1.75rem'
        }}
      >
        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={14} />
        <Link to="/profile" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Profile</Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>User Dashboard</span>
      </nav>

      {/* 2. WELCOME BANNER (Glassmorphic Luxury Hero) */}
      <div 
        className="dashboard-welcome-banner"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(234, 220, 203, 0.85)',
          borderRadius: '24px',
          padding: '2rem 2.25rem',
          boxShadow: '0 10px 30px rgba(45, 37, 32, 0.05)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative corner bloom */}
        <div 
          style={{
            position: 'absolute',
            right: '-15px',
            bottom: '-25px',
            opacity: 0.12,
            fontSize: '8rem',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          🌸
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', zIndex: 2 }}>
          {/* Avatar circle */}
          <div 
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: '#C5A97A',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.9rem',
              fontWeight: 700,
              boxShadow: '0 4px 16px rgba(197, 169, 122, 0.4)',
              border: '3px solid #FFFFFF',
              flexShrink: 0
            }}
          >
            {userInitial}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h1 
                className="font-serif" 
                style={{
                  fontSize: 'clamp(1.45rem, 2.5vw, 1.95rem)',
                  color: '#1C3728',
                  margin: 0,
                  fontWeight: 700,
                  letterSpacing: '-0.015em',
                  lineHeight: 1.2
                }}
              >
                Welcome back, {userName}!
              </h1>
              <span 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  backgroundColor: '#1A3B2A',
                  color: '#FFFFFF',
                  padding: '0.22rem 0.72rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.3px'
                }}
              >
                <Sparkles size={12} style={{ color: '#F4B942' }} />
                <span>Floora Gold Tier</span>
              </span>
            </div>

            <div className="dashboard-user-meta-chips">
              <span className="dashboard-meta-chip">
                <Mail size={13} />
                <span>{userEmail}</span>
              </span>
              <span className="dashboard-meta-chip dashboard-phone-chip">
                <Phone size={13} />
                <span>{userPhone}</span>
              </span>
              <span className="dashboard-meta-chip">
                <Calendar size={13} />
                <span>Member since 2024</span>
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', zIndex: 2 }}>
          <Link 
            to="/profile" 
            className="btn btn-secondary btn-sm"
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '0.6rem 1.25rem',
              fontWeight: 600,
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #EADCCB',
              color: '#1A3B2A'
            }}
          >
            <User size={15} />
            <span>Edit Profile</span>
          </Link>

          <Link 
            to="/shop" 
            className="btn btn-primary btn-sm"
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '0.6rem 1.35rem',
              fontWeight: 600,
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 14px rgba(26, 59, 42, 0.25)'
            }}
          >
            <span>Explore Catalog</span>
            <ArrowRight size={15} />
          </Link>

          <button
            type="button"
            onClick={async () => {
              await logout();
              if (onShowToast) onShowToast('Logged out successfully. 🌸');
              navigate('/auth');
            }}
            className="btn btn-secondary btn-sm"
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '0.6rem 1.15rem',
              fontWeight: 600,
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#FFF5F5',
              border: '1px solid #FFC9C9',
              color: '#E03131',
              cursor: 'pointer'
            }}
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* 3. QUICK STATS CARDS (5 Interactive Metrics) */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}
      >
        {/* Total Orders */}
        <div 
          onClick={() => setActiveTab('orders')}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(12px)',
            borderRadius: '18px',
            padding: '1.35rem 1.25rem',
            border: '1px solid #EADCCB',
            boxShadow: '0 4px 16px rgba(45, 37, 32, 0.04)',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
          className="dashboard-stat-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#6E5D4F', fontWeight: 600 }}>Total Orders</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#E8F5E9', color: '#1A3B2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#1A3B2A', fontFamily: 'var(--font-serif)' }}>
            {totalOrdersCount}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#887569' }}>
            {totalOrdersCount > 0 ? 'All delivered with love' : 'No orders yet'}
          </span>
        </div>

        {/* Active Deliveries */}
        <div 
          onClick={() => setActiveTab('orders')}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(12px)',
            borderRadius: '18px',
            padding: '1.35rem 1.25rem',
            border: '1px solid #EADCCB',
            boxShadow: '0 4px 16px rgba(45, 37, 32, 0.04)',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
          className="dashboard-stat-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#6E5D4F', fontWeight: 600 }}>Active Deliveries</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FFF8E1', color: '#B8860B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#B8860B', fontFamily: 'var(--font-serif)' }}>
            {activeOrdersCount}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#887569' }}>
            {activeOrdersCount > 0 ? 'Tracking live updates' : 'All packages arrived'}
          </span>
        </div>

        {/* Wishlist Items */}
        <div 
          onClick={() => setActiveTab('wishlist')}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(12px)',
            borderRadius: '18px',
            padding: '1.35rem 1.25rem',
            border: '1px solid #EADCCB',
            boxShadow: '0 4px 16px rgba(45, 37, 32, 0.04)',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
          className="dashboard-stat-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#6E5D4F', fontWeight: 600 }}>Saved Wishlist</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FFEBEE', color: '#D62828', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#D62828', fontFamily: 'var(--font-serif)' }}>
            {wishlistCount}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#887569' }}>
            {wishlistCount > 0 ? 'Favorite stems saved' : 'Browse to save stems'}
          </span>
        </div>

        {/* Saved Addresses */}
        <div 
          onClick={() => setActiveTab('addresses')}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(12px)',
            borderRadius: '18px',
            padding: '1.35rem 1.25rem',
            border: '1px solid #EADCCB',
            boxShadow: '0 4px 16px rgba(45, 37, 32, 0.04)',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
          className="dashboard-stat-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#6E5D4F', fontWeight: 600 }}>Saved Addresses</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#F3E5F5', color: '#7B1FA2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#1E1E1E', fontFamily: 'var(--font-serif)' }}>
            {savedAddressesCount}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#887569' }}>
            {defaultAddress.city || 'Mumbai'}, India
          </span>
        </div>

        {/* Reward Points */}
        <div 
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(12px)',
            borderRadius: '18px',
            padding: '1.35rem 1.25rem',
            border: '1px solid #EADCCB',
            boxShadow: '0 4px 16px rgba(45, 37, 32, 0.04)',
            transition: 'var(--transition)'
          }}
          className="dashboard-stat-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#6E5D4F', fontWeight: 600 }}>Floral Rewards</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FFF3E0', color: '#E65100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#C5A97A', fontFamily: 'var(--font-serif)' }}>
            {rewardPoints} Pts
          </div>
          <span style={{ fontSize: '0.78rem', color: '#887569' }}>
            Worth ₹250 on next bloom
          </span>
        </div>
      </div>

      {/* 4. DASHBOARD NAVIGATION TABS */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '2rem',
          borderBottom: '1px solid #ECE0CF',
          scrollbarWidth: 'none'
        }}
        className="dashboard-tabs-bar"
      >
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`dashboard-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
        >
          <LayoutDashboard size={16} />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`dashboard-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
        >
          <ShoppingBag size={16} />
          <span>My Orders ({totalOrdersCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wishlist')}
          className={`dashboard-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
        >
          <Heart size={16} />
          <span>Wishlist ({wishlistCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('addresses')}
          className={`dashboard-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
        >
          <MapPin size={16} />
          <span>Addresses ({savedAddressesCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reminders')}
          className={`dashboard-tab-btn ${activeTab === 'reminders' ? 'active' : ''}`}
        >
          <Calendar size={16} />
          <span>Occasions & Reminders</span>
        </button>
      </div>

      {/* 5. TAB PANELS CONTENT */}

      {/* TAB 1: OVERVIEW */}
      {(activeTab === 'overview') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Recent Orders Section */}
          <section 
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(16px)',
              borderRadius: '22px',
              padding: '1.85rem 2rem',
              border: '1.5px solid #EADCCB',
              boxShadow: '0 8px 24px rgba(45, 37, 32, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 className="font-serif" style={{ fontSize: '1.45rem', color: '#1E1E1E', margin: 0, fontWeight: 700 }}>
                  Recent Orders & Deliveries
                </h2>
                <p style={{ color: '#6E5D4F', fontSize: '0.88rem', margin: '0.2rem 0 0' }}>
                  Live shipment updates and quick 1-click reorder
                </p>
              </div>
              {orders.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    cursor: 'pointer'
                  }}
                >
                  <span>View All Orders</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>

            {orders.length === 0 ? (
              <div 
                style={{
                  textAlign: 'center',
                  padding: '3rem 1.5rem',
                  backgroundColor: 'rgba(250, 244, 235, 0.6)',
                  borderRadius: '16px',
                  border: '1px dashed #EADCCB'
                }}
              >
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.6rem' }}>🥀</span>
                <h3 className="font-serif" style={{ fontSize: '1.2rem', color: '#1E1E1E', marginBottom: '0.3rem' }}>
                  No orders yet
                </h3>
                <p style={{ color: '#6E5D4F', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto 1.25rem' }}>
                  You haven't ordered any blooms yet. Surprise your loved ones or elevate your living space today!
                </p>
                <Link to="/shop" className="btn btn-primary btn-sm">
                  <span>Start Shopping Blooms</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.slice(0, 3).map(order => {
                  const badge = getStatusBadge(order.status);
                  const firstItem = (order.items && order.items[0]) || {};
                  return (
                    <div 
                      key={order.orderId}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid #ECE0CF',
                        padding: '1.25rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        transition: 'var(--transition)'
                      }}
                      className="dashboard-order-row"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
                        <img 
                          src={firstItem.image || '/flowers/pink_rose_bouquet.jpg'} 
                          alt={firstItem.name || 'Flower'} 
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '12px',
                            objectFit: 'cover',
                            border: '1px solid #EADCCB',
                            backgroundColor: '#FAF5EE'
                          }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span style={{ fontWeight: 700, color: '#1A3B2A', fontSize: '0.96rem' }}>
                              Order #{order.orderId}
                            </span>
                            <span 
                              style={{
                                backgroundColor: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`,
                                borderRadius: '12px',
                                padding: '0.12rem 0.55rem',
                                fontSize: '0.72rem',
                                fontWeight: 600
                              }}
                            >
                              {badge.text}
                            </span>
                          </div>
                          <p style={{ margin: '0.2rem 0 0', color: '#6E5D4F', fontSize: '0.85rem' }}>
                            {firstItem.name || 'Fresh Handpicked Blooms'} 
                            {order.items?.length > 1 && ` +${order.items.length - 1} more`}
                          </p>
                          <span style={{ fontSize: '0.78rem', color: '#887569' }}>
                            Placed on {order.date || 'Recently'}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'right', minWidth: '80px' }}>
                          <span style={{ fontSize: '0.78rem', color: '#6E5D4F', display: 'block' }}>Total Amount</span>
                          <strong style={{ fontSize: '1.05rem', color: '#1A3B2A' }}>₹{order.total || 1299}</strong>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedOrderDetails(order)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.82rem',
                              padding: '0.45rem 0.95rem',
                              border: '1px solid #EADCCB',
                              backgroundColor: '#FAF5EE',
                              color: '#1A3B2A'
                            }}
                          >
                            <Eye size={14} />
                            <span>Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReorder(order)}
                            className="btn btn-primary btn-sm"
                            style={{
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.82rem',
                              padding: '0.45rem 1rem'
                            }}
                          >
                            <RotateCcw size={14} />
                            <span>Reorder</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setOrderToDelete(order)}
                            title="Cancel / Delete Order"
                            aria-label={`Delete Order ${order.orderId}`}
                            className="dashboard-delete-order-btn"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Two-Column Grid: Wishlist Preview & Upcoming Reminders */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '2rem'
            }}
          >
            {/* Wishlist Preview */}
            <section 
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(16px)',
                borderRadius: '22px',
                padding: '1.85rem 2rem',
                border: '1.5px solid #EADCCB',
                boxShadow: '0 8px 24px rgba(45, 37, 32, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3 className="font-serif" style={{ fontSize: '1.3rem', color: '#1E1E1E', margin: 0, fontWeight: 700 }}>
                    My Wishlist
                  </h3>
                  <span style={{ color: '#6E5D4F', fontSize: '0.82rem' }}>
                    {wishlistCount} blooms saved for later
                  </span>
                </div>
                <Link 
                  to="/wishlist" 
                  style={{
                    color: 'var(--primary)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                >
                  <span>View All</span>
                  <ChevronRight size={15} />
                </Link>
              </div>

              {wishlistProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#6E5D4F' }}>
                  <Heart size={32} style={{ color: '#C5A97A', margin: '0 auto 0.5rem', strokeWidth: 1.5 }} />
                  <p style={{ fontSize: '0.88rem', margin: '0 0 1rem' }}>No flowers saved yet</p>
                  <Link to="/shop" className="btn btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
                    Explore Flowers
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {wishlistProducts.slice(0, 3).map(prod => (
                    <div 
                      key={prod.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '14px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #ECE0CF'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img 
                          src={prod.image} 
                          alt={prod.name} 
                          style={{ width: '46px', height: '46px', borderRadius: '10px', objectFit: 'cover' }}
                        />
                        <div>
                          <Link 
                            to={`/product/${prod.id}`} 
                            style={{ fontWeight: 600, color: '#1E1E1E', fontSize: '0.88rem', textDecoration: 'none', display: 'block' }}
                          >
                            {prod.name}
                          </Link>
                          <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.82rem' }}>
                            ₹{prod.price}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          addToCart(prod, 1);
                          if (onShowToast) onShowToast(`Added "${prod.name}" to your cart! 🌸`);
                        }}
                        className="btn btn-primary btn-sm"
                        style={{
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.78rem',
                          padding: '0.35rem 0.8rem'
                        }}
                      >
                        + Cart
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Upcoming Celebrations & Reminders */}
            <section 
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(16px)',
                borderRadius: '22px',
                padding: '1.85rem 2rem',
                border: '1.5px solid #EADCCB',
                boxShadow: '0 8px 24px rgba(45, 37, 32, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3 className="font-serif" style={{ fontSize: '1.3rem', color: '#1E1E1E', margin: 0, fontWeight: 700 }}>
                    Floral Reminders
                  </h3>
                  <span style={{ color: '#6E5D4F', fontSize: '0.82rem' }}>
                    Never miss birthdays & anniversaries
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddReminderModal(true)}
                  style={{
                    backgroundColor: '#FAF5EE',
                    border: '1px solid #EADCCB',
                    borderRadius: '20px',
                    color: '#1A3B2A',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    padding: '0.3rem 0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Plus size={13} />
                  <span>Add Reminder</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {occasionsList.slice(0, 3).map(occ => (
                  <div 
                    key={occ.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '14px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #ECE0CF'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '1rem' }}>🎂</span>
                        <strong style={{ fontSize: '0.88rem', color: '#1E1E1E' }}>{occ.title}</strong>
                      </div>
                      <span style={{ color: '#887569', fontSize: '0.78rem', display: 'block', marginTop: '0.15rem' }}>
                        {occ.date} • Suggested: {occ.flowerPreference}
                      </span>
                    </div>

                    <Link
                      to={occ.link}
                      className="btn btn-secondary btn-sm"
                      style={{
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.78rem',
                        padding: '0.35rem 0.8rem',
                        backgroundColor: '#FAF5EE',
                        border: '1px solid #EADCCB',
                        color: '#1A3B2A'
                      }}
                    >
                      Order Now
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Quick Actions Bar */}
          <section 
            style={{
              backgroundColor: '#FAF4EB',
              borderRadius: '22px',
              padding: '1.75rem 2rem',
              border: '1.5px solid #EADCCB',
              boxShadow: '0 8px 24px rgba(180, 150, 120, 0.08)'
            }}
          >
            <h3 className="font-serif" style={{ fontSize: '1.25rem', color: '#1E1E1E', marginBottom: '1.25rem', fontWeight: 700 }}>
              Quick Concierge & Actions
            </h3>
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}
            >
              <Link 
                to="/orders" 
                className="dashboard-quick-action-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '1rem 1.15rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #ECE0CF',
                  textDecoration: 'none'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E8F5E9', color: '#1A3B2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Truck size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#1E1E1E', display: 'block' }}>Track Order</strong>
                  <span style={{ fontSize: '0.78rem', color: '#6E5D4F' }}>Live van updates</span>
                </div>
              </Link>

              <Link 
                to="/shop?tag=best-sellers" 
                className="dashboard-quick-action-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '1rem 1.15rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #ECE0CF',
                  textDecoration: 'none'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFF3E0', color: '#E65100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RotateCcw size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#1E1E1E', display: 'block' }}>Reorder Blooms</strong>
                  <span style={{ fontSize: '0.78rem', color: '#6E5D4F' }}>Top recurring stems</span>
                </div>
              </Link>

              <button 
                type="button" 
                onClick={() => {
                  if (onShowToast) onShowToast('Floora Concierge is available 24/7 at +91 98765 43210 🌸');
                }}
                className="dashboard-quick-action-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '1rem 1.15rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #ECE0CF',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E3F2FD', color: '#1565C0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Headphones size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#1E1E1E', display: 'block' }}>Floral Support</strong>
                  <span style={{ fontSize: '0.78rem', color: '#6E5D4F' }}>Custom arrangements</span>
                </div>
              </button>

              <Link 
                to="/profile" 
                className="dashboard-quick-action-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '1rem 1.15rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #ECE0CF',
                  textDecoration: 'none'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F3E5F5', color: '#7B1FA2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#1E1E1E', display: 'block' }}>Account Settings</strong>
                  <span style={{ fontSize: '0.78rem', color: '#6E5D4F' }}>Addresses & contact</span>
                </div>
              </Link>
            </div>
          </section>

        </div>
      )}

      {/* TAB 2: ALL ORDERS & TRACKING */}
      {(activeTab === 'orders') && (
        <section 
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(16px)',
            borderRadius: '22px',
            padding: '2rem 2.25rem',
            border: '1.5px solid #EADCCB',
            boxShadow: '0 8px 24px rgba(45, 37, 32, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 className="font-serif" style={{ fontSize: '1.6rem', color: '#1E1E1E', margin: 0, fontWeight: 700 }}>
                My Orders & Deliveries
              </h2>
              <p style={{ color: '#6E5D4F', fontSize: '0.9rem', margin: '0.2rem 0 0' }}>
                Complete order history and live shipment tracking
              </p>
            </div>
            <Link to="/shop" className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
              <span>Order More Blooms</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>🥀</span>
              <h3 className="font-serif" style={{ fontSize: '1.3rem', color: '#1E1E1E', marginBottom: '0.4rem' }}>
                No Orders Placed Yet
              </h3>
              <p style={{ color: '#6E5D4F', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                We haven't received any flower orders for your account yet. Browse our freshly curated bouquets and arrangements!
              </p>
              <Link to="/shop" className="btn btn-primary btn-sm">
                Explore Fresh Blooms
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {orders.map(order => {
                const badge = getStatusBadge(order.status);
                return (
                  <div 
                    key={order.orderId}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '18px',
                      border: '1px solid #ECE0CF',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #F0E6D8', paddingBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 700, color: '#1A3B2A', fontSize: '1.05rem' }}>
                          Order #{order.orderId}
                        </span>
                        <span style={{ color: '#887569', fontSize: '0.85rem' }}>
                          • Placed on {order.date}
                        </span>
                      </div>
                      <span 
                        style={{
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          borderRadius: '12px',
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.78rem',
                          fontWeight: 700
                        }}
                      >
                        {badge.text}
                      </span>
                    </div>

                    {/* Order items list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              style={{ width: '52px', height: '52px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #EADCCB' }}
                            />
                            <div>
                              <strong style={{ fontSize: '0.92rem', color: '#1E1E1E', display: 'block' }}>{item.name}</strong>
                              <span style={{ fontSize: '0.8rem', color: '#6E5D4F' }}>Qty: {item.quantity || 1} • ₹{item.price} each</span>
                            </div>
                          </div>
                          <span style={{ fontWeight: 700, color: '#1A3B2A', fontSize: '0.95rem' }}>
                            ₹{(item.price || 0) * (item.quantity || 1)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid #F0E6D8', paddingTop: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#6E5D4F' }}>
                        <span>Delivery: <strong>{order.deliverySlot || 'Standard Moisture Delivery'}</strong></span>
                        <span style={{ marginLeft: '1rem' }}>Total Paid: <strong style={{ color: '#1A3B2A' }}>₹{order.total}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedOrderDetails(order)}
                          className="btn btn-secondary btn-sm"
                          style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 1rem', fontSize: '0.82rem' }}
                        >
                          <Eye size={14} />
                          <span>View Full Details</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          className="btn btn-primary btn-sm"
                          style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 1.15rem', fontSize: '0.82rem' }}
                        >
                          <RotateCcw size={14} />
                          <span>Reorder All</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderToDelete(order)}
                          title="Cancel / Delete Order"
                          aria-label={`Delete Order ${order.orderId}`}
                          className="dashboard-delete-order-btn"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: WISHLIST PREVIEW */}
      {(activeTab === 'wishlist') && (
        <section 
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(16px)',
            borderRadius: '22px',
            padding: '2rem 2.25rem',
            border: '1.5px solid #EADCCB',
            boxShadow: '0 8px 24px rgba(45, 37, 32, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 className="font-serif" style={{ fontSize: '1.6rem', color: '#1E1E1E', margin: 0, fontWeight: 700 }}>
                My Wishlist ({wishlistCount})
              </h2>
              <p style={{ color: '#6E5D4F', fontSize: '0.9rem', margin: '0.2rem 0 0' }}>
                Blooms you saved to gift or decorate your home with
              </p>
            </div>
            <Link to="/shop" className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
              <span>Browse Catalog</span>
            </Link>
          </div>

          {wishlistProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
              <Heart size={44} style={{ color: '#C5A97A', margin: '0 auto 1rem', strokeWidth: 1.5 }} />
              <h3 className="font-serif" style={{ fontSize: '1.3rem', color: '#1E1E1E', marginBottom: '0.4rem' }}>
                Your Wishlist is Empty
              </h3>
              <p style={{ color: '#6E5D4F', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                Tap the heart icon on any bouquet or stem in the store to save it here for later.
              </p>
              <Link to="/shop" className="btn btn-primary btn-sm">
                Discover Fresh Blooms
              </Link>
            </div>
          ) : (
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1.5rem'
              }}
            >
              {wishlistProducts.map(prod => (
                <div 
                  key={prod.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #ECE0CF',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 12px rgba(45, 37, 32, 0.04)'
                  }}
                >
                  <div>
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      style={{
                        width: '100%',
                        height: '160px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        marginBottom: '0.85rem'
                      }}
                    />
                    <Link to={`/product/${prod.id}`} style={{ textDecoration: 'none' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1E1E1E', margin: '0 0 0.35rem' }}>
                        {prod.name}
                      </h4>
                    </Link>
                    <span style={{ fontSize: '0.8rem', color: '#6E5D4F', display: 'block' }}>
                      {prod.category} • {prod.flowerType || 'Fresh Bloom'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #F0E6D8' }}>
                    <strong style={{ fontSize: '1.05rem', color: '#1A3B2A' }}>₹{prod.price}</strong>
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(prod, 1);
                        if (onShowToast) onShowToast(`Added "${prod.name}" to cart! 🌸`);
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ borderRadius: 'var(--radius-full)', padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                    >
                      + Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 4: SAVED ADDRESSES */}
      {(activeTab === 'addresses') && (
        <section 
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(16px)',
            borderRadius: '22px',
            padding: '2rem 2.25rem',
            border: '1.5px solid #EADCCB',
            boxShadow: '0 8px 24px rgba(45, 37, 32, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 className="font-serif" style={{ fontSize: '1.6rem', color: '#1E1E1E', margin: 0, fontWeight: 700 }}>
                Saved Delivery Addresses
              </h2>
              <p style={{ color: '#6E5D4F', fontSize: '0.9rem', margin: '0.2rem 0 0' }}>
                Manage where your fresh bouquets and floral gifts are shipped
              </p>
            </div>
            <Link 
              to="/profile" 
              className="btn btn-secondary btn-sm"
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '0.55rem 1.25rem',
                backgroundColor: '#FAF5EE',
                border: '1px solid #EADCCB',
                color: '#1A3B2A'
              }}
            >
              <span>Manage in Profile</span>
              <ExternalLink size={14} />
            </Link>
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {/* Primary Address */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1.5px solid #C5A97A',
                padding: '1.5rem',
                boxShadow: '0 4px 16px rgba(197, 169, 122, 0.15)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <span style={{ fontWeight: 700, color: '#1A3B2A', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={16} style={{ color: '#C5A97A' }} />
                  <span>{defaultAddress.label || 'Home'}</span>
                </span>
                <span 
                  style={{
                    backgroundColor: '#E8F5E9',
                    color: '#2E7D32',
                    borderRadius: '10px',
                    padding: '0.15rem 0.55rem',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  Default Address
                </span>
              </div>
              <p style={{ fontWeight: 600, color: '#1E1E1E', margin: '0 0 0.3rem', fontSize: '0.92rem' }}>
                {defaultAddress.name || userName}
              </p>
              <p style={{ color: '#6E5D4F', fontSize: '0.88rem', margin: '0 0 0.3rem', lineHeight: 1.45 }}>
                {defaultAddress.addressLine || 'Flat 402, Lotus Residency, Link Road'}
              </p>
              <p style={{ color: '#6E5D4F', fontSize: '0.88rem', margin: '0 0 0.75rem' }}>
                {defaultAddress.city || 'Mumbai'}, {defaultAddress.state || 'Maharashtra'} - {defaultAddress.pincode || '400053'}
              </p>
              <span style={{ fontSize: '0.85rem', color: '#1A3B2A', fontWeight: 600 }}>
                📞 {defaultAddress.phone || userPhone}
              </span>
            </div>

            {/* Quick Add Placeholder Card */}
            <Link 
              to="/profile"
              style={{
                backgroundColor: 'rgba(250, 244, 235, 0.6)',
                borderRadius: '16px',
                border: '1.5px dashed #EADCCB',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                textDecoration: 'none',
                color: '#6E5D4F',
                minHeight: '180px',
                transition: 'var(--transition)'
              }}
              className="dashboard-add-address-card"
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A3B2A', marginBottom: '0.6rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Plus size={20} />
              </div>
              <strong style={{ fontSize: '0.95rem', color: '#1A3B2A', display: 'block' }}>Add New Address</strong>
              <span style={{ fontSize: '0.8rem', color: '#887569', marginTop: '0.2rem' }}>Deliver to office, parents or friends</span>
            </Link>
          </div>
        </section>
      )}

      {/* TAB 5: REMINDERS & OCCASIONS */}
      {(activeTab === 'reminders') && (
        <section 
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(16px)',
            borderRadius: '22px',
            padding: '2rem 2.25rem',
            border: '1.5px solid #EADCCB',
            boxShadow: '0 8px 24px rgba(45, 37, 32, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 className="font-serif" style={{ fontSize: '1.6rem', color: '#1E1E1E', margin: 0, fontWeight: 700 }}>
                Celebrations & Floral Reminders
              </h2>
              <p style={{ color: '#6E5D4F', fontSize: '0.9rem', margin: '0.2rem 0 0' }}>
                We'll remind you in advance so your fresh surprise arrives right on time
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddReminderModal(true)}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={15} />
              <span>Add Occasion</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {occasionsList.map(occ => (
              <div 
                key={occ.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #ECE0CF',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#FFF3E0', color: '#E65100', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                    🎂
                  </div>
                  <div>
                    <strong style={{ fontSize: '1rem', color: '#1E1E1E' }}>{occ.title}</strong>
                    <div style={{ color: '#6E5D4F', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                      <span>📅 {occ.date}</span> • <span>Category: {occ.occasion}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                      Recommended: {occ.flowerPreference}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Link 
                    to={occ.link} 
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 1.25rem' }}
                  >
                    <span>Order Blooms</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. ORDER DETAILS MODAL */}
      {selectedOrderDetails && (
        <div 
          className="modal-overlay animate-fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem'
          }}
          onClick={() => setSelectedOrderDetails(null)}
        >
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '560px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ECE0CF', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span className="section-subtitle" style={{ margin: 0 }}>Order Summary</span>
                <h3 className="font-serif" style={{ fontSize: '1.35rem', color: '#1A3B2A', margin: '0.2rem 0 0' }}>
                  Order #{selectedOrderDetails.orderId}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedOrderDetails(null)}
                style={{ background: 'none', border: 'none', color: '#887569', cursor: 'pointer', padding: '0.4rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Status Timeline */}
            <div style={{ backgroundColor: '#FAF5EE', borderRadius: '16px', padding: '1rem 1.25rem', marginBottom: '1.25rem', border: '1px solid #EADCCB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#6E5D4F', fontWeight: 600 }}>Shipment Status</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>
                  {selectedOrderDetails.status || 'Placed'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} style={{ color: '#2E7D32' }} />
                <span style={{ fontSize: '0.82rem', color: '#1E1E1E' }}>
                  {selectedOrderDetails.deliverySlot || 'Express 2-Hour Delivery'}
                </span>
              </div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.92rem', color: '#1E1E1E', marginBottom: '0.75rem', fontWeight: 600 }}>Items Ordered:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {selectedOrderDetails.items?.map((it, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #F5ECE0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={it.image} alt={it.name} style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }} />
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: '#1E1E1E', display: 'block' }}>{it.name}</strong>
                        <span style={{ fontSize: '0.78rem', color: '#6E5D4F' }}>Qty: {it.quantity || 1}</span>
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, color: '#1A3B2A', fontSize: '0.9rem' }}>
                      ₹{(it.price || 0) * (it.quantity || 1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE0CF', borderRadius: '14px', padding: '1rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#887569', display: 'block', marginBottom: '0.25rem' }}>Delivery To</span>
              <strong style={{ fontSize: '0.9rem', color: '#1E1E1E' }}>
                {selectedOrderDetails.shippingAddress?.name || userName}
              </strong>
              <p style={{ margin: '0.2rem 0', color: '#6E5D4F', fontSize: '0.85rem' }}>
                {selectedOrderDetails.shippingAddress?.addressLine || defaultAddress.addressLine}, {selectedOrderDetails.shippingAddress?.city || defaultAddress.city} {selectedOrderDetails.shippingAddress?.pincode || defaultAddress.pincode}
              </p>
              <span style={{ fontSize: '0.82rem', color: '#1A3B2A' }}>
                📞 {selectedOrderDetails.shippingAddress?.phone || userPhone}
              </span>
            </div>

            {/* Price Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #ECE0CF' }}>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1E1E' }}>Total Paid</span>
              <strong style={{ fontSize: '1.3rem', color: 'var(--primary)' }}>₹{selectedOrderDetails.total}</strong>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button 
                type="button" 
                onClick={() => {
                  handleReorder(selectedOrderDetails);
                  setSelectedOrderDetails(null);
                }}
                className="btn btn-primary btn-sm"
                style={{ flex: 1, borderRadius: 'var(--radius-full)' }}
              >
                <RotateCcw size={14} />
                <span>Reorder Items</span>
              </button>
              <button 
                type="button" 
                onClick={() => setSelectedOrderDetails(null)}
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. ADD CELEBRATION REMINDER MODAL */}
      {showAddReminderModal && (
        <div 
          className="modal-overlay animate-fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem'
          }}
          onClick={() => setShowAddReminderModal(false)}
        >
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ECE0CF', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
              <h3 className="font-serif" style={{ fontSize: '1.3rem', color: '#1A3B2A', margin: 0 }}>
                Add Celebration Reminder
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddReminderModal(false)}
                style={{ background: 'none', border: 'none', color: '#887569', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveReminder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E1E1E', marginBottom: '0.35rem' }}>
                  Reminder Title (e.g. Sister's Birthday)
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Grandma's 80th Birthday" 
                  value={reminderForm.title}
                  onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                  className="form-input"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #EADCCB' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E1E1E', marginBottom: '0.35rem' }}>
                  Occasion Type
                </label>
                <select 
                  value={reminderForm.occasion}
                  onChange={(e) => setReminderForm({ ...reminderForm, occasion: e.target.value })}
                  className="form-select"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #EADCCB' }}
                >
                  <option value="Birthday">Birthday</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Valentine's Day">Valentine's Day</option>
                  <option value="Mother's Day">Mother's Day</option>
                  <option value="Get Well Soon">Get Well Soon</option>
                  <option value="Congratulations">Congratulations</option>
                  <option value="Housewarming">Housewarming</option>
                  <option value="Corporate / Events">Corporate / Events</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E1E1E', marginBottom: '0.35rem' }}>
                  Date or Timeframe
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. October 28, or In 2 weeks" 
                  value={reminderForm.date}
                  onChange={(e) => setReminderForm({ ...reminderForm, date: e.target.value })}
                  className="form-input"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #EADCCB' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E1E1E', marginBottom: '0.35rem' }}>
                  Preferred Flower or Style
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Red Rose Bouquet, Dutch Tulips" 
                  value={reminderForm.flowerPreference}
                  onChange={(e) => setReminderForm({ ...reminderForm, flowerPreference: e.target.value })}
                  className="form-input"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #EADCCB' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1, borderRadius: 'var(--radius-full)' }}>
                  Save Reminder
                </button>
                <button type="button" onClick={() => setShowAddReminderModal(false)} className="btn btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPONENT STYLES */}
      {/* Delete / Cancel Order Confirmation Modal */}
      {orderToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-order-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(28, 55, 40, 0.38)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1200
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1.5px solid #EADCCB',
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(28, 55, 40, 0.2)',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}
            >
              <Trash2 size={24} />
            </div>
            <h3 id="delete-order-modal-title" className="font-serif" style={{ fontSize: '1.35rem', color: '#1E1E1E', margin: '0 0 0.5rem' }}>
              Cancel &amp; Delete Order?
            </h3>
            <p style={{ color: '#6E5D4F', fontSize: '0.9rem', lineHeight: 1.55, margin: '0 0 1.4rem' }}>
              Are you sure you want to cancel and delete <strong>Order #{orderToDelete.orderId}</strong>? This will also remove it from your Firebase order history.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                disabled={isDeletingOrder}
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: 'var(--radius-full)', padding: '0.55rem 1.25rem', flex: 1 }}
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteOrder}
                disabled={isDeletingOrder}
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '0.55rem 1.25rem',
                  flex: 1,
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: isDeletingOrder ? 'not-allowed' : 'pointer',
                  opacity: isDeletingOrder ? 0.75 : 1
                }}
              >
                {isDeletingOrder ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-user-meta-chips {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.55rem;
          margin-top: 0.55rem;
        }

        .dashboard-meta-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid #EADCCB;
          border-radius: var(--radius-full);
          padding: 0.25rem 0.75rem;
          font-size: 0.82rem;
          font-weight: 500;
          color: #5C4E42;
        }

        .dashboard-phone-chip {
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.02em;
          font-weight: 600;
          color: #1C3728;
          background: #EBF2EC;
          border-color: rgba(28, 55, 40, 0.16);
        }

        .dashboard-delete-order-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid #FECACA;
          background-color: #FEF2F2;
          color: #DC2626;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
          flex-shrink: 0;
        }

        .dashboard-delete-order-btn:hover {
          background-color: #DC2626;
          border-color: #DC2626;
          color: #FFFFFF;
          transform: scale(1.06);
        }
        .dashboard-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1.25rem;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid #EADCCB;
          border-radius: var(--radius-full);
          font-size: 0.88rem;
          font-weight: 600;
          color: #6E5D4F;
          cursor: pointer;
          white-space: nowrap;
          transition: var(--transition);
        }

        .dashboard-tab-btn:hover {
          background: rgba(26, 59, 42, 0.06);
          color: #1A3B2A;
        }

        .dashboard-tab-btn.active {
          background: #1A3B2A;
          color: #FFFFFF;
          border-color: #1A3B2A;
          box-shadow: 0 4px 12px rgba(26, 59, 42, 0.25);
        }

        .dashboard-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(45, 37, 32, 0.08);
          border-color: #C5A97A;
        }

        .dashboard-order-row:hover {
          border-color: #C5A97A;
          box-shadow: 0 4px 16px rgba(45, 37, 32, 0.06);
        }

        .dashboard-quick-action-card:hover {
          transform: translateY(-2px);
          border-color: #1A3B2A;
          box-shadow: 0 6px 18px rgba(26, 59, 42, 0.08);
        }

        .dashboard-add-address-card:hover {
          border-color: #1A3B2A;
          background-color: rgba(26, 59, 42, 0.04);
        }

        @media (max-width: 768px) {
          .dashboard-welcome-banner {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

    </div>
  );
};

