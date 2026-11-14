import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle2, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useOrders } from '../context/OrdersContext';

export const OrdersPage = () => {
  const { orders } = useOrders();

  if (orders.length === 0) {
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
            <Package size={36} />
          </div>
          <h2 className="font-serif" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>No Orders Found</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
            You haven’t placed any flower orders yet. Brighten someone’s day today!
          </p>
          <Link to="/shop" className="btn btn-primary btn-lg">
            <span>Explore Fresh Blooms</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { label: 'Placed', icon: '📝' },
    { label: 'Packed', icon: '🌸' },
    { label: 'Out for Delivery', icon: '🚚' },
    { label: 'Delivered', icon: '🏡' }
  ];

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem 5rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2.5rem' }}>
        <div>
          <span className="section-subtitle">Real-Time Tracking</span>
          <h1 className="font-serif" style={{ fontSize: '2.5rem' }}>My Orders & Deliveries</h1>
        </div>
        <Link to="/shop" className="btn btn-secondary btn-sm">
          <span>Order More Flowers</span>
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '880px', margin: '0 auto' }}>
        {orders.map(order => {
          const currentStep = order.statusStep || 1;
          const progressPercent = currentStep === 1 ? 15 : currentStep === 2 ? 45 : currentStep === 3 ? 75 : 100;

          return (
            <div 
              key={order.orderId}
              className="order-card-box"
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-soft)'
              }}
            >
              {/* Order Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                paddingBottom: '1.25rem',
                borderBottom: '1px solid var(--border-light)',
                marginBottom: '1.75rem'
              }}>
                <div>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                    Order {order.orderId}
                  </span>
                  <span style={{ color: 'var(--muted)', fontSize: '0.85rem', marginLeft: '0.6rem' }}>
                    • Placed on {order.date}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span className="badge badge-primary">{order.deliverySlot}</span>
                  <strong style={{ fontSize: '1.15rem' }}>₹{order.total}</strong>
                </div>
              </div>

              {/* 4-Stage Visual Status Tracker */}
              <div style={{ margin: '2rem 0', position: 'relative' }}>
                
                {/* Background Line */}
                <div style={{
                  position: 'absolute',
                  top: '18px',
                  left: '3rem',
                  right: '3rem',
                  height: '4px',
                  backgroundColor: 'var(--soft-rose)',
                  zIndex: 0
                }} />

                {/* Progress Active Line */}
                <div style={{
                  position: 'absolute',
                  top: '18px',
                  left: '3rem',
                  width: `${progressPercent * 0.8}%`,
                  height: '4px',
                  backgroundColor: 'var(--sage-dark)',
                  zIndex: 1,
                  transition: 'width 0.4s ease'
                }} />

                {/* Step Nodes */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  position: 'relative',
                  zIndex: 2
                }}>
                  {steps.map((s, idx) => {
                    const stepNum = idx + 1;
                    const isDone = currentStep >= stepNum;
                    const isCurrent = currentStep === stepNum;

                    return (
                      <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          backgroundColor: isDone ? 'var(--sage-dark)' : 'var(--surface)',
                          border: `3px solid ${isDone ? 'var(--sage-dark)' : 'var(--border)'}`,
                          color: isDone ? '#FFFFFF' : 'var(--muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          boxShadow: isCurrent ? '0 0 0 5px rgba(168, 195, 160, 0.35)' : 'none',
                          marginBottom: '0.5rem',
                          transition: 'var(--transition)'
                        }}>
                          {s.icon}
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: isDone ? 600 : 400, color: 'var(--text)' }}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ordered Items Preview */}
              <div style={{
                backgroundColor: 'var(--bg)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <strong style={{ fontSize: '0.88rem', color: 'var(--text)' }}>
                  Fresh Items in this Bouquet Shipment:
                </strong>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} 
                        />
                      )}
                      <span>{item.quantity} × {item.name}</span>
                    </div>
                    <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}

                {order.shippingAddress && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted)', borderTop: '1px dashed var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                    📍 <strong>Delivery Address:</strong> {order.shippingAddress.addressLine}, {order.shippingAddress.city} - {order.shippingAddress.pincode}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .order-card-box {
            padding: 1.25rem 0.95rem !important;
          }
        }
      `}</style>

    </div>
  );
};
