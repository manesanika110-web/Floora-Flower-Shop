import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const ProductCard = ({ product, onShowToast }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isBouncing, setIsBouncing] = useState(false);

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 650);
    addToCart(product, 1);
    if (onShowToast) onShowToast(`Added "${product.name}" to cart! 🌸`);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    if (onShowToast) {
      onShowToast(isFavorited ? `Removed from wishlist.` : `Saved "${product.name}" to wishlist! 💖`);
    }
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card-img-wrap" aria-label={product.name}>
        <img 
          src={product.image} 
          alt={product.name} 
          className="product-card-img"
          loading="lazy"
        />

        {product.discountBadge && (
          <span className="badge-discount product-badge-float">
            {product.discountBadge}
          </span>
        )}

        <button 
          type="button" 
          className={`product-wishlist-btn ${isFavorited ? 'active' : ''}`}
          onClick={handleToggleWishlist}
          title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
          aria-label="Wishlist"
        >
          <Heart size={18} fill={isFavorited ? '#E03131' : 'none'} color={isFavorited ? '#E03131' : 'currentColor'} />
        </button>
      </Link>

      <div className="product-card-body">
        <Link to={`/product/${product.id}`}>
          <h3 className="product-card-title">{product.name}</h3>
        </Link>

        <div className="product-rating-row">
          <div className="stars-gold">
            <Star size={13} fill="#F4B942" color="#F4B942" />
            <span style={{ fontWeight: 600, marginLeft: '3px', color: 'var(--text)', fontSize: '0.85rem' }}>
              {product.rating}
            </span>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            ({product.reviewsCount})
          </span>
        </div>

        <div className="product-price-row">
          <div className="price-box">
            <span className="price-current">₹{product.price}</span>
            {product.oldPrice && (
              <span className="price-old">₹{product.oldPrice}</span>
            )}
          </div>

          <button 
            type="button" 
            className={`product-cart-btn-icon ${isBouncing ? 'cart-bounce-anim' : ''}`}
            onClick={handleAddToCart}
            title={`Add ${product.name} to Cart`}
            aria-label={`Add ${product.name} to Cart`}
          >
            <ShoppingBag size={17} />
          </button>
        </div>
      </div>
    </div>
  );
};
