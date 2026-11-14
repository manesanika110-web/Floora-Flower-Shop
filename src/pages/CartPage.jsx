import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Tag, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const CartPage = ({ onShowToast }) => {
  const { currentUser } = useAuth();
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    applyCoupon, 
    generateAndApplyCoupon,
    removeCoupon, 
    activeCoupon, 
    couponError, 
    subtotal, 
    discount, 
    deliveryFee, 
    isFreeDelivery, 
    total 
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const navigate = useNavigate();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const trimmed = couponInput.trim();
    if (trimmed) {
      const res = applyCoupon(trimmed);
      if (res.success && onShowToast) {
        onShowToast(res.message);
      }
    } else if (typeof generateAndApplyCoupon === 'function') {
      const res = generateAndApplyCoupon();
      if (res.success) {
        setCouponInput(res.code);
        if (onShowToast) {
          onShowToast(res.message);
        }
      }
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div style={{
          maxWidth: '520px',
          margin: '0 auto',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '3.5rem 2rem',
          boxShadow: 'var(--shadow-soft)',
          border: '1px solid var(--border)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--soft-rose)',
            color: 'var(--primary-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <ShoppingBag size={36} />
          </div>
          <h2 className="font-serif" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Your Cart is Empty</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
            Bring fragrance and warmth to someone special today with our fresh floral arrangements.
          </p>
          <Link to="/shop" className="btn btn-primary btn-lg">
            <span>Explore Fresh Blooms</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  // Free shipping progress
  const progressPercent = Math.min(100, Math.round((subtotal / 999) * 100));

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem 5rem' }}>
      
      <h1 className="font-serif" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
        Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Cart Items List */}
        <div>
          
          {/* Free Shipping Progress Box */}
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
              <span>
                {isFreeDelivery ? (
                  <strong style={{ color: 'var(--sage-dark)' }}>🎉 Congratulations! You unlocked FREE Express Delivery!</strong>
                ) : (
                  <span>Add <strong>₹{999 - subtotal}</strong> more for <strong>FREE Express Delivery</strong></span>
                )}
              </span>
              <span style={{ fontWeight: 600 }}>{progressPercent}%</span>
            </div>
            <div style={{ height: '8px', backgroundColor: 'var(--soft-rose)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progressPercent}%`,
                backgroundColor: 'var(--sage-dark)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          {/* Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {cart.map(item => (
              <div 
                key={item.id} 
                style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr auto',
                  gap: '1.25rem',
                  alignItems: 'center'
                }}
              >
                {/* Real photo thumbnail */}
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--soft-rose)'
                }}>
                  <img 
                    src={item.product.image} 
                    alt={item.product.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>

                {/* Meta details */}
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--sage-dark)', fontWeight: 600, textTransform: 'uppercase' }}>
                    {item.product.category}
                  </span>
                  <Link to={`/product/${item.product.id}`}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', margin: '0.2rem 0' }}>
                      {item.product.name}
                    </h3>
                  </Link>
                  <div style={{ fontSize: '0.9rem', color: 'var(--primary-dark)', fontWeight: 700 }}>
                    ₹{item.product.price}
                  </div>
                  {item.deliveryDate && (
                    <small style={{ display: 'block', color: 'var(--muted)', fontSize: '0.78rem', marginTop: '0.25rem' }}>
                      📅 Delivery: {item.deliveryDate}
                    </small>
                  )}
                  {item.cardMessage && (
                    <small style={{ display: 'block', color: 'var(--muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>
                      💌 "{item.cardMessage}"
                    </small>
                  )}
                </div>

                {/* Actions: Quantity Stepper & Remove */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg)'
                  }}>
                    <button 
                      type="button" 
                      onClick={() => updateQuantity(item.id, -1)}
                      style={{ width: '32px', height: '32px', fontWeight: 700 }}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span style={{ width: '32px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
                      {item.quantity}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => updateQuantity(item.id, 1)}
                      style={{ width: '32px', height: '32px', fontWeight: 700 }}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button 
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      color: '#E03131',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <h2 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
            Order Summary
          </h2>

          {/* Coupon Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Have a Promo Code?
            </label>
            {activeCoupon ? (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--sage-light)',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--sage-dark)',
                fontSize: '0.88rem'
              }}>
                <span>✓ Coupon <strong>{activeCoupon.code}</strong> Applied!</span>
                <button type="button" onClick={removeCoupon} style={{ color: '#E03131', fontWeight: 600, fontSize: '0.8rem' }}>
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="e.g. FLORA10"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="form-input"
                  style={{ textTransform: 'uppercase', fontSize: '0.88rem' }}
                />
                <button type="submit" className="btn btn-secondary btn-sm">
                  Apply
                </button>
              </form>
            )}
            {couponError && (
              <p style={{ color: '#E03131', fontSize: '0.78rem', marginTop: '0.3rem' }}>
                {couponError}
              </p>
            )}
            <small style={{ display: 'block', color: 'var(--muted)', fontSize: '0.78rem', marginTop: '0.3rem' }}>
              💡 Tip: Use coupon <strong>FLORA10</strong> for 10% discount!
            </small>
          </div>

          {/* Summary Lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--sage-dark)', fontWeight: 600 }}>
                <span>Coupon Discount (10%)</span>
                <span>-₹{discount}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Express Delivery</span>
              <span>{deliveryFee === 0 ? <strong style={{ color: 'var(--sage-dark)' }}>FREE</strong> : `₹${deliveryFee}`}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-light)',
              paddingTop: '1rem',
              fontSize: '1.3rem',
              fontWeight: 700,
              color: 'var(--text)'
            }}>
              <span>Total Payable</span>
              <span style={{ color: 'var(--primary-dark)' }}>₹{total}</span>
            </div>
          </div>

          <button 
              type="button" 
              onClick={() => {
                if (!currentUser) {
                  if (onShowToast) onShowToast('Please create an account or sign in to continue to checkout 🌸');
                  navigate('/auth?redirect=/checkout');
                } else {
                  navigate('/checkout');
                }
              }}
              className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={18} />
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--muted)', marginTop: '1rem' }}>
            🔒 Safe & Secure 256-Bit SSL Encrypted Checkout
          </p>
        </div>

      </div>

    </div>
  );
};
