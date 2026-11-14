import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Star, 
  Truck, 
  Clock, 
  Search
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getStoredProducts, subscribeProducts } from '../services/productsService';

// Custom Vase Icon matching reference design
const VaseIcon = ({ size = 22, color = '#222F26' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2h8" />
    <path d="M9 2v2.5c0 1.5-2 2.5-2 5.5 0 4 2.5 7 5 7s5-3 5-7c0-3-2-4-2-5.5V2" />
    <path d="M7 17l1 5h8l1-5" />
  </svg>
);

export const ProductDetailPage = ({ onShowToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [allProducts, setAllProducts] = useState(() => getStoredProducts());

  useEffect(() => {
    const unsub = subscribeProducts((updated) => {
      if (updated && Array.isArray(updated)) {
        setAllProducts(updated);
      }
    });
    return unsub;
  }, []);

  const product = allProducts.find(p => p.id === id) || allProducts[0] || {};
  const [selectedImage, setSelectedImage] = useState(product?.image || '/flowers/pink_rose_bouquet.jpg');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Regular');
  const [cardMessage, setCardMessage] = useState('');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Sync selectedImage whenever product changes
  useEffect(() => {
    if (product?.image) {
      setSelectedImage(product.image);
    }
    setQuantity(1);
    setSelectedSize('Regular');
  }, [product?.id, product?.image]);

  const isFavorited = isInWishlist(product?.id);

  // 5 Gallery thumbnails matching exact reference design
  const galleryImages = useMemo(() => {
    const fallbackPool = [
      product?.image,
      '/flowers/pink_lily_bouquet.jpg',
      '/flowers/jasmine_mogra.jpg',
      '/flowers/cheerful_gerbera_bunch.jpg',
      '/flowers/white_orchid_pink_pot.jpg'
    ].filter(Boolean);
    const categoryMatches = allProducts
      .filter(p => p.category === product?.category && p.image !== product?.image)
      .map(p => p.image);
    const combined = [product?.image, ...categoryMatches, ...fallbackPool].filter(Boolean);
    return Array.from(new Set(combined)).slice(0, 5);
  }, [product, allProducts]);

  // Check delivery pincode
  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setPincodeStatus({ success: true, message: `Available for express delivery in ${pincode}! 🚚 Delivery in 3-4 hrs.` });
    } else {
      setPincodeStatus({ success: false, message: 'Please enter a valid 6-digit pincode.' });
    }
  };

  const [isCartBouncing, setIsCartBouncing] = useState(false);

  const handleAddToCart = () => {
    setIsCartBouncing(true);
    setTimeout(() => setIsCartBouncing(false), 650);
    addToCart(product, quantity, { cardMessage, selectedSize });
    if (onShowToast) onShowToast(`Added ${quantity} × "${product.name}" to cart! 🌸`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, { cardMessage, selectedSize });
    navigate('/checkout');
  };

  // Discount percentage display (e.g. 30% OFF)
  const discountDisplay = useMemo(() => {
    if (product.discountBadge) {
      const cleaned = product.discountBadge.replace('-', '').trim();
      return cleaned.includes('%') ? `${cleaned} OFF` : `${cleaned}% OFF`;
    }
    if (product.oldPrice && product.oldPrice > product.price) {
      const pct = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
      return `${pct}% OFF`;
    }
    return '30% OFF';
  }, [product]);

  const oldPriceDisplay = product.oldPrice || Math.round(product.price * 1.4);

  return (
    <div className="pdp-page-wrapper" style={{
      position: 'relative',
      backgroundColor: 'transparent',
      minHeight: '100vh',
      overflow: 'hidden',
      padding: '2rem 1.25rem 4rem'
    }}>

      {/* Main PDP Container */}
      <div style={{
        maxWidth: '1024px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}>

        <div className="pdp-grid-container" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(min(100%, 300px), 470px) minmax(min(100%, 300px), 1fr)',
          gap: '2.75rem',
          alignItems: 'start'
        }}>

          {/* LEFT COLUMN: 5 Thumbnails + Main Image */}
          <div className="pdp-gallery-wrap" style={{
            display: 'flex',
            gap: '0.85rem',
            alignItems: 'flex-start'
          }}>

            {/* 5 Vertical Thumbnails */}
            <div className="pdp-thumbnails-strip" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              flexShrink: 0
            }}>
              {galleryImages.map((imgUrl, idx) => {
                const isActive = selectedImage === imgUrl;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    aria-label={`View image ${idx + 1}`}
                    style={{
                      width: '54px',
                      height: '60px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: isActive ? '1.5px solid #1C3D2B' : '1px solid #D5CEC4',
                      backgroundColor: '#FFFFFF',
                      padding: '2px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxShadow: isActive ? '0 2px 6px rgba(28, 61, 43, 0.15)' : 'none'
                    }}
                  >
                    <img 
                      src={imgUrl} 
                      alt="" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        borderRadius: '6px' 
                      }} 
                    />
                  </button>
                );
              })}
            </div>

            {/* Main Product Image */}
            <div className="pdp-main-image-box" style={{
              flex: 1,
              height: '430px',
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: '#FFFFFF',
              border: '1px solid #EAE3D8',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
            }}>
              <img
                src={selectedImage}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>

          </div>

          {/* RIGHT COLUMN: Product Details */}
          <div className="pdp-info-column" style={{ maxWidth: '470px' }}>

            {/* Product Title */}
            <h1 className="font-serif pdp-title" style={{
              fontSize: '2rem',
              fontWeight: 500,
              color: '#222F26',
              lineHeight: 1.25,
              margin: '0 0 0.4rem'
            }}>
              {product.name}
            </h1>

            {/* Rating & Reviews Count */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              margin: '0 0 1.15rem'
            }}>
              <div style={{ display: 'flex', color: '#E5A83B', gap: '2px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} fill="#E5A83B" color="#E5A83B" />
                ))}
              </div>
              <Search size={13} color="#766E65" style={{ marginLeft: '0.2rem' }} />
              <span style={{ color: '#766E65', fontSize: '0.86rem' }}>
                {product.reviewsCount || 126} Reviews
              </span>
            </div>

            {/* Price Row with Strikethrough & Green Pill Discount Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.75rem',
              margin: '0 0 1.15rem'
            }}>
              <span style={{ fontSize: '1.95rem', fontWeight: 700, color: '#222F26' }}>
                ₹{product.price}
              </span>
              <span style={{ fontSize: '1.15rem', color: '#857C72', textDecoration: 'line-through' }}>
                ₹{oldPriceDisplay}
              </span>
              <span style={{
                backgroundColor: '#D9EAD3',
                color: '#3B6B48',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.4px'
              }}>
                {discountDisplay}
              </span>
            </div>

            {/* Description Text */}
            <p style={{
              color: '#5A524A',
              fontSize: '0.92rem',
              lineHeight: 1.55,
              margin: '0 0 1.4rem'
            }}>
              {product.description}
            </p>

            {/* 3 Horizontal Feature Benefit Cards */}
            <div className="pdp-features-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              margin: '0 0 1.4rem'
            }}>
              <div className="pdp-feature-card" style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5DFD5',
                borderRadius: '8px',
                padding: '1.1rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                textAlign: 'center'
              }}>
                <Truck size={22} color="#222F26" />
                <span style={{ fontSize: '0.84rem', fontWeight: 500, color: '#222F26' }}>Fresh Flowers</span>
              </div>

              <div className="pdp-feature-card" style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5DFD5',
                borderRadius: '8px',
                padding: '1.1rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                textAlign: 'center'
              }}>
                <Clock size={22} color="#222F26" />
                <span style={{ fontSize: '0.84rem', fontWeight: 500, color: '#222F26' }}>Delivery in 3-4 hrs</span>
              </div>

              <div className="pdp-feature-card" style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5DFD5',
                borderRadius: '8px',
                padding: '1.1rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                textAlign: 'center'
              }}>
                <VaseIcon size={22} color="#222F26" />
                <span style={{ fontSize: '0.84rem', fontWeight: 500, color: '#222F26' }}>Vase Included</span>
              </div>
            </div>

            {/* Divider Line */}
            <div style={{ borderBottom: '1px solid #EAE3D8', margin: '1.4rem 0' }} />

            {/* Select Size Section */}
            <div style={{ margin: '0 0 1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#222F26',
                marginBottom: '0.75rem'
              }}>
                Select Size:
              </label>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                {['Regular', 'Premium', 'Luxury'].map(size => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      style={{
                        flex: 1,
                        padding: '0.65rem 0',
                        borderRadius: '8px',
                        border: isSelected ? 'none' : '1px solid #D5CEC4',
                        backgroundColor: isSelected ? '#1C3D2B' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#222F26',
                        fontSize: '0.92rem',
                        fontWeight: 600,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Single Row: Quantity + Add to Cart + Buy Now + Wishlist */}
            <div className="pdp-action-row" style={{
              display: 'flex',
              gap: '0.65rem',
              alignItems: 'center',
              margin: '0 0 1.65rem'
            }}>

              {/* Quantity Stepper */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid #D5CEC4',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                height: '42px',
                padding: '0 0.2rem'
              }}>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                  style={{
                    width: '30px',
                    height: '100%',
                    border: 'none',
                    background: 'none',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    color: '#222F26'
                  }}
                >
                  -
                </button>
                <span style={{
                  width: '26px',
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  color: '#222F26'
                }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                  style={{
                    width: '30px',
                    height: '100%',
                    border: 'none',
                    background: 'none',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    color: '#222F26'
                  }}
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button (White Outline) */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`pdp-cta-btn ${isCartBouncing ? 'cart-bounce-anim' : ''}`}
                style={{
                  flex: 1,
                  height: '42px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #1C3D2B',
                  color: '#1C3D2B',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                Add to Cart
              </button>

              {/* Buy Now Button (Solid Green) */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="pdp-cta-btn"
                style={{
                  flex: 1,
                  height: '42px',
                  backgroundColor: '#1C3D2B',
                  border: 'none',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                Buy Now
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => {
                  toggleWishlist(product.id);
                  if (onShowToast) onShowToast(isFavorited ? 'Removed from wishlist' : 'Saved to wishlist! 💖');
                }}
                className="pdp-wishlist-btn"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  border: '1px solid #1C3D2B',
                  backgroundColor: '#FFFFFF',
                  color: '#1C3D2B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s ease'
                }}
                title="Wishlist"
                aria-label="Save to Wishlist"
              >
                <Heart size={18} fill={isFavorited ? '#1C3D2B' : 'none'} color="#1C3D2B" />
              </button>

            </div>

            {/* Divider Line */}
            <div style={{ borderBottom: '1px solid #EAE3D8', margin: '1.65rem 0' }} />

            {/* Check Delivery Section */}
            <div style={{ margin: '0 0 1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#222F26',
                marginBottom: '0.65rem'
              }}>
                Check Delivery
              </label>

              <form onSubmit={handleCheckPincode} style={{ display: 'flex', gap: '0.55rem' }}>
                <input
                  type="text"
                  placeholder="Enter Pincode"
                  maxLength="6"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  style={{
                    flex: 1,
                    height: '42px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D5CEC4',
                    borderRadius: '8px',
                    padding: '0 1rem',
                    fontSize: '0.92rem',
                    color: '#222F26',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    height: '42px',
                    backgroundColor: '#1C3D2B',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0 1.85rem',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Check
                </button>
              </form>

              {pincodeStatus && (
                <small style={{
                  display: 'block',
                  marginTop: '0.45rem',
                  color: pincodeStatus.success ? '#1C3D2B' : '#E03131',
                  fontWeight: 500
                }}>
                  {pincodeStatus.message}
                </small>
              )}
            </div>

            {/* Add a Message on Card (Optional) */}
            <div style={{ margin: '0 0 1.75rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#222F26',
                marginBottom: '0.5rem'
              }}>
                Add a Message on Card (Optional)
              </label>
              <input
                type="text"
                placeholder="Write your message..."
                value={cardMessage}
                onChange={(e) => setCardMessage(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D5CEC4',
                  borderRadius: '8px',
                  padding: '0 1rem',
                  fontSize: '0.92rem',
                  color: '#222F26',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Review Snippet Card at the Bottom */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #D5CEC4',
              borderRadius: '8px',
              padding: '1.1rem 1.35rem',
              margin: '0 0 1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.45rem' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#5A67D8',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}>
                  P
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#222F26' }}>
                  Priya ★★★★★
                </span>
              </div>
              <p style={{
                fontSize: '0.86rem',
                color: '#2D2520',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <span>Freshly sourced! Fresh and delivered on time</span>
                <span style={{ fontSize: '0.7rem' }}>▼</span>
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Scoped CSS for Responsive Viewports */}
      <style>{`
        @media (max-width: 860px) {
          .pdp-grid-container {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .pdp-info-column {
            max-width: 100% !important;
          }
          .pdp-main-image-box {
            height: 380px !important;
          }
        }

        @media (max-width: 520px) {
          .pdp-gallery-wrap {
            flex-direction: column-reverse !important;
          }
          .pdp-thumbnails-strip {
            flex-direction: row !important;
            width: 100% !important;
            overflow-x: auto !important;
            padding-bottom: 4px;
          }
          .pdp-thumbnails-strip button {
            flex-shrink: 0;
          }
          .pdp-action-row {
            flex-wrap: wrap !important;
            gap: 0.65rem !important;
          }
          .pdp-action-row .pdp-cta-btn {
            flex: 1 1 calc(50% - 0.5rem) !important;
            min-width: 110px !important;
          }
          .pdp-main-image-box {
            height: 280px !important;
          }
        }
      `}</style>

    </div>
  );
};
