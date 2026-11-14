import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Truck,
  CreditCard,
  Smartphone,
  Banknote,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Edit3
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';

const TIME_SLOTS = [
  { id: 'Morning (8 AM - 11 AM)', label: '🌅 Morning Delivery', time: '8:00 AM - 11:00 AM' },
  { id: 'Express 2-Hour', label: '⚡ Express 2-Hour', time: 'Within 2 Hours' },
  { id: 'Evening (4 PM - 8 PM)', label: '🌆 Evening Delivery', time: '4:00 PM - 8:00 PM' },
  { id: 'Midnight (11:30 PM - 12 AM)', label: '🌙 Midnight Surprise', time: '11:30 PM - 12:00 AM' }
];

// Calculate standard delivery date offset:
// Local delivery: 5 days after order date
// Long-distance delivery: 8 days after order date
export const getDeliveryDateForLocation = (pincode = '', city = '') => {
  const cleanPin = (pincode || '').toString().trim();
  const cleanCity = (city || '').toString().trim().toLowerCase();

  // Local Mumbai / Maharashtra zones (MMR, Pune, etc.):
  // PIN codes starting with 40, 41, 42, 43, 44 or local cities
  const localCities = ['mumbai', 'navi mumbai', 'thane', 'pune', 'kalyan', 'dombivli', 'panvel', 'mira bhayandar'];
  const isCityLocal = localCities.some(c => cleanCity.includes(c));

  let isLocal = true;
  if (cleanPin.length >= 2) {
    const prefix2 = cleanPin.slice(0, 2);
    if (['40', '41', '42', '43', '44'].includes(prefix2)) {
      isLocal = true;
    } else {
      isLocal = false; // Outside local Maharashtra/Mumbai region -> Long-distance
    }
  } else if (!cleanPin && isCityLocal) {
    isLocal = true;
  } else if (!cleanPin && cleanCity && !isCityLocal) {
    isLocal = false;
  }

  const days = isLocal ? 5 : 8;
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  return { dateStr, days, isLocal };
};

export const CheckoutPage = ({ onShowToast }) => {
  const navigate = useNavigate();
  const { cart, subtotal, discount, deliveryFee, total, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { currentUser } = useAuth();

  const todayISO = new Date().toISOString().split('T')[0];

  // Restrict access: Guest / unauthenticated users cannot view Express Floral Checkout
  useEffect(() => {
    if (!currentUser) {
      if (onShowToast) onShowToast('Please create an account or sign in to continue to checkout 🌸');
      navigate('/auth?redirect=/checkout', { replace: true });
    }
  }, [currentUser, navigate, onShowToast]);

  if (!currentUser) {
    return null;
  }

  // 2-Step Checkout State
  const [step, setStep] = useState(1);

  // Form states strictly isolated per user
  const defaultAddr = currentUser?.addresses?.find(a => a.isDefault) || currentUser?.addresses?.[0];
  const initialPin = defaultAddr?.pincode || currentUser?.pincode || '';
  const initialCity = defaultAddr?.city || currentUser?.city || 'Mumbai';
  const initialDeliveryInfo = getDeliveryDateForLocation(initialPin, initialCity);

  const [formData, setFormData] = useState({
    fullName: defaultAddr?.name || currentUser?.fullName || currentUser?.displayName || '',
    phone: (defaultAddr?.phone || currentUser?.phoneNumber || '').replace(/[^\d+ ]/g, ''),
    email: currentUser?.email || '',
    houseNo: defaultAddr?.houseNo || '',
    addressLine: defaultAddr?.addressLine || '',
    city: initialCity,
    state: defaultAddr?.state || currentUser?.state || 'Maharashtra',
    pincode: initialPin
  });

  // Delivery date auto-filled based on delivery location: 5 days for local, 8 days for long-distance
  const [deliveryDate, setDeliveryDate] = useState(initialDeliveryInfo.dateStr);

  // Delivery duration and location analysis
  const deliveryLocationInfo = useMemo(() => {
    return getDeliveryDateForLocation(formData.pincode, formData.city);
  }, [formData.pincode, formData.city]);

  // Automatically update the delivery date when the user changes the delivery PIN code or city
  const prevLocationKeyRef = useRef(`${initialPin}_${initialCity}`);
  useEffect(() => {
    const currentKey = `${formData.pincode}_${formData.city}`;
    if (prevLocationKeyRef.current !== currentKey) {
      prevLocationKeyRef.current = currentKey;
      // Auto-update to new location's standard delivery date
      const newLoc = getDeliveryDateForLocation(formData.pincode, formData.city);
      setDeliveryDate(newLoc.dateStr);
    }
  }, [formData.pincode, formData.city]);
  const [deliverySlot, setDeliverySlot] = useState('Express 2-Hour');

  // Step 2: Payment states (all existing payment options preserved)
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [cardData, setCardData] = useState({ number: '', exp: '', cvv: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2 className="font-serif" style={{ fontSize: '2rem', marginBottom: '1rem' }}>No Flowers in Cart</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Please add flowers to your cart before proceeding to checkout.
        </p>
        <Link to="/shop" className="btn btn-primary">Go to Shop</Link>
      </div>
    );
  }

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep1 = () => {
    const errs = {};
    const digitsPhone = formData.phone.replace(/\D/g, '');
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!digitsPhone || digitsPhone.length < 10) errs.phone = 'Valid 10-digit mobile number is required';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Valid email address is required';
    }
    if (!formData.houseNo.trim()) errs.houseNo = 'House / Flat number is required';
    if (!formData.addressLine.trim()) errs.addressLine = 'Street / Area is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.state.trim()) errs.state = 'State is required';
    if (!formData.pincode.trim() || formData.pincode.trim().length !== 6) {
      errs.pincode = 'Valid 6-digit PIN code is required';
    }
    if (!deliveryDate) errs.deliveryDate = 'Please select a delivery date';
    if (!deliverySlot) errs.deliverySlot = 'Please select a delivery time slot';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!paymentMethod) errs.paymentMethod = 'Please select a payment method';
    if (paymentMethod === 'Card') {
      const cardDigits = (cardData.number || '').replace(/\D/g, '');
      if (!cardDigits) {
        errs.cardNumber = 'Credit card number is required';
      } else if (cardDigits.length !== 16) {
        errs.cardNumber = 'Credit card number must be exactly 16 numeric digits';
      }
      if (!/^\d{2}\/\d{2}$/.test((cardData.exp || '').trim())) {
        errs.cardExp = 'Enter expiry in MM/YY format';
      }
      if ((cardData.cvv || '').replace(/\D/g, '').length < 3) {
        errs.cardCvv = 'Enter valid 3-digit CVV';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinueToPayment = (e) => {
    e.preventDefault();
    if (!validateStep1()) {
      if (onShowToast) onShowToast('Please fill in all required delivery details.');
      return;
    }
    setErrors({});
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStep1 = () => {
    setErrors({});
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError('');

    if (!validateStep1()) {
      setStep(1);
      if (onShowToast) onShowToast('Please complete all required delivery details.');
      return;
    }
    if (!validateStep2()) {
      if (onShowToast) onShowToast('Please complete the selected payment details.');
      return;
    }

    const fullStreetAddress = [formData.houseNo.trim(), formData.addressLine.trim()].filter(Boolean).join(', ');

    const orderPayload = {
      items: cart.map(i => ({
        id: i.product.id,
        name: i.product.name,
        image: i.product.image,
        price: i.product.price,
        quantity: i.quantity,
        deliveryDate: deliveryDate || i.deliveryDate,
        cardMessage: i.cardMessage
      })),
      subtotal,
      discount,
      deliveryFee,
      total,
      deliveryDate,
      deliverySlot,
      shippingAddress: {
        ...formData,
        addressLine: fullStreetAddress
      },
      paymentMethod
    };

    setIsSubmitting(true);
    try {
      const createdOrder = await placeOrder(orderPayload);
      clearCart();

      if (onShowToast) onShowToast(`Order ${createdOrder.orderId} placed successfully! 🌸`);
      navigate(`/order-success/${createdOrder.orderId}`, { state: { order: createdOrder } });
    } catch (err) {
      const message = err?.message || 'Unable to place order right now. Please try again.';
      setSubmitError(message);
      if (onShowToast) onShowToast(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = deliveryDate
    ? new Date(`${deliveryDate}T00:00:00`).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : '';

  return (
    <div className="container animate-fade-in checkout-page-container">
      {/* Top Back Link */}
      <div style={{ marginBottom: '1rem' }}>
        {step === 1 ? (
          <Link to="/cart" className="checkout-back-link">
            <ArrowLeft size={16} /> Return to Cart
          </Link>
        ) : (
          <button type="button" onClick={handleBackToStep1} className="checkout-back-btn">
            <ArrowLeft size={16} /> Back to Delivery Details
          </button>
        )}
      </div>

      {/* Page Header & 2-Step Progress Indicator */}
      <div className="checkout-header-wrap">
        <h1 className="font-serif checkout-main-title">Express Floral Checkout</h1>

        <div className="checkout-stepper" aria-label="Checkout progress">
          <div
            className={`checkout-step-item ${step === 1 ? 'active' : 'completed'}`}
            onClick={() => step === 2 && handleBackToStep1()}
            style={{ cursor: step === 2 ? 'pointer' : 'default' }}
          >
            <span className="checkout-step-circle">
              {step > 1 ? <CheckCircle2 size={15} /> : '1'}
            </span>
            <div className="checkout-step-text">
              <span className="checkout-step-label">Step 1</span>
              <strong className="checkout-step-title">Delivery Address</strong>
            </div>
          </div>

          <div className={`checkout-step-connector ${step === 2 ? 'active' : ''}`} />

          <div
            className={`checkout-step-item ${step === 1 ? 'active' : 'completed'}`}
            onClick={() => step === 2 && handleBackToStep1()}
            style={{ cursor: step === 2 ? 'pointer' : 'default' }}
          >
            <span className="checkout-step-circle">
              {step > 1 ? <CheckCircle2 size={15} /> : '2'}
            </span>
            <div className="checkout-step-text">
              <span className="checkout-step-label">Step 2</span>
              <strong className="checkout-step-title">Time Slot</strong>
            </div>
          </div>

          <div className={`checkout-step-connector ${step === 2 ? 'active' : ''}`} />

          <div className={`checkout-step-item ${step === 2 ? 'active' : ''}`}>
            <span className="checkout-step-circle">3</span>
            <div className="checkout-step-text">
              <span className="checkout-step-label">Step 3</span>
              <strong className="checkout-step-title">Payment Method</strong>
            </div>
          </div>

          <div className={`checkout-step-connector ${step === 2 ? 'active' : ''}`} />

          <div className={`checkout-step-item ${step === 2 ? 'active' : ''}`}>
            <span className="checkout-step-circle">4</span>
            <div className="checkout-step-text">
              <span className="checkout-step-label">Step 4</span>
              <strong className="checkout-step-title">Your Flower Order</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
          STEP 1: DELIVERY ADDRESS + SELECT DELIVERY TIME SLOT (ONLY 2 BOXES)
      ================================================================ */}
      {step === 1 && (
        <form onSubmit={handleContinueToPayment} noValidate>
          <div className="checkout-two-box-grid">
            {/* BOX 1: DELIVERY ADDRESS */}
            <div className="checkout-box">
              <div className="checkout-box-header">
                <span className="checkout-box-badge">1</span>
                <div>
                  <h2 className="font-serif checkout-box-title">Delivery Address</h2>
                  <p className="checkout-box-subtitle">Where should we deliver your fresh blooms?</p>
                </div>
              </div>

              <div className="checkout-fields-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter recipient full name"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    className="form-input"
                    style={{ borderColor: errors.fullName ? '#E03131' : undefined }}
                  />
                  {errors.fullName && <small className="checkout-err">{errors.fullName}</small>}
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="form-input"
                    style={{ borderColor: errors.phone ? '#E03131' : undefined }}
                  />
                  {errors.phone && <small className="checkout-err">{errors.phone}</small>}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.85rem' }}>
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="form-input"
                  style={{ borderColor: errors.email ? '#E03131' : undefined }}
                />
                {errors.email && <small className="checkout-err">{errors.email}</small>}
              </div>

              <div className="checkout-fields-grid-house" style={{ marginTop: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">House / Flat No. *</label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 402"
                    value={formData.houseNo}
                    onChange={(e) => updateField('houseNo', e.target.value)}
                    className="form-input"
                    style={{ borderColor: errors.houseNo ? '#E03131' : undefined }}
                  />
                  {errors.houseNo && <small className="checkout-err">{errors.houseNo}</small>}
                </div>

                <div className="form-group">
                  <label className="form-label">Street / Area *</label>
                  <input
                    type="text"
                    placeholder="Building, street name & landmark"
                    value={formData.addressLine}
                    onChange={(e) => updateField('addressLine', e.target.value)}
                    className="form-input"
                    style={{ borderColor: errors.addressLine ? '#E03131' : undefined }}
                  />
                  {errors.addressLine && <small className="checkout-err">{errors.addressLine}</small>}
                </div>
              </div>

              <div className="checkout-fields-grid-3" style={{ marginTop: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="form-input"
                    style={{ borderColor: errors.city ? '#E03131' : undefined }}
                  />
                  {errors.city && <small className="checkout-err">{errors.city}</small>}
                </div>

                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    className="form-input"
                    style={{ borderColor: errors.state ? '#E03131' : undefined }}
                  />
                  {errors.state && <small className="checkout-err">{errors.state}</small>}
                </div>

                <div className="form-group">
                  <label className="form-label">PIN Code *</label>
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="6 digits"
                    value={formData.pincode}
                    onChange={(e) => updateField('pincode', e.target.value.replace(/\D/g, ''))}
                    className="form-input"
                    style={{ borderColor: errors.pincode ? '#E03131' : undefined }}
                  />
                  {errors.pincode && <small className="checkout-err">{errors.pincode}</small>}
                </div>
              </div>
            </div>

            {/* BOX 2: SELECT DELIVERY TIME SLOT */}
            <div className="checkout-box">
              <div className="checkout-box-header">
                <span className="checkout-box-badge">2</span>
                <div>
                  <h2 className="font-serif checkout-box-title">Select Delivery Time Slot</h2>
                  <p className="checkout-box-subtitle">Choose your preferred delivery date &amp; time window</p>
                </div>
              </div>

              {/* Select Delivery Date */}
              <div className="form-group" style={{ marginBottom: '1.35rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={15} style={{ color: 'var(--primary)' }} />
                  <span>Select Delivery Date *</span>
                </label>
                <input
                  type="date"
                  min={deliveryLocationInfo.dateStr}
                  value={deliveryDate}
                  onChange={(e) => {
                    setDeliveryDate(e.target.value);
                    if (errors.deliveryDate) {
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.deliveryDate;
                        return next;
                      });
                    }
                  }}
                  className="form-input"
                  style={{ borderColor: errors.deliveryDate ? '#E03131' : undefined }}
                />
                {errors.deliveryDate && <small className="checkout-err">{errors.deliveryDate}</small>}

                {/* Location-based Delivery Availability Notice */}
                <div style={{ marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: deliveryLocationInfo.isLocal ? '#1C3D2B' : '#8A5D18', fontWeight: 500 }}>
                  <span>
                    {deliveryLocationInfo.isLocal
                      ? '📍 Local Delivery: Earliest delivery in 5 days from order date'
                      : '🚚 Long-Distance Delivery: Earliest delivery in 8 days from order date'}
                  </span>
                </div>
              </div>

              {/* Select Preferred Delivery Time Slot (Radio Buttons) */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
                  <Clock size={15} style={{ color: 'var(--primary)' }} />
                  <span>Select Preferred Delivery Time Slot *</span>
                </label>

                <div className="checkout-slots-list">
                  {TIME_SLOTS.map(slot => {
                    const isSelected = deliverySlot === slot.id;
                    return (
                      <label
                        key={slot.id}
                        className={`checkout-slot-card ${isSelected ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="deliverySlot"
                          value={slot.id}
                          checked={isSelected}
                          onChange={(e) => setDeliverySlot(e.target.value)}
                          className="checkout-slot-radio"
                        />
                        <div className="checkout-slot-info">
                          <strong className="checkout-slot-name">{slot.label}</strong>
                          <small className="checkout-slot-time">{slot.time}</small>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {errors.deliverySlot && <small className="checkout-err">{errors.deliverySlot}</small>}
              </div>
            </div>
          </div>

          {/* Bottom Step 1 CTA */}
          <div className="checkout-bottom-bar">
            <button type="submit" className="btn btn-primary btn-lg checkout-primary-cta">
              <span>Continue to Payment</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      )}

      {/* ================================================================
          STEP 2: PAYMENT METHOD + YOUR FLOWER ORDER (ONLY 2 BOXES)
      ================================================================ */}
      {step === 2 && (
        <form onSubmit={handleSubmitOrder} noValidate>
          <div className="checkout-two-box-grid">
            {/* BOX 3: PAYMENT METHOD */}
            <div className="checkout-box">
              <div className="checkout-box-header">
                <span className="checkout-box-badge">3</span>
                <div>
                  <h2 className="font-serif checkout-box-title">Payment Method</h2>
                  <p className="checkout-box-subtitle">Select one secure payment option</p>
                </div>
              </div>

              <div className="checkout-payment-options">
                {[
                  { id: 'UPI', label: 'Instant UPI / QR Code', desc: 'GPay, PhonePe, Paytm & BHIM', icon: <Smartphone size={18} /> },
                  { id: 'Card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard & RuPay', icon: <CreditCard size={18} /> },
                  { id: 'COD', label: 'Cash on Delivery (COD)', desc: 'Pay in cash or UPI at doorstep', icon: <Banknote size={18} /> }
                ].map(p => {
                  const isActive = paymentMethod === p.id;
                  return (
                    <label
                      key={p.id}
                      className={`checkout-payment-row ${isActive ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={p.id}
                        checked={isActive}
                        onChange={() => {
                          setPaymentMethod(p.id);
                          setErrors({});
                        }}
                        className="checkout-slot-radio"
                      />
                      <span className="checkout-payment-icon">{p.icon}</span>
                      <div className="checkout-payment-text">
                        <strong>{p.label}</strong>
                        <small>{p.desc}</small>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* UPI Option Details */}
              {paymentMethod === 'UPI' && (
                <div className="checkout-payment-detail upi">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ width: '78px', height: '78px', backgroundColor: '#FFF', padding: '6px', borderRadius: '8px', flexShrink: 0 }}>
                      <svg viewBox="0 0 100 100" width="100%" height="100%">
                        <rect width="100" height="100" fill="#FFF" />
                        <rect x="10" y="10" width="25" height="25" fill="#49343C" />
                        <rect x="15" y="15" width="15" height="15" fill="#FFF" />
                        <rect x="18" y="18" width="9" height="9" fill="#49343C" />
                        <rect x="65" y="10" width="25" height="25" fill="#49343C" />
                        <rect x="70" y="15" width="15" height="15" fill="#FFF" />
                        <rect x="73" y="18" width="9" height="9" fill="#49343C" />
                        <rect x="10" y="65" width="25" height="25" fill="#49343C" />
                        <rect x="15" y="70" width="15" height="15" fill="#FFF" />
                        <rect x="18" y="73" width="9" height="9" fill="#49343C" />
                        <rect x="45" y="45" width="10" height="10" fill="#E88EAA" />
                      </svg>
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.92rem' }}>Scan &amp; Pay via GPay, PhonePe, Paytm, BHIM</strong>
                      <small style={{ color: 'var(--text-muted)' }}>Merchant VPA: <code>floora@upi</code></small>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Option Details */}
              {paymentMethod === 'Card' && (
                <div className="checkout-payment-detail card">
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Card Number (e.g. 4532 1234 5678 8912)"
                      maxLength="19"
                      value={cardData.number}
                      onChange={(e) => {
                        // Strict 16 numeric digits only, no alphabets or special characters
                        const rawDigits = e.target.value.replace(/\D/g, '').slice(0, 16);
                        const formatted = rawDigits.match(/.{1,4}/g)?.join(' ') || rawDigits;
                        setCardData(prev => ({ ...prev, number: formatted }));
                        if (errors.cardNumber) {
                          setErrors(prev => {
                            const next = { ...prev };
                            delete next.cardNumber;
                            return next;
                          });
                        }
                      }}
                      className="form-input"
                      style={{ borderColor: errors.cardNumber ? '#E03131' : undefined }}
                    />
                    {errors.cardNumber && <small className="checkout-err">{errors.cardNumber}</small>}
                  </div>
                  <div className="checkout-fields-grid-2">
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength="5"
                        value={cardData.exp}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                          let formatted = raw;
                          if (raw.length > 2) {
                            formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
                          }
                          setCardData(prev => ({ ...prev, exp: formatted }));
                          if (errors.cardExp) {
                            setErrors(prev => {
                              const next = { ...prev };
                              delete next.cardExp;
                              return next;
                            });
                          }
                        }}
                        className="form-input"
                        style={{ borderColor: errors.cardExp ? '#E03131' : undefined }}
                      />
                      {errors.cardExp && <small className="checkout-err">{errors.cardExp}</small>}
                    </div>
                    <div className="form-group">
                      <input
                        type="password"
                        placeholder="CVV"
                        maxLength="3"
                        value={cardData.cvv}
                        onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                        className="form-input"
                        style={{ borderColor: errors.cardCvv ? '#E03131' : undefined }}
                      />
                      {errors.cardCvv && <small className="checkout-err">{errors.cardCvv}</small>}
                    </div>
                  </div>
                </div>
              )}

              {/* COD Option Details */}
              {paymentMethod === 'COD' && (
                <div className="checkout-payment-detail cod">
                  💵 Pay in cash or through UPI QR scan at the time of doorstep flower delivery.
                </div>
              )}
            </div>

            {/* BOX 4: YOUR FLOWER ORDER */}
            <div className="checkout-box">
              <div className="checkout-box-header">
                <span className="checkout-box-badge">4</span>
                <div>
                  <h2 className="font-serif checkout-box-title">Your Flower Order</h2>
                  <p className="checkout-box-subtitle">Review your blooms &amp; delivery summary</p>
                </div>
              </div>

              {/* Products List */}
              <div className="checkout-items-list">
                {cart.map(item => (
                  <div key={item.id} className="checkout-order-item">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="checkout-item-img"
                    />
                    <div className="checkout-item-meta">
                      <div className="checkout-item-name">{item.product.name}</div>
                      <small className="checkout-item-qty">Qty: {item.quantity}</small>
                    </div>
                    <strong className="checkout-item-price">₹{item.product.price * item.quantity}</strong>
                  </div>
                ))}
              </div>

              {/* Delivery Details Summary */}
              <div className="checkout-delivery-summary">
                <div className="checkout-delivery-summary-head">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)' }}>
                    <MapPin size={15} /> Delivery Details
                  </span>
                  <button
                    type="button"
                    onClick={handleBackToStep1}
                    className="checkout-edit-btn"
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                </div>
                <div className="checkout-delivery-summary-body">
                  <div><strong>{formData.fullName}</strong> · {formData.phone}</div>
                  <div>{formData.email}</div>
                  <div>
                    {[formData.houseNo, formData.addressLine, formData.city, formData.state].filter(Boolean).join(', ')} - {formData.pincode}
                  </div>
                  <div className="checkout-delivery-slot-line">
                    <Truck size={14} />
                    <span>{formattedDate} · {deliverySlot}</span>
                  </div>
                </div>
              </div>

              {/* Calculations */}
              <div className="checkout-totals-block">
                <div className="checkout-total-row">
                  <span>Subtotal:</span>
                  <span>₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="checkout-total-row discount">
                    <span>Coupon Discount:</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="checkout-total-row">
                  <span>Delivery Charges:</span>
                  <span>{deliveryFee === 0 ? <strong style={{ color: 'var(--primary)' }}>FREE</strong> : `₹${deliveryFee}`}</span>
                </div>
                <div className="checkout-grand-total">
                  <span>Grand Total:</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>
          </div>

          {submitError && (
            <div
              role="alert"
              style={{
                marginTop: '1rem',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '0.9rem',
                fontWeight: 500,
                textAlign: 'center'
              }}
            >
              {submitError}
            </div>
          )}

          {/* Bottom Step 2 Actions */}
          <div className="checkout-bottom-bar step2">
            <button
              type="button"
              onClick={handleBackToStep1}
              disabled={isSubmitting}
              className="btn btn-secondary btn-lg checkout-secondary-cta"
            >
              <ArrowLeft size={17} />
              <span>Edit Delivery Details</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-lg checkout-primary-cta"
              style={{ opacity: isSubmitting ? 0.78 : 1 }}
            >
              <span>{isSubmitting ? 'Placing Your Order...' : 'Place Order 🌸'}</span>
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.85rem' }}>
            By placing order, you agree to Floora 7-Day Farm Fresh Guarantee.
          </p>
        </form>
      )}

      <style>{`
        .checkout-page-container {
          padding: 2.5rem 1.5rem 5rem;
          max-width: 1120px;
        }

        .checkout-back-link,
        .checkout-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .checkout-back-link:hover,
        .checkout-back-btn:hover {
          color: var(--primary);
        }

        .checkout-header-wrap {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .checkout-main-title {
          font-size: 2.3rem;
          color: var(--text);
          margin: 0;
        }

        .checkout-stepper {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.65rem;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 0.6rem 1.15rem;
          box-shadow: var(--shadow-sm);
        }

        .checkout-step-item {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          opacity: 0.55;
          transition: var(--transition);
        }

        .checkout-step-item.active,
        .checkout-step-item.completed {
          opacity: 1;
        }

        .checkout-step-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1.5px solid var(--border);
          background: var(--bg-card-soft);
          color: var(--text);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.82rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .checkout-step-item.active .checkout-step-circle {
          background: var(--primary);
          border-color: var(--primary);
          color: #FFFFFF;
        }

        .checkout-step-item.completed .checkout-step-circle {
          background: var(--primary-light);
          border-color: var(--primary);
          color: var(--primary);
        }

        .checkout-step-text {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }

        .checkout-step-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .checkout-step-title {
          font-size: 0.85rem;
          color: var(--text);
        }

        .checkout-step-connector {
          width: 32px;
          height: 2px;
          background: var(--border);
          border-radius: 2px;
        }

        .checkout-step-connector.active {
          background: var(--primary);
        }

        .checkout-two-box-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.95fr;
          gap: 2rem;
          align-items: start;
        }

        .checkout-box {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: var(--shadow-card);
        }

        .checkout-box-header {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-light);
        }

        .checkout-box-badge {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--primary);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.88rem;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .checkout-box-title {
          font-size: 1.4rem;
          color: var(--text);
          margin: 0 0 0.15rem;
        }

        .checkout-box-subtitle {
          font-size: 0.84rem;
          color: var(--text-muted);
          margin: 0;
        }

        .checkout-fields-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .checkout-fields-grid-house {
          display: grid;
          grid-template-columns: 0.9fr 1.5fr;
          gap: 1rem;
        }

        .checkout-fields-grid-3 {
          display: grid;
          grid-template-columns: 1.1fr 1fr 0.9fr;
          gap: 1rem;
        }

        .checkout-err {
          display: block;
          color: #E03131;
          font-size: 0.78rem;
          margin-top: 0.25rem;
        }

        .checkout-slots-list {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }

        .checkout-slot-card {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.9rem 1rem;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--surface);
          cursor: pointer;
          transition: var(--transition);
        }

        .checkout-slot-card:hover {
          border-color: var(--primary);
          background: var(--bg-card-soft);
        }

        .checkout-slot-card.selected {
          border-color: var(--primary);
          background: var(--primary-light);
        }

        .checkout-slot-radio {
          width: 17px;
          height: 17px;
          accent-color: var(--primary);
          cursor: pointer;
          flex-shrink: 0;
          margin: 0;
        }

        .checkout-slot-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex: 1;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .checkout-slot-name {
          font-size: 0.92rem;
          color: var(--text);
        }

        .checkout-slot-time {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .checkout-payment-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .checkout-payment-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.95rem 1rem;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--surface);
          cursor: pointer;
          transition: var(--transition);
        }

        .checkout-payment-row:hover {
          border-color: var(--primary);
        }

        .checkout-payment-row.active {
          border-color: var(--primary);
          background: var(--primary-light);
        }

        .checkout-payment-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--bg-card-soft);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .checkout-payment-text {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }

        .checkout-payment-text strong {
          font-size: 0.92rem;
          color: var(--text);
        }

        .checkout-payment-text small {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .checkout-payment-detail {
          padding: 1.15rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
        }

        .checkout-payment-detail.upi {
          background: var(--blush-soft);
        }

        .checkout-payment-detail.card {
          background: var(--bg);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .checkout-payment-detail.cod {
          background: var(--primary-light);
          color: var(--primary);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .checkout-items-list {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          max-height: 260px;
          overflow-y: auto;
          margin-bottom: 1.25rem;
          padding-right: 0.25rem;
        }

        .checkout-order-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .checkout-item-img {
          width: 56px;
          height: 56px;
          border-radius: 10px;
          object-fit: cover;
          border: 1px solid var(--border-light);
          flex-shrink: 0;
        }

        .checkout-item-meta {
          flex: 1;
          min-width: 0;
        }

        .checkout-item-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text);
        }

        .checkout-item-qty {
          color: var(--text-muted);
          font-size: 0.8rem;
        }

        .checkout-item-price {
          font-size: 0.95rem;
          color: var(--text);
        }

        .checkout-delivery-summary {
          background: var(--bg-card-soft);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1rem 1.1rem;
          margin-bottom: 1.25rem;
        }

        .checkout-delivery-summary-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .checkout-edit-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: none;
          border: none;
          color: var(--primary);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .checkout-edit-btn:hover {
          text-decoration: underline;
        }

        .checkout-delivery-summary-body {
          font-size: 0.84rem;
          color: var(--text);
          line-height: 1.5;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .checkout-delivery-slot-line {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--primary);
          font-weight: 600;
          margin-top: 0.25rem;
        }

        .checkout-totals-block {
          border-top: 1px solid var(--border-light);
          padding-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          font-size: 0.92rem;
        }

        .checkout-total-row {
          display: flex;
          justify-content: space-between;
          color: var(--text-muted);
        }

        .checkout-total-row.discount {
          color: var(--primary);
          font-weight: 600;
        }

        .checkout-grand-total {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid var(--border);
          padding-top: 0.85rem;
          margin-top: 0.3rem;
          font-size: 1.22rem;
          font-weight: 700;
          color: var(--primary);
        }

        .checkout-bottom-bar {
          margin-top: 2rem;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .checkout-bottom-bar.step2 {
          justify-content: space-between;
        }

        .checkout-primary-cta {
          min-width: 240px;
          justify-content: center;
        }

        .checkout-secondary-cta {
          justify-content: center;
        }

        @media (max-width: 900px) {
          .checkout-two-box-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        @media (max-width: 640px) {
          .checkout-page-container {
            padding: 1.75rem 1rem 4rem;
          }
          .checkout-main-title {
            font-size: 1.85rem;
          }
          .checkout-stepper {
            width: 100%;
            justify-content: space-between;
            padding: 0.5rem 0.9rem;
          }
          .checkout-step-connector {
            width: 18px;
          }
          .checkout-box {
            padding: 1.35rem 1.15rem;
          }
          .checkout-fields-grid-2,
          .checkout-fields-grid-house,
          .checkout-fields-grid-3 {
            grid-template-columns: 1fr;
          }
          .checkout-bottom-bar,
          .checkout-bottom-bar.step2 {
            flex-direction: column;
          }
          .checkout-primary-cta,
          .checkout-secondary-cta {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
