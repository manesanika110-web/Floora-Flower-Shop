import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES } from '../data/products';
import { getStoredProducts, subscribeProducts } from '../services/productsService';
import { getHomeContent, subscribeHomeContent } from '../services/homeContentService';

// 5 Newly Provided Hero Banner Images
// Reference category images matching img-1
// Helper to ensure category buttons display only a single arrow
const formatSingleArrowBtn = (text, fallback) => {
  const str = text || fallback || '';
  return str.replace(/[\s→\u2192\u219B\u2794\u279C\u279D\u279E\u279F\u27A0\u27A1]+$/g, '').trim();
};

const CATEGORY_IMAGE_MAP = {
  'marigold': '/categories/marigold_flower.png',
  'jasmine': '/categories/jasmine_mogra_flower.png',
  'jasmine (mogra)': '/categories/jasmine_mogra_flower.png',
  'lotus': '/categories/lotus_flower.png',
  'tuberose': '/categories/tuberose_flower.png',
  'chrysanthemum': '/categories/chrysanthemum_flower.png',
  'roses': '/categories/roses_flower.png',
  'lilies': '/categories/lilies_flower.png',
  'sunflowers': '/categories/sunflowers_flower.png',
  'orchids': '/categories/orchids_flower.png',
  'bouquets': '/categories/bouquets_flower.png'
};

const HERO_BANNERS = [
  {
    id: 1,
    image: '/banners/banner_mixed_bouquets.jpg',
    alt: 'Floora Mixed Bouquet Edition – Fresh Flowers, Delivered with Love'
  },
  {
    id: 2,
    image: '/banners/banner_white_lilies.jpg',
    alt: 'Floora Flowers – Fresh White Lilies'
  },
  {
    id: 3,
    image: '/banners/banner_natures_beauty.jpg',
    alt: "Floora – Nature's Beauty Roses & Sunflowers"
  },
  {
    id: 4,
    image: '/banners/banner_exotic_orchids.jpg',
    alt: 'Floora Exotic Orchids Collection'
  },
  {
    id: 5,
    image: '/banners/banner_sunflower_bloom.jpg',
    alt: 'Bloom Like a Sunflower – Always Turn Towards the Sunshine'
  }
];

// =================== CUSTOMER REVIEWS DATA ===================
const CUSTOMER_REVIEWS = [
  {
    id: 'rev-1',
    name: 'YUDH VIJAY NAUTIYAL',
    date: '25 October 2026',
    rating: 5,
    text: 'Excellent',
    image: '/flowers/mix_flower_bouquet.jpg'
  },
  {
    id: 'rev-2',
    name: 'Katherine Baptist',
    date: '24 October 2026',
    rating: 5,
    text: 'Great experience! Very efficient . Absolutely gifting made easy !',
    image: '/flowers/pink_rose_bouquet.jpg'
  },
  {
    id: 'rev-3',
    name: 'Nida Fatima Khan',
    date: '19 October 2026',
    rating: 5,
    text: 'Nice',
    image: '/flowers/tulip_bouquet.jpg'
  },
  {
    id: 'rev-4',
    name: 'Priya Sharma',
    date: '15 October 2026',
    rating: 5,
    text: 'Beautiful flowers, delivered on time. Very fresh and fragrant. Loved it!',
    image: '/flowers/jasmine_mogra.jpg'
  },
  {
    id: 'rev-5',
    name: 'Rahul Mehta',
    date: '12 October 2026',
    rating: 5,
    text: 'Outstanding quality. My wife absolutely loved the lotus arrangement. Will order again!',
    image: '/flowers/sacred_pink_lotus.jpg'
  },
  {
    id: 'rev-6',
    name: 'Anjali Verma',
    date: '8 October 2026',
    rating: 5,
    text: 'Wonderful experience from ordering to delivery. The marigold garland was picture-perfect.',
    image: '/flowers/marigold_flowers.jpg'
  }
];

export const HomePage = ({ onShowToast }) => {
  const [homeContent, setHomeContent] = useState(() => getHomeContent());
  const [allProducts, setAllProducts] = useState(() => getStoredProducts());

  useEffect(() => {
    const unsubHome = subscribeHomeContent((updated) => {
      if (updated) setHomeContent(updated);
    });
    const unsubProd = subscribeProducts((updated) => {
      if (updated && Array.isArray(updated)) setAllProducts(updated);
    });
    return () => {
      unsubHome();
      unsubProd();
    };
  }, []);

  const [categoriesList, setCategoriesList] = useState(() => {
    try {
      const saved = localStorage.getItem('floora_admin_categories');
      return saved ? JSON.parse(saved) : CATEGORIES;
    } catch (e) {
      return CATEGORIES;
    }
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('floora_admin_categories');
        if (saved) setCategoriesList(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const heroBannersList = homeContent.heroBanners?.banners?.length > 0 
    ? homeContent.heroBanners.banners 
    : HERO_BANNERS;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [copiedCode, setCopiedCode] = useState(null);
  const [reviewSlide, setReviewSlide] = useState(0);

  const reviewsList = homeContent.reviewsSection?.reviews?.length > 0
    ? homeContent.reviewsSection.reviews
    : CUSTOMER_REVIEWS;

  const reviewsPerPage = 3;
  const totalReviewPages = Math.max(1, Math.ceil(reviewsList.length / reviewsPerPage));

  // Auto-slide based on admin configured interval and autoPlay toggle
  useEffect(() => {
    if (homeContent.heroBanners?.autoPlay === false) return;
    const intervalTime = homeContent.heroBanners?.interval || 3000;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % (heroBannersList.length || 1));
    }, intervalTime);
    return () => clearInterval(timer);
  }, [homeContent.heroBanners?.autoPlay, homeContent.heroBanners?.interval, heroBannersList.length]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    if (onShowToast) onShowToast(`Coupon code ${code} copied to clipboard! 🎉`);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  // Curated 4-Row Product Collections (4 Cards in each row on desktop)
  const indianFlowersRow = useMemo(() => {
    return [
      allProducts.find(p => p.id === 'fl-ind-01'),
      allProducts.find(p => p.id === 'fl-ind-02'),
      allProducts.find(p => p.id === 'fl-ind-03'),
      allProducts.find(p => p.id === 'fl-ind-05')
    ].filter(Boolean);
  }, [allProducts]);

  const bouquetsRow = useMemo(() => {
    return [
      allProducts.find(p => p.id === 'fl-mock-01'),
      allProducts.find(p => p.id === 'fl-mock-08'),
      allProducts.find(p => p.id === 'fl-mock-06'),
      allProducts.find(p => p.id === 'fl-bq-04')
    ].filter(Boolean);
  }, [allProducts]);

  const internationalFlowersRow = useMemo(() => {
    return [
      allProducts.find(p => p.id === 'fl-mock-02'),
      allProducts.find(p => p.id === 'fl-mock-03'),
      allProducts.find(p => p.id === 'fl-mock-07'),
      allProducts.find(p => p.id === 'fl-int-08')
    ].filter(Boolean);
  }, [allProducts]);

  const flowerPotsRow = useMemo(() => {
    return [
      allProducts.find(p => p.id === 'fl-pot-01'),
      allProducts.find(p => p.id === 'fl-pot-02'),
      allProducts.find(p => p.id === 'fl-pot-03'),
      allProducts.find(p => p.id === 'fl-pot-04')
    ].filter(Boolean);
  }, [allProducts]);

  const offerCards = homeContent.specialOffers?.offers?.length > 0
    ? homeContent.specialOffers.offers
    : [
        {
          id: 'offer-1',
          badge: 'FESTIVE HARVEST DEAL',
          badgeBg: '#FFF3BF',
          badgeColor: '#D9480F',
          title: 'Flat 20% OFF on Indian Fresh Flowers',
          description: 'Dawn-plucked fragrant Madurai Mogra, golden Marigold garlands, sacred Lotuses & Rajnigandha stalks.',
          coupon: 'INDIAN20',
          link: '/shop?origin=Indian',
          btnText: 'Shop Indian Flowers →',
          cardBg: 'linear-gradient(135deg, #FFF9F0 0%, #FFF2E2 100%)',
          borderColor: '#F3DEC0',
          iconEmoji: '🌸'
        },
        {
          id: 'offer-2',
          badge: 'ROMANTIC SPECIAL',
          badgeBg: '#FFE3EC',
          badgeColor: '#C2255C',
          title: 'Free Designer Vase & Custom Card',
          description: 'On all handcrafted Ecuadorian red, pink, and white rose bouquets. Arranged with premium silk wrap.',
          coupon: 'FREEVASE',
          link: '/shop?flower=Roses',
          btnText: 'Explore Rose Bouquets →',
          cardBg: 'linear-gradient(135deg, #FFF5F7 0%, #FFE9F0 100%)',
          borderColor: '#F8D2DF',
          iconEmoji: '🌹'
        },
        {
          id: 'offer-3',
          badge: 'SUPER SAVER DEAL',
          badgeBg: '#E6FCF5',
          badgeColor: '#0CA678',
          title: 'Extra 10% OFF + 2-Hr Express Dispatch',
          description: 'Cold-chain fresh hydration packaging guaranteed on all floral collections over ₹799.',
          coupon: 'FLORA10',
          link: '/shop',
          btnText: 'Shop All Flowers →',
          cardBg: 'linear-gradient(135deg, #F3FAF6 0%, #E7F6ED 100%)',
          borderColor: '#CFEEDB',
          iconEmoji: '⚡'
        }
      ];

  return (
    <div className="animate-fade-in" style={{ background: 'transparent' }}>

      {/* ================= 1. MAIN HERO BANNER SLIDER (WIDER & SHORTER, 100% VISIBLE, NO CROP) ================= */}
      <section className="hero-banner-section">
        {/* Wide and Compact Slider Container */}
        <div className="hero-slider-stage">
          <Link
            to={heroBannersList[currentSlide]?.buttonLink || '/shop'}
            className="hero-slider-link"
            title={heroBannersList[currentSlide]?.alt || 'Shop Floora Flowers'}
          >
            {heroBannersList.map((banner, index) => (
              <img
                key={banner.id || index}
                src={banner.image}
                alt={banner.alt || banner.title || 'Floora Fresh Flowers'}
                className={`hero-slide-img ${currentSlide === index ? 'active' : ''}`}
              />
            ))}
          </Link>

          {/* Bottom Pagination Dots */}
          <div className="hero-pagination-dots">
            {heroBannersList.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentSlide(index);
                }}
                className={`hero-dot-btn ${currentSlide === index ? 'active' : ''}`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Hero banner styles defined below */}
        <style>{`
          .hero-banner-section {
            position: relative;
            width: 100%;
            padding-top: 75px;
            padding-bottom: 0;
            background-color: #FAF5EE;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            overflow: hidden;
            margin: 0;
          }

          .hero-slider-stage {
            position: relative;
            z-index: 2;
            width: 100%;
            max-width: 100%;
            padding: 0;
            margin: 0 auto;
          }

          .hero-slider-link {
            display: block;
            position: relative;
            width: 100%;
            /* Fit banner within viewport below navbar — no crop, full image visible */
            height: calc(100vh - 75px);
            max-height: 520px;
            min-height: 220px;
            border-radius: 0;
            overflow: hidden;
            box-shadow: none;
            background-color: #FAF5EE;
            margin: 0 auto;
          }

          .hero-slide-img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            /* contain = full image visible, zero crop, aspect ratio preserved */
            object-fit: cover;
            object-position: center center;
            opacity: 0;
            transition: opacity 0.6s ease-in-out;
            pointer-events: none;
          }

          .hero-slide-img.active {
            opacity: 1;
            pointer-events: auto;
          }

          .hero-pagination-dots {
            position: absolute;
            bottom: 16px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 10;
            padding: 6px 14px;
            border-radius: var(--radius-full);
            background-color: rgba(0, 0, 0, 0.35);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
          }

          .hero-dot-btn {
            width: 9px;
            height: 9px;
            border-radius: var(--radius-full);
            background-color: rgba(255, 255, 255, 0.55);
            border: none;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            padding: 0;
          }

          .hero-dot-btn.active {
            width: 28px;
            background-color: #FFFFFF;
          }

          @media (max-width: 1024px) {
            .hero-slider-link {
              max-height: 420px;
            }
          }

          @media (max-width: 768px) {
            .hero-banner-section {
              padding-top: 65px !important;
            }
            .hero-slider-link {
              height: calc(100vw * 0.56);
              max-height: 320px;
              min-height: 180px;
            }
            .hero-pagination-dots {
              bottom: 10px;
            }
          }

          @media (max-width: 480px) {
            .hero-slider-link {
              height: calc(100vw * 0.6);
              max-height: 260px;
              min-height: 160px;
            }
          }
        `}</style>
      </section>

      {/* ================= HOMEPAGE FIXED STATIONARY FLORAL BACKGROUND WRAPPER ================= */}
      <div className="home-floral-fixed-wrapper">
        {/* Fixed Stationary Floral Background Layer - stays motionless while content scrolls */}
        <div className="home-fixed-floral-bg" aria-hidden="true" />

        <div className="home-floral-scroll-content">
          {/* ================= 1. REPEATING FLORAL SECTION: CATEGORIES TO SPECIAL OFFERS ================= */}
      <div className="home-floral-bg-section">

      {/* ================= 2. CATEGORY TILES (EXACT REFERENCE DESIGN: 1ST ROW: 5, 2ND ROW: 5) ================= */}
      <section className="categories-grid-section" style={{ padding: '3.5rem 0 3rem' }}>
        <div className="container">
          <div className="categories-reference-grid">
            {categoriesList.map(cat => {
              const flowerImg = CATEGORY_IMAGE_MAP[cat.id?.toLowerCase()] || 
                                CATEGORY_IMAGE_MAP[cat.name?.toLowerCase()] || 
                                cat.image;
              return (
                <Link
                  key={cat.id}
                  to={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="category-ref-card"
                >
                  <div className="category-ref-flower-wrap">
                    <img
                      src={flowerImg}
                      alt={cat.name}
                      className="category-ref-flower-img"
                      loading="lazy"
                    />
                  </div>
                  <div className="category-ref-bottom">
                    <span className="category-ref-title font-serif">{cat.name}</span>
                    <span className="category-ref-arrow-btn" aria-hidden="true">
                      <ArrowRight size={13} color="#2D2520" strokeWidth={2.4} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <style>{`
          .categories-reference-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 1.15rem;
            max-width: 1240px;
            margin: 0 auto;
          }

          .category-ref-card {
            background: rgba(255, 255, 255, 0.52);
            backdrop-filter: blur(16px) saturate(145%);
            -webkit-backdrop-filter: blur(16px) saturate(145%);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.9);
            box-shadow: 0 8px 24px rgba(45, 37, 32, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.95);
            padding: 0.85rem 0.95rem 0.85rem;
            display: flex;
            flex-direction: column;
            justifyContent: space-between;
            min-height: 154px;
            transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
            position: relative;
            text-decoration: none;
            overflow: hidden;
          }

          .category-ref-card:hover {
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.78) 0%, rgba(253, 248, 236, 0.75) 100%);
            backdrop-filter: blur(20px) saturate(160%);
            -webkit-backdrop-filter: blur(20px) saturate(160%);
            transform: translateY(-6px);
            border-color: #B8860B !important;
            box-shadow: 0 18px 38px rgba(184, 134, 11, 0.24), 0 0 18px rgba(184, 134, 11, 0.22), inset 0 1px 3px rgba(255, 255, 255, 1) !important;
          }

          .category-ref-card:hover .category-ref-title {
            color: #8C6208;
          }

          .category-ref-card:hover .category-ref-arrow-btn {
            background-color: #B8860B !important;
            transform: translateX(3px);
            box-shadow: 0 3px 8px rgba(184, 134, 11, 0.35);
          }

          .category-ref-card:hover .category-ref-arrow-btn svg {
            stroke: #FFFFFF !important;
          }

          .category-ref-flower-wrap {
            width: 100%;
            height: 102px;
            display: flex;
            align-items: center;
            justifyContent: center;
            overflow: hidden;
            border-radius: 14px 14px 0 0;
          }

          .category-ref-flower-img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            transition: transform 0.35s ease;
          }

          .category-ref-card:hover .category-ref-flower-img {
            transform: scale(1.06);
          }

          .category-ref-bottom {
            display: flex;
            align-items: center;
            justifyContent: space-between;
            gap: 0.5rem;
            margin-top: 0.45rem;
            padding-top: 0.25rem;
          }

          .category-ref-title {
            font-size: 1.02rem;
            font-weight: 600;
            color: #1A2920;
            line-height: 1.2;
            letter-spacing: -0.2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .category-ref-arrow-btn {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background-color: #F8D8DC;
            display: flex;
            align-items: center;
            justifyContent: center;
            flex-shrink: 0;
            transition: all 0.22s ease;
          }

          .category-ref-card:hover .category-ref-arrow-btn {
            background-color: #F3C4CB;
            transform: translateX(2px);
          }

          @media (max-width: 1024px) {
            .categories-reference-grid {
              grid-template-columns: repeat(5, 1fr);
              gap: 0.85rem;
            }
            .category-ref-title {
              font-size: 0.92rem;
            }
            .category-ref-flower-wrap {
              height: 90px;
            }
            .category-ref-card {
              min-height: 142px;
              padding: 0.75rem 0.8rem;
            }
          }

          @media (max-width: 768px) {
            .categories-reference-grid {
              grid-template-columns: repeat(3, 1fr);
              gap: 0.75rem;
            }
          }

          @media (max-width: 520px) {
            .categories-reference-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 0.65rem;
            }
            .category-ref-title {
              font-size: 0.88rem;
            }
            .category-ref-flower-wrap {
              height: 82px;
            }
            .category-ref-card {
              min-height: 132px;
              padding: 0.65rem 0.75rem;
            }
          }
        `}</style>
      </section>

      {/* ================= 3. SPECIAL OFFERS CARDS SECTION ================= */}
      <section style={{ padding: '2rem 0 4rem' }}>
        <div className="container">

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '1.75rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div>
              <span className="section-subtitle">Exclusive Deals</span>
              <h2 className="font-serif" style={{ fontSize: '2.1rem', color: 'var(--text)' }}>
                Special Offers & Promotions
              </h2>
            </div>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Use coupon codes at checkout for instant discounts
            </span>
          </div>

          {/* 3 Offers Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '1.5rem'
          }}>
            {offerCards.map(offer => (
              <div
                key={offer.id}
                style={{
                  background: (offer.cardBg || '').replace(/#FFF9F0/g, 'rgba(255, 249, 240, 0.62)').replace(/#FFF2E2/g, 'rgba(255, 242, 226, 0.58)').replace(/#FFF5F7/g, 'rgba(255, 245, 247, 0.62)').replace(/#FFE9F0/g, 'rgba(255, 233, 240, 0.58)').replace(/#F3FAF6/g, 'rgba(243, 250, 246, 0.62)').replace(/#E7F6ED/g, 'rgba(231, 246, 237, 0.58)') || 'rgba(255, 255, 255, 0.58)',
                  borderRadius: 'var(--radius-lg)',
                  border: `1px solid ${offer.borderColor}`,
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.03)',
                  transition: 'var(--transition)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                className="offer-card-item"
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{
                      backgroundColor: offer.badgeBg,
                      color: offer.badgeColor,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.3rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      letterSpacing: '0.5px'
                    }}>
                      {offer.badge}
                    </span>
                    <span style={{ fontSize: '1.6rem' }}>{offer.iconEmoji}</span>
                  </div>

                  <h3 className="font-serif" style={{ fontSize: '1.35rem', color: 'var(--text)', marginBottom: '0.6rem', lineHeight: 1.3 }}>
                    {offer.title}
                  </h3>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {offer.description}
                  </p>
                </div>

                <div>
                  {/* Coupon Copy Pill */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#FFFFFF',
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--border)',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Code: <strong style={{ color: 'var(--primary)', letterSpacing: '1px' }}>{offer.coupon}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(offer.coupon)}
                      style={{
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.78rem',
                        color: copiedCode === offer.coupon ? '#2F9E6B' : 'var(--primary)',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                      title="Copy coupon code"
                    >
                      {copiedCode === offer.coupon ? (
                        <>
                          <Check size={14} />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <Link
                    to={offer.link}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.9rem', padding: '0.65rem 1rem' }}
                  >
                    <span>{offer.btnText}</span>
                  </Link>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>
      </div>

      {/* ================= 2. REPEATING FLORAL SECTION: ALL FLOWERS & BOUQUETS TO BOUQUETS ================= */}
      <div className="home-floral-bg-section" style={{ padding: '3rem 0 3.5rem' }}>
        <div className="container">
          {/* Main Section Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '3rem',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingBottom: '1.5rem'
          }}>
            <div>
              <span className="section-subtitle">
                {homeContent.catalogSection?.sectionSubtitle || 'Fresh Floral Catalog'}
              </span>
              <h2 className="font-serif" style={{ fontSize: '2.4rem', color: 'var(--text)', margin: '0.2rem 0' }}>
                {homeContent.catalogSection?.sectionTitle || 'All Flowers & Bouquets'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                {homeContent.catalogSection?.sectionDescription || 'Explore our signature collections: traditional Indian blooms, artisanal bouquets, exotic international stems & living flower pots.'}
              </p>
            </div>

            <Link to={homeContent.catalogSection?.exploreAllLink || '/shop'} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 600,
              fontSize: '0.92rem',
              color: '#274E3A',
              backgroundColor: '#FAF5EE',
              padding: '0.6rem 1.25rem',
              borderRadius: '9999px',
              border: '1.5px solid #EADCCB',
              transition: 'var(--transition)'
            }} className="explore-all-btn">
              <span>{homeContent.catalogSection?.exploreAllText || 'Explore All in Shop'}</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* ================= ROW 1: INDIAN FLOWERS (4 CARDS) ================= */}
          <div className="collection-row-block" style={{ marginBottom: '4rem' }}>
            <div className="collection-row-header">
              <div className="collection-row-left">
                <span className="collection-row-num">1</span>
                <div>
                  <h3 className="font-serif collection-row-title">
                    {homeContent.catalogSection?.rows?.indian?.title || 'Indian Flowers'}
                  </h3>
                  <p className="collection-row-desc">
                    {homeContent.catalogSection?.rows?.indian?.subtitle || 'Auspicious dawn-harvested fresh blooms for celebrations, poojas & welcoming decor'}
                  </p>
                </div>
              </div>
              <Link to={homeContent.catalogSection?.rows?.indian?.buttonLink || '/shop?origin=Indian'} className="collection-view-all">
                <span>{formatSingleArrowBtn(homeContent.catalogSection?.rows?.indian?.buttonText, 'View All Indian Flowers')}</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="cards-grid-4">
              {indianFlowersRow.map(product => (
                <ProductCard key={product.id} product={product} onShowToast={onShowToast} />
              ))}
            </div>
          </div>

          {/* ================= ROW 2: BOUQUETS (4 CARDS) ================= */}
          <div className="collection-row-block" style={{ marginBottom: '4rem' }}>
            <div className="collection-row-header">
              <div className="collection-row-left">
                <span className="collection-row-num">2</span>
                <div>
                  <h3 className="font-serif collection-row-title">
                    {homeContent.catalogSection?.rows?.bouquets?.title || 'Bouquets (Different Flowers)'}
                  </h3>
                  <p className="collection-row-desc">
                    {homeContent.catalogSection?.rows?.bouquets?.subtitle || 'Hand-tied artisanal bouquets featuring distinct roses, spray blooms & festive combinations'}
                  </p>
                </div>
              </div>
              <Link to={homeContent.catalogSection?.rows?.bouquets?.buttonLink || '/shop?category=Bouquets'} className="collection-view-all">
                <span>{formatSingleArrowBtn(homeContent.catalogSection?.rows?.bouquets?.buttonText, 'View All Bouquets')}</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="cards-grid-4">
              {bouquetsRow.map(product => (
                <ProductCard key={product.id} product={product} onShowToast={onShowToast} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. REPEATING FLORAL SECTION: INTERNATIONAL FLOWERS TO FLOWER POTS ================= */}
      <div className="home-floral-bg-section" style={{ padding: '3.5rem 0 3.5rem' }}>
        <div className="container">

          {/* ================= ROW 3: INTERNATIONAL FLOWERS (4 CARDS) ================= */}
          <div className="collection-row-block" style={{ marginBottom: '4rem' }}>
            <div className="collection-row-header">
              <div className="collection-row-left">
                <span className="collection-row-num">3</span>
                <div>
                  <h3 className="font-serif collection-row-title">
                    {homeContent.catalogSection?.rows?.international?.title || 'International Flowers'}
                  </h3>
                  <p className="collection-row-desc">
                    {homeContent.catalogSection?.rows?.international?.subtitle || 'Exotic stems imported from Holland and South America, packed in cold-chain hydration'}
                  </p>
                </div>
              </div>
              <Link to={homeContent.catalogSection?.rows?.international?.buttonLink || '/shop?origin=International'} className="collection-view-all">
                <span>{formatSingleArrowBtn(homeContent.catalogSection?.rows?.international?.buttonText, 'View All International Flowers')}</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="cards-grid-4">
              {internationalFlowersRow.map(product => (
                <ProductCard key={product.id} product={product} onShowToast={onShowToast} />
              ))}
            </div>
          </div>

          {/* ================= ROW 4: FLOWER POTS (4 CARDS) ================= */}
          <div className="collection-row-block" style={{ marginBottom: '2.5rem' }}>
            <div className="collection-row-header">
              <div className="collection-row-left">
                <span className="collection-row-num">4</span>
                <div>
                  <h3 className="font-serif collection-row-title">
                    {homeContent.catalogSection?.rows?.pots?.title || 'Flower Pots'}
                  </h3>
                  <p className="collection-row-desc">
                    {homeContent.catalogSection?.rows?.pots?.subtitle || 'Living blooming flower plants in handcrafted ceramic & terracotta pots for homes & offices'}
                  </p>
                </div>
              </div>
              <Link to={homeContent.catalogSection?.rows?.pots?.buttonLink || '/shop?category=Flower%20Pots'} className="collection-view-all">
                <span>{formatSingleArrowBtn(homeContent.catalogSection?.rows?.pots?.buttonText, 'View All Flower Pots')}</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="cards-grid-4">
              {flowerPotsRow.map(product => (
                <ProductCard key={product.id} product={product} onShowToast={onShowToast} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4. REPEATING FLORAL SECTION: NEEDS FLOWERS BOX TO CUSTOMER REVIEWS ================= */}
      <div className="home-floral-bg-section" style={{ padding: '3.5rem 0 4rem' }}>
        <div className="container">

          {/* Bottom Explore Banner (Special Event / Wedding - Needs Flowers Box) */}
          <div className="event-wedding-banner" style={{
            position: 'relative',
            marginBottom: '4rem',
            backgroundColor: '#FAF0E6',
            borderRadius: '20px',
            border: '1px solid #CEAE76',
            padding: '2.85rem 3.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.75rem',
            boxShadow: '0 10px 30px rgba(180, 140, 90, 0.08), 0 2px 6px rgba(0, 0, 0, 0.02)',
            overflow: 'visible'
          }}>
            {/* Top-Left Floral Decoration */}
            <img
              src="/event_flower_tl.png"
              alt=""
              aria-hidden="true"
              className="event-flower-tl"
              style={{
                position: 'absolute',
                top: '-28px',
                left: '-28px',
                width: '108px',
                height: 'auto',
                pointerEvents: 'none',
                zIndex: 2,
                filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.06))'
              }}
            />

            {/* Bottom-Right Floral Decoration */}
            <img
              src="/event_flower_br.png"
              alt=""
              aria-hidden="true"
              className="event-flower-br"
              style={{
                position: 'absolute',
                bottom: '-28px',
                right: '-28px',
                width: '128px',
                height: 'auto',
                pointerEvents: 'none',
                zIndex: 2,
                filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.06))'
              }}
            />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px' }}>
              <h3 className="font-serif" style={{ fontSize: '1.75rem', fontWeight: 500, color: '#222F26', margin: '0 0 0.35rem', lineHeight: 1.25 }}>
                Need flowers for a <span style={{ color: '#8A334A', fontWeight: 600 }}>special event</span> or <span style={{ color: '#1E3F2F', fontWeight: 600 }}>wedding?</span>
              </h3>
              <p style={{ color: '#686056', fontSize: '0.92rem', margin: 0, lineHeight: 1.55 }}>
                Browse by color palettes, price range, or custom celebration arrangements with same-day express delivery.
              </p>
            </div>

            <Link
              to="/shop"
              className="event-wedding-btn"
              style={{
                position: 'relative',
                zIndex: 3,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.96rem',
                background: 'linear-gradient(90deg, #1B4A2C 0%, #254D34 40%, #BA9245 82%, #D2A957 100%)',
                padding: '0.82rem 1.85rem',
                borderRadius: '9999px',
                boxShadow: '0 8px 22px rgba(27, 74, 44, 0.28)',
                border: 'none',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.25s ease'
              }}
            >
              <span>Go to Shop Page</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* ================= 5. CUSTOMER REVIEWS SECTION ================= */}
          <div style={{ paddingTop: '1.5rem' }}>
            {/* Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 className="font-serif" style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.35rem' }}>
              {homeContent.reviewsSection?.sectionTitle || 'Customer Reviews'}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
              {homeContent.reviewsSection?.sectionSubtitle || '(Rated 4.8/5 based on 14887 ratings)'}
            </p>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: '0.1rem 0 0' }}>
              Loved by Many
            </p>
          </div>

          {/* Carousel Wrapper */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

            {/* Left Arrow */}
            <button
              type="button"
              onClick={() => setReviewSlide(prev => (prev - 1 + totalReviewPages) % totalReviewPages)}
              className="review-nav-btn"
              aria-label="Previous reviews"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Cards Stage */}
            <div style={{ flex: 1, overflow: 'visible', padding: '6px 2px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1.25rem',
                  transition: 'opacity 0.4s ease'
                }}
                className="reviews-grid"
              >
                {reviewsList.slice(
                  reviewSlide * reviewsPerPage,
                  reviewSlide * reviewsPerPage + reviewsPerPage
                ).map(review => (
                  <div key={review.id} className="review-card">
                    {/* Product thumbnail + stars + date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.9rem' }}>
                      <img
                        src={review.image}
                        alt={review.name}
                        style={{
                          width: '56px',
                          height: '56px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid #E8DFD0',
                          flexShrink: 0
                        }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                          {[...Array(5)].map((_, i) => (
                            <span key={i} style={{ color: i < review.rating ? '#E6A817' : '#D0C4B8', fontSize: '0.9rem' }}>★</span>
                          ))}
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{review.date}</span>
                      </div>
                    </div>

                    {/* Open quote */}
                    <span style={{ fontSize: '2.2rem', lineHeight: 1, color: '#1C3728', fontFamily: 'Georgia, serif', display: 'block', marginBottom: '0.3rem' }}>
                      &#x201C;
                    </span>

                    {/* Review text */}
                    <p style={{
                      fontSize: '0.9rem',
                      color: 'var(--text)',
                      lineHeight: 1.55,
                      flex: 1,
                      margin: '0 0 1rem'
                    }}>
                      {review.text}
                    </p>

                    {/* Reviewer name + close quote */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        -{review.name}
                      </span>
                      <span style={{ fontSize: '2.2rem', lineHeight: 1, color: '#1C3728', fontFamily: 'Georgia, serif' }}>
                        &#x201D;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow */}
            <button
              type="button"
              onClick={() => setReviewSlide(prev => (prev + 1) % totalReviewPages)}
              className="review-nav-btn"
              aria-label="Next reviews"
            >
              <ChevronRight size={20} />
            </button>

          </div>

          {/* Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.5rem' }}>
            {Array.from({ length: totalReviewPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setReviewSlide(i)}
                style={{
                  width: i === reviewSlide ? '24px' : '9px',
                  height: '9px',
                  borderRadius: '999px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: i === reviewSlide ? '#1C3728' : '#D0C4B8',
                  transition: 'all 0.3s ease',
                  padding: 0
                }}
                aria-label={`Review page ${i + 1}`}
              />
            ))}
          </div>

          </div>
        </div>
      </div>
        </div>
      </div>

      <style>{`
        /* Scoped Catalog & Cards Styles */
        .cards-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .collection-row-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          width: 100%;
          gap: 1.25rem;
        }

        .collection-row-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
          flex: 1;
        }

        .collection-row-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: #274E3A;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .collection-row-title {
          font-size: 1.55rem;
          font-weight: 700;
          color: var(--text);
          margin: 0;
          line-height: 1.2;
        }

        .collection-row-desc {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin: 0.2rem 0 0;
        }

        .collection-view-all {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--primary);
          font-weight: 600;
          font-size: 0.88rem;
          text-decoration: none;
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          background: rgba(28, 55, 40, 0.05);
          transition: var(--transition);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .collection-view-all:hover {
          background: var(--primary);
          color: #FFFFFF;
        }

        .event-wedding-banner {
          background-color: rgba(250, 240, 230, 0.62) !important;
          backdrop-filter: blur(16px) saturate(140%) !important;
          -webkit-backdrop-filter: blur(16px) saturate(140%) !important;
          box-shadow: 0 14px 36px rgba(180, 140, 90, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.85) !important;
          border: 1.5px solid rgba(206, 174, 118, 0.6) !important;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .event-wedding-banner:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 42px rgba(180, 140, 90, 0.16), inset 0 1px 2px rgba(255, 255, 255, 0.95) !important;
        }

        .event-wedding-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(27, 74, 44, 0.38) !important;
          filter: brightness(1.06);
        }

        @media (max-width: 1024px) {
          .cards-grid-4 {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.25rem;
          }
        }

        @media (max-width: 768px) {
          .event-wedding-banner {
            padding: 2rem 1.5rem !important;
          }
          .event-wedding-banner h3 {
            font-size: 1.35rem !important;
          }
          .event-flower-tl,
          .event-flower-br {
            display: none !important;
          }
        }

        @media (max-width: 640px) {
          .cards-grid-4 {
            grid-template-columns: 1fr !important;
          }
          .collection-row-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.85rem;
          }
          .collection-row-title {
            font-size: 1.35rem;
          }
          .collection-view-all {
            align-self: flex-start;
            margin-left: 0;
            font-size: 0.84rem;
            padding: 0.45rem 1rem;
          }
        }

        .offer-card-item {
          backdrop-filter: blur(14px) saturate(135%);
          -webkit-backdrop-filter: blur(14px) saturate(135%);
          border: 1px solid rgba(255, 255, 255, 0.75) !important;
          box-shadow: 0 8px 24px rgba(45, 37, 32, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.8) !important;
        }

        .offer-card-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 36px rgba(45, 37, 32, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.95) !important;
        }

        /* ========== CUSTOMER REVIEWS ========== */
        .review-nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1.5px solid #C8B89A;
          background: #FFFFFF;
          color: #1C3728;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.25s ease;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }
        .review-nav-btn:hover {
          background: #1C3728;
          color: #FFFFFF;
          border-color: #1C3728;
          transform: scale(1.07);
        }

        .review-card {
          background: rgba(255, 255, 255, 0.56);
          backdrop-filter: blur(14px) saturate(130%);
          -webkit-backdrop-filter: blur(14px) saturate(130%);
          border: 1.5px solid rgba(200, 169, 110, 0.7);
          box-shadow: 0 8px 24px rgba(45, 37, 32, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          padding: 1.4rem 1.4rem 1.2rem;
          display: flex;
          flex-direction: column;
          min-height: 200px;
          transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease;
        }
        .review-card:hover {
          background: rgba(255, 255, 255, 0.76);
          backdrop-filter: blur(18px) saturate(145%);
          -webkit-backdrop-filter: blur(18px) saturate(145%);
          border: 1.5px solid #8B5E10;
          box-shadow: 0 16px 36px rgba(28, 55, 40, 0.13), inset 0 1px 1px rgba(255, 255, 255, 0.95);
          transform: translateY(-4px);
        }

        @media (max-width: 900px) {
          .reviews-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 580px) {
          .reviews-grid {
            grid-template-columns: 1fr !important;
          }
          .review-nav-btn {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>

    </div>
  );
};
