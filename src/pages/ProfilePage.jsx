import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Pencil,
  ChevronRight,
  Home as HomeIcon,
  Plus,
  Globe,
  Heart,
  Share2,
  Store,
  Wallet,
  Truck,
  Settings,
  Star,
  FileText,
  LogOut,
  CreditCard,
  HelpCircle,
  Receipt,
  X,
  Check,
  MapPin,
  Sparkles,
  ShoppingBag,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useOrders } from '../context/OrdersContext';
import { getStoredProducts } from '../services/productsService';

export const ProfilePage = ({ onShowToast }) => {
  const { currentUser, logout, updateProfile, addAddress, editAddress } = useAuth();
  const { wishlist } = useWishlist();
  const { orders } = useOrders();
  const navigate = useNavigate();

  // All catalog products to resolve liked products by ID
  const allCatalogProducts = useMemo(() => getStoredProducts(), []);

  // Dynamically resolve Liked Products for the logged-in user
  const likedProducts = useMemo(() => {
    if (!wishlist || !Array.isArray(wishlist) || wishlist.length === 0) return [];
    return wishlist
      .map(id => allCatalogProducts.find(p => p.id === id))
      .filter(Boolean);
  }, [wishlist, allCatalogProducts]);

  // Dynamically resolve Purchased Products from the logged-in user's orders
  const purchasedProducts = useMemo(() => {
    if (!orders || !Array.isArray(orders) || orders.length === 0) return [];
    const map = new Map();
    orders.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (item && item.name) {
            const key = item.id || item.name;
            if (!map.has(key)) {
              map.set(key, {
                id: item.id,
                name: item.name,
                image: item.image,
                price: item.price,
                orderId: order.orderId,
                orderDate: order.date || 'Recent'
              });
            }
          }
        });
      }
    });
    return Array.from(map.values());
  }, [orders]);

  // Redirect if logged out
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);

  // Editing state for Box 1: My Profile
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    gender: 'Female',
    city: 'Mumbai',
    pincode: '400053',
    state: 'Maharashtra'
  });

  // Populate profile form whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        fullName: currentUser.fullName || currentUser.displayName || 'Ananya Sharma',
        phone: currentUser.phoneNumber || '+91 98765 43210',
        email: currentUser.email || 'ananya@example.com',
        gender: currentUser.gender || 'Female',
        city: currentUser.city || 'Mumbai',
        pincode: currentUser.pincode || '400053',
        state: currentUser.state || 'Maharashtra'
      });
    }
  }, [currentUser]);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    name: '',
    phone: '',
    addressLine: '',
    city: 'Mumbai',
    pincode: '400053',
    state: 'Maharashtra',
    isDefault: true
  });

  // Interactive menu modals
  const [activeModal, setActiveModal] = useState(null); // 'balance', 'refer', 'language', 'bank', 'refund', 'supplier', 'rate', 'legal', 'settings', 'help'
  const [ratingVal, setRatingVal] = useState(5);
  const [selectedLang, setSelectedLang] = useState('English');

  if (!currentUser) {
    return null;
  }

  // Get default address or first address
  const defaultAddress = (currentUser.addresses && currentUser.addresses.length > 0)
    ? (currentUser.addresses.find(a => a.isDefault) || currentUser.addresses[0])
    : null;

  // Handle Save Profile
  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    await updateProfile({
      fullName: profileForm.fullName,
      displayName: profileForm.fullName,
      phoneNumber: profileForm.phone,
      email: profileForm.email,
      gender: profileForm.gender,
      city: profileForm.city,
      pincode: profileForm.pincode,
      state: profileForm.state
    });
    setIsEditingProfile(false);
    if (onShowToast) onShowToast('Profile updated successfully! 🌸');
  };

  const handleCancelProfile = () => {
    if (currentUser) {
      setProfileForm({
        fullName: currentUser.fullName || currentUser.displayName || 'Ananya Sharma',
        phone: currentUser.phoneNumber || '+91 98765 43210',
        email: currentUser.email || 'ananya@example.com',
        gender: currentUser.gender || 'Female',
        city: currentUser.city || 'Mumbai',
        pincode: currentUser.pincode || '400053',
        state: currentUser.state || 'Maharashtra'
      });
    }
    setIsEditingProfile(false);
  };

  // Handle Logout (Complete user data privacy)
  const handleLogout = async () => {
    await logout();
    if (onShowToast) onShowToast('Signed out successfully. User data cleared.');
    navigate('/auth');
  };

  // Open Address Modal for Adding
  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setAddressForm({
      label: 'Home',
      name: currentUser.fullName || currentUser.displayName || '',
      phone: currentUser.phoneNumber || '',
      addressLine: '',
      city: currentUser.city || 'Mumbai',
      pincode: currentUser.pincode || '400053',
      state: currentUser.state || 'Maharashtra',
      isDefault: (currentUser.addresses || []).length === 0
    });
    setShowAddressModal(true);
  };

  // Open Address Modal for Editing
  const openEditAddressModal = (addr) => {
    if (!addr) {
      openAddAddressModal();
      return;
    }
    setEditingAddressId(addr.id);
    setAddressForm({
      label: addr.label || 'Home',
      name: addr.name || currentUser.fullName || '',
      phone: addr.phone || currentUser.phoneNumber || '',
      addressLine: addr.addressLine || '',
      city: addr.city || 'Mumbai',
      pincode: addr.pincode || '400053',
      state: addr.state || 'Maharashtra',
      isDefault: addr.isDefault || false
    });
    setShowAddressModal(true);
  };

  // Save Address Submit
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.addressLine || !addressForm.pincode) {
      if (onShowToast) onShowToast('Please provide a full street address and pincode.');
      return;
    }

    if (editingAddressId) {
      await editAddress(editingAddressId, addressForm);
      if (onShowToast) onShowToast('Address updated successfully! 🌸');
    } else {
      await addAddress(addressForm);
      if (onShowToast) onShowToast('New delivery address saved! 🌸');
    }
    setShowAddressModal(false);
  };

  return (
    <div className="floora-profile-wrapper" style={{
      backgroundColor: 'transparent',
      minHeight: '100vh',
      position: 'relative',
      padding: '2.5rem 1.25rem 5rem',
      overflowX: 'hidden'
    }}>

      {/* Decorative Floral Watercolor Corners (Exact as in reference image) */}
      <img
        src="/profile_flower_tl.png"
        alt=""
        aria-hidden="true"
        className="profile-corner-flower"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '260px',
          maxWidth: '30vw',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.96
        }}
      />

      <img
        src="/profile_flower_tr.png"
        alt=""
        aria-hidden="true"
        className="profile-corner-flower"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '260px',
          maxWidth: '30vw',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.96
        }}
      />

      {/* Main Two-Column Content Grid */}
      <div style={{
        maxWidth: '1040px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: '2.25rem',
        alignItems: 'start'
      }}>

        {/* =========================================================================
            LEFT COLUMN: 1. My Profile & 2. Account Menu
        ========================================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>

          {/* 1. MY PROFILE CARD */}
          <div style={{
            backgroundColor: '#FAF4EB',
            borderRadius: '22px',
            border: '1.5px solid #EADCCB',
            boxShadow: '0 8px 24px rgba(180, 150, 120, 0.12)',
            padding: '1.75rem 2rem 2rem',
            position: 'relative'
          }}>

            {/* Header: "My Profile" pill badge + "Edit Profile" button */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '0.55rem 1.6rem',
                fontSize: '1.35rem',
                fontWeight: 700,
                color: '#1E1E1E',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
                fontFamily: 'var(--font-serif, serif)'
              }}>
                My Profile
              </div>

              <button
                type="button"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                style={{
                  backgroundColor: '#B68D58',
                  color: '#FFFFFF',
                  borderRadius: '9999px',
                  border: 'none',
                  padding: '0.45rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(182, 141, 88, 0.3)',
                  transition: 'transform 0.2s ease, background-color 0.2s ease'
                }}
              >
                <Pencil size={14} />
                <span>{isEditingProfile ? 'Editing...' : 'Edit Profile'}</span>
              </button>
            </div>

            {/* Profile Fields List */}
            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>

                {/* Full Name */}
                <div className="profile-field-row" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.2rem',
                  borderBottom: '1px solid #ECE0CF'
                }}>
                  <span style={{ color: '#2B2320', fontWeight: 500, fontSize: '0.95rem', width: '38%' }}>
                    Full Name
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'space-between' }}>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.6rem',
                          borderRadius: '8px',
                          border: '1.5px solid #D8C3A8',
                          backgroundColor: '#FFFFFF',
                          fontSize: '0.92rem',
                          color: '#1E1E1E'
                        }}
                      />
                    ) : (
                      <span style={{ color: '#1E1E1E', fontSize: '0.95rem' }}>
                        {profileForm.fullName || 'Not specified'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#E6CCA8',
                        color: '#7C5427',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                      title="Edit field"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                </div>

                {/* Phone No */}
                <div className="profile-field-row" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.2rem',
                  borderBottom: '1px solid #ECE0CF'
                }}>
                  <span style={{ color: '#2B2320', fontWeight: 500, fontSize: '0.95rem', width: '38%' }}>
                    Phone No
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'space-between' }}>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.6rem',
                          borderRadius: '8px',
                          border: '1.5px solid #D8C3A8',
                          backgroundColor: '#FFFFFF',
                          fontSize: '0.92rem',
                          color: '#1E1E1E'
                        }}
                      />
                    ) : (
                      <span style={{ color: '#1E1E1E', fontSize: '0.95rem' }}>
                        {profileForm.phone || 'Not specified'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#E6CCA8',
                        color: '#7C5427',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                      title="Edit field"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                </div>

                {/* Email ID */}
                <div className="profile-field-row" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.2rem',
                  borderBottom: '1px solid #ECE0CF'
                }}>
                  <span style={{ color: '#2B2320', fontWeight: 500, fontSize: '0.95rem', width: '38%' }}>
                    Email ID
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'space-between' }}>
                    {isEditingProfile ? (
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.6rem',
                          borderRadius: '8px',
                          border: '1.5px solid #D8C3A8',
                          backgroundColor: '#FFFFFF',
                          fontSize: '0.92rem',
                          color: '#1E1E1E'
                        }}
                      />
                    ) : (
                      <span style={{ color: '#1E1E1E', fontSize: '0.95rem' }}>
                        {profileForm.email || 'Not specified'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#E6CCA8',
                        color: '#7C5427',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                      title="Edit field"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                </div>

                {/* Gender */}
                <div className="profile-field-row" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.2rem',
                  borderBottom: '1px solid #ECE0CF'
                }}>
                  <span style={{ color: '#2B2320', fontWeight: 500, fontSize: '0.95rem', width: '38%' }}>
                    Gender
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'space-between' }}>
                    {isEditingProfile ? (
                      <select
                        value={profileForm.gender}
                        onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.6rem',
                          borderRadius: '8px',
                          border: '1.5px solid #D8C3A8',
                          backgroundColor: '#FFFFFF',
                          fontSize: '0.92rem',
                          color: '#1E1E1E'
                        }}
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <span style={{ color: '#1E1E1E', fontSize: '0.95rem' }}>
                        {profileForm.gender || 'Not specified'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#E6CCA8',
                        color: '#7C5427',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                      title="Edit field"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                </div>

                {/* City */}
                <div className="profile-field-row" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.2rem',
                  borderBottom: '1px solid #ECE0CF'
                }}>
                  <span style={{ color: '#2B2320', fontWeight: 500, fontSize: '0.95rem', width: '38%' }}>
                    City
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'space-between' }}>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.6rem',
                          borderRadius: '8px',
                          border: '1.5px solid #D8C3A8',
                          backgroundColor: '#FFFFFF',
                          fontSize: '0.92rem',
                          color: '#1E1E1E'
                        }}
                      />
                    ) : (
                      <span style={{ color: '#1E1E1E', fontSize: '0.95rem' }}>
                        {profileForm.city || 'Not specified'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#E6CCA8',
                        color: '#7C5427',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                      title="Edit field"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                </div>

                {/* Pincode */}
                <div className="profile-field-row" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.2rem',
                  borderBottom: '1px solid #ECE0CF'
                }}>
                  <span style={{ color: '#2B2320', fontWeight: 500, fontSize: '0.95rem', width: '38%' }}>
                    Pincode
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'space-between' }}>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        maxLength="6"
                        value={profileForm.pincode}
                        onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value.replace(/\D/g, '') })}
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.6rem',
                          borderRadius: '8px',
                          border: '1.5px solid #D8C3A8',
                          backgroundColor: '#FFFFFF',
                          fontSize: '0.92rem',
                          color: '#1E1E1E'
                        }}
                      />
                    ) : (
                      <span style={{ color: '#1E1E1E', fontSize: '0.95rem' }}>
                        {profileForm.pincode || 'Not specified'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#E6CCA8',
                        color: '#7C5427',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                      title="Edit field"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                </div>

                {/* State */}
                <div className="profile-field-row" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.2rem',
                  borderBottom: '1px solid transparent'
                }}>
                  <span style={{ color: '#2B2320', fontWeight: 500, fontSize: '0.95rem', width: '38%' }}>
                    State
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'space-between' }}>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileForm.state}
                        onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.6rem',
                          borderRadius: '8px',
                          border: '1.5px solid #D8C3A8',
                          backgroundColor: '#FFFFFF',
                          fontSize: '0.92rem',
                          color: '#1E1E1E'
                        }}
                      />
                    ) : (
                      <span style={{ color: '#1E1E1E', fontSize: '0.95rem' }}>
                        {profileForm.state || 'Not specified'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#E6CCA8',
                        color: '#7C5427',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                      title="Edit field"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                </div>

              </div>

              {/* Bottom Action Buttons: Cancel & Save Changes */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                marginTop: '1.75rem'
              }}>
                <button
                  type="button"
                  onClick={handleCancelProfile}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #D8C3A8',
                    color: '#4A3E38',
                    borderRadius: '9999px',
                    padding: '0.55rem 2rem',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    backgroundColor: '#274E3A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '0.55rem 2.25rem',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(39, 78, 58, 0.28)',
                    transition: 'background-color 0.2s ease, transform 0.2s ease'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>


          {/* 2. ACCOUNT MENU CARD */}
          <div style={{
            backgroundColor: '#FAF4EB',
            borderRadius: '22px',
            border: '1.5px solid #EADCCB',
            boxShadow: '0 8px 24px rgba(180, 150, 120, 0.12)',
            padding: '1.75rem 2rem 2rem',
            position: 'relative'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#1E1E1E',
              marginBottom: '1rem',
              fontFamily: 'var(--font-serif, serif)'
            }}>
              Account Menu
            </h3>

            {/* Menu Items */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 0.2rem',
                  borderBottom: '1px solid #ECE0CF',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  width: '100%',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <LogOut size={16} style={{ color: '#E03131' }} strokeWidth={2.5} />
                  </div>
                  <span style={{ color: '#E03131', fontSize: '0.98rem', fontWeight: 700 }}>
                    Logout
                  </span>
                </div>
                <ChevronRight size={18} style={{ color: '#E03131' }} />
              </button>

            </div>
          </div>


          {/* 5. MY PAYMENTS CARD */}
          <div style={{
            backgroundColor: '#FAF4EB',
            borderRadius: '22px',
            border: '1.5px solid #EADCCB',
            boxShadow: '0 8px 24px rgba(180, 150, 120, 0.12)',
            padding: '1.75rem 2rem',
            position: 'relative'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#1E1E1E',
              marginBottom: '1rem',
              fontFamily: 'var(--font-serif, serif)'
            }}>
              My Payments
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column' }}>

              {/* Bank & UPI Details */}
              <button
                type="button"
                onClick={() => setActiveModal('bank')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 0.2rem',
                  borderBottom: '1px solid #ECE0CF',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  width: '100%',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#C5A97A',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <CreditCard size={16} />
                  </div>
                  <span style={{ color: '#1E1E1E', fontSize: '0.95rem', fontWeight: 500 }}>
                    Bank & UPI Details
                  </span>
                </div>
                <ChevronRight size={18} style={{ color: '#B68D58' }} />
              </button>

              {/* Payment & Refund */}
              <button
                type="button"
                onClick={() => setActiveModal('refund')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 0.2rem',
                  background: 'none',
                  border: 'none',
                  width: '100%',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#C5A97A',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Receipt size={16} />
                  </div>
                  <span style={{ color: '#1E1E1E', fontSize: '0.95rem', fontWeight: 500 }}>
                    Payment & Refund
                  </span>
                </div>
                <ChevronRight size={18} style={{ color: '#B68D58' }} />
              </button>

            </div>
          </div>

        </div>

        {/* =========================================================================
            RIGHT COLUMN: MY DASHBOARD (Liked Products & Purchased Products)
        ========================================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>

          {/* MY DASHBOARD MAIN CARD */}
          <div style={{
            backgroundColor: '#FAF4EB',
            borderRadius: '22px',
            border: '1.5px solid #EADCCB',
            boxShadow: '0 8px 24px rgba(180, 150, 120, 0.12)',
            padding: '1.75rem 2rem 2rem',
            position: 'relative'
          }}>

            {/* Header: "My Dashboard" badge + Link to full user dashboard */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '0.55rem 1.6rem',
                fontSize: '1.35rem',
                fontWeight: 700,
                color: '#1E1E1E',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
                fontFamily: 'var(--font-serif, serif)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <LayoutDashboard size={20} style={{ color: '#B68D58' }} />
                <span>My Dashboard</span>
              </div>

              <Link
                to="/user-dashboard"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#1A3B2A',
                  borderRadius: '9999px',
                  border: '1px solid #D8C3A8',
                  padding: '0.45rem 1.15rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease'
                }}
              >
                <span>Full Dashboard</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <p style={{ color: '#6E5D4F', fontSize: '0.88rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
              Welcome back, <strong>{currentUser?.fullName || currentUser?.displayName || 'Flower Lover'}</strong>! Here is your personal collection of liked blooms and previously purchased flowers.
            </p>

            {/* SUBSECTION 1: LIKED PRODUCTS */}
            <div style={{
              marginBottom: '2rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid #ECE0CF'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#FEE2E2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#E03131'
                  }}>
                    <Heart size={15} fill="#E03131" />
                  </div>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#1E1E1E',
                    margin: 0,
                    fontFamily: 'var(--font-serif, serif)'
                  }}>
                    Liked Products
                  </h4>
                  <span style={{
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.12rem 0.55rem',
                    borderRadius: '12px'
                  }}>
                    {likedProducts.length}
                  </span>
                </div>

                <Link
                  to="/wishlist"
                  style={{
                    fontSize: '0.82rem',
                    color: '#B68D58',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                >
                  <span>View All</span>
                  <ChevronRight size={13} />
                </Link>
              </div>

              {likedProducts.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                  gap: '0.85rem'
                }}>
                  {likedProducts.map(prod => (
                    <div
                      key={prod.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid #ECE0CF',
                        padding: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}
                    >
                      <img
                        src={prod.image}
                        alt={prod.name}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '12px',
                          objectFit: 'cover',
                          flexShrink: 0,
                          backgroundColor: '#F5EFEB'
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link
                          to={`/product/${prod.id}`}
                          style={{
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            color: '#1E1E1E',
                            textDecoration: 'none',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginBottom: '0.25rem'
                          }}
                          title={prod.name}
                        >
                          {prod.name}
                        </Link>
                        <span style={{
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: '#1A3B2A',
                          display: 'block'
                        }}>
                          ₹{prod.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px dashed #D8C3A8',
                  padding: '1.25rem',
                  textAlign: 'center',
                  color: '#7A6B63'
                }}>
                  <Heart size={24} style={{ color: '#D8C3A8', margin: '0 auto 0.4rem', display: 'block' }} />
                  <p style={{ fontSize: '0.86rem', margin: '0 0 0.6rem' }}>
                    You have not liked any flowers yet. Heart your favorite blooms while browsing!
                  </p>
                  <Link
                    to="/shop"
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#1A3B2A',
                      color: '#FFFFFF',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      padding: '0.4rem 1rem',
                      borderRadius: '9999px',
                      textDecoration: 'none'
                    }}
                  >
                    Browse Flowers
                  </Link>
                </div>
              )}
            </div>

            {/* SUBSECTION 2: PURCHASED PRODUCTS */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#E6FCF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0CA678'
                  }}>
                    <ShoppingBag size={15} />
                  </div>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#1E1E1E',
                    margin: 0,
                    fontFamily: 'var(--font-serif, serif)'
                  }}>
                    Purchased Products
                  </h4>
                  <span style={{
                    backgroundColor: '#E6FCF5',
                    color: '#0CA678',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.12rem 0.55rem',
                    borderRadius: '12px'
                  }}>
                    {purchasedProducts.length}
                  </span>
                </div>

                <Link
                  to="/orders"
                  style={{
                    fontSize: '0.82rem',
                    color: '#B68D58',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                >
                  <span>All Orders</span>
                  <ChevronRight size={13} />
                </Link>
              </div>

              {purchasedProducts.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                  gap: '0.85rem'
                }}>
                  {purchasedProducts.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid #ECE0CF',
                        padding: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '12px',
                          objectFit: 'cover',
                          flexShrink: 0,
                          backgroundColor: '#F5EFEB'
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link
                          to={item.id ? `/product/${item.id}` : '/orders'}
                          style={{
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            color: '#1E1E1E',
                            textDecoration: 'none',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginBottom: '0.2rem'
                          }}
                          title={item.name}
                        >
                          {item.name}
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.3rem' }}>
                          <span style={{
                            fontSize: '0.92rem',
                            fontWeight: 700,
                            color: '#1A3B2A'
                          }}>
                            ₹{item.price}
                          </span>
                          {item.orderId && (
                            <span style={{
                              fontSize: '0.72rem',
                              color: '#8A7A70',
                              backgroundColor: '#F5EFEB',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '6px'
                            }}>
                              #{item.orderId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px dashed #D8C3A8',
                  padding: '1.25rem',
                  textAlign: 'center',
                  color: '#7A6B63'
                }}>
                  <ShoppingBag size={24} style={{ color: '#D8C3A8', margin: '0 auto 0.4rem', display: 'block' }} />
                  <p style={{ fontSize: '0.86rem', margin: '0 0 0.6rem' }}>
                    No purchased flower orders yet. Order farm-fresh blooms delivered in 2 hours!
                  </p>
                  <Link
                    to="/shop"
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#1A3B2A',
                      color: '#FFFFFF',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      padding: '0.4rem 1rem',
                      borderRadius: '9999px',
                      textDecoration: 'none'
                    }}
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>


      {/* =========================================================================
          MODALS & DIALOGS
      ========================================================================== */}

      {/* 1. Add / Edit Delivery Address Modal */}
      {showAddressModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(30, 20, 15, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#FAF4EB',
            borderRadius: '20px',
            border: '1.5px solid #EADCCB',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            padding: '2rem',
            maxWidth: '480px',
            width: '100%',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setShowAddressModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#7A6B63'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '1.25rem', fontFamily: 'var(--font-serif, serif)' }}>
              {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
            </h3>

            <form onSubmit={handleSaveAddress}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3A302A', display: 'block', marginBottom: '0.3rem' }}>Label</label>
                  <input
                    type="text"
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    placeholder="Home, Office"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #D8C3A8', backgroundColor: '#FFFFFF' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3A302A', display: 'block', marginBottom: '0.3rem' }}>Recipient Name</label>
                  <input
                    type="text"
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #D8C3A8', backgroundColor: '#FFFFFF' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3A302A', display: 'block', marginBottom: '0.3rem' }}>Street Address & Landmark *</label>
                <input
                  type="text"
                  required
                  placeholder="Flat No, Building, Street, Area"
                  value={addressForm.addressLine}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #D8C3A8', backgroundColor: '#FFFFFF' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3A302A', display: 'block', marginBottom: '0.3rem' }}>City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #D8C3A8', backgroundColor: '#FFFFFF' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3A302A', display: 'block', marginBottom: '0.3rem' }}>Pincode *</label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '') })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #D8C3A8', backgroundColor: '#FFFFFF' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3A302A', display: 'block', marginBottom: '0.3rem' }}>Phone Number</label>
                <input
                  type="text"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #D8C3A8', backgroundColor: '#FFFFFF' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #D8C3A8',
                    color: '#4A3E38',
                    borderRadius: '9999px',
                    padding: '0.45rem 1.4rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#274E3A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '0.45rem 1.6rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Interactive Modals for Other Rows */}
      {activeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(30, 20, 15, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#FAF4EB',
            borderRadius: '20px',
            border: '1.5px solid #EADCCB',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            padding: '2rem',
            maxWidth: '460px',
            width: '100%',
            position: 'relative',
            textAlign: 'center'
          }}>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#7A6B63'
              }}
            >
              <X size={20} />
            </button>

            {/* Modal: Floora Balance */}
            {activeModal === 'balance' && (
              <div>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#F0E2CF', color: '#B68D58', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Wallet size={28} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.5rem', fontFamily: 'var(--font-serif, serif)' }}>
                  Floora Wallet
                </h3>
                <div style={{ fontSize: '2.4rem', fontWeight: 700, color: '#274E3A', margin: '1rem 0' }}>
                  ₹0.00
                </div>
                <p style={{ color: '#6A5B52', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Your Floora cashback and store credits will appear here automatically on qualifying orders.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    if (onShowToast) onShowToast('Floora credits feature coming soon! 🌸');
                  }}
                  style={{ backgroundColor: '#274E3A', color: '#FFFFFF', border: 'none', borderRadius: '9999px', padding: '0.6rem 2rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Add Gift Voucher
                </button>
              </div>
            )}

            {/* Modal: Refer & Earn */}
            {activeModal === 'refer' && (
              <div>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#F0E2CF', color: '#B68D58', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Sparkles size={28} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.5rem', fontFamily: 'var(--font-serif, serif)' }}>
                  Refer & Earn ₹100
                </h3>
                <p style={{ color: '#6A5B52', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Gift friends ₹100 off on their first fresh flower bouquet, and earn ₹100 in your Floora Wallet!
                </p>
                <div style={{ backgroundColor: '#FFFFFF', border: '1.5px dashed #B68D58', padding: '0.75rem', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 700, color: '#B68D58', letterSpacing: '2px', marginBottom: '1.25rem' }}>
                  FLOORA-BLOOM-100
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('FLOORA-BLOOM-100');
                    if (onShowToast) onShowToast('Referral code copied! Share with friends 🌸');
                    setActiveModal(null);
                  }}
                  style={{ backgroundColor: '#B68D58', color: '#FFFFFF', border: 'none', borderRadius: '9999px', padding: '0.6rem 2rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Copy Referral Link
                </button>
              </div>
            )}

            {/* Modal: Change Language */}
            {activeModal === 'language' && (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '1rem', fontFamily: 'var(--font-serif, serif)' }}>
                  Select Language
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                  {['English', 'Hindi (हिंदी)', 'Marathi (मराठी)', 'Gujarati (ગુજરાતી)', 'Tamil (தமிழ்)'].map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLang(lang)}
                      style={{
                        padding: '0.65rem 1rem',
                        borderRadius: '10px',
                        border: selectedLang === lang ? '2px solid #274E3A' : '1px solid #D8C3A8',
                        backgroundColor: selectedLang === lang ? '#EBF3EE' : '#FFFFFF',
                        color: '#1E1E1E',
                        fontWeight: selectedLang === lang ? 600 : 400,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{lang}</span>
                      {selectedLang === lang && <Check size={16} color="#274E3A" />}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    if (onShowToast) onShowToast(`Language set to ${selectedLang}`);
                  }}
                  style={{ backgroundColor: '#274E3A', color: '#FFFFFF', border: 'none', borderRadius: '9999px', padding: '0.55rem 2rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Apply Language
                </button>
              </div>
            )}

            {/* Modal: Bank & UPI */}
            {activeModal === 'bank' && (
              <div>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#F0E2CF', color: '#B68D58', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <CreditCard size={28} />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.5rem', fontFamily: 'var(--font-serif, serif)' }}>
                  Bank & UPI Details
                </h3>
                <p style={{ color: '#6A5B52', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Secure payment instruments for quick 1-click floral checkout.
                </p>
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #D8C3A8', borderRadius: '12px', padding: '1rem', textAlign: 'left', marginBottom: '1.25rem' }}>
                  <div style={{ fontWeight: 600, color: '#1E1E1E' }}>Primary UPI ID</div>
                  <div style={{ color: '#55473F', fontSize: '0.9rem', marginTop: '0.2rem' }}>{currentUser.email.split('@')[0]}@okhdfcbank</div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  style={{ backgroundColor: '#274E3A', color: '#FFFFFF', border: 'none', borderRadius: '9999px', padding: '0.55rem 2rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            )}

            {/* Modal: Payment & Refund */}
            {activeModal === 'refund' && (
              <div>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#F0E2CF', color: '#B68D58', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Receipt size={28} />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.5rem', fontFamily: 'var(--font-serif, serif)' }}>
                  Payment & Refund Policy
                </h3>
                <p style={{ color: '#6A5B52', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'left', lineHeight: 1.5 }}>
                  Floora guarantees 100% farm-fresh flower replacements or instant UPI refunds if you are not delighted with your bouquet. All refunds process within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  style={{ backgroundColor: '#274E3A', color: '#FFFFFF', border: 'none', borderRadius: '9999px', padding: '0.55rem 2rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Understood
                </button>
              </div>
            )}

            {/* Modal: Become a Supplier */}
            {activeModal === 'supplier' && (
              <div>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#F0E2CF', color: '#B68D58', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Truck size={28} />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.5rem', fontFamily: 'var(--font-serif, serif)' }}>
                  Partner With Floora
                </h3>
                <p style={{ color: '#6A5B52', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Are you a local flower grower, greenhouse cultivator, or artisanal florist in India? Supply fresh stems to Floora's fast-delivery network.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    if (onShowToast) onShowToast('Thank you for your interest! Our team will contact you. 🌸');
                  }}
                  style={{ backgroundColor: '#274E3A', color: '#FFFFFF', border: 'none', borderRadius: '9999px', padding: '0.55rem 2rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Apply as Florist Partner
                </button>
              </div>
            )}

            {/* Modal: Rate Floora */}
            {activeModal === 'rate' && (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.5rem', fontFamily: 'var(--font-serif, serif)' }}>
                  Rate Your Floora Experience
                </h3>
                <p style={{ color: '#6A5B52', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  How do you rate the freshness and delivery of our flowers?
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingVal(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <Star size={32} fill={star <= ratingVal ? '#F4B942' : 'none'} color={star <= ratingVal ? '#F4B942' : '#C5A97A'} />
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    if (onShowToast) onShowToast('Thank you for rating us 5 stars! 🌸');
                  }}
                  style={{ backgroundColor: '#274E3A', color: '#FFFFFF', border: 'none', borderRadius: '9999px', padding: '0.55rem 2rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Submit Rating
                </button>
              </div>
            )}

            {/* Modal: Legal & Policies */}
            {activeModal === 'legal' && (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.75rem', fontFamily: 'var(--font-serif, serif)' }}>
                  Legal & Freshness Guarantee
                </h3>
                <div style={{ textAlign: 'left', fontSize: '0.88rem', color: '#55473F', lineHeight: 1.5, maxHeight: '200px', overflowY: 'auto', marginBottom: '1.25rem', paddingRight: '0.5rem' }}>
                  <p><strong>1. Complete User Privacy:</strong> Your personal information, delivery addresses, and past orders are strictly confidential and encrypted per authenticated session.</p>
                  <p style={{ marginTop: '0.5rem' }}><strong>2. 72-Hour Freshness:</strong> Every bloom is conditioned in chilled floral food water to last a minimum of 72 hours in your vase.</p>
                  <p style={{ marginTop: '0.5rem' }}><strong>3. Delivery Commitment:</strong> Express deliveries are completed within 2 hours of slot confirmation.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  style={{ backgroundColor: '#274E3A', color: '#FFFFFF', border: 'none', borderRadius: '9999px', padding: '0.55rem 2rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            )}

            {/* Modal: Help Centre */}
            {activeModal === 'help' && (
              <div>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#F0E2CF', color: '#B68D58', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <HelpCircle size={28} />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.5rem', fontFamily: 'var(--font-serif, serif)' }}>
                  Floora Concierge Help
                </h3>
                <p style={{ color: '#6A5B52', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Need help with order tracking, custom floral bouquets, or venue delivery? Our master florists are online 24/7.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #D8C3A8', borderRadius: '8px', padding: '0.75rem', textAlign: 'left', fontSize: '0.9rem' }}>
                    <strong>📞 Helpline:</strong> +91 98765 43210 (9 AM - 9 PM)
                  </div>
                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #D8C3A8', borderRadius: '8px', padding: '0.75rem', textAlign: 'left', fontSize: '0.9rem' }}>
                    <strong>✉️ Email:</strong> care@floora.com
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  style={{ backgroundColor: '#274E3A', color: '#FFFFFF', border: 'none', borderRadius: '9999px', padding: '0.55rem 2rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Done
                </button>
              </div>
            )}

            {/* Modal: Settings */}
            {activeModal === 'settings' && (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '1rem', fontFamily: 'var(--font-serif, serif)' }}>
                  Account Preferences
                </h3>
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: '#2C2523' }}>
                    <input type="checkbox" defaultChecked /> Receive 2-Hour Delivery SMS alerts
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: '#2C2523' }}>
                    <input type="checkbox" defaultChecked /> Seasonal bloom discount notifications
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: '#2C2523' }}>
                    <input type="checkbox" defaultChecked /> Strict user data privacy protection
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    if (onShowToast) onShowToast('Preferences saved! 🌸');
                  }}
                  style={{ backgroundColor: '#274E3A', color: '#FFFFFF', border: 'none', borderRadius: '9999px', padding: '0.55rem 2rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save Settings
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .profile-corner-flower {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .profile-field-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.45rem !important;
          }
          .profile-field-row > span {
            width: 100% !important;
          }
          .profile-field-row > div {
            width: 100% !important;
          }
        }
      `}</style>

    </div>
  );
};
