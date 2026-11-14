import React, { useMemo } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { PackageCheck, ShoppingBag, Calendar, Clock, MapPin, CreditCard, Sparkles } from 'lucide-react';
import { useOrders } from '../context/OrdersContext';

const LEFT_BURST_FLOWERS = [
  { id: 'l1', type: 'blossom', color: '#E88EAA', center: '#FDF4E5', size: 34, tx: '24vw', ty: '-44vh', rot: '220deg', delay: '0.04s', dur: '3.1s', startBottom: '28%' },
  { id: 'l2', type: 'rose', color: '#D96B8C', center: '#F7E1E8', size: 38, tx: '32vw', ty: '-52vh', rot: '-190deg', delay: '0.12s', dur: '3.4s', startBottom: '32%' },
  { id: 'l3', type: 'daisy', color: '#F4B942', center: '#1C3728', size: 30, tx: '18vw', ty: '-36vh', rot: '260deg', delay: '0.08s', dur: '2.8s', startBottom: '35%' },
  { id: 'l4', type: 'blossom', color: '#F7E1E8', center: '#C89B59', size: 34, tx: '36vw', ty: '-46vh', rot: '310deg', delay: '0.18s', dur: '3.5s', startBottom: '24%' },
  { id: 'l5', type: 'petal', color: '#E88EAA', size: 24, tx: '28vw', ty: '-30vh', rot: '400deg', delay: '0.05s', dur: '2.7s', startBottom: '30%' },
  { id: 'l6', type: 'rose', color: '#C89B59', center: '#FFF8F0', size: 32, tx: '24vw', ty: '-58vh', rot: '-240deg', delay: '0.22s', dur: '3.3s', startBottom: '33%' },
  { id: 'l7', type: 'petal', color: '#F4B942', size: 22, tx: '38vw', ty: '-38vh', rot: '340deg', delay: '0.15s', dur: '3.1s', startBottom: '22%' },
  { id: 'l8', type: 'daisy', color: '#E88EAA', center: '#FFF8F0', size: 28, tx: '14vw', ty: '-46vh', rot: '-280deg', delay: '0.26s', dur: '3.2s', startBottom: '38%' },
  { id: 'l9', type: 'blossom', color: '#2E523A', center: '#F7E1E8', size: 26, tx: '32vw', ty: '-24vh', rot: '195deg', delay: '0.1s', dur: '2.9s', startBottom: '20%' },
  { id: 'l10', type: 'petal', color: '#D96B8C', size: 24, tx: '42vw', ty: '-52vh', rot: '-320deg', delay: '0.28s', dur: '3.6s', startBottom: '28%' }
];

const RIGHT_BURST_FLOWERS = [
  { id: 'r1', type: 'blossom', color: '#E88EAA', center: '#FDF4E5', size: 34, tx: '-24vw', ty: '-44vh', rot: '-220deg', delay: '0.04s', dur: '3.1s', startBottom: '28%' },
  { id: 'r2', type: 'rose', color: '#D96B8C', center: '#F7E1E8', size: 38, tx: '-32vw', ty: '-52vh', rot: '190deg', delay: '0.12s', dur: '3.4s', startBottom: '32%' },
  { id: 'r3', type: 'daisy', color: '#F4B942', center: '#1C3728', size: 30, tx: '-18vw', ty: '-36vh', rot: '-260deg', delay: '0.08s', dur: '2.8s', startBottom: '35%' },
  { id: 'r4', type: 'blossom', color: '#F7E1E8', center: '#C89B59', size: 34, tx: '-36vw', ty: '-46vh', rot: '-310deg', delay: '0.18s', dur: '3.5s', startBottom: '24%' },
  { id: 'r5', type: 'petal', color: '#E88EAA', size: 24, tx: '-28vw', ty: '-30vh', rot: '-400deg', delay: '0.05s', dur: '2.7s', startBottom: '30%' },
  { id: 'r6', type: 'rose', color: '#C89B59', center: '#FFF8F0', size: 32, tx: '-24vw', ty: '-58vh', rot: '240deg', delay: '0.22s', dur: '3.3s', startBottom: '33%' },
  { id: 'r7', type: 'petal', color: '#F4B942', size: 22, tx: '-38vw', ty: '-38vh', rot: '-340deg', delay: '0.15s', dur: '3.1s', startBottom: '22%' },
  { id: 'r8', type: 'daisy', color: '#E88EAA', center: '#FFF8F0', size: 28, tx: '-14vw', ty: '-46vh', rot: '280deg', delay: '0.26s', dur: '3.2s', startBottom: '38%' },
  { id: 'r9', type: 'blossom', color: '#2E523A', center: '#F7E1E8', size: 26, tx: '-32vw', ty: '-24vh', rot: '-195deg', delay: '0.1s', dur: '2.9s', startBottom: '20%' },
  { id: 'r10', type: 'petal', color: '#D96B8C', size: 24, tx: '-42vw', ty: '-52vh', rot: '320deg', delay: '0.28s', dur: '3.6s', startBottom: '28%' }
];

const BOUNCING_PETALS = [
  { id: 'bp1', type: 'petal', color: '#E88EAA', left: '7%', delay: '0.1s', dur: '6.5s', size: 20, drift: '28px' },
  { id: 'bp2', type: 'blossom', color: '#F7E1E8', center: '#C89B59', left: '16%', delay: '0.9s', dur: '7.2s', size: 22, drift: '-24px' },
  { id: 'bp3', type: 'petal', color: '#D96B8C', left: '26%', delay: '0.4s', dur: '6.2s', size: 18, drift: '30px' },
  { id: 'bp4', type: 'petal', color: '#C89B59', left: '38%', delay: '1.6s', dur: '7.0s', size: 18, drift: '-26px' },
  { id: 'bp5', type: 'daisy', color: '#F4B942', center: '#1C3728', left: '48%', delay: '0.8s', dur: '7.5s', size: 22, drift: '22px' },
  { id: 'bp6', type: 'petal', color: '#E88EAA', left: '60%', delay: '0.2s', dur: '6.4s', size: 20, drift: '-30px' },
  { id: 'bp7', type: 'blossom', color: '#E88EAA', center: '#FDF4E5', left: '72%', delay: '1.2s', dur: '7.1s', size: 24, drift: '26px' },
  { id: 'bp8', type: 'petal', color: '#F7E1E8', left: '82%', delay: '0.6s', dur: '6.8s', size: 19, drift: '-24px' },
  { id: 'bp9', type: 'petal', color: '#D96B8C', left: '92%', delay: '1.4s', dur: '6.6s', size: 20, drift: '20px' }
];

const FlowerGraphic = ({ type, color, center = '#FDF4E5', size = 28 }) => {
  if (type === 'petal') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M16 3C22 8 26 15 24 22C22 27 18 29 16 29C14 29 10 27 8 22C6 15 10 8 16 3Z"
          fill={color}
          opacity="0.92"
        />
        <path d="M16 8C16 14 16 21 16 26" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'rose') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="16" fill={color} opacity="0.28" />
        <circle cx="14" cy="17" r="9" fill={color} />
        <circle cx="26" cy="17" r="9" fill={color} />
        <circle cx="20" cy="25" r="9" fill={color} />
        <circle cx="20" cy="19" r="7.5" fill={center} opacity="0.9" />
        <path d="M16 18C18 15 23 15 24 19C24 22 20 24 18 22" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'daisy') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <ellipse cx="20" cy="8" rx="4.2" ry="7.5" fill={color} />
        <ellipse cx="20" cy="32" rx="4.2" ry="7.5" fill={color} />
        <ellipse cx="8" cy="20" rx="7.5" ry="4.2" fill={color} />
        <ellipse cx="32" cy="20" rx="7.5" ry="4.2" fill={color} />
        <ellipse cx="11.5" cy="11.5" rx="4" ry="7" transform="rotate(-45 11.5 11.5)" fill={color} opacity="0.88" />
        <ellipse cx="28.5" cy="28.5" rx="4" ry="7" transform="rotate(-45 28.5 28.5)" fill={color} opacity="0.88" />
        <ellipse cx="28.5" cy="11.5" rx="4" ry="7" transform="rotate(45 28.5 11.5)" fill={color} opacity="0.88" />
        <ellipse cx="11.5" cy="28.5" rx="4" ry="7" transform="rotate(45 11.5 28.5)" fill={color} opacity="0.88" />
        <circle cx="20" cy="20" r="5.5" fill={center} />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="10" r="7" fill={color} />
      <circle cx="29" cy="17" r="7" fill={color} />
      <circle cx="26" cy="28" r="7" fill={color} />
      <circle cx="14" cy="28" r="7" fill={color} />
      <circle cx="11" cy="17" r="7" fill={color} />
      <circle cx="20" cy="20" r="5.5" fill={center} />
    </svg>
  );
};

export const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const { orders } = useOrders();

  const order = useMemo(() => {
    if (location.state?.order) return location.state.order;
    if (orderId && Array.isArray(orders)) {
      return orders.find(o => o.orderId === orderId) || null;
    }
    return null;
  }, [location.state, orders, orderId]);

  const displayOrderId = order?.orderId || orderId || 'FL-94812';
  const items = order?.items || [];
  const address = order?.shippingAddress;

  return (
    <div className="order-success-backdrop" role="dialog" aria-modal="true" aria-labelledby="order-success-title">
      {/* Both Sides Flower Explosion Celebration Layer */}
      <div className="order-explosion-layer" aria-hidden="true">
        {LEFT_BURST_FLOWERS.map(item => (
          <span
            key={item.id}
            className="burst-flower burst-left"
            style={{
              bottom: item.startBottom,
              '--tx': item.tx,
              '--ty': item.ty,
              '--rot': item.rot,
              animationDelay: item.delay,
              animationDuration: item.dur
            }}
          >
            <FlowerGraphic type={item.type} color={item.color} center={item.center} size={item.size} />
          </span>
        ))}

        {RIGHT_BURST_FLOWERS.map(item => (
          <span
            key={item.id}
            className="burst-flower burst-right"
            style={{
              bottom: item.startBottom,
              '--tx': item.tx,
              '--ty': item.ty,
              '--rot': item.rot,
              animationDelay: item.delay,
              animationDuration: item.dur
            }}
          >
            <FlowerGraphic type={item.type} color={item.color} center={item.center} size={item.size} />
          </span>
        ))}

        {BOUNCING_PETALS.map(item => (
          <span
            key={item.id}
            className="bouncing-falling-petal"
            style={{
              left: item.left,
              '--drift': item.drift,
              animationDelay: item.delay,
              animationDuration: item.dur
            }}
          >
            <FlowerGraphic type={item.type} color={item.color} center={item.center} size={item.size} />
          </span>
        ))}
      </div>

      {/* Horizontal Desktop / Vertical Mobile Order Success Card */}
      <div className="order-success-card">
        {/* Left Column: Bouquet Celebration, Confirmation Message, Order ID, Actions */}
        <div className="order-success-left">
          <div className="celebration-hero" aria-hidden="true">
            <div className="celebration-halo" />

            <span className="bouncing-svg-bloom bloom-left">
              <FlowerGraphic type="blossom" color="#E88EAA" center="#FDF4E5" size={26} />
            </span>
            <span className="bouncing-svg-bloom bloom-right">
              <FlowerGraphic type="daisy" color="#F4B942" center="#1C3728" size={24} />
            </span>
            <span className="bouncing-svg-bloom bloom-top-left">
              <FlowerGraphic type="petal" color="#C89B59" size={18} />
            </span>
            <span className="bouncing-svg-bloom bloom-top-right">
              <FlowerGraphic type="rose" color="#D96B8C" center="#F7E1E8" size={24} />
            </span>

            <div className="bouquet-celebration-wrap">
              <img
                src="/img/order_success_bouquet.jpg"
                alt="Fresh Floora Flower Bouquet"
                className="bouquet-photo"
              />

              <div className="success-check-badge">
                <svg viewBox="0 0 52 52" className="success-check-svg">
                  <circle className="check-circle" cx="26" cy="26" r="23" fill="none" />
                  <path className="check-tick" fill="none" d="M15 27 L23 35 L38 18" />
                </svg>
              </div>
            </div>
          </div>

          <div className="order-success-badge-pill">
            <Sparkles size={14} />
            <span>Order Confirmed</span>
          </div>

          <h1 id="order-success-title" className="font-serif order-success-heading">
            Your Order Has Been Placed Successfully!
          </h1>

          <p className="order-success-subtitle">
            Thank you for choosing Floora. We will deliver happiness with flowers! ❤️
          </p>

          <div className="order-id-banner">
            <span className="order-id-label">Order ID</span>
            <strong className="order-id-value">{displayOrderId}</strong>
          </div>

          <div className="order-success-actions">
            <Link to="/shop" className="btn btn-primary btn-lg order-success-primary-btn">
              <ShoppingBag size={18} />
              <span>Continue Shopping</span>
            </Link>
            <Link to="/orders" className="btn btn-secondary btn-lg order-success-secondary-btn">
              <PackageCheck size={18} />
              <span>Track Order</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="order-success-right">
          <div className="order-summary-card">
            <div className="order-summary-title">Order Summary</div>

            {items.length > 0 && (
              <div className="order-summary-items">
                {items.map((item, idx) => (
                  <div key={`${item.id || idx}-${idx}`} className="order-summary-item">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="order-summary-thumb"
                      />
                    )}
                    <div className="order-summary-item-info">
                      <div className="order-summary-item-name">{item.name}</div>
                      <small className="order-summary-item-qty">Qty: {item.quantity}</small>
                    </div>
                    <strong className="order-summary-item-price">
                      ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN')}
                    </strong>
                  </div>
                ))}
              </div>
            )}

            {order && (
              <div className="order-summary-meta">
                {order.deliveryDate && (
                  <div className="meta-row">
                    <Calendar size={14} />
                    <span>Delivery Date: <strong>{order.deliveryDate}</strong></span>
                  </div>
                )}
                {order.deliverySlot && (
                  <div className="meta-row">
                    <Clock size={14} />
                    <span>Time Slot: <strong>{order.deliverySlot}</strong></span>
                  </div>
                )}
                {address?.fullName && (
                  <div className="meta-row">
                    <MapPin size={14} />
                    <span>
                      Deliver to: <strong>{address.fullName}</strong>
                      {address.city ? `, ${address.city}` : ''}
                      {address.pincode ? ` - ${address.pincode}` : ''}
                    </span>
                  </div>
                )}
                {order.paymentMethod && (
                  <div className="meta-row">
                    <CreditCard size={14} />
                    <span>Payment: <strong>{order.paymentMethod}</strong></span>
                  </div>
                )}
              </div>
            )}

            {order && (
              <div className="order-summary-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{Number(order.subtotal || 0).toLocaleString('en-IN')}</span>
                </div>
                {Number(order.discount || 0) > 0 && (
                  <div className="total-row discount">
                    <span>Discount</span>
                    <span>-₹{Number(order.discount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="total-row">
                  <span>Delivery Charges</span>
                  <span style={{ color: order.deliveryFee === 0 ? 'var(--primary)' : undefined }}>
                    {order.deliveryFee === 0 ? 'FREE' : `₹${Number(order.deliveryFee || 0).toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="total-row grand-total">
                  <span>Grand Total</span>
                  <span>₹{Number(order.total || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            {!order && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                Your floral order has been confirmed and saved to your Floora account.
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .order-success-backdrop {
          position: relative;
          min-height: calc(100vh - 140px);
          padding: 2.5rem 1.5rem 3.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background:
            radial-gradient(circle at 14% 25%, rgba(232, 142, 170, 0.16), transparent 42%),
            radial-gradient(circle at 86% 25%, rgba(200, 155, 89, 0.14), transparent 42%),
            radial-gradient(circle at 50% 88%, rgba(28, 55, 40, 0.09), transparent 52%),
            var(--bg);
        }

        /* Flower Explosion Celebration Layer */
        .order-explosion-layer {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 2;
        }

        .burst-flower {
          position: absolute;
          will-change: transform, opacity;
          animation-name: flowerBurstArc;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
          animation-fill-mode: both;
          opacity: 0;
        }

        .burst-left {
          left: -20px;
        }

        .burst-right {
          right: -20px;
        }

        @keyframes flowerBurstArc {
          0% {
            opacity: 0;
            transform: translate3d(0, 0, 0) scale(0.3) rotate(0deg);
          }
          15% {
            opacity: 1;
            transform: translate3d(calc(var(--tx) * 0.45), calc(var(--ty) * 0.7), 0) scale(1.22) rotate(calc(var(--rot) * 0.45));
          }
          40% {
            opacity: 1;
            transform: translate3d(calc(var(--tx) * 0.88), var(--ty), 0) scale(1.02) rotate(calc(var(--rot) * 0.75));
          }
          62% {
            opacity: 0.95;
            transform: translate3d(calc(var(--tx) * 0.98), calc(var(--ty) * 0.68), 0) scale(0.96) rotate(calc(var(--rot) * 0.92));
          }
          80% {
            opacity: 0.88;
            transform: translate3d(var(--tx), calc(var(--ty) * 0.4), 0) scale(1.04) rotate(var(--rot));
          }
          100% {
            opacity: 0;
            transform: translate3d(calc(var(--tx) * 1.1), 16vh, 0) scale(0.82) rotate(calc(var(--rot) * 1.3));
          }
        }

        .bouncing-falling-petal {
          position: absolute;
          top: -45px;
          will-change: transform, opacity;
          animation-name: bouncingPetalFall;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          opacity: 0;
        }

        @keyframes bouncingPetalFall {
          0% {
            opacity: 0;
            transform: translate3d(0, -5vh, 0) rotate(0deg) scale(0.85);
          }
          15% {
            opacity: 0.92;
          }
          48% {
            transform: translate3d(var(--drift, 24px), 44vh, 0) rotate(160deg) scale(1.05);
          }
          76% {
            opacity: 0.88;
            transform: translate3d(calc(var(--drift, 24px) * -0.6), 80vh, 0) rotate(280deg) scale(0.96);
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--drift, 24px), 108vh, 0) rotate(360deg) scale(0.85);
          }
        }

        /* Large Horizontal Card on Desktop */
        .order-success-card {
          position: relative;
          z-index: 5;
          width: 100%;
          max-width: 1020px;
          background-color: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2.5rem 2.75rem;
          box-shadow: 0 24px 60px rgba(28, 55, 40, 0.13);
          display: grid;
          grid-template-columns: 1fr 1.02fr;
          gap: 2.5rem;
          align-items: center;
          animation: cardPopIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes cardPopIn {
          0% {
            opacity: 0;
            transform: translate3d(0, 22px, 0) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        .order-success-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding-right: 0.5rem;
        }

        .order-success-right {
          display: flex;
          flex-direction: column;
        }

        .celebration-hero {
          position: relative;
          width: 185px;
          height: 132px;
          margin: 0 auto 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .celebration-halo {
          position: absolute;
          width: 132px;
          height: 132px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(247, 225, 232, 0.92) 0%, rgba(235, 242, 236, 0.52) 65%, transparent 72%);
          animation: haloPulse 2.8s ease-in-out infinite;
        }

        @keyframes haloPulse {
          0%, 100% {
            transform: scale(0.95);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }

        .bouquet-celebration-wrap {
          position: relative;
          width: 112px;
          height: 112px;
          animation: bouquetCelebrate 2.6s ease-in-out infinite;
          transform-origin: bottom center;
        }

        @keyframes bouquetCelebrate {
          0%, 100% {
            transform: translateY(0) rotate(-2deg) scale(1);
          }
          50% {
            transform: translateY(-7px) rotate(2deg) scale(1.04);
          }
        }

        .bouquet-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          border: 3px solid var(--surface);
          box-shadow: 0 10px 24px rgba(28, 55, 40, 0.16);
          background-color: var(--bg-card-soft);
        }

        .bouncing-svg-bloom {
          position: absolute;
          display: inline-flex;
          animation: flowerBounce 2.2s ease-in-out infinite;
          z-index: 2;
        }

        .bloom-left {
          left: 0;
          bottom: 18px;
          animation-delay: 0.1s;
        }

        .bloom-right {
          right: 0;
          bottom: 20px;
          animation-delay: 0.55s;
        }

        .bloom-top-left {
          left: 14px;
          top: 6px;
          animation-delay: 0.35s;
        }

        .bloom-top-right {
          right: 10px;
          top: 6px;
          animation-delay: 0.8s;
        }

        @keyframes flowerBounce {
          0%, 100% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          50% {
            transform: translateY(-9px) rotate(10deg) scale(1.14);
          }
        }

        .success-check-badge {
          position: absolute;
          right: -6px;
          bottom: -2px;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background-color: var(--primary);
          border: 3px solid var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 16px rgba(28, 55, 40, 0.25);
          animation: checkBadgePop 0.55s 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          z-index: 3;
        }

        @keyframes checkBadgePop {
          0% {
            opacity: 0;
            transform: scale(0.4);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .success-check-svg {
          width: 26px;
          height: 26px;
        }

        .check-circle {
          stroke: rgba(255, 255, 255, 0.35);
          stroke-width: 3;
          stroke-dasharray: 150;
          stroke-dashoffset: 150;
          animation: drawStroke 0.65s 0.35s ease-out forwards;
        }

        .check-tick {
          stroke: #ffffff;
          stroke-width: 4.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: drawStroke 0.45s 0.6s ease-out forwards;
        }

        @keyframes drawStroke {
          to {
            stroke-dashoffset: 0;
          }
        }

        .order-success-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.9rem;
          border-radius: var(--radius-full);
          background-color: var(--primary-light);
          color: var(--primary);
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0.85rem;
        }

        .order-success-heading {
          font-size: 2rem;
          line-height: 1.22;
          color: var(--text);
          margin-bottom: 0.65rem;
        }

        .order-success-subtitle {
          color: var(--text-muted);
          font-size: 0.98rem;
          line-height: 1.6;
          margin: 0 auto 1.3rem;
          max-width: 420px;
        }

        .order-id-banner {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          background-color: var(--blush-soft);
          border: 1px solid rgba(232, 142, 170, 0.35);
          padding: 0.55rem 1.2rem;
          border-radius: var(--radius-full);
          margin-bottom: 1.5rem;
        }

        .order-id-label {
          font-size: 0.84rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .order-id-value {
          font-size: 1rem;
          color: var(--primary);
          letter-spacing: 0.02em;
        }

        .order-success-actions {
          display: flex;
          align-items: stretch;
          justify-content: center;
          gap: 0.75rem;
          flex-wrap: nowrap;
          width: 100%;
        }

        .order-success-primary-btn,
        .order-success-secondary-btn {
          flex: 1 1 0;
          min-width: 0;
          height: 48px;
          padding: 0 1.1rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          white-space: nowrap;
          box-sizing: border-box;
        }

        .order-summary-card {
          background-color: var(--bg-card-soft);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1.4rem 1.5rem;
          text-align: left;
          width: 100%;
        }

        .order-summary-title {
          font-weight: 700;
          font-size: 0.98rem;
          color: var(--primary);
          margin-bottom: 0.95rem;
          padding-bottom: 0.6rem;
          border-bottom: 1px solid var(--border);
        }

        .order-summary-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 220px;
          overflow-y: auto;
          margin-bottom: 0.95rem;
        }

        .order-summary-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .order-summary-thumb {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid var(--border);
          flex-shrink: 0;
        }

        .order-summary-item-info {
          flex: 1;
          min-width: 0;
        }

        .order-summary-item-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .order-summary-item-qty {
          color: var(--text-muted);
          font-size: 0.79rem;
        }

        .order-summary-item-price {
          font-size: 0.94rem;
          color: var(--text);
        }

        .order-summary-meta {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          padding: 0.85rem 0;
          border-top: 1px dashed var(--border);
          border-bottom: 1px dashed var(--border);
          margin-bottom: 0.85rem;
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .meta-row strong {
          color: var(--text);
        }

        .order-summary-totals {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-size: 0.88rem;
          color: var(--text-muted);
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .total-row.discount {
          color: var(--primary);
        }

        .total-row.grand-total {
          margin-top: 0.35rem;
          padding-top: 0.55rem;
          border-top: 1px solid var(--border);
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--primary);
        }

        /* Tablet & Mobile: Automatically collapse into vertical single-column layout */
        @media (max-width: 860px) {
          .order-success-backdrop {
            padding: 1.5rem 1rem 3rem;
          }

          .order-success-card {
            grid-template-columns: 1fr;
            gap: 1.75rem;
            max-width: 560px;
            padding: 2rem 1.35rem;
          }

          .order-success-left {
            padding-right: 0;
          }

          .order-success-heading {
            font-size: 1.6rem;
          }
        }

        @media (max-width: 480px) {
          .order-success-card {
            padding: 1.65rem 1.1rem;
          }

          .order-success-heading {
            font-size: 1.45rem;
          }

          .order-success-subtitle {
            font-size: 0.9rem;
          }

          .order-success-actions {
            flex-direction: column;
            gap: 0.7rem;
          }

          .order-success-primary-btn,
          .order-success-secondary-btn {
            width: 100%;
            flex: none;
          }
        }
      `}</style>
    </div>
  );
};
