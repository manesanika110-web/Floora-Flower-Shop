import React, { useState, useEffect, useMemo, useRef } from 'react';

import { Link, useNavigate, useLocation } from 'react-router-dom';

import { 

  Home, 

  Package, 

  ShoppingBag, 

  Users, 

  Tag, 

  Image as ImageIcon, 

  Grid, 

  Settings, 

  LogOut, 

  ChevronDown, 

  ChevronRight, 

  Calendar, 

  Bell, 

  Menu, 

  X, 

  Search, 

  Plus, 

  Edit2, 

  Trash2, 

  Check, 

  Eye, 

  EyeOff,

  Lock,

  Mail,

  ShieldCheck,

  TrendingUp, 

  DollarSign, 

  Percent, 

  ArrowRight,

  Filter,

  Sparkles,

  ExternalLink,

  UploadCloud,

  Layout,

  Play,

  Pause,

  Star,

  Sliders,

  Globe,

  Save,

  MessageSquare

} from 'lucide-react';

import { PRODUCTS, CATEGORIES } from '../data/products';
import { getStoredProducts, saveStoredProducts, getStoredCategories, saveStoredCategories } from '../services/productsService';

import { isFirebaseConfigured, db } from '../services/firebase';

import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

import { useAuth } from '../context/AuthContext';

import { getHomeContent, saveHomeContent, subscribeHomeContent } from '../services/homeContentService';



// Default Demo Orders matching reference image exactly

const INITIAL_RECENT_ORDERS = [

  {

    id: '#ORD1001',

    customer: 'Sneha Patil',

    avatarBg: '#FCE7DF',

    avatarFlower: '🌸',

    amount: '₹1,250',

    amountNum: 1250,

    status: 'Delivered',

    date: 'Today',

    items: 'Fresh Marigold Loose Petals (1kg)'

  },

  {

    id: '#ORD1002',

    customer: 'Rutuja Deshmukh',

    avatarBg: '#FFE3EC',

    avatarFlower: '🌹',

    amount: '₹899',

    amountNum: 899,

    status: 'Pending',

    date: 'Today',

    items: 'Pink Rose Bouquet'

  },

  {

    id: '#ORD1003',

    customer: 'Ananya Sharma',

    avatarBg: '#E8F5E9',

    avatarFlower: '🌼',

    amount: '₹2,499',

    amountNum: 2499,

    status: 'Shipped',

    date: 'Yesterday',

    items: 'Exotic Purple Orchid Ceramic Pot'

  },

  {

    id: '#ORD1004',

    customer: 'Priya More',

    avatarBg: '#FFF9DB',

    avatarFlower: '🌻',

    amount: '₹1,750',

    amountNum: 1750,

    status: 'Delivered',

    date: 'Yesterday',

    items: 'Sunny Yellow Shevanti Bunch'

  }

];



// Initial Coupons/Offers

const INITIAL_OFFERS = [

  { id: 'off-1', code: 'FRESHFEST20', discount: '20% OFF', description: 'Flat 20% OFF on all Indian Fresh Flowers', minSpend: '₹499', active: true },

  { id: 'off-2', code: 'FREEVASE', discount: 'Free Gift', description: 'Free Designer Vase on Handcrafted Bouquets', minSpend: '₹799', active: true },

  { id: 'off-3', code: 'FLORA10', discount: '10% OFF', description: 'Extra 10% OFF + 2-Hour Express Dispatch', minSpend: '₹699', active: true }

];



export const AdminPage = () => {

  const navigate = useNavigate();

  const location = useLocation();



  // Load ONLY real registered users from the website (No fake dummy users)

  const loadRealRegisteredUsers = () => {

    const list = [];

    try {

      const regStr = localStorage.getItem('floora_registered_users');

      if (regStr) {

        const parsed = JSON.parse(regStr);

        if (Array.isArray(parsed)) {

          parsed.forEach((u) => {

            if (u.email && u.email.toLowerCase() !== 'floora@admin.com' && u.email.toLowerCase() !== 'flowers@admin.com') {

              let prof = null;

              try {

                const pStr = localStorage.getItem(`floora_user_profile_${u.uid}`);

                if (pStr) prof = JSON.parse(pStr);

              } catch {}



              let ordersCount = 0;

              let totalSpent = 0;

              try {

                const ordStr = localStorage.getItem(`floora_orders_${u.uid}`);

                if (ordStr) {

                  const ords = JSON.parse(ordStr);

                  if (Array.isArray(ords)) {

                    ordersCount = ords.length;

                    totalSpent = ords.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

                  }

                }

              } catch {}



              list.push({

                id: u.uid || `usr-${Date.now()}`,

                name: prof?.fullName || prof?.displayName || u.displayName || u.name || u.email.split('@')[0],

                email: u.email,

                phone: prof?.phoneNumber || u.phone || u.phoneNumber || 'Not provided',

                ordersCount,

                spent: totalSpent > 0 ? `₹${totalSpent.toLocaleString()}` : '₹0',

                status: 'Active',

                joinDate: 'Active User'

              });

            }

          });

        }

      }



      // Also check demo user Ananya if she has active profile and not in list

      const ananyaProfileStr = localStorage.getItem('floora_user_profile_ananya-floora-demo');

      if (ananyaProfileStr && !list.some(u => u.email === 'ananya@example.com')) {

        const a = JSON.parse(ananyaProfileStr);

        list.push({

          id: a.uid,

          name: a.fullName || a.displayName || 'Ananya Sharma',

          email: a.email || 'ananya@example.com',

          phone: a.phoneNumber || '+91 98765 43210',

          ordersCount: 1,

          spent: '₹1,250',

          status: 'Active',

          joinDate: 'Active User'

        });

      }

    } catch (e) {

      console.warn("Could not load users:", e);

    }

    return list;

  };



  // Active Tab state (dashboard, products, orders, users, offers, banners, categories, settings)

  const [activeTab, setActiveTab] = useState('dashboard');

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [dateRange, setDateRange] = useState('Last 30 Days');

  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(true);
  const notificationsRef = useRef(null);

  // Store Settings state (simple & store-focused)
  const [storeSettings, setStoreSettings] = useState(() => {
    const saved = localStorage.getItem('floora_store_settings');
    return saved ? JSON.parse(saved) : {
      name: 'Floora Flower Boutique',
      email: 'care@floorashop.com',
      phone: '+91 98200 12345',
      address: 'Plot 14, Flower Valley, MG Road, Pune, Maharashtra - 411001',
      deliveryCharge: '₹49',
      orderAlerts: true,
      smsAlerts: true
    };
  });

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('floora_store_settings', JSON.stringify(storeSettings));
    triggerToast('Store settings saved successfully! 🌸');
  };

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  const [salesPeriod, setSalesPeriod] = useState('This Month');

  const [salesPeriodOpen, setSalesPeriodOpen] = useState(false);



  // Dynamic Data States (synced with localStorage & Firestore if configured)

  const [productsList, setProductsList] = useState(() => getStoredProducts());

  const [productImagePreview, setProductImagePreview] = useState('');



  const [ordersList, setOrdersList] = useState(() => {
    const saved = localStorage.getItem('floora_admin_orders');
    return saved ? JSON.parse(saved) : INITIAL_RECENT_ORDERS;
  });

  const [viewingOrder, setViewingOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);



  // Real registered users list

  const [usersList, setUsersList] = useState(loadRealRegisteredUsers);



  // Categories list with persistence

  const [categoriesList, setCategoriesList] = useState(() => {

    try {

      const saved = localStorage.getItem('floora_admin_categories');

      if (saved) return JSON.parse(saved);

    } catch {}

    return CATEGORIES;

  });



  const [offersList, setOffersList] = useState(() => {

    const saved = localStorage.getItem('floora_admin_offers');

    return saved ? JSON.parse(saved) : INITIAL_OFFERS;

  });



  // Category modal states

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);

  const [categoryForm, setCategoryForm] = useState({

    name: '',

    section: 'Indian Flowers',

    image: '',

    count: 2

  });

  const [imagePreview, setImagePreview] = useState('');



  // Modals

  const [productModalOpen, setProductModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [toast, setToast] = useState('');



  // Search queries

  const [productSearch, setProductSearch] = useState('');

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');



  // Trigger toast

  const triggerToast = (msg) => {

    setToast(msg);

    setTimeout(() => setToast(''), 3500);

  };



  // Sync to localStorage

  useEffect(() => {

    localStorage.setItem('floora_admin_products', JSON.stringify(productsList));

  }, [productsList]);



  useEffect(() => {

    localStorage.setItem('floora_admin_orders', JSON.stringify(ordersList));

  }, [ordersList]);



  useEffect(() => {

    localStorage.setItem('floora_admin_offers', JSON.stringify(offersList));

  }, [offersList]);



  useEffect(() => {

    localStorage.setItem('floora_admin_categories', JSON.stringify(categoriesList));

  }, [categoriesList]);



  // Refresh real users whenever tab changes

  useEffect(() => {

    if (activeTab === 'users' || activeTab === 'dashboard') {

      setUsersList(loadRealRegisteredUsers());

    }

  }, [activeTab]);



  // Handle Category Photo Upload (converts file to base64 DataURL)

  const handleImageFileUpload = (e) => {

    const file = e.target.files[0];

    if (file) {

      if (file.size > 5 * 1024 * 1024) {

        alert('File size exceeds 5MB. Please choose a smaller image.');

        return;

      }

      const reader = new FileReader();

      reader.onloadend = () => {

        setImagePreview(reader.result);

        setCategoryForm(prev => ({ ...prev, image: reader.result }));

      };

      reader.readAsDataURL(file);

    }

  };



  // Save new or edited category

  const handleSaveCategory = (e) => {

    e.preventDefault();

    if (!categoryForm.name.trim()) {

      alert('Please enter a category name');

      return;

    }



    const finalImage = categoryForm.image || imagePreview || '/flowers/marigold_flowers.jpg';



    if (editingCategory) {

      const updated = categoriesList.map(cat => 

        cat.id === editingCategory.id 

          ? { 

              ...cat, 

              name: categoryForm.name.trim(), 

              section: categoryForm.section || 'Indian Flowers', 

              image: finalImage,

              count: parseInt(categoryForm.count) || 0

            } 

          : cat

      );

      setCategoriesList(updated);

      triggerToast(`Category "${categoryForm.name}" updated successfully! 🌸`);

    } else {

      const newCat = {

        id: `cat-${Date.now()}`,

        name: categoryForm.name.trim(),

        section: categoryForm.section || 'Indian Flowers',

        image: finalImage,

        count: parseInt(categoryForm.count) || 0

      };

      setCategoriesList([newCat, ...categoriesList]);

      triggerToast(`Category "${newCat.name}" added successfully! ✨`);

    }



    setCategoryModalOpen(false);

    setEditingCategory(null);

    setCategoryForm({ name: '', section: 'Indian Flowers', image: '', count: 2 });

    setImagePreview('');

  };



  // Delete category

  const handleDeleteCategory = (catId, catName) => {

    if (window.confirm(`Are you sure you want to delete category "${catName}"?`)) {

      setCategoriesList(prev => prev.filter(c => c.id !== catId));

      triggerToast(`Category "${catName}" removed.`);

    }

  };



  // Open edit category modal

  const handleOpenEditCategory = (cat) => {

    setEditingCategory(cat);

    setCategoryForm({

      name: cat.name,

      section: cat.section || 'Indian Flowers',

      image: cat.image,

      count: cat.count || 0

    });

    setImagePreview(cat.image);

    setCategoryModalOpen(true);

  };



  // ================= MANAGE HOME STATES & SYNC =================

  const [homeData, setHomeData] = useState(() => getHomeContent());

  const [homeSubTab, setHomeSubTab] = useState('hero'); // 'hero', 'catalog', 'offers', 'reviews', 'footer', 'categories'



  // Modals for Manage Home

  const [bannerModalOpen, setBannerModalOpen] = useState(false);

  const [editingBanner, setEditingBanner] = useState(null);

  const [bannerForm, setBannerForm] = useState({

    image: '',

    alt: '',

    title: '',

    subtitle: '',

    buttonText: 'Shop Now',

    buttonLink: '/shop'

  });

  const [bannerImagePreview, setBannerImagePreview] = useState('');



  const [offerModalOpen, setOfferModalOpen] = useState(false);

  const [editingOffer, setEditingOffer] = useState(null);

  const [offerForm, setOfferForm] = useState({

    badge: 'SPECIAL DEAL',

    badgeBg: '#FFF3BF',

    badgeColor: '#D9480F',

    title: '',

    description: '',

    coupon: '',

    link: '/shop',

    btnText: 'Shop Now →',

    cardBg: 'linear-gradient(135deg, #FFF9F0 0%, #FFF2E2 100%)',

    borderColor: '#F3DEC0',

    iconEmoji: '🌸'

  });



  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const [editingReview, setEditingReview] = useState(null);

  const [reviewForm, setReviewForm] = useState({

    name: '',

    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),

    rating: 5,

    text: '',

    image: '/flowers/mix_flower_bouquet.jpg'

  });

  const [reviewImagePreview, setReviewImagePreview] = useState('');



  // Catalog Section form state

  const [catalogForm, setCatalogForm] = useState(() => homeData.catalogSection || {});



  // Footer form state

  const [footerForm, setFooterForm] = useState(() => homeData.footer || {});



  // Real-time synchronization for homepage content

  useEffect(() => {

    const unsub = subscribeHomeContent((updated) => {

      if (updated) {

        setHomeData(updated);

        if (updated.catalogSection) setCatalogForm(updated.catalogSection);

        if (updated.footer) setFooterForm(updated.footer);

      }

    });

    return unsub;

  }, []);



  // Update whole home data with Firebase sync

  const updateAndSyncHomeData = async (newData, msg = 'Homepage updated & synced with Firebase! ✨') => {

    setHomeData(newData);

    await saveHomeContent(newData);

    triggerToast(msg);

  };



  // 1. Hero Banners Handlers

  const handleToggleAutoPlay = () => {

    const updated = {

      ...homeData,

      heroBanners: {

        ...homeData.heroBanners,

        autoPlay: !homeData.heroBanners?.autoPlay

      }

    };

    updateAndSyncHomeData(updated, `Auto-Play turned ${updated.heroBanners.autoPlay ? 'ON' : 'OFF'}`);

  };



  const handleIntervalChange = (val) => {

    const updated = {

      ...homeData,

      heroBanners: {

        ...homeData.heroBanners,

        interval: parseInt(val, 10) || 3000

      }

    };

    updateAndSyncHomeData(updated, `Slide duration set to ${val / 1000}s`);

  };



  const handleOpenAddBanner = () => {

    setEditingBanner(null);

    setBannerForm({

      image: '',

      alt: '',

      title: '',

      subtitle: '',

      buttonText: 'Shop Now',

      buttonLink: '/shop'

    });

    setBannerImagePreview('');

    setBannerModalOpen(true);

  };



  const handleOpenEditBanner = (b) => {

    setEditingBanner(b);

    setBannerForm({

      image: b.image || '',

      alt: b.alt || '',

      title: b.title || '',

      subtitle: b.subtitle || '',

      buttonText: b.buttonText || 'Shop Now',

      buttonLink: b.buttonLink || '/shop'

    });

    setBannerImagePreview(b.image || '');

    setBannerModalOpen(true);

  };



  const handleSaveBanner = (e) => {

    e.preventDefault();

    const finalImage = bannerForm.image || bannerImagePreview || '/banners/banner_mixed_bouquets.jpg';

    const currentBanners = homeData.heroBanners?.banners || [];



    let updatedBanners;

    if (editingBanner) {

      updatedBanners = currentBanners.map(b => b.id === editingBanner.id ? { ...b, ...bannerForm, image: finalImage } : b);

    } else {

      const newSlide = {

        id: `banner-${Date.now()}`,

        ...bannerForm,

        image: finalImage

      };

      updatedBanners = [...currentBanners, newSlide];

    }



    const updated = {

      ...homeData,

      heroBanners: {

        ...homeData.heroBanners,

        banners: updatedBanners

      }

    };



    updateAndSyncHomeData(updated, editingBanner ? 'Banner updated successfully!' : 'New banner slide added!');

    setBannerModalOpen(false);

  };



  const handleDeleteBanner = (bannerId) => {

    if (window.confirm('Are you sure you want to delete this hero banner?')) {

      const currentBanners = homeData.heroBanners?.banners || [];

      const updatedBanners = currentBanners.filter(b => b.id !== bannerId);

      const updated = {

        ...homeData,

        heroBanners: {

          ...homeData.heroBanners,

          banners: updatedBanners

        }

      };

      updateAndSyncHomeData(updated, 'Banner slide deleted.');

    }

  };



  // 2. Special Offers Handlers

  const handleOpenAddOffer = () => {

    setEditingOffer(null);

    setOfferForm({

      badge: 'FESTIVE DEAL',

      badgeBg: '#FFF3BF',

      badgeColor: '#D9480F',

      title: '',

      description: '',

      coupon: '',

      link: '/shop',

      btnText: 'Shop Now →',

      cardBg: 'linear-gradient(135deg, #FFF9F0 0%, #FFF2E2 100%)',

      borderColor: '#F3DEC0',

      iconEmoji: '🌸'

    });

    setOfferModalOpen(true);

  };



  const handleOpenEditOffer = (off) => {

    setEditingOffer(off);

    setOfferForm({ ...off });

    setOfferModalOpen(true);

  };



  const handleSaveOffer = (e) => {

    e.preventDefault();

    const currentOffers = homeData.specialOffers?.offers || [];

    let updatedOffers;

    if (editingOffer) {

      updatedOffers = currentOffers.map(o => o.id === editingOffer.id ? { ...o, ...offerForm } : o);

    } else {

      const newOffer = { id: `offer-${Date.now()}`, ...offerForm };

      updatedOffers = [...currentOffers, newOffer];

    }

    const updated = {

      ...homeData,

      specialOffers: {

        ...homeData.specialOffers,

        offers: updatedOffers

      }

    };

    updateAndSyncHomeData(updated, editingOffer ? 'Special offer updated!' : 'New special offer created!');

    setOfferModalOpen(false);

  };



  const handleDeleteOffer = (offerId) => {

    if (window.confirm('Are you sure you want to delete this promotion?')) {

      const currentOffers = homeData.specialOffers?.offers || [];

      const updatedOffers = currentOffers.filter(o => o.id !== offerId);

      const updated = {

        ...homeData,

        specialOffers: {

          ...homeData.specialOffers,

          offers: updatedOffers

        }

      };

      updateAndSyncHomeData(updated, 'Promotion deleted.');

    }

  };



  // 3. Customer Reviews Handlers

  const handleOpenAddReview = () => {

    setEditingReview(null);

    setReviewForm({

      name: '',

      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),

      rating: 5,

      text: '',

      image: '/flowers/mix_flower_bouquet.jpg'

    });

    setReviewImagePreview('');

    setReviewModalOpen(true);

  };



  const handleOpenEditReview = (rev) => {

    setEditingReview(rev);

    setReviewForm({ ...rev });

    setReviewImagePreview(rev.image || '');

    setReviewModalOpen(true);

  };



  const handleSaveReview = (e) => {

    e.preventDefault();

    const finalImage = reviewForm.image || reviewImagePreview || '/flowers/mix_flower_bouquet.jpg';

    const currentReviews = homeData.reviewsSection?.reviews || [];

    let updatedReviews;

    if (editingReview) {

      updatedReviews = currentReviews.map(r => r.id === editingReview.id ? { ...r, ...reviewForm, image: finalImage } : r);

    } else {

      const newRev = { id: `rev-${Date.now()}`, ...reviewForm, image: finalImage };

      updatedReviews = [...currentReviews, newRev];

    }

    const updated = {

      ...homeData,

      reviewsSection: {

        ...homeData.reviewsSection,

        reviews: updatedReviews

      }

    };

    updateAndSyncHomeData(updated, editingReview ? 'Customer review updated!' : 'Customer review added!');

    setReviewModalOpen(false);

  };



  const handleDeleteReview = (revId) => {

    if (window.confirm('Delete this customer review?')) {

      const currentReviews = homeData.reviewsSection?.reviews || [];

      const updatedReviews = currentReviews.filter(r => r.id !== revId);

      const updated = {

        ...homeData,

        reviewsSection: {

          ...homeData.reviewsSection,

          reviews: updatedReviews

        }

      };

      updateAndSyncHomeData(updated, 'Customer review deleted.');

    }

  };



  // 4. Save Catalog Section

  const handleSaveCatalogSection = (e) => {

    e.preventDefault();

    const updated = {

      ...homeData,

      catalogSection: { ...catalogForm }

    };

    updateAndSyncHomeData(updated, 'All Flowers & Bouquets section updated!');

  };



  // 5. Save Footer Settings

  const handleSaveFooter = (e) => {

    e.preventDefault();

    const updated = {

      ...homeData,

      footer: { ...footerForm }

    };

    updateAndSyncHomeData(updated, 'Footer settings updated & live synced!');

  };



  // Handle Tab navigation based on URL hash or path

  useEffect(() => {

    const params = new URLSearchParams(location.search);

    const tabParam = params.get('tab');

    if (tabParam) {

      setActiveTab(tabParam);

    }

  }, [location.search]);



  const { currentUser, login, logout } = useAuth();



  // Admin Login States for Direct URL Access

  const [adminEmail, setAdminEmail] = useState('');

  const [adminPassword, setAdminPassword] = useState('');

  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const [loginError, setLoginError] = useState('');

  const [isLoggingIn, setIsLoggingIn] = useState(false);



  // Authorize only if email is floora@admin.com or role is admin

  const isAdminAuthenticated = Boolean(

    currentUser &&

    (currentUser.isAdmin || currentUser.email?.toLowerCase() === 'flowers@admin.com' || currentUser.email?.toLowerCase() === 'floora@admin.com' || currentUser.role === 'admin')

  );



  const handleAdminLoginSubmit = async (e) => {

    e.preventDefault();

    setLoginError('');

    setIsLoggingIn(true);

    try {

      const res = await login(adminEmail.trim(), adminPassword);

      if (res.success && (res.isAdmin || adminEmail.trim().toLowerCase() === 'flowers@admin.com' || adminEmail.trim().toLowerCase() === 'floora@admin.com')) {

        setAdminEmail('');
        setAdminPassword('');
        triggerToast('Welcome, Administrator! Access granted. 👑');

      } else {

        setLoginError('Invalid Admin credentials. Access restricted to authorized administrators only.');

      }

    } catch (err) {

      setLoginError('Authentication failed. Please verify credentials.');

    } finally {

      setIsLoggingIn(false);

    }

  };



  const handleTabChange = async (tabId) => {

    if (tabId === 'logout') {

      if (window.confirm('Are you sure you want to log out of the Admin Panel?')) {

        await logout();
        setAdminEmail('');
        setAdminPassword('');
        setLoginError('');
        triggerToast('Admin logged out.');

      }

      return;

    }

    setActiveTab(tabId);

    setMobileSidebarOpen(false);

    navigate(`/admin?tab=${tabId}`, { replace: true });

  };



  // Update order status
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const updated = ordersList.map(ord => ord.id === orderId ? { ...ord, status: newStatus } : ord);
    setOrdersList(updated);
    localStorage.setItem('floora_admin_orders', JSON.stringify(updated));
    triggerToast(`Order ${orderId} updated to ${newStatus}`);
  };

  // Delete Order with Firebase sync and confirmation
  const handleDeleteOrder = (orderId) => {
    if (!window.confirm(`Are you sure you want to cancel and delete order ${orderId}?`)) return;
    const cleanId = orderId.replace(/^#/, '');
    const updated = ordersList.filter(o => o.id !== orderId && o.id !== `#${cleanId}`);
    setOrdersList(updated);
    localStorage.setItem('floora_admin_orders', JSON.stringify(updated));

    // Clear from user orders storage in localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('floora_orders_')) {
          const userOrdersRaw = localStorage.getItem(key);
          if (userOrdersRaw) {
            const userOrders = JSON.parse(userOrdersRaw);
            const filteredUser = userOrders.filter(o => o.orderId !== cleanId && `#${o.orderId}` !== orderId);
            localStorage.setItem(key, JSON.stringify(filteredUser));
          }
        }
      }
    } catch (e) {
      console.warn('Error clearing user orders:', e);
    }

    triggerToast(`Order ${orderId} deleted successfully.`);
  };

  // Save Edited Order
  const handleSaveEditedOrder = (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    const formData = new FormData(e.target);
    const updatedOrder = {
      ...editingOrder,
      customer: formData.get('customer') || editingOrder.customer,
      amount: formData.get('amount') || editingOrder.amount,
      status: formData.get('status') || editingOrder.status,
      items: formData.get('items') || editingOrder.items,
      date: formData.get('date') || editingOrder.date
    };

    const updatedList = ordersList.map(o => o.id === editingOrder.id ? updatedOrder : o);
    setOrdersList(updatedList);
    localStorage.setItem('floora_admin_orders', JSON.stringify(updatedList));
    setEditingOrder(null);
    triggerToast(`Order ${editingOrder.id} updated successfully!`);
  };



  // Save new or edited product

  const handleSaveProduct = (e) => {

    e.preventDefault();

    const formData = new FormData(e.target);

    const catVal = formData.get('category') || 'Bouquets';
    const newProd = {
      id: editingProduct?.id || `fl-custom-${Date.now()}`,
      name: formData.get('name') || 'Seasonal Bloom',
      category: catVal,
      categorySlug: catVal.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      bouquetType: catVal.includes('Bouquet') ? catVal : (catVal === 'Mini Bouquets' ? 'Mini Bouquets' : null),
      flowerType: (!catVal.includes('Bouquet') && !catVal.includes('Pot') && !catVal.includes('Flower')) ? catVal : (editingProduct?.flowerType || 'Roses'),
      price: parseInt(formData.get('price')) || 499,
      oldPrice: parseInt(formData.get('oldPrice')) || 699,
      rating: editingProduct?.rating || 4.9,
      reviewsCount: editingProduct?.reviewsCount || 120,
      image: productImagePreview || formData.get('image') || editingProduct?.image || '/flowers/pink_rose_bouquet.jpg',
      origin: catVal === 'Indian Flowers' ? 'Indian' : (formData.get('origin') || 'International'),
      inStock: formData.get('inStock') === 'true',
      description: formData.get('description') || 'Fresh seasonal floral arrangement.'
    };



    let updatedList;
    if (editingProduct) {
      updatedList = productsList.map(p => p.id === newProd.id ? newProd : p);
      setProductsList(updatedList);
      triggerToast(`Product "${newProd.name}" updated successfully!`);
    } else {
      updatedList = [newProd, ...productsList];
      setProductsList(updatedList);
      triggerToast(`Product "${newProd.name}" added successfully!`);
    }
    saveStoredProducts(updatedList);
    setProductModalOpen(false);
    setEditingProduct(null);
    setProductImagePreview('');

  };



  const handleDeleteProduct = (productId) => {

    if (window.confirm('Are you sure you want to delete this product?')) {
      const updatedList = productsList.filter(p => p.id !== productId);
      setProductsList(updatedList);
      saveStoredProducts(updatedList);
      triggerToast('Product removed.');
    }

  };



  // Filtered products with robust flower/product search & category matching
  const filteredProducts = useMemo(() => {
    const rawSearch = (productSearch || '').trim().toLowerCase();
    const searchTerms = rawSearch ? rawSearch.split(/\s+/).filter(Boolean) : [];

    return productsList.filter(p => {
      // 1. Search by flower name, product name, category, origin, description, colors
      const prodName = (p.name || '').toLowerCase();
      const prodFlower = (p.flowerType || '').toLowerCase();
      const prodCat = (p.category || '').toLowerCase();
      const prodOrigin = (p.origin || '').toLowerCase();
      const prodBouquet = (p.bouquetType || '').toLowerCase();
      const prodColors = Array.isArray(p.colors) ? p.colors.join(' ').toLowerCase() : '';
      const prodDesc = (p.description || '').toLowerCase();

      const matchSearch = searchTerms.length === 0 || searchTerms.every(term =>
        prodName.includes(term) ||
        prodFlower.includes(term) ||
        prodCat.includes(term) ||
        prodOrigin.includes(term) ||
        prodBouquet.includes(term) ||
        prodColors.includes(term) ||
        prodDesc.includes(term)
      );

      // 2. Category Filter (supports Indian Flowers, International Flowers, Bouquets, Flower Pots, Mini Bouquets, Single Flowers, etc.)
      let matchCategory = true;
      if (selectedCategoryFilter && selectedCategoryFilter !== 'All') {
        const cat = selectedCategoryFilter;
        const isPot = prodCat === 'flower pots' || (p.id && String(p.id).startsWith('fl-pot')) || prodName.includes('pot') || prodName.includes('plant');
        const isBouquet = prodCat === 'bouquets' || Boolean(p.bouquetType) || prodName.includes('bouquet') || prodName.includes('arrangement') || prodName.includes('bunch');

        if (cat === 'Indian Flowers') {
          matchCategory = prodOrigin === 'indian' || prodCat.includes('indian');
        } else if (cat === 'International Flowers') {
          matchCategory = prodOrigin === 'international' || prodCat.includes('international');
        } else if (cat === 'Bouquets') {
          matchCategory = isBouquet;
        } else if (cat === 'Flower Pots') {
          matchCategory = isPot;
        } else if (cat === 'Mini Bouquets') {
          matchCategory = prodBouquet === 'mini bouquets' || prodCat === 'mini bouquets' || prodName.includes('bunch') || prodName.includes('mini');
        } else if (cat === 'Single Flowers') {
          matchCategory = (
            prodCat === 'single flowers' ||
            prodName.includes('single') ||
            prodName.includes('bloom') ||
            prodName.includes('stalk') ||
            prodName.includes('stem') ||
            prodName.includes('garland') ||
            (!prodBouquet && !isPot && !prodName.includes('bouquet'))
          ) && !isPot && !prodName.includes('bunch') && !prodName.includes('bouquet');
        } else {
          matchCategory = prodCat === cat.toLowerCase() || prodCat === cat || prodFlower.includes(cat.toLowerCase()) || prodName.includes(cat.toLowerCase());
        }
      }

      return matchSearch && matchCategory;
    });
  }, [productsList, productSearch, selectedCategoryFilter]);



  // Sidebar Menu Config

  const SIDEBAR_ITEMS = [

    { id: 'dashboard', label: 'Dashboard', icon: <Home size={18} /> },

    { id: 'manage-home', label: 'Manage Home', icon: <Layout size={18} /> },

    { id: 'products', label: 'Manage Products', icon: <Package size={18} />, hasArrow: true },

    { id: 'orders', label: 'Manage Orders', icon: <ShoppingBag size={18} />, hasArrow: true },

    { id: 'users', label: 'Manage Users', icon: <Users size={18} />, hasArrow: true },



    { id: 'categories', label: 'Manage Categories', icon: <Grid size={18} /> },

    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },

    { id: 'logout', label: 'Logout', icon: <LogOut size={18} /> }

  ];



  // Direct Admin Login Gate: If not authenticated with admin credentials, display Admin Login directly at /admin!

  if (!isAdminAuthenticated) {

    return (

      <div className="admin-login-screen animate-fade-in" style={{

        minHeight: '100vh',

        backgroundColor: '#FAF6EE',

        backgroundImage: "url('/backgrounds/floral_watercolor_bg.jpg')",

        backgroundSize: 'cover',

        backgroundPosition: 'center top',

        backgroundRepeat: 'no-repeat',

        backgroundAttachment: 'fixed',

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'center',

        padding: '2.5rem 1.25rem',

        position: 'relative',

        overflow: 'hidden',

        fontFamily: "'Poppins', sans-serif"

      }}>

        <div style={{

          backgroundColor: '#FFFFFF',

          borderRadius: '24px',

          border: '1px solid #ECE0CF',

          boxShadow: '0 16px 45px rgba(26, 59, 42, 0.08)',

          width: '100%',

          maxWidth: '430px',

          padding: '2.5rem 2rem 2.25rem',

          position: 'relative',

          zIndex: 2,

          textAlign: 'center'

        }}>

          {/* Floora Flower Boutique Official Logo */}

          <div style={{ marginBottom: '1.25rem' }}>

            <img

              src="/admin_floora_logo.png"

              alt="Floora Logo"

              style={{

                width: '56px',

                height: '56px',

                objectFit: 'contain',

                margin: '0 auto 0.5rem',

                display: 'block',

                filter: 'drop-shadow(0 4px 10px rgba(200, 155, 89, 0.25))'

              }}

            />

            <h2 className="font-serif" style={{ fontSize: '1.95rem', fontWeight: 700, color: '#1A3B2A', margin: 0, lineHeight: 1 }}>

              Floora

            </h2>

            <span style={{ fontSize: '0.72rem', color: '#C89B59', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' }}>

              Flower Boutique

            </span>

          </div>



          <div style={{

            display: 'inline-flex',

            alignItems: 'center',

            gap: '0.4rem',

            backgroundColor: '#F5EFE6',

            color: '#1A3B2A',

            padding: '0.35rem 0.85rem',

            borderRadius: '20px',

            fontSize: '0.78rem',

            fontWeight: 600,

            marginBottom: '1rem'

          }}>

            <span>👑</span>

            <span>Admin Management Console</span>

          </div>



          <p style={{ fontSize: '0.86rem', color: '#6F665F', margin: '0 0 1.5rem', lineHeight: 1.45 }}>

            Sign in with authorized administrator credentials to manage your store.

          </p>



          {loginError && (

            <div style={{

              backgroundColor: '#FFE3E3',

              color: '#C92A2A',

              padding: '0.65rem 0.85rem',

              borderRadius: '10px',

              fontSize: '0.82rem',

              fontWeight: 500,

              marginBottom: '1.25rem',

              textAlign: 'left'

            }}>

              {loginError}

            </div>

          )}



          <form onSubmit={handleAdminLoginSubmit} autoComplete="off" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <div>

              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1A3B2A', marginBottom: '0.35rem' }}>

                Admin Email

              </label>

              <div style={{ position: 'relative' }}>

                <input

                  type="email"

                  required

                  value={adminEmail}

                  onChange={(e) => setAdminEmail(e.target.value)}

                  name="floora_admin_email"
                  autoComplete="off"
                  readOnly
                  onFocus={(e) => e.target.removeAttribute('readonly')}
                  onTouchStart={(e) => e.target.removeAttribute('readonly')}
                  placeholder="Enter admin email"

                  style={{

                    width: '100%',

                    padding: '0.7rem 0.85rem 0.7rem 2.4rem',

                    borderRadius: '12px',

                    border: '1px solid #ECE0CF',

                    fontSize: '0.88rem',

                    backgroundColor: '#FAF7F2',

                    color: '#1A3B2A'

                  }}

                />

                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7E736B' }} />

              </div>

            </div>



            <div>

              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1A3B2A', marginBottom: '0.35rem' }}>

                Admin Password

              </label>

              <div style={{ position: 'relative' }}>

                <input

                  type={showAdminPassword ? 'text' : 'password'}

                  required

                  value={adminPassword}

                  onChange={(e) => setAdminPassword(e.target.value)}

                  name="floora_admin_password"
                  autoComplete="new-password"
                  readOnly
                  onFocus={(e) => e.target.removeAttribute('readonly')}
                  onTouchStart={(e) => e.target.removeAttribute('readonly')}
                  placeholder="Enter admin password"

                  style={{

                    width: '100%',

                    padding: '0.7rem 2.4rem 0.7rem 2.4rem',

                    borderRadius: '12px',

                    border: '1px solid #ECE0CF',

                    fontSize: '0.88rem',

                    backgroundColor: '#FAF7F2',

                    color: '#1A3B2A'

                  }}

                />

                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7E736B' }} />

                <button

                  type="button"

                  onClick={() => setShowAdminPassword(!showAdminPassword)}

                  style={{

                    position: 'absolute',

                    right: '12px',

                    top: '50%',

                    transform: 'translateY(-50%)',

                    background: 'none',

                    border: 'none',

                    cursor: 'pointer',

                    color: '#7E736B',

                    padding: 0

                  }}

                  tabIndex={-1}

                >

                  {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}

                </button>

              </div>

            </div>



            <button

              type="submit"

              disabled={isLoggingIn}

              style={{

                backgroundColor: '#1A3B2A',

                color: '#FFFFFF',

                border: 'none',

                borderRadius: '12px',

                padding: '0.8rem',

                fontSize: '0.92rem',

                fontWeight: 600,

                cursor: 'pointer',

                marginTop: '0.5rem',

                boxShadow: '0 4px 14px rgba(26, 59, 42, 0.25)',

                transition: 'all 0.2s ease'

              }}

            >

              {isLoggingIn ? 'Authenticating...' : 'Sign In to Admin Dashboard →'}

            </button>

          </form>



          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #F0E8DC' }}>

            <Link

              to="/"

              style={{

                fontSize: '0.82rem',

                color: '#1A3B2A',

                textDecoration: 'none',

                fontWeight: 600,

                display: 'inline-flex',

                alignItems: 'center',

                gap: '0.35rem'

              }}

            >

              ← Return to Customer Storefront

            </Link>

          </div>

        </div>

      </div>

    );

  }





  return (

    <div className="admin-root-layout" style={{

      display: 'flex',

      minHeight: '100vh',

      backgroundColor: '#FCF5ED',

      fontFamily: "'Poppins', sans-serif",

      color: '#222F26',

      position: 'relative'

    }}>



      {/* ================= 1. ADMIN SIDEBAR (DEEP FOREST GREEN #1A3B2A) ================= */}

      <aside className={`admin-sidebar ${mobileSidebarOpen ? 'open' : ''}`} style={{

        width: '260px',

        backgroundColor: '#1A3B2A',

        color: '#FFFFFF',

        display: 'flex',

        flexDirection: 'column',

        justifyContent: 'space-between',

        flexShrink: 0,

        position: 'sticky',

        top: 0,

        height: '100vh',

        overflowY: 'auto',

        zIndex: 100,

        transition: 'transform 0.3s ease'

      }}>

        <div>

          {/* Floora Flower Boutique Logo matching reference */}

          <div style={{

            padding: '2rem 1.5rem 1.75rem',

            display: 'flex',

            flexDirection: 'column',

            alignItems: 'center',

            textAlign: 'center',

            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'

          }}>

            {/* Gold Stylized Flower Icon */}

            <img
              src="/admin_floora_logo.png"
              alt="Floora Logo"
              style={{
                width: '62px',
                height: '62px',
                objectFit: 'contain',
                marginBottom: '0.55rem',
                display: 'block',
                filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.25))'
              }}
            />



            <span className="font-serif" style={{

              fontSize: '1.95rem',

              fontWeight: 700,

              color: '#FFFFFF',

              letterSpacing: '0.5px',

              lineHeight: 1

            }}>

              Floora

            </span>

            <span style={{

              fontSize: '0.72rem',

              color: '#C89B59',

              fontWeight: 500,

              letterSpacing: '1.5px',

              textTransform: 'uppercase',

              marginTop: '0.35rem'

            }}>

              Flower Boutique

            </span>

          </div>



          {/* Navigation Menu */}

          <nav style={{ padding: '1.5rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>

            {SIDEBAR_ITEMS.map((item) => {

              const isActive = activeTab === item.id;

              return (

                <button

                  key={item.id}

                  onClick={() => handleTabChange(item.id)}

                  style={{

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'space-between',

                    width: '100%',

                    padding: '0.72rem 1rem',

                    borderRadius: isActive ? '12px' : '10px',

                    border: 'none',

                    cursor: 'pointer',

                    background: isActive ? 'linear-gradient(90deg, #D4A45C 0%, #C89B59 100%)' : 'transparent',

                    color: isActive ? '#FFFFFF' : '#A9BCB0',

                    fontSize: '0.88rem',

                    fontWeight: isActive ? 600 : 400,

                    transition: 'all 0.2s ease',

                    boxShadow: isActive ? '0 4px 14px rgba(200, 155, 89, 0.35)' : 'none'

                  }}

                  className={`admin-nav-item ${isActive ? 'active' : ''}`}

                >

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>

                    <span style={{ display: 'flex', alignItems: 'center', color: isActive ? '#FFFFFF' : '#A9BCB0' }}>

                      {item.icon}

                    </span>

                    <span>{item.label}</span>

                  </div>

                  {item.hasArrow && (

                    <ChevronDown size={14} style={{ opacity: 0.6 }} />

                  )}

                </button>

              );

            })}

          </nav>

        </div>



        {/* Sidebar Bottom Gold Illustration & Motto matching reference */}

        <div style={{

          padding: '1.5rem 1.25rem 2rem',

          textAlign: 'center',

          display: 'flex',

          flexDirection: 'column',

          alignItems: 'center',

          borderTop: '1px solid rgba(255, 255, 255, 0.08)'

        }}>

          {/* Gold Botanical Sketch */}

          <img

            src="/admin_sidebar_sketch_clean.png"

            alt=""

            style={{

              width: '135px',

              height: 'auto',

              marginBottom: '0.65rem',

              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))'

            }}

          />



          <span style={{

            fontFamily: "'Playfair Display', Georgia, serif",

            fontStyle: 'italic',

            fontSize: '1.05rem',

            color: '#D4A45C',

            lineHeight: 1.3

          }}>

            Bloom Business

          </span>

          <span style={{

            fontFamily: "'Playfair Display', Georgia, serif",

            fontStyle: 'italic',

            fontSize: '0.98rem',

            color: '#D4A45C',

            lineHeight: 1.3

          }}>

            Grow Together ♡

          </span>

        </div>

      </aside>



      {/* Mobile Sidebar Overlay */}

      {mobileSidebarOpen && (

        <div

          onClick={() => setMobileSidebarOpen(false)}

          style={{

            position: 'fixed',

            inset: 0,

            backgroundColor: 'rgba(0, 0, 0, 0.5)',

            zIndex: 99

          }}

        />

      )}



      {/* ================= 2. MAIN ADMIN CONTENT CONTAINER ================= */}

      <div style={{

        flex: 1,

        display: 'flex',

        flexDirection: 'column',

        minWidth: 0,

        overflowX: 'hidden'

      }}>



        {/* ================= TOP HEADER BAR ================= */}

        <header style={{

          padding: '0.85rem 2rem',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'space-between',

          backgroundColor: '#FCF5ED',

          borderBottom: '1px solid #EFE4D6',

          position: 'sticky',

          top: 0,

          zIndex: 50

        }}>

          {/* Left: Mobile Toggle & Welcome Greeting */}

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>

            <button

              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}

              className="admin-hamburger-btn"

              style={{

                background: 'none',

                border: 'none',

                cursor: 'pointer',

                color: '#1A3B2A',

                display: 'flex',

                alignItems: 'center',

                padding: '0.35rem'

              }}

              aria-label="Toggle menu"

            >

              <Menu size={22} />

            </button>



            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img
                src="/admin_floora_logo.png"
                alt="Floora Logo"
                style={{
                  width: '36px',
                  height: '36px',
                  objectFit: 'contain',
                  flexShrink: 0
                }}
              />
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#1A3B2A' }}>
                  Welcome, Admin
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#7E736B', margin: 0 }}>
                  Have a great day!
                </p>
              </div>
            </div>

          </div>



          {/* Right: Notifications & Profile Pill */}

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>

            {/* Notification Bell with Badge */}
            <div style={{ position: 'relative' }} ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #ECE0CF',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#222F26',
                  position: 'relative',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
                title="Customer Order Notifications"
              >
                <Bell size={18} />
                {unreadNotifications && ordersList.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    backgroundColor: '#E03131',
                    color: '#FFFFFF',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #FCF5ED'
                  }}>
                    {Math.min(ordersList.length, 9)}
                  </span>
                )}
              </button>

              {/* Order Notifications Dropdown (Customer Orders Only) */}
              {notificationsOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '48px',
                  width: '320px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.12)',
                  border: '1px solid #ECE0CF',
                  padding: '1.15rem 1rem 1rem',
                  zIndex: 100
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', paddingBottom: '0.65rem', borderBottom: '1px solid #F0E8DC' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A3B2A' }}>Customer Orders</span>
                      <span style={{ fontSize: '0.72rem', backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: 600 }}>
                        {ordersList.length} orders
                      </span>
                    </div>
                    {unreadNotifications && (
                      <button
                        type="button"
                        onClick={() => setUnreadNotifications(false)}
                        style={{ fontSize: '0.72rem', color: '#1A3B2A', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '320px', overflowY: 'auto' }}>
                    {ordersList.length === 0 ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center', color: '#7E736B', fontSize: '0.82rem' }}>
                        No customer orders placed yet.
                      </div>
                    ) : (
                      ordersList.slice(0, 6).map((order, idx) => (
                        <div
                          key={order.id || idx}
                          onClick={() => {
                            setActiveTab('orders');
                            setNotificationsOpen(false);
                          }}
                          style={{
                            padding: '0.75rem',
                            backgroundColor: idx === 0 ? '#FAF5EE' : '#FFFFFF',
                            borderRadius: '10px',
                            fontSize: '0.82rem',
                            border: '1px solid #F0E8DC',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span style={{ fontSize: '0.95rem' }}>🌸</span>
                              <strong style={{ color: '#1A3B2A', fontSize: '0.84rem' }}>{order.id}</strong>
                            </div>
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.45rem',
                              borderRadius: '6px',
                              backgroundColor: order.status === 'Delivered' ? '#E8F5E9' : '#FFF3E0',
                              color: order.status === 'Delivered' ? '#2E7D32' : '#E65100'
                            }}>
                              {order.status || 'Placed'}
                            </span>
                          </div>
                          <p style={{ margin: 0, color: '#332E2B', fontSize: '0.82rem', fontWeight: 500 }}>
                            New flower order placed by <strong style={{ color: '#1A3B2A' }}>{order.customer}</strong>
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#7E736B', marginTop: '0.15rem' }}>
                            <span>📅 {order.date || 'Today'}</span>
                            <strong style={{ color: '#1A3B2A' }}>{order.amount}</strong>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {ordersList.length > 0 && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #F0E8DC', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('orders');
                          setNotificationsOpen(false);
                        }}
                        style={{
                          fontSize: '0.78rem',
                          color: '#1A3B2A',
                          fontWeight: 600,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        View all in Manage Orders →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Admin Avatar Pill */}

            <div style={{ position: 'relative' }}>

              <button

                onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}

                style={{

                  display: 'flex',

                  alignItems: 'center',

                  gap: '0.6rem',

                  background: '#FFFFFF',

                  border: '1px solid #ECE0CF',

                  borderRadius: '30px',

                  padding: '0.35rem 0.85rem 0.35rem 0.4rem',

                  cursor: 'pointer',

                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'

                }}

              >

                <img

                  src="/admin_avatar.png"

                  alt="Admin"

                  style={{

                    width: '32px',

                    height: '32px',

                    borderRadius: '50%',

                    objectFit: 'cover'

                  }}

                  onError={(e) => {

                    e.target.style.display = 'none';

                  }}

                />

                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1A3B2A' }}>

                  Admin

                </span>

                <ChevronDown size={14} style={{ color: '#7E736B' }} />

              </button>



              {/* Admin Menu Dropdown */}

              {adminDropdownOpen && (

                <div style={{

                  position: 'absolute',

                  right: 0,

                  top: '48px',

                  width: '180px',

                  backgroundColor: '#FFFFFF',

                  borderRadius: '12px',

                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',

                  border: '1px solid #ECE0CF',

                  padding: '0.5rem 0',

                  zIndex: 60

                }}>

                  <button

                    onClick={() => { setActiveTab('settings'); setAdminDropdownOpen(false); }}

                    style={{ width: '100%', padding: '0.6rem 1rem', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}

                  >

                    <Settings size={14} /> Settings

                  </button>

                  <Link

                    to="/"

                    style={{ width: '100%', padding: '0.6rem 1rem', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1A3B2A', textDecoration: 'none' }}

                  >

                    <ExternalLink size={14} /> Visit Storefront

                  </Link>

                  <hr style={{ border: 'none', borderTop: '1px solid #EEE', margin: '0.35rem 0' }} />

                  <button

                    onClick={() => handleTabChange('logout')}

                    style={{ width: '100%', padding: '0.6rem 1rem', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E03131' }}

                  >

                    <LogOut size={14} /> Logout

                  </button>

                </div>

              )}

            </div>



          </div>

        </header>



        {/* ================= 3. TAB CONTENT VIEWS ================= */}

        <main style={{

          padding: '2rem 2.25rem 3.5rem',

          flex: 1,

          position: 'relative'

        }}>



          {/* ========================================================= */}

          {/* TAB 1: DASHBOARD (EXACT REPLICA OF REFERENCE DESIGN)     */}

          {/* ========================================================= */}

          {activeTab === 'dashboard' && (

            <div>



              {/* Top Row: Dashboard Title + Leaf Branch + Roses Bouquet + Date Filter */}

              <div style={{

                display: 'flex',

                justifyContent: 'space-between',

                alignItems: 'flex-start',

                marginBottom: '2rem',

                position: 'relative'

              }}>

                {/* Left: Olive leaf + Title */}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 2 }}>

                  

                  <div>

                    <h1 className="font-serif" style={{

                      fontSize: '2.5rem',

                      fontWeight: 700,

                      color: '#1C3728',

                      margin: 0,

                      lineHeight: 1.15

                    }}>

                      Dashboard

                    </h1>

                    <p style={{

                      fontSize: '0.92rem',

                      color: '#6F665F',

                      margin: '0.25rem 0 0'

                    }}>

                      Overview of your Floora store

                    </p>

                  </div>

                </div>



                {/* Right: Date Filter Pill */}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 2 }}>

                  <div style={{ position: 'relative' }}>

                    <button

                      onClick={() => setDateDropdownOpen(!dateDropdownOpen)}

                      style={{

                        display: 'flex',

                        alignItems: 'center',

                        gap: '0.6rem',

                        backgroundColor: '#FFFFFF',

                        border: '1px solid #ECE0CF',

                        borderRadius: '12px',

                        padding: '0.65rem 1.15rem',

                        fontSize: '0.86rem',

                        fontWeight: 600,

                        color: '#1A3B2A',

                        cursor: 'pointer',

                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'

                      }}

                    >

                      <Calendar size={16} style={{ color: '#1A3B2A' }} />

                      <span>{dateRange}</span>

                      <ChevronDown size={14} style={{ color: '#7E736B' }} />

                    </button>



                    {dateDropdownOpen && (

                      <div style={{

                        position: 'absolute',

                        right: 0,

                        top: '46px',

                        width: '160px',

                        backgroundColor: '#FFFFFF',

                        borderRadius: '12px',

                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',

                        border: '1px solid #ECE0CF',

                        padding: '0.4rem 0',

                        zIndex: 60

                      }}>

                        {['Today', 'Last 7 Days', 'Last 30 Days', 'This Quarter', 'This Year'].map(range => (

                          <button

                            key={range}

                            onClick={() => { setDateRange(range); setDateDropdownOpen(false); }}

                            style={{

                              width: '100%',

                              padding: '0.55rem 1rem',

                              background: dateRange === range ? '#F5EFE6' : 'none',

                              border: 'none',

                              textAlign: 'left',

                              fontSize: '0.84rem',

                              cursor: 'pointer',

                              fontWeight: dateRange === range ? 600 : 400

                            }}

                          >

                            {range}

                          </button>

                        ))}

                      </div>

                    )}

                  </div>

                </div>

              </div>



              {/* ================= 4 METRIC / KPI CARDS MATCHING REFERENCE ================= */}

              <div style={{

                display: 'grid',

                gridTemplateColumns: 'repeat(4, 1fr)',

                gap: '1.4rem',

                marginBottom: '2rem'

              }} className="admin-kpi-grid">



                {/* Card 1: Total Orders */}

                <div style={{

                  backgroundColor: '#FFFFFF',

                  borderRadius: '20px',

                  padding: '1.4rem 1.35rem 1.25rem',

                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.035)',

                  border: '1px solid #ECE0CF',

                  position: 'relative',

                  overflow: 'hidden',

                  display: 'flex',

                  flexDirection: 'column',

                  justifyContent: 'space-between',

                  minHeight: '135px'

                }}>

                  {/* Top: Icon + Number + Label */}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

                    <div style={{

                      width: '54px',

                      height: '54px',

                      borderRadius: '50%',

                      backgroundColor: '#1E3E2B',

                      display: 'flex',

                      alignItems: 'center',

                      justifyContent: 'center',

                      color: '#FFFFFF',

                      flexShrink: 0

                    }}>

                      <ShoppingBag size={24} />

                    </div>

                    <div>

                      <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#1A3B2A', lineHeight: 1.15, fontFamily: "'Inter', system-ui, -apple-system, sans-serif", letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums lining-nums' }}>

                        245

                      </h2>

                      <span style={{ fontSize: '0.82rem', color: '#7E736B', fontWeight: 500 }}>

                        Total Orders

                      </span>

                    </div>

                  </div>



                  {/* Bottom: Trend Indicator */}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>

                    <span style={{

                      fontSize: '0.78rem',

                      fontWeight: 600,

                      color: '#2F9E6B',

                      display: 'flex',

                      alignItems: 'center',

                      gap: '0.2rem'

                    }}>

                      ↑ +12%

                    </span>

                  </div>



                  {/* Soft wavy light green accent bottom */}

                  <div style={{

                    position: 'absolute',

                    bottom: 0,

                    left: 0,

                    right: 0,

                    height: '8px',

                    background: 'linear-gradient(90deg, rgba(30, 62, 43, 0.15) 0%, rgba(200, 155, 89, 0.15) 100%)'

                  }} />

                </div>



                {/* Card 2: Total Customers */}

                <div style={{

                  backgroundColor: '#FFFFFF',

                  borderRadius: '20px',

                  padding: '1.4rem 1.35rem 1.25rem',

                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.035)',

                  border: '1px solid #ECE0CF',

                  position: 'relative',

                  overflow: 'hidden',

                  display: 'flex',

                  flexDirection: 'column',

                  justifyContent: 'space-between',

                  minHeight: '135px'

                }}>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

                    <div style={{

                      width: '54px',

                      height: '54px',

                      borderRadius: '50%',

                      backgroundColor: '#C89B59',

                      display: 'flex',

                      alignItems: 'center',

                      justifyContent: 'center',

                      color: '#FFFFFF',

                      flexShrink: 0

                    }}>

                      <Users size={24} />

                    </div>

                    <div>

                      <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#1A3B2A', lineHeight: 1.15, fontFamily: "'Inter', system-ui, -apple-system, sans-serif", letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums lining-nums' }}>

                        {usersList.length.toLocaleString()}

                      </h2>

                      <span style={{ fontSize: '0.82rem', color: '#7E736B', fontWeight: 500 }}>

                        Total Customers

                      </span>

                    </div>

                  </div>



                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>

                    <span style={{

                      fontSize: '0.78rem',

                      fontWeight: 600,

                      color: '#2F9E6B',

                      display: 'flex',

                      alignItems: 'center',

                      gap: '0.2rem'

                    }}>

                      ↑ +8%

                    </span>

                  </div>



                  <div style={{

                    position: 'absolute',

                    bottom: 0,

                    left: 0,

                    right: 0,

                    height: '8px',

                    background: 'linear-gradient(90deg, rgba(200, 155, 89, 0.2) 0%, rgba(200, 155, 89, 0.05) 100%)'

                  }} />

                </div>



                {/* Card 3: Total Sales */}

                <div style={{

                  backgroundColor: '#FFFFFF',

                  borderRadius: '20px',

                  padding: '1.4rem 1.35rem 1.25rem',

                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.035)',

                  border: '1px solid #ECE0CF',

                  position: 'relative',

                  overflow: 'hidden',

                  display: 'flex',

                  flexDirection: 'column',

                  justifyContent: 'space-between',

                  minHeight: '135px'

                }}>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

                    <div style={{

                      width: '54px',

                      height: '54px',

                      borderRadius: '50%',

                      backgroundColor: '#1E3E2B',

                      display: 'flex',

                      alignItems: 'center',

                      justifyContent: 'center',

                      color: '#FFFFFF',

                      flexShrink: 0,

                      fontSize: '1.4rem',

                      fontWeight: 700

                    }}>

                      ₹

                    </div>

                    <div>

                      <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#1A3B2A', lineHeight: 1.15, fontFamily: "'Inter', system-ui, -apple-system, sans-serif", letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums lining-nums', display: 'flex', alignItems: 'baseline', gap: '2px' }}>

                        <span style={{ fontSize: '1.4rem', fontWeight: 600, color: '#1A3B2A' }}>₹</span>
                        <span>2,48,750</span>

                      </h2>

                      <span style={{ fontSize: '0.82rem', color: '#7E736B', fontWeight: 500 }}>

                        Total Sales

                      </span>

                    </div>

                  </div>



                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>

                    <span style={{

                      fontSize: '0.78rem',

                      fontWeight: 600,

                      color: '#2F9E6B',

                      display: 'flex',

                      alignItems: 'center',

                      gap: '0.2rem'

                    }}>

                      ↑ +15%

                    </span>

                  </div>



                  <div style={{

                    position: 'absolute',

                    bottom: 0,

                    left: 0,

                    right: 0,

                    height: '8px',

                    background: 'linear-gradient(90deg, rgba(30, 62, 43, 0.2) 0%, rgba(47, 158, 107, 0.1) 100%)'

                  }} />

                </div>



                {/* Card 4: Products */}

                <div style={{

                  backgroundColor: '#FFFFFF',

                  borderRadius: '20px',

                  padding: '1.4rem 1.35rem 1.25rem',

                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.035)',

                  border: '1px solid #ECE0CF',

                  position: 'relative',

                  overflow: 'hidden',

                  display: 'flex',

                  flexDirection: 'column',

                  justifyContent: 'space-between',

                  minHeight: '135px'

                }}>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

                    <div style={{

                      width: '54px',

                      height: '54px',

                      borderRadius: '50%',

                      backgroundColor: '#C89B59',

                      display: 'flex',

                      alignItems: 'center',

                      justifyContent: 'center',

                      color: '#FFFFFF',

                      flexShrink: 0

                    }}>

                      {/* 5 petal flower icon matching reference */}

                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">

                        <circle cx="12" cy="7" r="3.2"/>

                        <circle cx="16.5" cy="10.5" r="3.2"/>

                        <circle cx="15" cy="16" r="3.2"/>

                        <circle cx="9" cy="16" r="3.2"/>

                        <circle cx="7.5" cy="10.5" r="3.2"/>

                        <circle cx="12" cy="12" r="2.2" fill="#C89B59"/>

                      </svg>

                    </div>

                    <div>

                      <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#1A3B2A', lineHeight: 1.15, fontFamily: "'Inter', system-ui, -apple-system, sans-serif", letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums lining-nums' }}>
                        {productsList.length || 180}
                      </h2>

                      <span style={{ fontSize: '0.82rem', color: '#7E736B', fontWeight: 500 }}>

                        Products

                      </span>

                    </div>

                  </div>



                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>

                    <span style={{

                      fontSize: '0.78rem',

                      fontWeight: 600,

                      color: '#2F9E6B',

                      display: 'flex',

                      alignItems: 'center',

                      gap: '0.2rem'

                    }}>

                      ↑ +10%

                    </span>

                  </div>



                  <div style={{

                    position: 'absolute',

                    bottom: 0,

                    left: 0,

                    right: 0,

                    height: '8px',

                    background: 'linear-gradient(90deg, rgba(200, 155, 89, 0.2) 0%, rgba(200, 155, 89, 0.05) 100%)'

                  }} />

                </div>



              </div>



              {/* ================= MIDDLE SECTION: SALES OVERVIEW + RECENT ORDERS ================= */}

              <div style={{

                display: 'grid',

                gridTemplateColumns: '1.05fr 1fr',

                gap: '1.5rem',

                marginBottom: '2rem'

              }} className="admin-middle-grid">



                {/* LEFT CARD: SALES OVERVIEW (CUSTOM SVG CHART MATCHING REFERENCE) */}

                <div style={{

                  backgroundColor: '#FFFFFF',

                  borderRadius: '20px',

                  padding: '1.5rem 1.6rem 1.25rem',

                  border: '1px solid #ECE0CF',

                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.035)',

                  display: 'flex',

                  flexDirection: 'column',

                  justifyContent: 'space-between',

                  position: 'relative'

                }}>

                  {/* Card Header */}

                  <div style={{

                    display: 'flex',

                    justifyContent: 'space-between',

                    alignItems: 'center',

                    marginBottom: '1.25rem'

                  }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>

                      <span style={{ display: 'flex', alignItems: 'center', color: '#1A3B2A' }}>

                        {/* Vertical Bar Chart Icon */}

                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">

                          <line x1="18" y1="20" x2="18" y2="10"/>

                          <line x1="12" y1="20" x2="12" y2="4"/>

                          <line x1="6" y1="20" x2="6" y2="14"/>

                        </svg>

                      </span>

                      <h3 className="font-serif" style={{ fontSize: '1.28rem', fontWeight: 700, margin: 0, color: '#1A3B2A' }}>

                        Sales Overview

                      </h3>

                    </div>



                    {/* Period Dropdown */}

                    <div style={{ position: 'relative' }}>

                      <button

                        onClick={() => setSalesPeriodOpen(!salesPeriodOpen)}

                        style={{

                          display: 'flex',

                          alignItems: 'center',

                          gap: '0.45rem',

                          background: '#FFFFFF',

                          border: '1px solid #ECE0CF',

                          borderRadius: '8px',

                          padding: '0.4rem 0.85rem',

                          fontSize: '0.8rem',

                          color: '#222F26',

                          cursor: 'pointer',

                          fontWeight: 500

                        }}

                      >

                        <span>{salesPeriod}</span>

                        <ChevronDown size={13} style={{ color: '#7E736B' }} />

                      </button>



                      {salesPeriodOpen && (

                        <div style={{

                          position: 'absolute',

                          right: 0,

                          top: '36px',

                          backgroundColor: '#FFFFFF',

                          border: '1px solid #ECE0CF',

                          borderRadius: '8px',

                          boxShadow: '0 6px 18px rgba(0,0,0,0.08)',

                          zIndex: 20,

                          width: '130px',

                          padding: '0.3rem 0'

                        }}>

                          {['This Month', 'Last Month', 'This Quarter'].map(period => (

                            <button

                              key={period}

                              onClick={() => { setSalesPeriod(period); setSalesPeriodOpen(false); }}

                              style={{

                                width: '100%',

                                padding: '0.45rem 0.8rem',

                                background: salesPeriod === period ? '#FAF5EE' : 'none',

                                border: 'none',

                                textAlign: 'left',

                                fontSize: '0.8rem',

                                cursor: 'pointer'

                              }}

                            >

                              {period}

                            </button>

                          ))}

                        </div>

                      )}

                    </div>

                  </div>



                  {/* Chart Stage with Y-Axis and Smooth SVG Curve */}

                  <div style={{ display: 'flex', gap: '0.75rem', position: 'relative', height: '220px', alignItems: 'stretch' }}>

                    

                    {/* Y-Axis Labels */}

                    <div style={{

                      display: 'flex',

                      flexDirection: 'column',

                      justifyContent: 'space-between',

                      fontSize: '0.75rem',

                      color: '#7E736B',

                      textAlign: 'right',

                      width: '32px',

                      paddingBottom: '22px'

                    }}>

                      <span>1.5L</span>

                      <span>1L</span>

                      <span>50k</span>

                      <span>0k</span>

                    </div>



                    {/* SVG Curve Container */}

                    <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>

                      

                      {/* Grid Lines */}

                      <div style={{

                        position: 'absolute',

                        inset: 0,

                        bottom: '22px',

                        display: 'flex',

                        flexDirection: 'column',

                        justifyContent: 'space-between',

                        pointerEvents: 'none'

                      }}>

                        <div style={{ borderBottom: '1px solid #F0E8DC' }} />

                        <div style={{ borderBottom: '1px solid #F0E8DC' }} />

                        <div style={{ borderBottom: '1px solid #F0E8DC' }} />

                        <div style={{ borderBottom: '1px solid #EAE0D2' }} />

                      </div>



                      {/* Smooth Area SVG */}

                      <svg

                        viewBox="0 0 400 170"

                        preserveAspectRatio="none"

                        style={{ width: '100%', height: 'calc(100% - 22px)', overflow: 'visible' }}

                      >

                        <defs>

                          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">

                            <stop offset="0%" stopColor="#2E6B47" stopOpacity="0.32" />

                            <stop offset="60%" stopColor="#8AB89E" stopOpacity="0.12" />

                            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />

                          </linearGradient>

                        </defs>







                        {/* Shaded Area */}

                        <path

                          d="M 10 120 C 80 100, 120 85, 140 80 C 180 75, 220 65, 260 55 C 310 45, 360 30, 390 20 L 390 170 L 10 170 Z"

                          fill="url(#salesGrad)"

                        />



                        {/* Trend Stroke Line */}

                        <path

                          d="M 10 120 C 80 100, 120 85, 140 80 C 180 75, 220 65, 260 55 C 310 45, 360 30, 390 20"

                          fill="none"

                          stroke="#1A3B2A"

                          strokeWidth="2.8"

                          strokeLinecap="round"

                        />



                        {/* Points on Line */}

                        <circle cx="10" cy="120" r="4.5" fill="#1A3B2A" stroke="#FFFFFF" strokeWidth="1.5" />

                        <circle cx="140" cy="80" r="4.5" fill="#1A3B2A" stroke="#FFFFFF" strokeWidth="1.5" />

                        <circle cx="260" cy="55" r="4.5" fill="#1A3B2A" stroke="#FFFFFF" strokeWidth="1.5" />

                        <circle cx="390" cy="20" r="5" fill="#1A3B2A" stroke="#FFFFFF" strokeWidth="2" />

                      </svg>



                      {/* Tooltip on last point (Week 4: ₹1,32,000) matching reference */}

                      <div style={{

                        position: 'absolute',

                        top: '-2px',

                        right: '0px',

                        backgroundColor: '#162E20',

                        color: '#FFFFFF',

                        fontSize: '0.78rem',

                        fontWeight: 700,

                        padding: '0.35rem 0.75rem',

                        borderRadius: '12px',

                        boxShadow: '0 4px 12px rgba(22, 46, 32, 0.35)',

                        pointerEvents: 'none',

                        zIndex: 10

                      }}>

                        ₹1,32,000

                      </div>



                      {/* X-Axis Labels */}

                      <div style={{

                        display: 'flex',

                        justifyContent: 'space-between',

                        fontSize: '0.78rem',

                        color: '#7E736B',

                        marginTop: '0.25rem',

                        padding: '0 5px'

                      }}>

                        <span>Week 1</span>

                        <span>Week 2</span>

                        <span>Week 3</span>

                        <span>Week 4</span>

                      </div>



                    </div>

                  </div>

                </div>



                {/* RIGHT CARD: RECENT ORDERS TABLE MATCHING REFERENCE */}

                <div style={{

                  backgroundColor: '#FFFFFF',

                  borderRadius: '20px',

                  padding: '1.5rem 1.6rem 1.25rem',

                  border: '1px solid #ECE0CF',

                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.035)',

                  display: 'flex',

                  flexDirection: 'column',

                  justifyContent: 'space-between'

                }}>

                  {/* Card Header */}

                  <div style={{

                    display: 'flex',

                    justifyContent: 'space-between',

                    alignItems: 'center',

                    marginBottom: '1.25rem'

                  }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>

                      <span style={{ display: 'flex', alignItems: 'center', color: '#1A3B2A' }}>

                        <ShoppingBag size={20} />

                      </span>

                      <h3 className="font-serif" style={{ fontSize: '1.28rem', fontWeight: 700, margin: 0, color: '#1A3B2A' }}>

                        Recent Orders

                      </h3>

                    </div>



                    <button

                      onClick={() => handleTabChange('orders')}

                      style={{

                        background: 'none',

                        border: 'none',

                        fontSize: '0.84rem',

                        fontWeight: 600,

                        color: '#1A3B2A',

                        cursor: 'pointer',

                        display: 'flex',

                        alignItems: 'center',

                        gap: '0.3rem'

                      }}

                    >

                      <span>View All</span>

                      <ArrowRight size={14} />

                    </button>

                  </div>



                  {/* Orders Table */}

                  <div style={{ overflowX: 'auto', flex: 1 }}>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>

                      <thead>

                        <tr style={{ color: '#7E736B', textAlign: 'left', borderBottom: '1px solid #F0E8DC' }}>

                          <th style={{ paddingBottom: '0.75rem', fontWeight: 600 }}>Order ID</th>

                          <th style={{ paddingBottom: '0.75rem', fontWeight: 600 }}>Customer</th>

                          <th style={{ paddingBottom: '0.75rem', fontWeight: 600 }}>Amount</th>

                          <th style={{ paddingBottom: '0.75rem', fontWeight: 600, textAlign: 'center' }}>Status</th>

                          <th style={{ paddingBottom: '0.75rem', fontWeight: 600, textAlign: 'right' }}>Date</th>

                        </tr>

                      </thead>

                      <tbody>

                        {ordersList.slice(0, 4).map((order) => {

                          const statusStyles = {

                            Delivered: { bg: '#EBF7EE', color: '#2B8A3E' },

                            Pending: { bg: '#FFF4E6', color: '#E8590C' },

                            Shipped: { bg: '#E7F5FF', color: '#1C7ED6' },

                            Cancelled: { bg: '#FFE3E3', color: '#C92A2A' }

                          };

                          const currentStyle = statusStyles[order.status] || statusStyles.Pending;



                          return (

                            <tr key={order.id} style={{ borderBottom: '1px solid #FAF4EC' }}>

                              <td style={{ padding: '0.75rem 0', fontWeight: 600, color: '#1A3B2A' }}>

                                {order.id}

                              </td>

                              <td style={{ padding: '0.75rem 0' }}>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>

                                  <span style={{

                                    width: '26px',

                                    height: '26px',

                                    borderRadius: '50%',

                                    backgroundColor: order.avatarBg || '#F5EFE6',

                                    display: 'flex',

                                    alignItems: 'center',

                                    justifyContent: 'center',

                                    fontSize: '0.85rem'

                                  }}>

                                    {order.avatarFlower || '🌸'}

                                  </span>

                                  <span style={{ fontWeight: 600, color: '#2D2520' }}>

                                    {order.customer}

                                  </span>

                                </div>

                              </td>

                              <td style={{ padding: '0.75rem 0', fontWeight: 700, color: '#222F26' }}>

                                {order.amount}

                              </td>

                              <td style={{ padding: '0.75rem 0', textAlign: 'center' }}>

                                <span style={{

                                  backgroundColor: currentStyle.bg,

                                  color: currentStyle.color,

                                  padding: '0.25rem 0.7rem',

                                  borderRadius: '20px',

                                  fontSize: '0.72rem',

                                  fontWeight: 600,

                                  display: 'inline-block'

                                }}>

                                  {order.status}

                                </span>

                              </td>

                              <td style={{ padding: '0.75rem 0', textAlign: 'right', color: '#7E736B' }}>

                                {order.date}

                              </td>

                            </tr>

                          );

                        })}

                      </tbody>

                    </table>

                  </div>



                </div>



              </div>



              {/* ================= BOTTOM 4 QUICK-ACTION CARDS MATCHING REFERENCE ================= */}

              <div style={{

                display: 'grid',

                gridTemplateColumns: 'repeat(4, 1fr)',

                gap: '1.4rem'

              }} className="admin-bottom-cards-grid">



                {/* Bottom Card 1: Manage Products */}

                <div style={{

                  backgroundColor: '#FFFFFF',

                  borderRadius: '20px',

                  padding: '1.25rem 1.25rem',

                  border: '1px solid #ECE0CF',

                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.035)',

                  display: 'flex',

                  alignItems: 'center',

                  justifyContent: 'space-between',

                  gap: '1rem',

                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'

                }} className="admin-quick-card">

                  {/* Left: Red Rose Bouquet in Vase */}

                  <img

                    src="/admin_card_roses.png"

                    alt="Products"

                    style={{

                      width: '75px',

                      height: '85px',

                      objectFit: 'contain',

                      flexShrink: 0

                    }}

                  />

                  {/* Right: Title & Go button */}

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.65rem' }}>

                    <h4 className="font-serif" style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#1A3B2A' }}>

                      Manage<br />Products

                    </h4>

                    <button

                      onClick={() => handleTabChange('products')}

                      style={{

                        backgroundColor: '#1E3E2B',

                        color: '#FFFFFF',

                        border: 'none',

                        borderRadius: '20px',

                        padding: '0.35rem 0.95rem',

                        fontSize: '0.78rem',

                        fontWeight: 600,

                        cursor: 'pointer',

                        display: 'flex',

                        alignItems: 'center',

                        gap: '0.3rem',

                        boxShadow: '0 2px 6px rgba(30, 62, 43, 0.2)'

                      }}

                    >

                      <span>Go</span>

                      <ArrowRight size={12} />

                    </button>

                  </div>

                </div>



                {/* Bottom Card 2: Manage Orders */}

                <div style={{

                  backgroundColor: '#FFFFFF',

                  borderRadius: '20px',

                  padding: '1.25rem 1.25rem',

                  border: '1px solid #ECE0CF',

                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.035)',

                  display: 'flex',

                  alignItems: 'center',

                  justifyContent: 'space-between',

                  gap: '1rem',

                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'

                }} className="admin-quick-card">

                  {/* Left: Pink Rose Bouquet wrap */}

                  <img

                    src="/admin_card_pink_roses.png"

                    alt="Orders"

                    style={{

                      width: '75px',

                      height: '85px',

                      objectFit: 'contain',

                      flexShrink: 0

                    }}

                  />

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.65rem' }}>

                    <h4 className="font-serif" style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#1A3B2A' }}>

                      Manage<br />Orders

                    </h4>

                    <button

                      onClick={() => handleTabChange('orders')}

                      style={{

                        backgroundColor: '#1E3E2B',

                        color: '#FFFFFF',

                        border: 'none',

                        borderRadius: '20px',

                        padding: '0.35rem 0.95rem',

                        fontSize: '0.78rem',

                        fontWeight: 600,

                        cursor: 'pointer',

                        display: 'flex',

                        alignItems: 'center',

                        gap: '0.3rem',

                        boxShadow: '0 2px 6px rgba(30, 62, 43, 0.2)'

                      }}

                    >

                      <span>Go</span>

                      <ArrowRight size={12} />

                    </button>

                  </div>

                </div>



                {/* Bottom Card 3: Manage Categories */}

                <div style={{

                  backgroundColor: '#FFFFFF',

                  borderRadius: '20px',

                  padding: '1.25rem 1.25rem',

                  border: '1px solid #ECE0CF',

                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.035)',

                  display: 'flex',

                  alignItems: 'center',

                  justifyContent: 'space-between',

                  gap: '1rem',

                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'

                }} className="admin-quick-card">

                  {/* Left: Potted Sunflower */}

                  <img

                    src="/admin_card_sunflower.png"

                    alt="Categories"

                    style={{

                      width: '75px',

                      height: '85px',

                      objectFit: 'contain',

                      flexShrink: 0

                    }}

                  />

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.65rem' }}>

                    <h4 className="font-serif" style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#1A3B2A' }}>

                      Manage<br />Categories

                    </h4>

                    <button

                      onClick={() => handleTabChange('categories')}

                      style={{

                        backgroundColor: '#1E3E2B',

                        color: '#FFFFFF',

                        border: 'none',

                        borderRadius: '20px',

                        padding: '0.35rem 0.95rem',

                        fontSize: '0.78rem',

                        fontWeight: 600,

                        cursor: 'pointer',

                        display: 'flex',

                        alignItems: 'center',

                        gap: '0.3rem',

                        boxShadow: '0 2px 6px rgba(30, 62, 43, 0.2)'

                      }}

                    >

                      <span>Go</span>

                      <ArrowRight size={12} />

                    </button>

                  </div>

                </div>



                {/* Bottom Card 4: Manage Offers */}

                <div style={{

                  backgroundColor: '#FFFFFF',

                  borderRadius: '20px',

                  padding: '1.25rem 1.25rem',

                  border: '1px solid #ECE0CF',

                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.035)',

                  display: 'flex',

                  alignItems: 'center',

                  justifyContent: 'space-between',

                  gap: '1rem',

                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'

                }} className="admin-quick-card">

                  {/* Left: Pink Lilies Vase */}

                  <img

                    src="/admin_card_lilies.png"

                    alt="Offers"

                    style={{

                      width: '75px',

                      height: '85px',

                      objectFit: 'contain',

                      flexShrink: 0

                    }}

                  />

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.65rem' }}>

                    <h4 className="font-serif" style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#1A3B2A' }}>

                      Manage<br />Home

                    </h4>

                    <button

                      onClick={() => handleTabChange('manage_home')}

                      style={{

                        backgroundColor: '#1E3E2B',

                        color: '#FFFFFF',

                        border: 'none',

                        borderRadius: '20px',

                        padding: '0.35rem 0.95rem',

                        fontSize: '0.78rem',

                        fontWeight: 600,

                        cursor: 'pointer',

                        display: 'flex',

                        alignItems: 'center',

                        gap: '0.3rem',

                        boxShadow: '0 2px 6px rgba(30, 62, 43, 0.2)'

                      }}

                    >

                      <span>Go</span>

                      <ArrowRight size={12} />

                    </button>

                  </div>

                </div>



              </div>



            </div>

          )}



          {/* ========================================================= */}

          {/* TAB 2: MANAGE PRODUCTS                                   */}

          {/* ========================================================= */}

          {/* ========================================================= */}

          {/* TAB: MANAGE HOME (Live Homepage Sections & Footer Control) */}

          {/* ========================================================= */}

          {activeTab === 'manage-home' && (

            <div>

              {/* Header */}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>

                <div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>

                    <h1 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1C3728', margin: 0 }}>

                      Manage Home

                    </h1>

                    <span style={{

                      backgroundColor: '#E8F5E9',

                      color: '#2E7D32',

                      fontSize: '0.74rem',

                      fontWeight: 600,

                      padding: '0.25rem 0.65rem',

                      borderRadius: '12px',

                      display: 'inline-flex',

                      alignItems: 'center',

                      gap: '0.35rem'

                    }}>

                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2E7D32' }}></span>

                      Live Synced with Firebase

                    </span>

                  </div>

                  <p style={{ fontSize: '0.88rem', color: '#7E736B', margin: '0.25rem 0 0' }}>

                    Add, edit, reorder, or update all User Panel homepage sections and footer in real-time.

                  </p>

                </div>



                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>

                  <Link

                    to="/"

                    target="_blank"

                    style={{

                      padding: '0.65rem 1.15rem',

                      borderRadius: '12px',

                      backgroundColor: '#FFFFFF',

                      color: '#1A3B2A',

                      border: '1px solid #ECE0CF',

                      textDecoration: 'none',

                      fontSize: '0.85rem',

                      fontWeight: 600,

                      display: 'flex',

                      alignItems: 'center',

                      gap: '0.4rem',

                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'

                    }}

                  >

                    <span>View User Homepage</span>

                    <ExternalLink size={14} />

                  </Link>



                  <button

                    type="button"

                    onClick={() => updateAndSyncHomeData(homeData, 'All Homepage sections saved & live synced!')}

                    style={{

                      backgroundColor: '#1A3B2A',

                      color: '#FFFFFF',

                      border: 'none',

                      borderRadius: '12px',

                      padding: '0.65rem 1.35rem',

                      fontSize: '0.86rem',

                      fontWeight: 600,

                      cursor: 'pointer',

                      display: 'flex',

                      alignItems: 'center',

                      gap: '0.45rem',

                      boxShadow: '0 4px 12px rgba(26, 59, 42, 0.2)'

                    }}

                  >

                    <Save size={15} />

                    <span>Sync All to Firebase</span>

                  </button>

                </div>

              </div>



              {/* Section Sub-Navigation Tabs */}

              <div style={{

                display: 'flex',

                gap: '0.5rem',

                backgroundColor: '#FFFFFF',

                padding: '0.5rem',

                borderRadius: '14px',

                border: '1px solid #ECE0CF',

                marginBottom: '1.75rem',

                overflowX: 'auto',

                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'

              }}>

                {[

                  { id: 'hero', label: 'Hero Banners', icon: <ImageIcon size={15} />, badge: `${homeData.heroBanners?.banners?.length || 0} slides` },

                  { id: 'catalog', label: 'All Flowers & Bouquets', icon: <Package size={15} /> },

                  { id: 'offers', label: 'Special Offers', icon: <Tag size={15} />, badge: `${homeData.specialOffers?.offers?.length || 0} active` },

                  { id: 'reviews', label: 'Customer Reviews', icon: <Star size={15} />, badge: `${homeData.reviewsSection?.reviews?.length || 0} reviews` },



                  { id: 'footer', label: 'Footer & Info', icon: <Globe size={15} /> },

                ].map(tab => {

                  const isActive = homeSubTab === tab.id;

                  return (

                    <button

                      key={tab.id}

                      type="button"

                      onClick={() => setHomeSubTab(tab.id)}

                      style={{

                        display: 'flex',

                        alignItems: 'center',

                        gap: '0.45rem',

                        padding: '0.6rem 1.1rem',

                        borderRadius: '10px',

                        border: 'none',

                        backgroundColor: isActive ? '#1A3B2A' : 'transparent',

                        color: isActive ? '#FFFFFF' : '#4A4036',

                        fontSize: '0.84rem',

                        fontWeight: isActive ? 600 : 500,

                        cursor: 'pointer',

                        whiteSpace: 'nowrap',

                        transition: 'all 0.2s ease'

                      }}

                    >

                      {tab.icon}

                      <span>{tab.label}</span>

                      {tab.badge && (

                        <span style={{

                          fontSize: '0.72rem',

                          padding: '0.15rem 0.45rem',

                          borderRadius: '8px',

                          backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#F5EFE6',

                          color: isActive ? '#FFFFFF' : '#7E736B'

                        }}>

                          {tab.badge}

                        </span>

                      )}

                    </button>

                  );

                })}

              </div>



              {/* ================= 1. HERO BANNERS MANAGEMENT ================= */}

              {homeSubTab === 'hero' && (

                <div>

                  {/* Slider Control Panel Card */}

                  <div style={{

                    backgroundColor: '#FFFFFF',

                    borderRadius: '18px',

                    border: '1px solid #ECE0CF',

                    padding: '1.35rem 1.5rem',

                    marginBottom: '1.5rem',

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'space-between',

                    flexWrap: 'wrap',

                    gap: '1rem',

                    boxShadow: '0 4px 16px rgba(0,0,0,0.02)'

                  }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

                        <button

                          type="button"

                          onClick={handleToggleAutoPlay}

                          style={{

                            display: 'flex',

                            alignItems: 'center',

                            gap: '0.45rem',

                            padding: '0.5rem 0.95rem',

                            borderRadius: '10px',

                            border: '1px solid #ECE0CF',

                            backgroundColor: homeData.heroBanners?.autoPlay ? '#E8F5E9' : '#FAF5EE',

                            color: homeData.heroBanners?.autoPlay ? '#2E7D32' : '#7E736B',

                            fontWeight: 600,

                            fontSize: '0.82rem',

                            cursor: 'pointer'

                          }}

                        >

                          {homeData.heroBanners?.autoPlay ? <Play size={14} /> : <Pause size={14} />}

                          <span>Auto-Play: {homeData.heroBanners?.autoPlay ? 'ON' : 'OFF'}</span>

                        </button>

                      </div>



                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

                        <span style={{ fontSize: '0.82rem', color: '#7E736B', fontWeight: 500 }}>Slide Duration:</span>

                        <select

                          value={homeData.heroBanners?.interval || 3000}

                          onChange={(e) => handleIntervalChange(e.target.value)}

                          style={{

                            padding: '0.45rem 0.75rem',

                            borderRadius: '8px',

                            border: '1px solid #ECE0CF',

                            backgroundColor: '#FFFFFF',

                            fontSize: '0.82rem',

                            fontWeight: 600,

                            color: '#1A3B2A'

                          }}

                        >

                          <option value="2000">2 Seconds (Fast)</option>

                          <option value="3000">3 Seconds (Standard)</option>

                          <option value="4000">4 Seconds (Smooth)</option>

                          <option value="5000">5 Seconds (Relaxed)</option>

                        </select>

                      </div>

                    </div>



                    <button

                      type="button"

                      onClick={handleOpenAddBanner}

                      style={{

                        backgroundColor: '#1A3B2A',

                        color: '#FFFFFF',

                        border: 'none',

                        borderRadius: '10px',

                        padding: '0.65rem 1.25rem',

                        fontSize: '0.84rem',

                        fontWeight: 600,

                        cursor: 'pointer',

                        display: 'flex',

                        alignItems: 'center',

                        gap: '0.45rem',

                        boxShadow: '0 4px 12px rgba(26,59,42,0.18)'

                      }}

                    >

                      <Plus size={15} />

                      <span>Add Hero Banner</span>

                    </button>

                  </div>



                  {/* Banners Grid */}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>

                    {(homeData.heroBanners?.banners || []).map((banner, idx) => (

                      <div

                        key={banner.id || idx}

                        style={{

                          backgroundColor: '#FFFFFF',

                          borderRadius: '16px',

                          border: '1px solid #ECE0CF',

                          overflow: 'hidden',

                          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',

                          display: 'flex',

                          flexDirection: 'column'

                        }}

                      >

                        <div style={{ position: 'relative', height: '160px', backgroundColor: '#FAF5EE' }}>

                          <img

                            src={banner.image}

                            alt={banner.alt || banner.title}

                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}

                          />

                          <span style={{

                            position: 'absolute',

                            top: '10px',

                            left: '10px',

                            backgroundColor: 'rgba(26, 59, 42, 0.85)',

                            color: '#FFFFFF',

                            fontSize: '0.72rem',

                            fontWeight: 700,

                            padding: '0.2rem 0.55rem',

                            borderRadius: '6px',

                            backdropFilter: 'blur(4px)'

                          }}>

                            Slide #{idx + 1}

                          </span>

                        </div>



                        <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>

                          <div>

                            <h4 className="font-serif" style={{ fontSize: '1.15rem', color: '#1A3B2A', margin: '0 0 0.35rem', fontWeight: 700 }}>

                              {banner.title || banner.alt || 'Floora Fresh Flowers Banner'}

                            </h4>

                            <p style={{ fontSize: '0.8rem', color: '#7E736B', margin: '0 0 0.85rem', lineHeight: 1.4 }}>

                              {banner.subtitle || 'Fresh Flowers, Delivered with Love.'}

                            </p>

                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.75rem', color: '#655A52' }}>

                              <span style={{ backgroundColor: '#FAF5EE', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>

                                Link: {banner.buttonLink || '/shop'}

                              </span>

                            </div>

                          </div>



                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid #F5EFE6', paddingTop: '0.75rem' }}>

                            <button

                              type="button"

                              onClick={() => handleOpenEditBanner(banner)}

                              style={{

                                display: 'flex',

                                alignItems: 'center',

                                gap: '0.35rem',

                                padding: '0.45rem 0.85rem',

                                borderRadius: '8px',

                                border: '1px solid #ECE0CF',

                                backgroundColor: '#F5EFE6',

                                color: '#1A3B2A',

                                fontSize: '0.78rem',

                                fontWeight: 600,

                                cursor: 'pointer'

                              }}

                            >

                              <Edit2 size={13} />

                              <span>Edit</span>

                            </button>

                            <button

                              type="button"

                              onClick={() => handleDeleteBanner(banner.id)}

                              style={{

                                display: 'flex',

                                alignItems: 'center',

                                gap: '0.35rem',

                                padding: '0.45rem 0.85rem',

                                borderRadius: '8px',

                                border: '1px solid #FFD8D8',

                                backgroundColor: '#FFF5F5',

                                color: '#E03131',

                                fontSize: '0.78rem',

                                fontWeight: 600,

                                cursor: 'pointer'

                              }}

                            >

                              <Trash2 size={13} />

                              <span>Delete</span>

                            </button>

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                </div>

              )}



              {/* ================= 2. ALL FLOWERS & BOUQUETS CATALOG MANAGEMENT ================= */}

              {homeSubTab === 'catalog' && (

                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #ECE0CF', padding: '1.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>

                  <form onSubmit={handleSaveCatalogSection}>

                    <div style={{ borderBottom: '1px solid #F0E6D8', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>

                      <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1A3B2A', margin: '0 0 0.35rem' }}>

                        Main Section Header Settings

                      </h3>

                      <p style={{ fontSize: '0.84rem', color: '#7E736B', margin: '0 0 1.25rem' }}>

                        Controls the title, subtitle, and description displayed above the 4 curated collections on the homepage.

                      </p>



                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>

                        <div>

                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#1A3B2A', marginBottom: '0.35rem' }}>

                            Section Subtitle Badge

                          </label>

                          <input

                            type="text"

                            value={catalogForm.sectionSubtitle || ''}

                            onChange={(e) => setCatalogForm({ ...catalogForm, sectionSubtitle: e.target.value })}

                            style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.86rem' }}

                          />

                        </div>



                        <div>

                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#1A3B2A', marginBottom: '0.35rem' }}>

                            Main Section Title

                          </label>

                          <input

                            type="text"

                            value={catalogForm.sectionTitle || ''}

                            onChange={(e) => setCatalogForm({ ...catalogForm, sectionTitle: e.target.value })}

                            style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.86rem' }}

                          />

                        </div>

                      </div>



                      <div style={{ marginTop: '1rem' }}>

                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#1A3B2A', marginBottom: '0.35rem' }}>

                          Section Description Paragraph

                        </label>

                        <textarea

                          rows="2"

                          value={catalogForm.sectionDescription || ''}

                          onChange={(e) => setCatalogForm({ ...catalogForm, sectionDescription: e.target.value })}

                          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.86rem' }}

                        />

                      </div>



                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem' }}>

                        <div>

                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#1A3B2A', marginBottom: '0.35rem' }}>

                            Explore All Button Label

                          </label>

                          <input

                            type="text"

                            value={catalogForm.exploreAllText || ''}

                            onChange={(e) => setCatalogForm({ ...catalogForm, exploreAllText: e.target.value })}

                            style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.86rem' }}

                          />

                        </div>

                        <div>

                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#1A3B2A', marginBottom: '0.35rem' }}>

                            Explore All Button Target URL

                          </label>

                          <input

                            type="text"

                            value={catalogForm.exploreAllLink || ''}

                            onChange={(e) => setCatalogForm({ ...catalogForm, exploreAllLink: e.target.value })}

                            style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.86rem' }}

                          />

                        </div>

                      </div>

                    </div>



                    {/* 4 Collection Rows Config */}

                    <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1A3B2A', margin: '0 0 1rem' }}>

                      4 Collection Rows Headers & Action Links

                    </h3>



                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>

                      {[

                        { key: 'indian', defaultNum: '1', defaultTitle: 'Indian Flowers' },

                        { key: 'bouquets', defaultNum: '2', defaultTitle: 'Bouquets (Different Flowers)' },

                        { key: 'international', defaultNum: '3', defaultTitle: 'International Flowers' },

                        { key: 'pots', defaultNum: '4', defaultTitle: 'Flower Pots & Indoor Plants' },

                      ].map(r => {

                        const rowData = catalogForm.rows?.[r.key] || {};

                        return (

                          <div key={r.key} style={{ backgroundColor: '#FAF7F2', borderRadius: '14px', border: '1px solid #ECE0CF', padding: '1.2rem' }}>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>

                              <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#1A3B2A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.74rem', fontWeight: 700 }}>

                                {r.defaultNum}

                              </span>

                              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1A3B2A' }}>

                                {r.defaultTitle}

                              </span>

                            </div>



                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>

                              <div>

                                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#655A52', marginBottom: '0.2rem' }}>Row Heading</label>

                                <input

                                  type="text"

                                  value={rowData.title || ''}

                                  onChange={(e) => setCatalogForm({

                                    ...catalogForm,

                                    rows: {

                                      ...catalogForm.rows,

                                      [r.key]: { ...rowData, title: e.target.value }

                                    }

                                  })}

                                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #ECE0CF', fontSize: '0.82rem' }}

                                />

                              </div>



                              <div>

                                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#655A52', marginBottom: '0.2rem' }}>Row Subtitle Description</label>

                                <input

                                  type="text"

                                  value={rowData.subtitle || ''}

                                  onChange={(e) => setCatalogForm({

                                    ...catalogForm,

                                    rows: {

                                      ...catalogForm.rows,

                                      [r.key]: { ...rowData, subtitle: e.target.value }

                                    }

                                  })}

                                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #ECE0CF', fontSize: '0.82rem' }}

                                />

                              </div>



                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>

                                <div>

                                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#655A52', marginBottom: '0.2rem' }}>Button Text</label>

                                  <input

                                    type="text"

                                    value={rowData.buttonText || ''}

                                    onChange={(e) => setCatalogForm({

                                      ...catalogForm,

                                      rows: {

                                        ...catalogForm.rows,

                                        [r.key]: { ...rowData, buttonText: e.target.value }

                                      }

                                    })}

                                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #ECE0CF', fontSize: '0.82rem' }}

                                  />

                                </div>

                                <div>

                                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#655A52', marginBottom: '0.2rem' }}>Target Link</label>

                                  <input

                                    type="text"

                                    value={rowData.buttonLink || ''}

                                    onChange={(e) => setCatalogForm({

                                      ...catalogForm,

                                      rows: {

                                        ...catalogForm.rows,

                                        [r.key]: { ...rowData, buttonLink: e.target.value }

                                      }

                                    })}

                                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #ECE0CF', fontSize: '0.82rem' }}

                                  />

                                </div>

                              </div>

                            </div>

                          </div>

                        );

                      })}

                    </div>



                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>

                      <button

                        type="submit"

                        style={{

                          backgroundColor: '#1A3B2A',

                          color: '#FFFFFF',

                          border: 'none',

                          borderRadius: '10px',

                          padding: '0.7rem 1.6rem',

                          fontSize: '0.88rem',

                          fontWeight: 600,

                          cursor: 'pointer',

                          display: 'flex',

                          alignItems: 'center',

                          gap: '0.5rem'

                        }}

                      >

                        <Save size={16} />

                        <span>Save Catalog Section Changes</span>

                      </button>

                    </div>

                  </form>

                </div>

              )}



              {/* ================= 3. SPECIAL OFFERS & PROMOTIONS MANAGEMENT ================= */}

              {homeSubTab === 'offers' && (

                <div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>

                    <div>

                      <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1A3B2A', margin: 0 }}>

                        Special Offers Cards

                      </h3>

                      <p style={{ fontSize: '0.82rem', color: '#7E736B', margin: '0.2rem 0 0' }}>

                        Promotions shown in the 3 colored offer banners with coupon copy actions.

                      </p>

                    </div>



                    <button

                      type="button"

                      onClick={handleOpenAddOffer}

                      style={{

                        backgroundColor: '#1A3B2A',

                        color: '#FFFFFF',

                        border: 'none',

                        borderRadius: '10px',

                        padding: '0.65rem 1.25rem',

                        fontSize: '0.84rem',

                        fontWeight: 600,

                        cursor: 'pointer',

                        display: 'flex',

                        alignItems: 'center',

                        gap: '0.45rem'

                      }}

                    >

                      <Plus size={15} />

                      <span>Add Special Offer</span>

                    </button>

                  </div>



                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem' }}>

                    {(homeData.specialOffers?.offers || []).map((offer, idx) => (

                      <div

                        key={offer.id || idx}

                        style={{

                          background: offer.cardBg || '#FFFFFF',

                          borderRadius: '16px',

                          border: `1px solid ${offer.borderColor || '#ECE0CF'}`,

                          padding: '1.4rem',

                          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',

                          display: 'flex',

                          flexDirection: 'column',

                          justifyContent: 'space-between'

                        }}

                      >

                        <div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>

                            <span style={{

                              backgroundColor: offer.badgeBg || '#FFF3BF',

                              color: offer.badgeColor || '#D9480F',

                              fontSize: '0.7rem',

                              fontWeight: 700,

                              padding: '0.25rem 0.65rem',

                              borderRadius: '20px'

                            }}>

                              {offer.badge}

                            </span>

                            <span style={{ fontSize: '1.4rem' }}>{offer.iconEmoji || '🌸'}</span>

                          </div>



                          <h4 className="font-serif" style={{ fontSize: '1.15rem', color: '#1A3B2A', margin: '0 0 0.4rem', fontWeight: 700 }}>

                            {offer.title}

                          </h4>

                          <p style={{ fontSize: '0.82rem', color: '#655A52', margin: '0 0 0.85rem', lineHeight: 1.45 }}>

                            {offer.description}

                          </p>



                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FFFFFF', padding: '0.35rem 0.65rem', borderRadius: '8px', border: '1px dashed #C89B59', fontSize: '0.78rem', fontWeight: 600, color: '#1A3B2A' }}>

                            <span>Coupon:</span>

                            <span style={{ color: '#D9480F' }}>{offer.coupon}</span>

                          </div>

                        </div>



                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.2rem', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '0.75rem' }}>

                          <button

                            type="button"

                            onClick={() => handleOpenEditOffer(offer)}

                            style={{

                              display: 'flex',

                              alignItems: 'center',

                              gap: '0.35rem',

                              padding: '0.45rem 0.85rem',

                              borderRadius: '8px',

                              border: '1px solid #ECE0CF',

                              backgroundColor: '#FFFFFF',

                              color: '#1A3B2A',

                              fontSize: '0.78rem',

                              fontWeight: 600,

                              cursor: 'pointer'

                            }}

                          >

                            <Edit2 size={13} />

                            <span>Edit</span>

                          </button>

                          <button

                            type="button"

                            onClick={() => handleDeleteOffer(offer.id)}

                            style={{

                              display: 'flex',

                              alignItems: 'center',

                              gap: '0.35rem',

                              padding: '0.45rem 0.85rem',

                              borderRadius: '8px',

                              border: '1px solid #FFD8D8',

                              backgroundColor: '#FFF5F5',

                              color: '#E03131',

                              fontSize: '0.78rem',

                              fontWeight: 600,

                              cursor: 'pointer'

                            }}

                          >

                            <Trash2 size={13} />

                            <span>Delete</span>

                          </button>

                        </div>

                      </div>

                    ))}

                  </div>

                </div>

              )}



              {/* ================= 4. CUSTOMER REVIEWS MANAGEMENT ================= */}

              {homeSubTab === 'reviews' && (

                <div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>

                    <div>

                      <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1A3B2A', margin: 0 }}>

                        Customer Reviews ({homeData.reviewsSection?.reviews?.length || 0})

                      </h3>

                      <p style={{ fontSize: '0.82rem', color: '#7E736B', margin: '0.2rem 0 0' }}>

                        Ratings and testimonials featured in the homepage review carousel.

                      </p>

                    </div>



                    <button

                      type="button"

                      onClick={handleOpenAddReview}

                      style={{

                        backgroundColor: '#1A3B2A',

                        color: '#FFFFFF',

                        border: 'none',

                        borderRadius: '10px',

                        padding: '0.65rem 1.25rem',

                        fontSize: '0.84rem',

                        fontWeight: 600,

                        cursor: 'pointer',

                        display: 'flex',

                        alignItems: 'center',

                        gap: '0.45rem'

                      }}

                    >

                      <Plus size={15} />

                      <span>Add Customer Review</span>

                    </button>

                  </div>



                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>

                    {(homeData.reviewsSection?.reviews || []).map((rev, idx) => (

                      <div

                        key={rev.id || idx}

                        style={{

                          backgroundColor: '#FFFFFF',

                          borderRadius: '16px',

                          border: '1px solid #ECE0CF',

                          padding: '1.35rem',

                          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',

                          display: 'flex',

                          flexDirection: 'column',

                          justifyContent: 'space-between'

                        }}

                      >

                        <div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>

                            <img

                              src={rev.image || '/flowers/mix_flower_bouquet.jpg'}

                              alt={rev.name}

                              style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #ECE0CF' }}

                            />

                            <div>

                              <h5 style={{ margin: 0, fontSize: '0.92rem', color: '#1A3B2A', fontWeight: 700 }}>

                                {rev.name}

                              </h5>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.15rem' }}>

                                {[...Array(rev.rating || 5)].map((_, i) => (

                                  <span key={i} style={{ color: '#E6A817', fontSize: '0.82rem' }}>★</span>

                                ))}

                                <span style={{ fontSize: '0.72rem', color: '#7E736B', marginLeft: '0.35rem' }}>{rev.date}</span>

                              </div>

                            </div>

                          </div>



                          <p style={{ fontSize: '0.84rem', color: '#4A4036', fontStyle: 'italic', margin: '0 0 1rem', lineHeight: 1.5 }}>

                            "{rev.text}"

                          </p>

                        </div>



                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid #F5EFE6', paddingTop: '0.75rem' }}>

                          <button

                            type="button"

                            onClick={() => handleOpenEditReview(rev)}

                            style={{

                              display: 'flex',

                              alignItems: 'center',

                              gap: '0.35rem',

                              padding: '0.45rem 0.85rem',

                              borderRadius: '8px',

                              border: '1px solid #ECE0CF',

                              backgroundColor: '#F5EFE6',

                              color: '#1A3B2A',

                              fontSize: '0.78rem',

                              fontWeight: 600,

                              cursor: 'pointer'

                            }}

                          >

                            <Edit2 size={13} />

                            <span>Edit</span>

                          </button>

                          <button

                            type="button"

                            onClick={() => handleDeleteReview(rev.id)}

                            style={{

                              display: 'flex',

                              alignItems: 'center',

                              gap: '0.35rem',

                              padding: '0.45rem 0.85rem',

                              borderRadius: '8px',

                              border: '1px solid #FFD8D8',

                              backgroundColor: '#FFF5F5',

                              color: '#E03131',

                              fontSize: '0.78rem',

                              fontWeight: 600,

                              cursor: 'pointer'

                            }}

                          >

                            <Trash2 size={13} />

                            <span>Delete</span>

                          </button>

                        </div>

                      </div>

                    ))}

                  </div>

                </div>

              )}



              {/* ================= 5. CATEGORIES SECTION MANAGEMENT ================= */}

              


              {/* ================= 6. FOOTER & BRAND SETTINGS ================= */}

              {homeSubTab === 'footer' && (

                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #ECE0CF', padding: '1.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>

                  <form onSubmit={handleSaveFooter}>

                    <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1A3B2A', margin: '0 0 0.35rem' }}>

                      Footer Content & Social Links Settings

                    </h3>

                    <p style={{ fontSize: '0.84rem', color: '#7E736B', margin: '0 0 1.5rem' }}>

                      Controls the brand bio paragraph, social media channels, trust promise points, and copyright text across all pages.

                    </p>



                    <div style={{ marginBottom: '1.25rem' }}>

                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#1A3B2A', marginBottom: '0.35rem' }}>

                        Brand Bio / Mission Statement

                      </label>

                      <textarea

                        rows="2"

                        value={footerForm.brandBio || ''}

                        onChange={(e) => setFooterForm({ ...footerForm, brandBio: e.target.value })}

                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.86rem' }}

                      />

                    </div>



                    <div style={{ marginBottom: '1.5rem' }}>

                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#1A3B2A', marginBottom: '0.5rem' }}>

                        Social Media Links

                      </label>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>

                        <div>

                          <span style={{ fontSize: '0.74rem', color: '#655A52' }}>Facebook URL</span>

                          <input

                            type="text"

                            value={footerForm.socialLinks?.facebook || ''}

                            onChange={(e) => setFooterForm({

                              ...footerForm,

                              socialLinks: { ...footerForm.socialLinks, facebook: e.target.value }

                            })}

                            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #ECE0CF', fontSize: '0.82rem', marginTop: '0.2rem' }}

                          />

                        </div>

                        <div>

                          <span style={{ fontSize: '0.74rem', color: '#655A52' }}>Instagram URL</span>

                          <input

                            type="text"

                            value={footerForm.socialLinks?.instagram || ''}

                            onChange={(e) => setFooterForm({

                              ...footerForm,

                              socialLinks: { ...footerForm.socialLinks, instagram: e.target.value }

                            })}

                            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #ECE0CF', fontSize: '0.82rem', marginTop: '0.2rem' }}

                          />

                        </div>

                        <div>

                          <span style={{ fontSize: '0.74rem', color: '#655A52' }}>Twitter / X URL</span>

                          <input

                            type="text"

                            value={footerForm.socialLinks?.twitter || ''}

                            onChange={(e) => setFooterForm({

                              ...footerForm,

                              socialLinks: { ...footerForm.socialLinks, twitter: e.target.value }

                            })}

                            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #ECE0CF', fontSize: '0.82rem', marginTop: '0.2rem' }}

                          />

                        </div>

                        <div>

                          <span style={{ fontSize: '0.74rem', color: '#655A52' }}>YouTube URL</span>

                          <input

                            type="text"

                            value={footerForm.socialLinks?.youtube || ''}

                            onChange={(e) => setFooterForm({

                              ...footerForm,

                              socialLinks: { ...footerForm.socialLinks, youtube: e.target.value }

                            })}

                            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #ECE0CF', fontSize: '0.82rem', marginTop: '0.2rem' }}

                          />

                        </div>

                      </div>

                    </div>



                    {/* Floora Promise Items */}

                    <div style={{ marginBottom: '1.5rem' }}>

                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#1A3B2A', marginBottom: '0.5rem' }}>

                        Floora Promise Points (Quality & Trust)

                      </label>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>

                        {(footerForm.promiseList || []).map((promise, pIdx) => (

                          <input

                            key={pIdx}

                            type="text"

                            value={promise}

                            onChange={(e) => {

                              const newList = [...(footerForm.promiseList || [])];

                              newList[pIdx] = e.target.value;

                              setFooterForm({ ...footerForm, promiseList: newList });

                            }}

                            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #ECE0CF', fontSize: '0.82rem' }}

                          />

                        ))}

                      </div>

                    </div>



                    <div style={{ marginBottom: '1.5rem' }}>

                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#1A3B2A', marginBottom: '0.35rem' }}>

                        Copyright Line

                      </label>

                      <input

                        type="text"

                        value={footerForm.copyrightNote || ''}

                        onChange={(e) => setFooterForm({ ...footerForm, copyrightNote: e.target.value })}

                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.86rem' }}

                      />

                    </div>



                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>

                      <button

                        type="submit"

                        style={{

                          backgroundColor: '#1A3B2A',

                          color: '#FFFFFF',

                          border: 'none',

                          borderRadius: '10px',

                          padding: '0.7rem 1.6rem',

                          fontSize: '0.88rem',

                          fontWeight: 600,

                          cursor: 'pointer',

                          display: 'flex',

                          alignItems: 'center',

                          gap: '0.5rem'

                        }}

                      >

                        <Save size={16} />

                        <span>Save & Sync Footer</span>

                      </button>

                    </div>

                  </form>

                </div>

              )}

            </div>

          )}



          {activeTab === 'products' && (

            <div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>

                <div>

                  <h1 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1C3728', margin: 0 }}>

                    Manage Products

                  </h1>

                  <p style={{ fontSize: '0.88rem', color: '#7E736B', margin: '0.2rem 0 0' }}>

                    Add, edit, manage catalog inventory and prices ({productsList.length} total items)

                  </p>

                </div>



                <button

                  onClick={() => { setEditingProduct(null); setProductImagePreview(''); setProductModalOpen(true); }}

                  style={{

                    backgroundColor: '#1A3B2A',

                    color: '#FFFFFF',

                    border: 'none',

                    borderRadius: '12px',

                    padding: '0.7rem 1.4rem',

                    fontSize: '0.88rem',

                    fontWeight: 600,

                    cursor: 'pointer',

                    display: 'flex',

                    alignItems: 'center',

                    gap: '0.5rem',

                    boxShadow: '0 4px 12px rgba(26, 59, 42, 0.25)'

                  }}

                >

                  <Plus size={16} />

                  <span>Add New Product</span>

                </button>

              </div>



              {/* Filters & Search Bar */}

              <div style={{

                display: 'flex',

                gap: '1rem',

                backgroundColor: '#FFFFFF',

                padding: '1rem 1.25rem',

                borderRadius: '16px',

                border: '1px solid #ECE0CF',

                marginBottom: '1.5rem',

                flexWrap: 'wrap'

              }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: '240px' }}>

                  <Search size={18} style={{ color: '#7E736B' }} />

                  <input

                    type="text"

                    placeholder="Search by flower name or category..."

                    value={productSearch}

                    onChange={(e) => setProductSearch(e.target.value)}

                    style={{

                      border: 'none',

                      outline: 'none',

                      width: '100%',

                      fontSize: '0.88rem',

                      background: 'transparent'

                    }}

                  />

                </div>



                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

                  <Filter size={16} style={{ color: '#7E736B' }} />

                  <select

                    value={selectedCategoryFilter}

                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}

                    style={{

                      border: '1px solid #ECE0CF',

                      borderRadius: '8px',

                      padding: '0.4rem 0.75rem',

                      fontSize: '0.84rem',

                      backgroundColor: '#FFFFFF',

                      color: '#1A3B2A',

                      cursor: 'pointer'

                    }}

                  >

                    <option value="All">All Categories</option>
                    <option value="Indian Flowers">Indian Flowers</option>
                    <option value="International Flowers">International Flowers</option>
                    <option value="Bouquets">Bouquets</option>
                    <option value="Flower Pots">Flower Pots</option>
                    <option value="Mini Bouquets">Mini Bouquets</option>
                    <option value="Single Flowers">Single Flowers</option>
                    <option value="Roses">Roses</option>
                    <option value="Lilies">Lilies</option>
                    <option value="Sunflowers">Sunflowers</option>
                    <option value="Orchids">Orchids</option>
                    <option value="Tulips">Tulips</option>

                  </select>

                </div>

              </div>



              {/* Products Table */}

              <div style={{

                backgroundColor: '#FFFFFF',

                borderRadius: '16px',

                border: '1px solid #ECE0CF',

                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',

                overflow: 'hidden'

              }}>

                <div style={{ overflowX: 'auto' }}>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>

                    <thead>

                      <tr style={{ backgroundColor: '#FAF5EE', color: '#7E736B', textAlign: 'left', borderBottom: '1px solid #ECE0CF' }}>

                        <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>Product</th>

                        <th style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>Category</th>

                        <th style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>Price</th>

                        <th style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>Origin</th>

                        <th style={{ padding: '0.9rem 1rem', fontWeight: 600, textAlign: 'center' }}>Stock Status</th>

                        <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>

                      </tr>

                    </thead>

                    <tbody>

                      {filteredProducts.map(p => (

                        <tr key={p.id} style={{ borderBottom: '1px solid #FAF4EC' }}>

                          <td style={{ padding: '0.85rem 1.25rem' }}>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>

                              <img

                                src={p.image}

                                alt={p.name}

                                style={{

                                  width: '44px',

                                  height: '44px',

                                  borderRadius: '10px',

                                  objectFit: 'cover',

                                  border: '1px solid #ECE0CF'

                                }}

                              />

                              <div>

                                <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: '#1A3B2A' }}>

                                  {p.name}

                                </h4>

                                <span style={{ fontSize: '0.74rem', color: '#7E736B' }}>

                                  ⭐ {p.rating} ({p.reviewsCount} reviews)

                                </span>

                              </div>

                            </div>

                          </td>

                          <td style={{ padding: '0.85rem 1rem', color: '#555' }}>

                            {p.category}

                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>

                            <span style={{ fontWeight: 700, color: '#1A3B2A' }}>₹{p.price}</span>

                            {p.oldPrice && (

                              <span style={{ fontSize: '0.74rem', color: '#999', textDecoration: 'line-through', marginLeft: '0.4rem' }}>

                                ₹{p.oldPrice}

                              </span>

                            )}

                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>

                            <span style={{

                              padding: '0.2rem 0.6rem',

                              borderRadius: '12px',

                              fontSize: '0.72rem',

                              fontWeight: 600,

                              backgroundColor: p.origin === 'Indian' ? '#EBF7EE' : '#FFF4E6',

                              color: p.origin === 'Indian' ? '#2B8A3E' : '#E8590C'

                            }}>

                              {p.origin || 'Indian'}

                            </span>

                          </td>

                          <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>

                            <button

                              onClick={() => {

                                setProductsList(prev => prev.map(prod => prod.id === p.id ? { ...prod, inStock: !prod.inStock } : prod));

                                triggerToast(`Stock updated for ${p.name}`);

                              }}

                              style={{

                                border: 'none',

                                cursor: 'pointer',

                                padding: '0.25rem 0.75rem',

                                borderRadius: '20px',

                                fontSize: '0.75rem',

                                fontWeight: 600,

                                backgroundColor: p.inStock !== false ? '#EBF7EE' : '#FFE3E3',

                                color: p.inStock !== false ? '#2B8A3E' : '#C92A2A'

                              }}

                              title="Click to toggle stock"

                            >

                              {p.inStock !== false ? '● In Stock' : '✕ Out of Stock'}

                            </button>

                          </td>

                          <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>

                            <div style={{ display: 'inline-flex', gap: '0.5rem' }}>

                              <button

                                onClick={() => { setEditingProduct(p); setProductImagePreview(p.image || ''); setProductModalOpen(true); }}

                                style={{

                                  background: '#FAF5EE',

                                  border: '1px solid #ECE0CF',

                                  borderRadius: '8px',

                                  padding: '0.4rem 0.6rem',

                                  cursor: 'pointer',

                                  color: '#1A3B2A'

                                }}

                                title="Edit Product"

                              >

                                <Edit2 size={14} />

                              </button>

                              <button

                                onClick={() => handleDeleteProduct(p.id)}

                                style={{

                                  background: '#FFF5F5',

                                  border: '1px solid #FFD8D8',

                                  borderRadius: '8px',

                                  padding: '0.4rem 0.6rem',

                                  cursor: 'pointer',

                                  color: '#E03131'

                                }}

                                title="Delete Product"

                              >

                                <Trash2 size={14} />

                              </button>

                            </div>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>

          )}



          {/* ========================================================= */}

          {/* TAB 3: MANAGE ORDERS                                     */}

          {/* ========================================================= */}

          {activeTab === 'orders' && (

            <div>

              <div style={{ marginBottom: '1.75rem' }}>

                <h1 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1C3728', margin: 0 }}>

                  Manage Orders

                </h1>

                <p style={{ fontSize: '0.88rem', color: '#7E736B', margin: '0.2rem 0 0' }}>

                  Track customer orders, update delivery status & view invoice totals

                </p>

              </div>



              {/* Orders Table */}

              <div style={{

                backgroundColor: '#FFFFFF',

                borderRadius: '16px',

                border: '1px solid #ECE0CF',

                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',

                overflow: 'hidden'

              }}>

                <div style={{ overflowX: 'auto' }}>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>

                    <thead>

                      <tr style={{ backgroundColor: '#FAF5EE', color: '#7E736B', textAlign: 'left', borderBottom: '1px solid #ECE0CF' }}>

                        <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>Order ID</th>

                        <th style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>Customer</th>

                        <th style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>Items Ordered</th>

                        <th style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>Amount</th>

                        <th style={{ padding: '0.9rem 1rem', fontWeight: 600, textAlign: 'center' }}>Status</th>

                        <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>

                      </tr>

                    </thead>

                    <tbody>

                      {ordersList.map(order => (

                        <tr key={order.id} style={{ borderBottom: '1px solid #FAF4EC' }}>

                          <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#1A3B2A' }}>

                            {order.id}

                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>

                            <div style={{ fontWeight: 600, color: '#222F26' }}>{order.customer}</div>

                            <span style={{ fontSize: '0.75rem', color: '#888' }}>{order.date}</span>

                          </td>

                          <td style={{ padding: '0.85rem 1rem', color: '#555', maxWidth: '220px' }}>

                            {order.items}

                          </td>

                          <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#1A3B2A' }}>

                            {order.amount}

                          </td>

                          <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>

                            <select

                              value={order.status}

                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}

                              style={{

                                border: '1px solid #ECE0CF',

                                borderRadius: '12px',

                                padding: '0.35rem 0.65rem',

                                fontSize: '0.78rem',

                                fontWeight: 600,

                                cursor: 'pointer',

                                backgroundColor: order.status === 'Delivered' ? '#EBF7EE' : order.status === 'Shipped' ? '#E7F5FF' : '#FFF4E6',

                                color: order.status === 'Delivered' ? '#2B8A3E' : order.status === 'Shipped' ? '#1C7ED6' : '#E8590C'

                              }}

                            >

                              <option value="Pending">Pending</option>

                              <option value="Shipped">Shipped</option>

                              <option value="Delivered">Delivered</option>

                              <option value="Cancelled">Cancelled</option>

                            </select>

                          </td>

                          <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.45rem' }}>
                              {/* Edit Order */}
                              <button
                                type="button"
                                onClick={() => setEditingOrder(order)}
                                title="Edit Order Details"
                                aria-label={`Edit Order ${order.id}`}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  border: '1px solid #ECE0CF',
                                  backgroundColor: '#FAF5EE',
                                  color: '#1A3B2A',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <Edit2 size={15} />
                              </button>

                              {/* View Order */}
                              <button
                                type="button"
                                onClick={() => setViewingOrder(order)}
                                title="View Complete Order"
                                aria-label={`View Order ${order.id}`}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  border: '1px solid #ECE0CF',
                                  backgroundColor: '#FAF5EE',
                                  color: '#1A3B2A',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <Eye size={15} />
                              </button>

                              {/* Delete Order */}
                              <button
                                type="button"
                                onClick={() => handleDeleteOrder(order.id)}
                                title="Delete / Cancel Order"
                                aria-label={`Delete Order ${order.id}`}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  border: '1px solid #FECACA',
                                  backgroundColor: '#FEF2F2',
                                  color: '#DC2626',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>

          )}



          {/* ========================================================= */}

          {/* TAB 4: MANAGE USERS (REAL REGISTERED CUSTOMERS ONLY)       */}

          {/* ========================================================= */}

          {activeTab === 'users' && (

            <div>

              <div style={{ marginBottom: '1.75rem' }}>

                <h1 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1C3728', margin: 0 }}>

                  Manage Users

                </h1>

                <p style={{ fontSize: '0.88rem', color: '#7E736B', margin: '0.2rem 0 0' }}>

                  Registered customer accounts, contact details & orders ({usersList.length} customer{usersList.length !== 1 ? 's' : ''})

                </p>

              </div>



              <div style={{

                backgroundColor: '#FFFFFF',

                borderRadius: '16px',

                border: '1px solid #ECE0CF',

                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',

                overflow: 'hidden'

              }}>

                <div style={{ overflowX: 'auto' }}>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>

                    <thead>

                      <tr style={{ backgroundColor: '#FAF5EE', color: '#7E736B', textAlign: 'left', borderBottom: '1px solid #ECE0CF' }}>

                        <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>Customer Name</th>

                        <th style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>Email Address</th>

                        <th style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>Phone</th>

                        <th style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>Orders</th>

                        <th style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>Total Spent</th>

                        <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600, textAlign: 'center' }}>Status</th>

                      </tr>

                    </thead>

                    <tbody>

                      {usersList.length === 0 ? (

                        <tr>

                          <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#7E736B' }}>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>

                              <Users size={38} style={{ color: '#C89B59', opacity: 0.8 }} />

                              <h3 style={{ fontSize: '1.15rem', margin: '0.4rem 0 0', color: '#1A3B2A', fontWeight: 600 }}>

                                No Registered Users Yet

                              </h3>

                              <p style={{ margin: 0, fontSize: '0.84rem', color: '#7E736B', maxWidth: '380px', lineHeight: 1.5 }}>

                                Only actual customers who register on the website will appear here. When a user creates an account, their details and order history will automatically show up.

                              </p>

                            </div>

                          </td>

                        </tr>

                      ) : (

                        usersList.map(u => (

                          <tr key={u.id} style={{ borderBottom: '1px solid #FAF4EC' }}>

                            <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: '#1A3B2A' }}>

                              {u.name}

                            </td>

                            <td style={{ padding: '0.85rem 1rem', color: '#666' }}>

                              {u.email}

                            </td>

                            <td style={{ padding: '0.85rem 1rem', color: '#666' }}>

                              {u.phone}

                            </td>

                            <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>

                              {u.ordersCount} {u.ordersCount === 1 ? 'order' : 'orders'}

                            </td>

                            <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#2B8A3E' }}>

                              {u.spent}

                            </td>

                            <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>

                              <span style={{

                                backgroundColor: '#EBF7EE',

                                color: '#2B8A3E',

                                padding: '0.25rem 0.7rem',

                                borderRadius: '20px',

                                fontSize: '0.74rem',

                                fontWeight: 600

                              }}>

                                {u.status}

                              </span>

                            </td>

                          </tr>

                        ))

                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>

          )}



          {/* ========================================================= */}

          {/* TAB 5: MANAGE OFFERS                                      */}

          {/* ========================================================= */}

          


          {/* ========================================================= */}

          {/* TAB 6: MANAGE BANNERS                                     */}

          {/* ========================================================= */}

          {activeTab === 'banners' && (

            <div>

              <div style={{ marginBottom: '1.75rem' }}>

                <h1 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1C3728', margin: 0 }}>

                  Manage Hero Banners

                </h1>

                <p style={{ fontSize: '0.88rem', color: '#7E736B', margin: '0.2rem 0 0' }}>

                  Hero sliders and promotional graphics on the homepage

                </p>

              </div>



              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

                {[

                  { id: 'b1', title: 'Grand Floral Festival', image: '/banners/hero_floral_festival.png', subtitle: 'Celebrate every special moment with fragrant blossoms' },

                  { id: 'b2', title: 'Artisanal Fresh Blooms', image: '/banners/hero_artisanal_blooms.png', subtitle: 'Handcrafted luxury bouquets delivered with moisture care' }

                ].map(b => (

                  <div key={b.id} style={{

                    backgroundColor: '#FFFFFF',

                    borderRadius: '16px',

                    border: '1px solid #ECE0CF',

                    overflow: 'hidden',

                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)'

                  }}>

                    <img

                      src={b.image}

                      alt={b.title}

                      style={{ width: '100%', height: '180px', objectFit: 'cover' }}

                    />

                    <div style={{ padding: '1.25rem' }}>

                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1A3B2A', margin: '0 0 0.35rem' }}>

                        {b.title}

                      </h3>

                      <p style={{ fontSize: '0.84rem', color: '#666', margin: '0 0 1rem' }}>

                        {b.subtitle}

                      </p>

                      <button

                        onClick={() => triggerToast(`Banner "${b.title}" is currently live!`)}

                        style={{

                          backgroundColor: '#EBF7EE',

                          color: '#2B8A3E',

                          border: 'none',

                          borderRadius: '8px',

                          padding: '0.4rem 0.85rem',

                          fontSize: '0.78rem',

                          fontWeight: 600,

                          cursor: 'pointer'

                        }}

                      >

                        ● Active on Homepage

                      </button>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          )}



          {/* ========================================================= */}

          {/* TAB 7: MANAGE CATEGORIES                                  */}

          {/* ========================================================= */}

          {activeTab === 'categories' && (

            <div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>

                <div>

                  <h1 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1C3728', margin: 0 }}>

                    Manage Categories

                  </h1>

                  <p style={{ fontSize: '0.88rem', color: '#7E736B', margin: '0.2rem 0 0' }}>

                    Flower groupings, category images, and counts ({categoriesList.length} total categories)

                  </p>

                </div>



                <button

                  type="button"

                  onClick={() => {

                    setEditingCategory(null);

                    setCategoryForm({ name: '', section: 'Indian Flowers', image: '', count: 2 });

                    setImagePreview('');

                    setCategoryModalOpen(true);

                  }}

                  style={{

                    backgroundColor: '#1A3B2A',

                    color: '#FFFFFF',

                    border: 'none',

                    borderRadius: '12px',

                    padding: '0.7rem 1.4rem',

                    fontSize: '0.88rem',

                    fontWeight: 600,

                    cursor: 'pointer',

                    display: 'flex',

                    alignItems: 'center',

                    gap: '0.5rem',

                    boxShadow: '0 4px 12px rgba(26, 59, 42, 0.25)',

                    transition: 'all 0.2s ease'

                  }}

                >

                  <Plus size={16} />

                  <span>Add Category</span>

                </button>

              </div>



              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>

                {categoriesList.map(cat => (

                  <div key={cat.id} style={{

                    backgroundColor: '#FFFFFF',

                    borderRadius: '18px',

                    border: '1px solid #ECE0CF',

                    padding: '1.4rem 1.25rem 1.25rem',

                    textAlign: 'center',

                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',

                    position: 'relative',

                    display: 'flex',

                    flexDirection: 'column',

                    justifyContent: 'space-between',

                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'

                  }}>

                    {/* Separate Action Buttons: Edit & Delete */}

                    <div style={{

                      position: 'absolute',

                      top: '12px',

                      right: '12px',

                      display: 'flex',

                      gap: '0.35rem',

                      zIndex: 3

                    }}>

                      <button

                        type="button"

                        onClick={() => handleOpenEditCategory(cat)}

                        style={{

                          width: '30px',

                          height: '30px',

                          borderRadius: '8px',

                          backgroundColor: '#F5EFE6',

                          color: '#1A3B2A',

                          border: '1px solid #ECE0CF',

                          display: 'flex',

                          alignItems: 'center',

                          justifyContent: 'center',

                          cursor: 'pointer',

                          transition: 'all 0.2s ease'

                        }}

                        title="Edit Category"

                      >

                        <Edit2 size={13} />

                      </button>



                      <button

                        type="button"

                        onClick={() => handleDeleteCategory(cat.id, cat.name)}

                        style={{

                          width: '30px',

                          height: '30px',

                          borderRadius: '8px',

                          backgroundColor: '#FFF5F5',

                          color: '#E03131',

                          border: '1px solid #FFD8D8',

                          display: 'flex',

                          alignItems: 'center',

                          justifyContent: 'center',

                          cursor: 'pointer',

                          transition: 'all 0.2s ease'

                        }}

                        title="Delete Category"

                      >

                        <Trash2 size={13} />

                      </button>

                    </div>



                    <div>

                      <img

                        src={cat.image || '/flowers/marigold_flowers.jpg'}

                        alt={cat.name}

                        style={{

                          width: '76px',

                          height: '76px',

                          borderRadius: '50%',

                          objectFit: 'cover',

                          margin: '0.5rem auto 0.75rem',

                          border: '2px solid #FAF5EE',

                          boxShadow: '0 3px 10px rgba(0,0,0,0.06)'

                        }}

                      />

                      <h4 className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1A3B2A', margin: '0 0 0.25rem' }}>

                        {cat.name}

                      </h4>

                      {cat.section && (

                        <span style={{

                          display: 'inline-block',

                          backgroundColor: '#F4F0E8',

                          color: '#655A52',

                          fontSize: '0.72rem',

                          fontWeight: 600,

                          padding: '0.2rem 0.65rem',

                          borderRadius: '12px',

                          marginBottom: '0.4rem'

                        }}>

                          {cat.section}

                        </span>

                      )}

                    </div>



                    <span style={{ fontSize: '0.8rem', color: '#7E736B', marginTop: '0.25rem' }}>

                      {cat.count || 0} items available

                    </span>

                  </div>

                ))}

              </div>

            </div>

          )}



          {/* ========================================================= */}
          {/* TAB: STORE SETTINGS (SIMPLIFIED & CLEAN)                  */}
          {/* ========================================================= */}
          {activeTab === 'settings' && (
            <div style={{ maxWidth: '680px' }}>
              <div style={{ marginBottom: '1.75rem' }}>
                <h1 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1C3728', margin: 0 }}>
                  Store Settings
                </h1>
                <p style={{ fontSize: '0.88rem', color: '#7E736B', margin: '0.2rem 0 0' }}>
                  Floora Flower Boutique operational configurations
                </p>
              </div>

              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #ECE0CF',
                padding: '2rem',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
              }}>
                <form onSubmit={handleSaveSettings}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.4rem', color: '#1A3B2A' }}>
                        Boutique / Store Name
                      </label>
                      <input
                        type="text"
                        value={storeSettings.name}
                        onChange={(e) => setStoreSettings({ ...storeSettings, name: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.4rem', color: '#1A3B2A' }}>
                          Customer Support Email
                        </label>
                        <input
                          type="email"
                          value={storeSettings.email}
                          onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.4rem', color: '#1A3B2A' }}>
                          Store Helpline Phone
                        </label>
                        <input
                          type="text"
                          value={storeSettings.phone}
                          onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.4rem', color: '#1A3B2A' }}>
                        Store Address
                      </label>
                      <input
                        type="text"
                        value={storeSettings.address}
                        onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.4rem', color: '#1A3B2A' }}>
                          Currency
                        </label>
                        <input
                          type="text"
                          value="₹ INR (Indian Rupee)"
                          disabled
                          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem', backgroundColor: '#F8F4EE' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.4rem', color: '#1A3B2A' }}>
                          Express Delivery Charge
                        </label>
                        <input
                          type="text"
                          value={storeSettings.deliveryCharge}
                          onChange={(e) => setStoreSettings({ ...storeSettings, deliveryCharge: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingTop: '0.5rem', borderTop: '1px solid #F0E8DC' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 500 }}>
                        <input
                          type="checkbox"
                          checked={storeSettings.orderAlerts}
                          onChange={(e) => setStoreSettings({ ...storeSettings, orderAlerts: e.target.checked })}
                        />
                        <span>Enable instant notification bell alerts when customer places an order</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 500 }}>
                        <input
                          type="checkbox"
                          checked={storeSettings.smsAlerts}
                          onChange={(e) => setStoreSettings({ ...storeSettings, smsAlerts: e.target.checked })}
                        />
                        <span>Send automated SMS / WhatsApp order confirmations to customers</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      style={{
                        backgroundColor: '#1A3B2A',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.75rem 1.75rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        alignSelf: 'flex-start',
                        marginTop: '0.5rem',
                        boxShadow: '0 4px 12px rgba(26, 59, 42, 0.25)'
                      }}
                    >
                      Save Store Settings
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>

      </div>



      {/* View Order Modal */}
      {viewingOrder && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(28, 55, 40, 0.45)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1100
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1.5px solid #ECE0CF',
              boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #FAF4EC', backgroundColor: '#FAF5EE' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Eye size={18} style={{ color: '#1A3B2A' }} />
                <h3 className="font-serif" style={{ margin: 0, fontSize: '1.25rem', color: '#1A3B2A', fontWeight: 700 }}>
                  Order Details ({viewingOrder.id})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7E736B' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid #FAF4EC' }}>
                <span style={{ color: '#7E736B' }}>Customer Name</span>
                <strong style={{ color: '#1A3B2A' }}>{viewingOrder.customer}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid #FAF4EC' }}>
                <span style={{ color: '#7E736B' }}>Status</span>
                <span style={{
                  padding: '0.2rem 0.65rem',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  backgroundColor: viewingOrder.status === 'Delivered' ? '#EBF7EE' : viewingOrder.status === 'Shipped' ? '#E7F5FF' : '#FFF4E6',
                  color: viewingOrder.status === 'Delivered' ? '#2B8A3E' : viewingOrder.status === 'Shipped' ? '#1C7ED6' : '#E8590C'
                }}>
                  {viewingOrder.status}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid #FAF4EC' }}>
                <span style={{ color: '#7E736B' }}>Total Amount</span>
                <strong style={{ color: '#1A3B2A', fontSize: '1.05rem' }}>{viewingOrder.amount}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid #FAF4EC' }}>
                <span style={{ color: '#7E736B' }}>Order Date</span>
                <span>{viewingOrder.date}</span>
              </div>

              <div>
                <span style={{ color: '#7E736B', display: 'block', marginBottom: '0.35rem' }}>Items Ordered</span>
                <div style={{ padding: '0.75rem', backgroundColor: '#FAF5EE', borderRadius: '10px', color: '#1A3B2A', fontWeight: 500 }}>
                  {typeof viewingOrder.items === 'number' ? `${viewingOrder.items} item(s) in this order` : (viewingOrder.items || 'Fresh Floral Arrangement')}
                </div>
              </div>
            </div>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #FAF4EC', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#FAF5EE' }}>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                style={{
                  padding: '0.55rem 1.25rem',
                  backgroundColor: '#1A3B2A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(28, 55, 40, 0.45)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1100
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1.5px solid #ECE0CF',
              boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #FAF4EC', backgroundColor: '#FAF5EE' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={18} style={{ color: '#1A3B2A' }} />
                <h3 className="font-serif" style={{ margin: 0, fontSize: '1.25rem', color: '#1A3B2A', fontWeight: 700 }}>
                  Edit Order ({editingOrder.id})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7E736B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedOrder} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>
                  Customer Name
                </label>
                <input
                  name="customer"
                  type="text"
                  required
                  defaultValue={editingOrder.customer}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>
                    Order Amount
                  </label>
                  <input
                    name="amount"
                    type="text"
                    required
                    defaultValue={editingOrder.amount}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>
                    Order Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingOrder.status}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>
                  Items Ordered
                </label>
                <input
                  name="items"
                  type="text"
                  defaultValue={typeof editingOrder.items === 'number' ? `${editingOrder.items} item(s)` : (editingOrder.items || '')}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>
                  Date / Time
                </label>
                <input
                  name="date"
                  type="text"
                  defaultValue={editingOrder.date}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  style={{
                    padding: '0.6rem 1.15rem',
                    backgroundColor: '#FAF5EE',
                    color: '#6E5D4F',
                    border: '1px solid #ECE0CF',
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.6rem 1.35rem',
                    backgroundColor: '#1A3B2A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Save Order Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD/EDIT PRODUCT MODAL ================= */}

      {productModalOpen && (

        <div style={{

          position: 'fixed',

          inset: 0,

          backgroundColor: 'rgba(0, 0, 0, 0.55)',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          zIndex: 200,

          padding: '1rem'

        }}>

          <div style={{

            backgroundColor: '#FFFFFF',

            borderRadius: '20px',

            width: '100%',

            maxWidth: '560px',

            padding: '2rem',

            maxHeight: '90vh',

            overflowY: 'auto',

            boxShadow: '0 20px 50px rgba(0,0,0,0.2)'

          }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>

              <h3 className="font-serif" style={{ fontSize: '1.45rem', fontWeight: 700, margin: 0, color: '#1A3B2A' }}>

                {editingProduct ? 'Edit Product' : 'Add New Flower Product'}

              </h3>

              <button

                onClick={() => { setProductModalOpen(false); setEditingProduct(null); }}

                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}

              >

                <X size={20} />

              </button>

            </div>



            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <div>

                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                  Product Name *

                </label>

                <input

                  name="name"

                  type="text"

                  required

                  defaultValue={editingProduct?.name || ''}

                  placeholder="e.g. Sunny Gerbera Bunch"

                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}

                />

              </div>



              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                <div>

                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                    Category *

                  </label>

                  <select

                    name="category"

                    defaultValue={editingProduct?.category || 'Bouquets'}

                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}

                  >

                    {[
                      'Indian Flowers',
                      'International Flowers',
                      'Bouquets',
                      'Flower Pots',
                      'Mini Bouquets',
                      'Single Flowers',
                      'Roses',
                      'Lilies',
                      'Sunflowers',
                      'Orchids',
                      'Tulips'
                    ].map(catName => (
                      <option key={catName} value={catName}>{catName}</option>
                    ))}

                  </select>

                </div>



                <div>

                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                    Origin *

                  </label>

                  <select

                    name="origin"

                    defaultValue={editingProduct?.origin || 'Indian'}

                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}

                  >

                    <option value="Indian">Indian</option>

                    <option value="International">International</option>

                  </select>

                </div>

              </div>



              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                <div>

                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                    Selling Price (₹) *

                  </label>

                  <input

                    name="price"

                    type="number"

                    required

                    defaultValue={editingProduct?.price || 499}

                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}

                  />

                </div>



                <div>

                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                    Original Price (₹)

                  </label>

                  <input

                    name="oldPrice"

                    type="number"

                    defaultValue={editingProduct?.oldPrice || 699}

                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}

                  />

                </div>

              </div>



              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.45rem', color: '#1A3B2A' }}>
                  Product Flower Image *
                </label>
                
                {/* Image Preview Box */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', padding: '0.75rem', backgroundColor: '#FAF5EE', borderRadius: '12px', border: '1px solid #ECE0CF' }}>
                  <img
                    src={productImagePreview || editingProduct?.image || '/flowers/pink_rose_bouquet.jpg'}
                    alt="Preview"
                    style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover', border: '1.5px solid #1A3B2A', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1A3B2A', display: 'block' }}>
                      {productImagePreview?.startsWith('data:') ? 'Custom Uploaded Image (Saved)' : 'Selected Catalog Image'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#7E736B' }}>
                      Upload directly from your device/folder, or pick from Floora gallery below.
                    </span>
                  </div>
                </div>

                {/* Upload from Local Computer / Folder */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#1A3B2A', marginBottom: '0.25rem' }}>
                    📁 Upload from Computer / Local Folder:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 8 * 1024 * 1024) {
                          alert('File size exceeds 8MB. Please choose a smaller image.');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProductImagePreview(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ width: '100%', fontSize: '0.82rem', padding: '0.5rem', background: '#FFFFFF', border: '1.5px dashed #C89B59', borderRadius: '8px', cursor: 'pointer' }}
                  />
                </div>



                {/* Direct Image URL input */}
                <div>
                  <input
                    name="image"
                    type="text"
                    value={productImagePreview}
                    onChange={(e) => setProductImagePreview(e.target.value)}
                    placeholder="Or enter image URL / path (/flowers/...)"
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.82rem', background: '#FAFAFA' }}
                  />
                </div>
              </div>



              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>
                  Stock Availability
                </label>
                <select
                  name="inStock"
                  defaultValue={editingProduct?.inStock !== false ? 'true' : 'false'}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}
                >
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </div>



              <div>

                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                  Description

                </label>

                <textarea

                  name="description"

                  rows="3"

                  defaultValue={editingProduct?.description || 'Freshly picked blooms with moisture delivery guaranteed.'}

                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}

                />

              </div>



              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>

                <button

                  type="button"

                  onClick={() => { setProductModalOpen(false); setEditingProduct(null); }}

                  style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1px solid #ECE0CF', background: '#FFFFFF', cursor: 'pointer', fontSize: '0.88rem' }}

                >

                  Cancel

                </button>

                <button

                  type="submit"

                  style={{ padding: '0.65rem 1.5rem', borderRadius: '10px', border: 'none', background: '#1A3B2A', color: '#FFFFFF', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}

                >

                  {editingProduct ? 'Save Changes' : 'Create Product'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}



      {/* Category Modal (Add / Edit) with Photo Upload & Section */}

      {categoryModalOpen && (

        <div style={{

          position: 'fixed',

          top: 0,

          left: 0,

          right: 0,

          bottom: 0,

          backgroundColor: 'rgba(0,0,0,0.5)',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          zIndex: 200,

          padding: '1rem',

          backdropFilter: 'blur(3px)'

        }}>

          <div style={{

            backgroundColor: '#FFFFFF',

            borderRadius: '20px',

            width: '100%',

            maxWidth: '520px',

            maxHeight: '90vh',

            overflowY: 'auto',

            padding: '2rem',

            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',

            border: '1px solid #ECE0CF'

          }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>

              <div>

                <h3 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A3B2A', margin: 0 }}>

                  {editingCategory ? 'Edit Category' : 'Add New Category'}

                </h3>

                <p style={{ fontSize: '0.82rem', color: '#7E736B', margin: '0.2rem 0 0' }}>

                  {editingCategory ? 'Update category details and photo' : 'Create a new flower category grouping with photo'}

                </p>

              </div>

              <button

                type="button"

                onClick={() => { setCategoryModalOpen(false); setEditingCategory(null); }}

                style={{ background: '#FAF5EE', border: '1px solid #ECE0CF', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1A3B2A' }}

              >

                <X size={16} />

              </button>

            </div>



            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>

              <div>

                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                  Category Name *

                </label>

                <input

                  type="text"

                  required

                  placeholder="e.g. Marigold, Orchid, Lavender..."

                  value={categoryForm.name}

                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}

                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}

                />

              </div>



              <div>

                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                  Section / Grouping *

                </label>

                <select

                  value={categoryForm.section}

                  onChange={(e) => setCategoryForm({ ...categoryForm, section: e.target.value })}

                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem', backgroundColor: '#FFFFFF' }}

                >

                  <option value="Indian Flowers">Indian Flowers</option>

                  <option value="Bouquets">Bouquets</option>

                  <option value="International Flowers">International Flowers</option>

                  <option value="Flower Pots">Flower Pots</option>

                  <option value="Loose Petals">Loose Petals</option>

                  <option value="Special Offers & Gifts">Special Offers & Gifts</option>

                  <option value="Other">Other</option>

                </select>

              </div>



              {/* Photo Upload with File Picker & Preview */}

              <div>

                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                  Category Photo Upload *

                </label>

                

                <div style={{

                  border: '2px dashed #ECE0CF',

                  borderRadius: '12px',

                  padding: '1rem',

                  backgroundColor: '#FAF7F2',

                  display: 'flex',

                  alignItems: 'center',

                  gap: '1rem'

                }}>

                  {/* Photo Preview Circle */}

                  <div style={{

                    width: '64px',

                    height: '64px',

                    borderRadius: '50%',

                    backgroundColor: '#FFFFFF',

                    border: '2px solid #D4AF37',

                    overflow: 'hidden',

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'center',

                    flexShrink: 0

                  }}>

                    {(imagePreview || categoryForm.image) ? (

                      <img

                        src={imagePreview || categoryForm.image}

                        alt="Preview"

                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}

                      />

                    ) : (

                      <UploadCloud size={24} style={{ color: '#C89B59' }} />

                    )}

                  </div>



                  <div style={{ flex: 1 }}>

                    <label style={{

                      display: 'inline-flex',

                      alignItems: 'center',

                      gap: '0.4rem',

                      padding: '0.5rem 0.9rem',

                      backgroundColor: '#1A3B2A',

                      color: '#FFFFFF',

                      borderRadius: '8px',

                      fontSize: '0.82rem',

                      fontWeight: 600,

                      cursor: 'pointer'

                    }}>

                      <UploadCloud size={14} />

                      Choose Photo from Device

                      <input

                        type="file"

                        accept="image/*"

                        onChange={handleImageFileUpload}

                        style={{ display: 'none' }}

                      />

                    </label>

                    <p style={{ fontSize: '0.74rem', color: '#7E736B', margin: '0.4rem 0 0' }}>

                      Supports JPG, PNG, WEBP (Max 5MB)

                    </p>

                  </div>

                </div>



                {/* Fallback Image URL input */}

                <div style={{ marginTop: '0.5rem' }}>

                  <span style={{ fontSize: '0.74rem', color: '#7E736B' }}>Or paste image web URL:</span>

                  <input

                    type="text"

                    placeholder="https://images.unsplash.com/... or /flowers/..."

                    value={categoryForm.image}

                    onChange={(e) => {

                      setCategoryForm({ ...categoryForm, image: e.target.value });

                      setImagePreview(e.target.value);

                    }}

                    style={{ width: '100%', marginTop: '0.25rem', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid #ECE0CF', fontSize: '0.82rem' }}

                  />

                </div>

              </div>



              <div>

                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                  Available Items Count

                </label>

                <input

                  type="number"

                  min="0"

                  value={categoryForm.count}

                  onChange={(e) => setCategoryForm({ ...categoryForm, count: e.target.value })}

                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}

                />

              </div>



              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>

                <button

                  type="button"

                  onClick={() => { setCategoryModalOpen(false); setEditingCategory(null); }}

                  style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1px solid #ECE0CF', background: '#FFFFFF', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500 }}

                >

                  Cancel

                </button>

                <button

                  type="submit"

                  style={{ padding: '0.65rem 1.5rem', borderRadius: '10px', border: 'none', background: '#1A3B2A', color: '#FFFFFF', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}

                >

                  {editingCategory ? 'Update Category' : 'Save Category'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}



      {/* Hero Banner Modal (Add / Edit) with Image Upload */}

      {bannerModalOpen && (

        <div style={{

          position: 'fixed',

          top: 0,

          left: 0,

          right: 0,

          bottom: 0,

          backgroundColor: 'rgba(0,0,0,0.5)',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          zIndex: 200,

          padding: '1rem',

          backdropFilter: 'blur(3px)'

        }}>

          <div style={{

            backgroundColor: '#FFFFFF',

            borderRadius: '20px',

            width: '100%',

            maxWidth: '520px',

            maxHeight: '90vh',

            overflowY: 'auto',

            padding: '2rem',

            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',

            border: '1px solid #ECE0CF'

          }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>

              <div>

                <h3 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A3B2A', margin: 0 }}>

                  {editingBanner ? 'Edit Hero Banner Slide' : 'Add Hero Banner Slide'}

                </h3>

                <p style={{ fontSize: '0.82rem', color: '#7E736B', margin: '0.2rem 0 0' }}>

                  Upload full-width banner image and configure text & call to action.

                </p>

              </div>

              <button

                type="button"

                onClick={() => setBannerModalOpen(false)}

                style={{ background: '#FAF5EE', border: '1px solid #ECE0CF', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1A3B2A' }}

              >

                <X size={16} />

              </button>

            </div>



            <form onSubmit={handleSaveBanner} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>

              {/* Photo Upload with File Picker & Preview */}

              <div>

                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                  Banner Image *

                </label>

                

                <div style={{

                  border: '2px dashed #ECE0CF',

                  borderRadius: '12px',

                  padding: '1rem',

                  backgroundColor: '#FAF7F2',

                  display: 'flex',

                  alignItems: 'center',

                  gap: '1rem'

                }}>

                  <div style={{

                    width: '90px',

                    height: '56px',

                    borderRadius: '8px',

                    backgroundColor: '#FFFFFF',

                    border: '1px solid #ECE0CF',

                    overflow: 'hidden',

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'center',

                    flexShrink: 0

                  }}>

                    {(bannerImagePreview || bannerForm.image) ? (

                      <img

                        src={bannerImagePreview || bannerForm.image}

                        alt="Preview"

                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}

                      />

                    ) : (

                      <ImageIcon size={24} style={{ color: '#C89B59' }} />

                    )}

                  </div>



                  <div style={{ flex: 1 }}>

                    <label style={{

                      display: 'inline-flex',

                      alignItems: 'center',

                      gap: '0.4rem',

                      padding: '0.45rem 0.85rem',

                      backgroundColor: '#1A3B2A',

                      color: '#FFFFFF',

                      borderRadius: '8px',

                      fontSize: '0.8rem',

                      fontWeight: 600,

                      cursor: 'pointer'

                    }}>

                      <UploadCloud size={14} />

                      Choose Image File

                      <input

                        type="file"

                        accept="image/*"

                        onChange={(e) => {

                          const file = e.target.files[0];

                          if (file) {

                            const reader = new FileReader();

                            reader.onloadend = () => {

                              setBannerImagePreview(reader.result);

                              setBannerForm(prev => ({ ...prev, image: reader.result }));

                            };

                            reader.readAsDataURL(file);

                          }

                        }}

                        style={{ display: 'none' }}

                      />

                    </label>

                    <p style={{ fontSize: '0.72rem', color: '#7E736B', margin: '0.35rem 0 0' }}>

                      Recommended: 1920×650px JPG or WEBP

                    </p>

                  </div>

                </div>



                <div style={{ marginTop: '0.5rem' }}>

                  <span style={{ fontSize: '0.74rem', color: '#7E736B' }}>Or paste image path / web URL:</span>

                  <input

                    type="text"

                    placeholder="/banners/banner_mixed_bouquets.jpg"

                    value={bannerForm.image}

                    onChange={(e) => {

                      setBannerForm({ ...bannerForm, image: e.target.value });

                      setBannerImagePreview(e.target.value);

                    }}

                    style={{ width: '100%', marginTop: '0.25rem', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid #ECE0CF', fontSize: '0.82rem' }}

                  />

                </div>

              </div>



              <div>

                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                  Banner Title

                </label>

                <input

                  type="text"

                  placeholder="e.g. Mixed Bouquet Edition"

                  value={bannerForm.title}

                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}

                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}

                />

              </div>



              <div>

                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                  Subtitle / Alt Description

                </label>

                <input

                  type="text"

                  placeholder="e.g. Fresh Flowers, Delivered with Love"

                  value={bannerForm.subtitle}

                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value, alt: e.target.value })}

                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}

                />

              </div>



              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>

                <div>

                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                    Button Text

                  </label>

                  <input

                    type="text"

                    placeholder="Explore Bouquets"

                    value={bannerForm.buttonText}

                    onChange={(e) => setBannerForm({ ...bannerForm, buttonText: e.target.value })}

                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}

                  />

                </div>

                <div>

                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                    Button Link

                  </label>

                  <input

                    type="text"

                    placeholder="/shop?category=Bouquets"

                    value={bannerForm.buttonLink}

                    onChange={(e) => setBannerForm({ ...bannerForm, buttonLink: e.target.value })}

                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.88rem' }}

                  />

                </div>

              </div>



              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>

                <button

                  type="button"

                  onClick={() => setBannerModalOpen(false)}

                  style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1px solid #ECE0CF', background: '#FFFFFF', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500 }}

                >

                  Cancel

                </button>

                <button

                  type="submit"

                  style={{ padding: '0.65rem 1.5rem', borderRadius: '10px', border: 'none', background: '#1A3B2A', color: '#FFFFFF', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}

                >

                  {editingBanner ? 'Update Banner' : 'Add Banner Slide'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}



      {/* Special Offer Modal (Add / Edit) */}

      {offerModalOpen && (

        <div style={{

          position: 'fixed',

          top: 0,

          left: 0,

          right: 0,

          bottom: 0,

          backgroundColor: 'rgba(0,0,0,0.5)',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          zIndex: 200,

          padding: '1rem',

          backdropFilter: 'blur(3px)'

        }}>

          <div style={{

            backgroundColor: '#FFFFFF',

            borderRadius: '20px',

            width: '100%',

            maxWidth: '520px',

            maxHeight: '90vh',

            overflowY: 'auto',

            padding: '2rem',

            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',

            border: '1px solid #ECE0CF'

          }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>

              <div>

                <h3 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A3B2A', margin: 0 }}>

                  {editingOffer ? 'Edit Special Offer' : 'Add Special Offer'}

                </h3>

                <p style={{ fontSize: '0.82rem', color: '#7E736B', margin: '0.2rem 0 0' }}>

                  Create or edit promotional discount banners with coupon codes.

                </p>

              </div>

              <button

                type="button"

                onClick={() => setOfferModalOpen(false)}

                style={{ background: '#FAF5EE', border: '1px solid #ECE0CF', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1A3B2A' }}

              >

                <X size={16} />

              </button>

            </div>



            <form onSubmit={handleSaveOffer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>

                <div>

                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                    Badge Label

                  </label>

                  <input

                    type="text"

                    required

                    placeholder="e.g. FESTIVE HARVEST DEAL"

                    value={offerForm.badge}

                    onChange={(e) => setOfferForm({ ...offerForm, badge: e.target.value })}

                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.86rem' }}

                  />

                </div>

                <div>

                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                    Icon Emoji

                  </label>

                  <input

                    type="text"

                    value={offerForm.iconEmoji}

                    onChange={(e) => setOfferForm({ ...offerForm, iconEmoji: e.target.value })}

                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.86rem', textAlign: 'center' }}

                  />

                </div>

              </div>



              <div>

                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                  Offer Title *

                </label>

                <input

                  type="text"

                  required

                  placeholder="e.g. Flat 20% OFF on Indian Fresh Flowers"

                  value={offerForm.title}

                  onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}

                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.86rem' }}

                />

              </div>



              <div>

                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                  Description Details

                </label>

                <textarea

                  rows="2"

                  placeholder="Brief description of blooms included in the promotion..."

                  value={offerForm.description}

                  onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}

                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.86rem' }}

                />

              </div>



              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>

                <div>

                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                    Coupon Code

                  </label>

                  <input

                    type="text"

                    placeholder="e.g. INDIAN20"

                    value={offerForm.coupon}

                    onChange={(e) => setOfferForm({ ...offerForm, coupon: e.target.value.toUpperCase() })}

                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.86rem', fontWeight: 700 }}

                  />

                </div>

                <div>

                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                    Button Label

                  </label>

                  <input

                    type="text"

                    placeholder="Shop Indian Flowers →"

                    value={offerForm.btnText}

                    onChange={(e) => setOfferForm({ ...offerForm, btnText: e.target.value })}

                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.86rem' }}

                  />

                </div>

              </div>



              <div>

                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                  Target Link

                </label>

                <input

                  type="text"

                  placeholder="/shop?origin=Indian"

                  value={offerForm.link}

                  onChange={(e) => setOfferForm({ ...offerForm, link: e.target.value })}

                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.86rem' }}

                />

              </div>



              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>

                <button

                  type="button"

                  onClick={() => setOfferModalOpen(false)}

                  style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1px solid #ECE0CF', background: '#FFFFFF', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500 }}

                >

                  Cancel

                </button>

                <button

                  type="submit"

                  style={{ padding: '0.65rem 1.5rem', borderRadius: '10px', border: 'none', background: '#1A3B2A', color: '#FFFFFF', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}

                >

                  {editingOffer ? 'Save Offer Changes' : 'Create Offer'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}



      {/* Customer Review Modal (Add / Edit) with Image Upload */}

      {reviewModalOpen && (

        <div style={{

          position: 'fixed',

          top: 0,

          left: 0,

          right: 0,

          bottom: 0,

          backgroundColor: 'rgba(0,0,0,0.5)',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          zIndex: 200,

          padding: '1rem',

          backdropFilter: 'blur(3px)'

        }}>

          <div style={{

            backgroundColor: '#FFFFFF',

            borderRadius: '20px',

            width: '100%',

            maxWidth: '520px',

            maxHeight: '90vh',

            overflowY: 'auto',

            padding: '2rem',

            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',

            border: '1px solid #ECE0CF'

          }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>

              <div>

                <h3 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A3B2A', margin: 0 }}>

                  {editingReview ? 'Edit Customer Review' : 'Add Customer Review'}

                </h3>

                <p style={{ fontSize: '0.82rem', color: '#7E736B', margin: '0.2rem 0 0' }}>

                  Provide customer name, verified rating, quote, and product image.

                </p>

              </div>

              <button

                type="button"

                onClick={() => setReviewModalOpen(false)}

                style={{ background: '#FAF5EE', border: '1px solid #ECE0CF', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1A3B2A' }}

              >

                <X size={16} />

              </button>

            </div>



            <form onSubmit={handleSaveReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>

                <div>

                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                    Customer Name *

                  </label>

                  <input

                    type="text"

                    required

                    placeholder="e.g. Priya Sharma"

                    value={reviewForm.name}

                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}

                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.86rem' }}

                  />

                </div>

                <div>

                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                    Rating (Stars)

                  </label>

                  <select

                    value={reviewForm.rating}

                    onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value, 10) })}

                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.86rem', backgroundColor: '#FFFFFF' }}

                  >

                    <option value="5">5 Stars ★★★★★</option>

                    <option value="4">4 Stars ★★★★☆</option>

                    <option value="3">3 Stars ★★★☆☆</option>

                  </select>

                </div>

              </div>



              <div>

                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                  Review Date

                </label>

                <input

                  type="text"

                  placeholder="e.g. 25 October 2026"

                  value={reviewForm.date}

                  onChange={(e) => setReviewForm({ ...reviewForm, date: e.target.value })}

                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.86rem' }}

                />

              </div>



              {/* Flower / Product Image */}

              <div>

                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                  Associated Flower / Product Photo

                </label>

                <div style={{

                  border: '2px dashed #ECE0CF',

                  borderRadius: '12px',

                  padding: '0.85rem',

                  backgroundColor: '#FAF7F2',

                  display: 'flex',

                  alignItems: 'center',

                  gap: '1rem'

                }}>

                  <img

                    src={reviewImagePreview || reviewForm.image}

                    alt="Preview"

                    style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #ECE0CF' }}

                  />

                  <div>

                    <label style={{

                      display: 'inline-flex',

                      alignItems: 'center',

                      gap: '0.4rem',

                      padding: '0.45rem 0.85rem',

                      backgroundColor: '#1A3B2A',

                      color: '#FFFFFF',

                      borderRadius: '8px',

                      fontSize: '0.78rem',

                      fontWeight: 600,

                      cursor: 'pointer'

                    }}>

                      <UploadCloud size={13} />

                      Choose Photo

                      <input

                        type="file"

                        accept="image/*"

                        onChange={(e) => {

                          const file = e.target.files[0];

                          if (file) {

                            const reader = new FileReader();

                            reader.onloadend = () => {

                              setReviewImagePreview(reader.result);

                              setReviewForm(prev => ({ ...prev, image: reader.result }));

                            };

                            reader.readAsDataURL(file);

                          }

                        }}

                        style={{ display: 'none' }}

                      />

                    </label>

                  </div>

                </div>

              </div>



              <div>

                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1A3B2A' }}>

                  Review Feedback Text *

                </label>

                <textarea

                  rows="3"

                  required

                  placeholder="Enter customer feedback..."

                  value={reviewForm.text}

                  onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}

                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #ECE0CF', fontSize: '0.86rem' }}

                />

              </div>



              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>

                <button

                  type="button"

                  onClick={() => setReviewModalOpen(false)}

                  style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1px solid #ECE0CF', background: '#FFFFFF', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500 }}

                >

                  Cancel

                </button>

                <button

                  type="submit"

                  style={{ padding: '0.65rem 1.5rem', borderRadius: '10px', border: 'none', background: '#1A3B2A', color: '#FFFFFF', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}

                >

                  {editingReview ? 'Save Review' : 'Add Review'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}



      {/* Toast Notification */}

      {toast && (

        <div style={{

          position: 'fixed',

          bottom: '24px',

          right: '24px',

          backgroundColor: '#1A3B2A',

          color: '#FFFFFF',

          padding: '0.85rem 1.5rem',

          borderRadius: '12px',

          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',

          fontSize: '0.88rem',

          fontWeight: 600,

          display: 'flex',

          alignItems: 'center',

          gap: '0.6rem',

          zIndex: 300,

          animation: 'fadeInUp 0.3s ease'

        }}>

          <Check size={18} style={{ color: '#C89B59' }} />

          <span>{toast}</span>

        </div>

      )}



      {/* Scoped CSS for Admin Panel Exact Match & Responsiveness */}

      <style>{`

        .admin-nav-item:hover:not(.active) {

          background-color: rgba(255, 255, 255, 0.06) !important;

          color: #FFFFFF !important;

        }

        .admin-quick-card:hover {

          transform: translateY(-3px);

          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.07) !important;

        }



        /* Medium screens / Tablet */

        @media (max-width: 1100px) {

          .admin-kpi-grid {

            grid-template-columns: repeat(2, 1fr) !important;

          }

          .admin-bottom-cards-grid {

            grid-template-columns: repeat(2, 1fr) !important;

          }

        }



        @media (max-width: 900px) {

          .admin-middle-grid {

            grid-template-columns: 1fr !important;

          }

          .admin-sidebar {

            position: fixed !important;

            left: 0;

            top: 0;

            bottom: 0;

            transform: translateX(-100%);

            z-index: 1000 !important;

          }

          .admin-sidebar.open {

            transform: translateX(0);

          }

          .admin-hamburger-btn {

            display: flex !important;

          }

        }



        @media (min-width: 901px) {

          .admin-hamburger-btn {

            display: none !important;

          }

        }



        @media (max-width: 600px) {

          .admin-kpi-grid {

            grid-template-columns: 1fr !important;

          }

          .admin-bottom-cards-grid {

            grid-template-columns: 1fr !important;

          }

        }

      `}</style>



    </div>

  );

};

