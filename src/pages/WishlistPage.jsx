import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getStoredProducts } from '../services/productsService';

export const WishlistPage = ({ onShowToast }) => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const allProducts = getStoredProducts();
  const wishlistProducts = allProducts.filter(p => wishlist.includes(p.id));

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    toggleWishlist(product.id);
    if (onShowToast) onShowToast(`Moved "${product.name}" to cart! 🌸`);
  };

  if (wishlistProducts.length === 0) {
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
            <Heart size={36} />
          </div>
          <h2 className="font-serif" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Your Wishlist is Empty</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
            Tap the heart icon on any flower card to save your favorite blooms here.
          </p>
          <Link to="/shop" className="btn btn-primary btn-lg">
            <span>Explore Beautiful Flowers</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem 5rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2.5rem' }}>
        <div>
          <span className="section-subtitle">Saved Blossoms</span>
          <h1 className="font-serif" style={{ fontSize: '2.5rem' }}>My Wishlist ({wishlistProducts.length})</h1>
        </div>
        <Link to="/shop" className="btn btn-secondary btn-sm">
          <span>Continue Shopping</span>
        </Link>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2rem'
      }}>
        {wishlistProducts.map(product => (
          <div 
            key={product.id}
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ position: 'relative', height: '240px', backgroundColor: 'var(--soft-rose)' }}>
              <img 
                src={product.image} 
                alt={product.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button 
                type="button"
                onClick={() => {
                  toggleWishlist(product.id);
                  if (onShowToast) onShowToast(`Removed "${product.name}" from wishlist.`);
                }}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#E03131',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
                title="Remove from Wishlist"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--sage-dark)', fontWeight: 600, textTransform: 'uppercase' }}>
                {product.category}
              </span>
              <Link to={`/product/${product.id}`}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0.3rem 0', color: 'var(--text)' }}>
                  {product.name}
                </h3>
              </Link>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '1.25rem' }}>
                ₹{product.price}
              </div>

              <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => handleMoveToCart(product)}
                  className="btn btn-primary btn-sm"
                >
                  <ShoppingBag size={16} />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
