import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { FlowerLoader } from '../components/FlowerLoader';
import { SHOP_BY_COLOR, OCCASIONS } from '../data/products';
import { getStoredProducts, subscribeProducts } from '../services/productsService';
import { 
  Filter, 
  X, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Globe, 
  Flower2, 
  Palette, 
  SlidersHorizontal, 
  ArrowUpDown, 
  PartyPopper,
  Check
} from 'lucide-react';

// Unified Category Matcher for accurate filtering and counts
export const matchesProductCategory = (prod, catId) => {
  if (!catId || catId === 'all') return true;
  const cat = catId.toLowerCase();
  const prodCat = (prod.category || '').toLowerCase();
  const prodFt = (prod.flowerType || '').toLowerCase();
  const prodBt = (prod.bouquetType || '').toLowerCase();
  const prodName = (prod.name || '').toLowerCase();
  const isPot = prodCat === 'flower pots' || (prod.id && String(prod.id).startsWith('fl-pot'));
  const isBouquet = prodCat === 'bouquets' || Boolean(prodBt) || prodName.includes('bouquet') || prodName.includes('arrangement') || prodName.includes('bunch');

  if (catId === 'Bouquets') {
    return isBouquet;
  }
  if (catId === 'Flower Pots') {
    return isPot;
  }
  if (catId === 'Indian Flowers') {
    return prod.origin === 'Indian' || prodCat.includes('indian');
  }
  if (catId === 'International Flowers') {
    return prod.origin === 'International' || prodCat.includes('international');
  }
  if (catId === 'Mini Bouquets' || cat.includes('mini')) {
    return prodBt.includes('mini') || prodCat.includes('mini') || prodName.includes('mini') || prodName.includes('bunch');
  }
  if (catId === 'Single Flowers' || cat.includes('single')) {
    return (
      prodCat.includes('single') ||
      prodName.includes('single') ||
      prodName.includes('bloom') ||
      prodName.includes('stalk') ||
      prodName.includes('stem') ||
      prodName.includes('garland') ||
      prod.origin === 'Indian'
    ) && !isPot && !prodName.includes('bouquet');
  }
  if (catId === 'Roses') {
    return prodCat.includes('rose') || prodFt.includes('rose') || (prodName.includes('rose') && !prodName.includes('tuberose'));
  }
  if (catId === 'Lilies') {
    return prodCat.includes('lil') || prodFt.includes('lil') || prodName.includes('lil');
  }
  if (catId === 'Orchids') {
    return prodCat.includes('orchid') || prodFt.includes('orchid') || prodName.includes('orchid');
  }
  if (catId === 'Sunflowers') {
    return prodCat.includes('sunflower') || prodFt.includes('sunflower') || prodName.includes('sunflower');
  }
  return prodCat === cat || prodCat.includes(cat) || prodFt.includes(cat) || prodBt.includes(cat) || prodName.includes(cat);
};

export const FILTER_CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'Bouquets', label: 'Bouquets' },
  { id: 'Mini Bouquets', label: 'Mini Bouquets' },
  { id: 'Roses', label: 'Roses' },
  { id: 'Lilies', label: 'Lilies' },
  { id: 'Orchids', label: 'Orchids' },
  { id: 'Sunflowers', label: 'Sunflowers' },
  { id: 'Indian Flowers', label: 'Indian Flowers' },
  { id: 'International Flowers', label: 'International Flowers' },
  { id: 'Flower Pots', label: 'Flower Pots & Plants' },
  { id: 'Single Flowers', label: 'Single Flowers' }
];

export const ORIGIN_OPTIONS = [
  { id: '', label: 'All Flowers', icon: '🌐' },
  { id: 'Indian', label: 'Indian Flowers', icon: '🌸' },
  { id: 'International', label: 'International Flowers', icon: '🌷' }
];

export const SORT_OPTIONS = [
  { id: 'popularity', label: 'Popularity / Best Sellers' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'newest', label: 'Newest Blooms' },
  { id: 'rating', label: 'Highest Customer Rating' }
];

export const ShopPage = ({ onShowToast }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState(() => getStoredProducts());

  useEffect(() => {
    const unsub = subscribeProducts((updated) => {
      if (updated && Array.isArray(updated)) {
        setAllProducts(updated);
      }
    });
    return unsub;
  }, []);

  // URL search parameters
  const searchOrigin = searchParams.get('origin') || '';
  const searchFlower = searchParams.get('flower') || '';
  const searchBouquet = searchParams.get('bouquet') || '';
  const searchColor = searchParams.get('color') || '';
  const searchTag = searchParams.get('tag') || '';
  const searchCategory = searchParams.get('category') || '';
  const searchOccasion = searchParams.get('occasion') || '';
  const searchQuery = searchParams.get('search') || '';

  // Filter States
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState(2500);
  const [sortBy, setSortBy] = useState('popularity');
  const [currentPage, setCurrentPage] = useState(1);
  const [isProductsLoading, setIsProductsLoading] = useState(false);

  // Rotating Flower Loading Animation when products/filters update
  useEffect(() => {
    setIsProductsLoading(true);
    const timer = setTimeout(() => {
      setIsProductsLoading(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [
    searchOrigin,
    searchFlower,
    searchBouquet,
    searchColor,
    searchCategory,
    searchOccasion,
    searchQuery,
    selectedCategory,
    selectedOccasions,
    maxPrice,
    sortBy,
    currentPage
  ]);

  // Layout & UI States
    const sidebarRef = useRef(null);

  // Independent wheel scrolling for filter sidebar:
  // Stops wheel propagation to window so right-side product section remains completely fixed.
  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      // Always stop propagation so wheel events inside sidebar never scroll window / right column
      e.stopPropagation();

      const { scrollTop, scrollHeight, clientHeight } = el;
      const isAtTop = scrollTop <= 0 && e.deltaY < 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;

      // Prevent window scrolling when cursor hits the top or bottom edge of sidebar
      if (isAtTop || isAtBottom) {
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showAllOccasions, setShowAllOccasions] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [collapsedCards, setCollapsedCards] = useState({
    occasions: true,
    origin: true,
    categories: true,
    color: true,
    price: true,
    sort: true
  });

  const toggleCard = (cardKey) => {
    setCollapsedCards(prev => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  // Sync category URL param with component state
  useEffect(() => {
    setSelectedCategory(searchCategory || 'all');
  }, [searchCategory]);

  // Sync occasion URL param with component state (only when occasion param itself changes)
  useEffect(() => {
    setSelectedOccasions(searchOccasion ? [searchOccasion] : []);
  }, [searchOccasion]);

  // Reset pagination when any filter param changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchCategory, searchOccasion, searchOrigin, searchFlower, searchBouquet, searchColor, searchTag, searchQuery]);

  // Occasions Selection Handlers (MULTIPLE selection)
  const handleOccasionToggle = (occ) => {
    setSelectedOccasions(prev => {
      const next = prev.includes(occ) ? prev.filter(o => o !== occ) : [...prev, occ];
      return next;
    });
    // Clear narrow search/flower/bouquet params so occasion flowers always show
    if (searchParams.has('flower') || searchParams.has('bouquet') || searchParams.has('search')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('flower');
      nextParams.delete('bouquet');
      nextParams.delete('search');
      setSearchParams(nextParams);
    }
    setCurrentPage(1);
  };

  const clearOccasions = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedOccasions([]);
    if (searchParams.has('occasion')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('occasion');
      setSearchParams(nextParams);
    }
  };

  // Category Selection Handler (SINGLE selection with automatic param cleanup)
  const handleCategorySelect = (catId) => {
    const nextParams = new URLSearchParams(searchParams);
    // Clear conflicting navbar / specific search parameters
    nextParams.delete('flower');
    nextParams.delete('bouquet');
    nextParams.delete('search');

    if (catId === 'all' || catId === selectedCategory) {
      setSelectedCategory('all');
      nextParams.delete('category');
    } else {
      setSelectedCategory(catId);
      nextParams.set('category', catId);

      // When selecting Indian Flowers or International Flowers category, align origin
      if (catId === 'Indian Flowers') {
        nextParams.set('origin', 'Indian');
      } else if (catId === 'International Flowers') {
        nextParams.set('origin', 'International');
      } else if (catId === 'Flower Pots') {
        nextParams.delete('origin');
      }
    }
    setSearchParams(nextParams);
    setCurrentPage(1);
  };

  // Collection Origin Handler (SINGLE selection)
  const handleOriginSelect = (originId) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('flower');
    nextParams.delete('bouquet');
    nextParams.delete('search');

    if (!originId || originId === searchOrigin) {
      nextParams.delete('origin');
      if (selectedCategory === 'Indian Flowers' || selectedCategory === 'International Flowers') {
        setSelectedCategory('all');
        nextParams.delete('category');
      }
    } else {
      nextParams.set('origin', originId);
      if (originId === 'Indian' && selectedCategory === 'International Flowers') {
        setSelectedCategory('all');
        nextParams.delete('category');
      } else if (originId === 'International' && selectedCategory === 'Indian Flowers') {
        setSelectedCategory('all');
        nextParams.delete('category');
      }
    }
    setSearchParams(nextParams);
    setCurrentPage(1);
  };

  // Color Swatch Click Handler
  const handleColorClick = (colorVal) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('flower');
    nextParams.delete('bouquet');
    nextParams.delete('search');

    if (searchColor && searchColor.toLowerCase() === colorVal.toLowerCase()) {
      nextParams.delete('color');
    } else {
      nextParams.set('color', colorVal);
    }
    setSearchParams(nextParams);
    setCurrentPage(1);
  };

  // Master Reset
  const clearAllFilters = () => {
    setSelectedOccasions([]);
    setSelectedCategory('all');
    setMaxPrice(2500);
    setSortBy('popularity');
    setSearchParams({});
    setCurrentPage(1);
  };

  // Active filters check
  const hasActiveFilters = Boolean(
    searchOrigin || 
    searchFlower || 
    searchBouquet || 
    searchColor || 
    searchTag || 
    (selectedCategory && selectedCategory !== 'all') || 
    searchOccasion ||
    searchQuery || 
    selectedOccasions.length > 0 ||
    maxPrice < 2500 ||
    sortBy !== 'popularity'
  );

  const totalActiveFilterCount = (
    selectedOccasions.length +
    (searchOrigin ? 1 : 0) +
    (selectedCategory && selectedCategory !== 'all' ? 1 : 0) +
    (searchColor ? 1 : 0) +
    (maxPrice < 2500 ? 1 : 0) +
    (sortBy !== 'popularity' ? 1 : 0)
  );

  // Compute Active Filter Label (clean, elegant page title)
  const activeFilterTitle = useMemo(() => {
    if (selectedOccasions.length > 0) return `${selectedOccasions.join(', ')} Flowers`;
    if (searchOccasion) return `${searchOccasion} Flowers`;
    if (selectedCategory && selectedCategory !== 'all') {
      if (selectedCategory === 'Flower Pots') return 'Flower Pots & Plants';
      if (selectedCategory === 'Bouquets') return 'Artisanal Bouquets';
      if (selectedCategory === 'Indian Flowers') return 'Indian Flowers Collection';
      if (selectedCategory === 'International Flowers') return 'International Flowers Collection';
      if (selectedCategory === 'Mini Bouquets') return 'Mini Bouquets';
      if (selectedCategory === 'Single Flowers') return 'Single Flowers';
      return `${selectedCategory} Collection`;
    }
    if (searchCategory) {
      if (searchCategory === 'Flower Pots') return 'Flower Pots & Plants';
      if (searchCategory === 'Bouquets') return 'Artisanal Bouquets';
      if (searchCategory === 'Indian Flowers') return 'Indian Flowers Collection';
      if (searchCategory === 'International Flowers') return 'International Flowers Collection';
      if (searchCategory === 'Mini Bouquets') return 'Mini Bouquets';
      if (searchCategory === 'Single Flowers') return 'Single Flowers';
      return `${searchCategory} Collection`;
    }
    if (searchFlower) return `${searchFlower} Collection`;
    if (searchBouquet) return `${searchBouquet} Collection`;
    if (searchColor) return `${searchColor} Flowers Collection`;
    if (searchOrigin) return `${searchOrigin} Flowers Collection`;
    if (searchTag === 'best-sellers') return 'Best Sellers Collection';
    if (searchTag === 'new-arrivals') return 'New Arrivals Collection';
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    return 'All Flowers & Bouquets';
  }, [searchFlower, searchBouquet, searchColor, searchOrigin, searchTag, searchCategory, searchOccasion, searchQuery, selectedOccasions, selectedCategory]);

  // Dynamic Product Counts
  const getCategoryCount = (catId) => {
    if (catId === 'all') return allProducts.length;
    const catLow = catId.toLowerCase();
    if (catId === 'Bouquets') {
      return allProducts.filter(p => (p.category && p.category.toLowerCase() === 'bouquets') || Boolean(p.bouquetType) || (p.name && (p.name.toLowerCase().includes('bouquet') || p.name.toLowerCase().includes('arrangement') || p.name.toLowerCase().includes('bunch')))).length;
    }
    if (catId === 'Flower Pots') {
      return allProducts.filter(p => (p.category && p.category.toLowerCase() === 'flower pots') || (p.id && String(p.id).startsWith('fl-pot'))).length;
    }
    if (catId === 'Indian Flowers') {
      return allProducts.filter(p => p.origin === 'Indian' || (p.category && p.category.toLowerCase().includes('indian'))).length;
    }
    if (catId === 'International Flowers') {
      return allProducts.filter(p => p.origin === 'International' || (p.category && p.category.toLowerCase().includes('international'))).length;
    }
    if (catId === 'Mini Bouquets') {
      return allProducts.filter(p => (p.bouquetType && p.bouquetType.toLowerCase().includes('mini')) || (p.category && p.category.toLowerCase().includes('mini'))).length;
    }
    if (catId === 'Single Flowers') {
      return allProducts.filter(p => (p.category && p.category.toLowerCase().includes('single')) || (p.name && (p.name.toLowerCase().includes('bloom') || p.name.toLowerCase().includes('stalk') || p.name.toLowerCase().includes('stem') || p.name.toLowerCase().includes('garland')))).length;
    }
    return allProducts.filter(p => 
      (p.category && (p.category.toLowerCase() === catLow || p.category.toLowerCase().includes(catLow))) ||
      (p.flowerType && p.flowerType.toLowerCase().includes(catLow)) ||
      (p.bouquetType && p.bouquetType.toLowerCase().includes(catLow)) ||
      (p.name && p.name.toLowerCase().includes(catLow))
    ).length;
  };

  const getOccasionCount = (occName) => {
    return allProducts.filter(p => Array.isArray(p.occasions) && p.occasions.includes(occName)).length;
  };

  const getOriginCount = (originId) => {
    if (!originId) return allProducts.length;
    return allProducts.filter(p => p.origin === originId).length;
  };

  // Filter products matching all criteria
  const filteredProducts = useMemo(() => {
    const seen = new Set();
    return allProducts.filter(prod => {
      if (seen.has(prod.id)) return false;
      // 1. Occasion filter (multi-select: matches ANY selected occasion)
      if (selectedOccasions.length > 0) {
        const matchesOccasion = selectedOccasions.some(occ => 
          Array.isArray(prod.occasions) && prod.occasions.includes(occ)
        );
        if (!matchesOccasion) return false;
      }

      // 2. Collection origin filter
      if (searchOrigin) {
        if (!prod.origin || prod.origin.toLowerCase() !== searchOrigin.toLowerCase()) {
          return false;
        }
      }

      // 3. Category filter (SINGLE selection)
      const activeCat = (selectedCategory && selectedCategory !== 'all') ? selectedCategory : (searchCategory || '');
      if (activeCat && activeCat !== 'all') {
        if (!matchesProductCategory(prod, activeCat)) {
          return false;
        }
      }

      // 4. Flower type filter
      if (searchFlower) {
        const sf = searchFlower.toLowerCase();
        const prodFt = (prod.flowerType || '').toLowerCase();
        const prodName = prod.name.toLowerCase();
        const prodCat = (prod.category || '').toLowerCase();
        
        const keywords = sf.replace(/[()]/g, ' ').split(/\s+/).filter(Boolean);
        const matchesAnyKeyword = keywords.some(kw => 
          prodFt.includes(kw) || prodName.includes(kw) || prodCat.includes(kw)
        );

        if (!matchesAnyKeyword && !prodFt.includes(sf) && !prodName.includes(sf)) {
          return false;
        }
      }

      // 5. Bouquet type filter
      if (searchBouquet) {
        const sb = searchBouquet.toLowerCase();
        const prodBt = (prod.bouquetType || '').toLowerCase();
        const prodCat = (prod.category || '').toLowerCase();
        const prodName = prod.name.toLowerCase();

        let matchBouquet = false;
        if (sb.includes('mini')) {
          matchBouquet = prodBt.includes('mini') || prodCat.includes('mini') || prodName.includes('mini') || prodName.includes('bunch');
        } else {
          matchBouquet = 
            prodBt === sb || 
            prodBt.includes(sb) || 
            prodCat === sb ||
            (prodCat === 'bouquets' && sb.split(' ').some(w => prodName.includes(w) && w !== 'bouquets'));
        }
        
        if (!matchBouquet) return false;
      }

      // 6. Color filter
      if (searchColor) {
        const sc = searchColor.toLowerCase();
        const matchColor = prod.colors && prod.colors.some(c => c.toLowerCase() === sc);
        if (!matchColor) return false;
      }

      // 7. Tag filter
      if (searchTag === 'best-sellers' && !prod.isBestSeller) return false;
      if (searchTag === 'new-arrivals' && !prod.isNewArrival) return false;

      // 8. Price filter
      if (prod.price > maxPrice) return false;

      // 9. Search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = prod.name.toLowerCase().includes(q);
        const matchDesc = prod.description.toLowerCase().includes(q);
        const matchFlower = prod.flowerType && prod.flowerType.toLowerCase().includes(q);
        const matchColor = prod.colors && prod.colors.some(c => c.toLowerCase().includes(q));
        const matchOrigin = prod.origin && prod.origin.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchFlower && !matchColor && !matchOrigin) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    });
  }, [allProducts, searchOrigin, searchFlower, searchBouquet, searchColor, searchTag, selectedCategory, searchOccasion, searchQuery, selectedOccasions, maxPrice, sortBy]);

  // Occasions list slice (Top 5 vs All 10)
  const displayedOccasions = showAllOccasions ? OCCASIONS : OCCASIONS.slice(0, 5);

  // Categories list slice (Top 5 vs All)
  const displayedCategories = showAllCategories ? FILTER_CATEGORIES : FILTER_CATEGORIES.slice(0, 5);

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      
      {/* Page Heading - Display only page title at top */}
      <div className="section-header text-center" style={{ marginBottom: '2.5rem' }}>
        <h1 className="font-serif" style={{ fontSize: '2.5rem', margin: 0, color: 'var(--text)' }}>
          {activeFilterTitle}
        </h1>
      </div>

      {/* Mobile Drawer Trigger Bar */}
      <div className="mobile-filter-bar">
        <button 
          type="button" 
          onClick={() => setMobileDrawerOpen(true)}
          className="mobile-filter-btn"
          aria-label="Open filter menu"
        >
          <Filter size={16} />
          <span>Filter Flowers</span>
          {totalActiveFilterCount > 0 && (
            <span className="mobile-filter-badge">{totalActiveFilterCount}</span>
          )}
        </button>
        {hasActiveFilters && (
          <button 
            type="button" 
            onClick={clearAllFilters}
            className="mobile-clear-btn"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Mobile Drawer Backdrop */}
      <div 
        className={`shop-drawer-backdrop ${mobileDrawerOpen ? 'active' : ''}`}
        onClick={() => setMobileDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Main Grid: Filters Sidebar + Products */}
      <div className="shop-grid-layout">
        
        {/* Left Filter Sidebar */}
        <aside ref={sidebarRef} className={`shop-filters-sidebar ${mobileDrawerOpen ? 'drawer-open' : ''}`}>
          
          {/* Sidebar Top Header Card */}
          <div className="filter-sidebar-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Filter size={18} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E1E1E', fontFamily: 'var(--font-serif)' }}>
                Filter Flowers
              </span>
              {totalActiveFilterCount > 0 && (
                <span className="filter-card-badge">{totalActiveFilterCount}</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {hasActiveFilters && (
                <button 
                  type="button" 
                  onClick={clearAllFilters}
                  className="filter-card-clear-btn"
                  style={{ textDecoration: 'underline' }}
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="mobile-drawer-close-btn"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* =========================================================================
              CARD 1: SHOP BY OCCASION (MULTIPLE SELECTION)
          ========================================================================== */}
          <div className="filter-card">
            <div 
              className="filter-card-header"
              onClick={() => toggleCard('occasions')}
              role="button"
              tabIndex={0}
              aria-expanded={!collapsedCards.occasions}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCard('occasions'); } }}
            >
              <div className="filter-card-title-group">
                <span className="filter-card-icon">
                  <PartyPopper size={18} />
                </span>
                <h4 className="filter-card-title">Shop by Occasion</h4>
                {selectedOccasions.length > 0 && (
                  <span className="filter-card-badge">{selectedOccasions.length}</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {selectedOccasions.length > 0 && (
                  <button 
                    type="button"
                    onClick={clearOccasions}
                    className="filter-card-clear-btn"
                  >
                    Clear
                  </button>
                )}
                <span style={{ color: 'var(--text-muted)', display: 'flex' }}>
                  {collapsedCards.occasions ? <ChevronDown size={17} /> : <ChevronUp size={17} />}
                </span>
              </div>
            </div>

            {!collapsedCards.occasions && (
              <div className="filter-card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {displayedOccasions.map(occ => {
                    const isChecked = selectedOccasions.includes(occ);
                    const count = getOccasionCount(occ);
                    return (
                      <label 
                        key={occ} 
                        className={`filter-item-row ${isChecked ? 'active' : ''}`}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleOccasionToggle(occ)}
                          />
                          <span>{occ}</span>
                        </span>
                        <span style={{ 
                          color: isChecked ? 'var(--primary)' : 'var(--text-muted)', 
                          fontSize: '0.8rem',
                          fontWeight: isChecked ? 700 : 400
                        }}>
                          ({count})
                        </span>
                      </label>
                    );
                  })}
                </div>

                {OCCASIONS.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAllOccasions(prev => !prev)}
                    className="filter-show-more-btn"
                  >
                    <span>{showAllOccasions ? 'Show fewer occasions' : `+ Show ${OCCASIONS.length - 5} more occasions`}</span>
                    {showAllOccasions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* =========================================================================
              CARD 2: COLLECTION ORIGIN (SINGLE SELECTION)
          ========================================================================== */}
          <div className="filter-card">
            <div 
              className="filter-card-header"
              onClick={() => toggleCard('origin')}
              role="button"
              tabIndex={0}
              aria-expanded={!collapsedCards.origin}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCard('origin'); } }}
            >
              <div className="filter-card-title-group">
                <span className="filter-card-icon">
                  <Globe size={18} />
                </span>
                <h4 className="filter-card-title">Collection Origin</h4>
                {searchOrigin && (
                  <span className="filter-card-badge">1</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {searchOrigin && (
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleOriginSelect(''); }}
                    className="filter-card-clear-btn"
                  >
                    Clear
                  </button>
                )}
                <span style={{ color: 'var(--text-muted)', display: 'flex' }}>
                  {collapsedCards.origin ? <ChevronDown size={17} /> : <ChevronUp size={17} />}
                </span>
              </div>
            </div>

            {!collapsedCards.origin && (
              <div className="filter-card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {ORIGIN_OPTIONS.map(opt => {
                    const isSelected = (!searchOrigin && opt.id === '') || (searchOrigin === opt.id);
                    const count = getOriginCount(opt.id);
                    return (
                      <label 
                        key={opt.id} 
                        className={`filter-item-row ${isSelected ? 'active' : ''}`}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <input 
                            type="radio"
                            name="filter-origin"
                            checked={isSelected}
                            onChange={() => handleOriginSelect(opt.id)}
                          />
                          <span>{opt.icon} {opt.label}</span>
                        </span>
                        <span style={{ 
                          color: isSelected ? 'var(--primary)' : 'var(--text-muted)', 
                          fontSize: '0.8rem',
                          fontWeight: isSelected ? 700 : 400
                        }}>
                          ({count})
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              CARD 3: CATEGORIES (SINGLE SELECTION ONLY)
          ========================================================================== */}
          <div className="filter-card">
            <div 
              className="filter-card-header"
              onClick={() => toggleCard('categories')}
              role="button"
              tabIndex={0}
              aria-expanded={!collapsedCards.categories}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCard('categories'); } }}
            >
              <div className="filter-card-title-group">
                <span className="filter-card-icon">
                  <Flower2 size={18} />
                </span>
                <h4 className="filter-card-title">Categories</h4>
                {selectedCategory !== 'all' && (
                  <span className="filter-card-badge">1</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {selectedCategory !== 'all' && (
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleCategorySelect('all'); }}
                    className="filter-card-clear-btn"
                  >
                    Reset
                  </button>
                )}
                <span style={{ color: 'var(--text-muted)', display: 'flex' }}>
                  {collapsedCards.categories ? <ChevronDown size={17} /> : <ChevronUp size={17} />}
                </span>
              </div>
            </div>

            {!collapsedCards.categories && (
              <div className="filter-card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {displayedCategories.map(cat => {
                    const isSelected = selectedCategory === cat.id;
                    const count = getCategoryCount(cat.id);
                    return (
                      <label 
                        key={cat.id} 
                        className={`filter-item-row ${isSelected ? 'active' : ''}`}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <input 
                            type="radio"
                            name="filter-category"
                            checked={isSelected}
                            onChange={() => handleCategorySelect(cat.id)}
                          />
                          <span>{cat.label}</span>
                        </span>
                        <span style={{ 
                          color: isSelected ? 'var(--primary)' : 'var(--text-muted)', 
                          fontSize: '0.8rem',
                          fontWeight: isSelected ? 700 : 400
                        }}>
                          ({count})
                        </span>
                      </label>
                    );
                  })}
                </div>

                {FILTER_CATEGORIES.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAllCategories(prev => !prev)}
                    className="filter-show-more-btn"
                  >
                    <span>{showAllCategories ? 'Show fewer categories' : `+ Show ${FILTER_CATEGORIES.length - 5} more categories`}</span>
                    {showAllCategories ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* =========================================================================
              CARD 4: FILTER BY COLOR (COLOR SWATCHES)
          ========================================================================== */}
          <div className="filter-card">
            <div 
              className="filter-card-header"
              onClick={() => toggleCard('color')}
              role="button"
              tabIndex={0}
              aria-expanded={!collapsedCards.color}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCard('color'); } }}
            >
              <div className="filter-card-title-group">
                <span className="filter-card-icon">
                  <Palette size={18} />
                </span>
                <h4 className="filter-card-title">Filter by Color</h4>
                {searchColor && (
                  <span className="filter-card-badge">1</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {searchColor && (
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleColorClick(searchColor); }}
                    className="filter-card-clear-btn"
                  >
                    Clear
                  </button>
                )}
                <span style={{ color: 'var(--text-muted)', display: 'flex' }}>
                  {collapsedCards.color ? <ChevronDown size={17} /> : <ChevronUp size={17} />}
                </span>
              </div>
            </div>

            {!collapsedCards.color && (
              <div className="filter-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', width: '100%' }}>
                  {SHOP_BY_COLOR.map(c => {
                    const isSelected = searchColor.toLowerCase() === c.value.toLowerCase();
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => handleColorClick(c.value)}
                        className={`filter-color-swatch ${isSelected ? 'active' : ''}`}
                        title={c.name}
                      >
                        <span 
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: c.hex,
                            border: c.border ? `1px solid ${c.border}` : '1px solid rgba(0,0,0,0.12)',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }} 
                        >
                          {isSelected && (
                            <Check size={13} color={c.value === 'White' || c.value === 'Cream' || c.value === 'Yellow' ? '#1A3B2A' : '#FFFFFF'} strokeWidth={3} />
                          )}
                        </span>
                        <span style={{ 
                          fontSize: '0.8rem', 
                          color: isSelected ? 'var(--primary)' : '#2B2320', 
                          fontWeight: isSelected ? 700 : 500,
                          lineHeight: 1.2
                        }}>
                          {c.value}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              CARD 5: MAX PRICE (SLIDER & PRESETS)
          ========================================================================== */}
          <div className="filter-card">
            <div 
              className="filter-card-header"
              onClick={() => toggleCard('price')}
              role="button"
              tabIndex={0}
              aria-expanded={!collapsedCards.price}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCard('price'); } }}
            >
              <div className="filter-card-title-group">
                <span className="filter-card-icon">
                  <SlidersHorizontal size={18} />
                </span>
                <h4 className="filter-card-title">Max Price</h4>
                {maxPrice < 2500 && (
                  <span className="filter-card-badge">₹{maxPrice}</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {maxPrice < 2500 && (
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setMaxPrice(2500); }}
                    className="filter-card-clear-btn"
                  >
                    Reset
                  </button>
                )}
                <span style={{ color: 'var(--text-muted)', display: 'flex' }}>
                  {collapsedCards.price ? <ChevronDown size={17} /> : <ChevronUp size={17} />}
                </span>
              </div>
            </div>

            {!collapsedCards.price && (
              <div className="filter-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#6E5D4F' }}>Selected Budget:</span>
                  <strong style={{ fontSize: '1.15rem', color: 'var(--primary)', fontFamily: 'var(--font-serif)' }}>
                    Up to ₹{maxPrice}
                  </strong>
                </div>

                <input 
                  type="range" 
                  min="300" 
                  max="2500" 
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{ width: '100%', height: '7px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  aria-label="Filter by maximum price"
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  <span>₹300 (Min)</span>
                  <span>₹2,500 (Max)</span>
                </div>

                {/* Quick Budget Preset Chips */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
                  {[500, 1000, 1500, 2500].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setMaxPrice(val)}
                      className={`filter-preset-chip ${maxPrice === val ? 'active' : ''}`}
                    >
                      {val === 2500 ? 'All Prices' : `₹${val}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              CARD 6: SORT RESULTS (SINGLE SELECTION RADIO GROUP)
          ========================================================================== */}
          <div className="filter-card">
            <div 
              className="filter-card-header"
              onClick={() => toggleCard('sort')}
              role="button"
              tabIndex={0}
              aria-expanded={!collapsedCards.sort}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCard('sort'); } }}
            >
              <div className="filter-card-title-group">
                <span className="filter-card-icon">
                  <ArrowUpDown size={18} />
                </span>
                <h4 className="filter-card-title">Sort Results</h4>
                {sortBy !== 'popularity' && (
                  <span className="filter-card-badge">Active</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {sortBy !== 'popularity' && (
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSortBy('popularity'); }}
                    className="filter-card-clear-btn"
                  >
                    Reset
                  </button>
                )}
                <span style={{ color: 'var(--text-muted)', display: 'flex' }}>
                  {collapsedCards.sort ? <ChevronDown size={17} /> : <ChevronUp size={17} />}
                </span>
              </div>
            </div>

            {!collapsedCards.sort && (
              <div className="filter-card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {SORT_OPTIONS.map(opt => {
                    const isSelected = sortBy === opt.id;
                    return (
                      <label 
                        key={opt.id} 
                        className={`filter-item-row ${isSelected ? 'active' : ''}`}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <input 
                            type="radio"
                            name="sort-order"
                            checked={isSelected}
                            onChange={() => setSortBy(opt.id)}
                          />
                          <span>{opt.label}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Full-Width Master Reset Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="btn btn-secondary"
              style={{
                width: '100%',
                minHeight: '44px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.88rem',
                fontWeight: 600,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1.5px solid #EADCCB',
                color: '#1A3B2A',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                marginTop: '0.25rem'
              }}
            >
              <RotateCcw size={15} />
              <span>Reset All Filters ({totalActiveFilterCount})</span>
            </button>
          )}

        </aside>

        {/* Right Products Grid Column */}
        <section className="shop-products-column">
          {isProductsLoading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '340px',
              backgroundColor: 'rgba(255, 255, 255, 0.65)',
              borderRadius: '24px',
              border: '1px solid #EADCCB',
              backdropFilter: 'blur(10px)'
            }}>
              <FlowerLoader size={42} text="Loading fresh blooms..." />
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '2rem'
                }}
              >
                {filteredProducts.map(prod => (
                  <ProductCard key={prod.id} product={prod} onShowToast={onShowToast} />
                ))}
              </div>

              {/* Pagination */}
              {filteredProducts.length > 12 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setCurrentPage(1)} 
                    className={`pagination-btn ${currentPage === 1 ? 'active' : ''}`}
                  >
                    1
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setCurrentPage(2)} 
                    className={`pagination-btn ${currentPage === 2 ? 'active' : ''}`}
                  >
                    2
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '4.5rem 2rem',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              borderRadius: '24px',
              border: '1px solid #EADCCB',
              boxShadow: '0 8px 24px rgba(45, 37, 32, 0.04)'
            }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🥀</span>
              <h3 className="font-serif" style={{ fontSize: '1.6rem', color: 'var(--text)', marginBottom: '0.5rem' }}>
                No Flowers Found
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                We couldn't find any blooms matching your current filter criteria. Try adjusting the price range or resetting your filters.
              </p>
              <button 
                type="button" 
                onClick={clearAllFilters}
                className="btn btn-primary btn-sm"
                style={{ borderRadius: 'var(--radius-full)', padding: '0.6rem 1.5rem' }}
              >
                Reset All Filters
              </button>
            </div>
          )}

        </section>

      </div>

      {/* FILTER PANEL STYLES */}
      <style>{`
        /* Master Grid Layout */
        .shop-grid-layout {
          display: grid;
          grid-template-columns: 310px 1fr;
          gap: 2.25rem;
          align-items: start;
        }

        /* Outer Filter Container - Smooth, fully & independently scrollable */
        .shop-filters-sidebar {
          position: sticky;
          top: 90px;
          height: calc(100vh - 105px);
          max-height: calc(100vh - 105px);
          overflow-y: auto;
          overscroll-behavior: contain;
          overscroll-behavior-y: contain;
          background: transparent;
          border: none;
          box-shadow: none;
          padding: 0 0 5rem 0; /* Ensures full scrollability through all cards without stopping */
          scrollbar-width: thin;
          scrollbar-color: #EADCCB transparent;
          -webkit-overflow-scrolling: touch;
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }

        .shop-filters-sidebar::-webkit-scrollbar {
          width: 5px;
        }
        .shop-filters-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        .shop-filters-sidebar::-webkit-scrollbar-thumb {
          background-color: #EADCCB;
          border-radius: 4px;
        }
        .shop-filters-sidebar::-webkit-scrollbar-thumb:hover {
          background-color: #C5A97A;
        }

        /* Sidebar Header Card */
        .filter-sidebar-header {
          width: 100%;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.15rem 1.35rem;
          background: rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(14px);
          border: 1px solid #EADCCB;
          border-radius: 18px;
          box-shadow: 0 4px 14px rgba(45, 37, 32, 0.04);
        }

        /* Balanced Individual Filter Card */
        .filter-card {
          width: 100%;
          box-sizing: border-box;
          background: rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(14px);
          border: 1px solid #EADCCB;
          border-radius: 18px;
          padding: 1.2rem 1.35rem;
          box-shadow: 0 4px 14px rgba(45, 37, 32, 0.04);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .filter-card:hover {
          border-color: #D6C2AA;
          box-shadow: 0 6px 20px rgba(45, 37, 32, 0.06);
        }

        .filter-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          user-select: none;
          padding: 0.1rem 0;
        }

        .filter-card-title-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .filter-card-icon {
          color: var(--primary);
          display: flex;
          align-items: center;
        }

        .filter-card-title {
          font-size: 1.02rem;
          font-weight: 600;
          color: #1E1E1E;
          margin: 0;
        }

        .filter-card-badge {
          background-color: var(--primary);
          color: #FFFFFF;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.12rem 0.5rem;
          border-radius: 10px;
          line-height: 1.2;
        }

        .filter-card-clear-btn {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0 0.25rem;
        }

        .filter-card-body {
          margin-top: 0.9rem;
          padding-top: 0.85rem;
          border-top: 1px solid rgba(234, 220, 203, 0.75);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        /* Spacious Touch Target Rows (42px min-height) */
        .filter-item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 42px;
          padding: 0.55rem 0.85rem;
          border-radius: 12px;
          font-size: 0.88rem;
          color: #2B2320;
          cursor: pointer;
          background-color: transparent;
          border: 1px solid transparent;
          transition: all 0.2s ease;
          user-select: none;
        }

        .filter-item-row:hover {
          background-color: rgba(26, 59, 42, 0.05);
        }

        .filter-item-row.active {
          background-color: rgba(26, 59, 42, 0.09) !important;
          border-color: rgba(26, 59, 42, 0.22) !important;
          color: var(--primary) !important;
          font-weight: 600;
        }

        .filter-item-row input[type="checkbox"],
        .filter-item-row input[type="radio"] {
          width: 17px;
          height: 17px;
          accent-color: var(--primary);
          cursor: pointer;
          margin: 0;
          flex-shrink: 0;
        }

        /* Show More Toggle Button */
        .filter-show-more-btn {
          width: 100%;
          min-height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          background: rgba(26, 59, 42, 0.04);
          border: 1px dashed #D6C2AA;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--primary);
          cursor: pointer;
          margin-top: 0.35rem;
          transition: all 0.2s ease;
        }

        .filter-show-more-btn:hover {
          background: rgba(26, 59, 42, 0.08);
          border-style: solid;
        }

        /* Color Swatches Grid */
        .filter-color-swatch {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          min-height: 54px;
          padding: 0.6rem 0.35rem;
          border-radius: 14px;
          border: 1.5px solid #EADCCB;
          background-color: #FFFFFF;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-color-swatch:hover {
          border-color: #C5A97A;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.06);
        }

        .filter-color-swatch.active {
          border: 2px solid var(--primary) !important;
          background-color: rgba(26, 59, 42, 0.08) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(26, 59, 42, 0.15);
        }

        /* Preset Budget Chips */
        .filter-preset-chip {
          padding: 0.35rem 0.8rem;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 600;
          background: #FFFFFF;
          border: 1px solid #EADCCB;
          color: #6E5D4F;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-preset-chip:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .filter-preset-chip.active {
          background: var(--primary);
          color: #FFFFFF;
          border-color: var(--primary);
        }

        /* Mobile Trigger Bar */
        .mobile-filter-bar {
          display: none;
        }

        .mobile-drawer-close-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.2rem;
          border-radius: var(--radius-sm);
        }

        .shop-drawer-backdrop {
          display: none;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .shop-grid-layout {
            grid-template-columns: 290px 1fr;
            gap: 1.75rem;
          }
        }

        @media (max-width: 900px) {
          .mobile-filter-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
            gap: 0.75rem;
          }
          .mobile-filter-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.7rem 1.35rem;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(8px);
            border: 1px solid var(--border);
            border-radius: var(--radius-full);
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text);
            cursor: pointer;
            box-shadow: var(--shadow-sm);
          }
          .mobile-filter-badge {
            background-color: var(--primary);
            color: #FFFFFF;
            font-size: 0.75rem;
            padding: 0.12rem 0.55rem;
            border-radius: 10px;
            font-weight: 700;
          }
          .mobile-clear-btn {
            font-size: 0.85rem;
            color: var(--primary);
            font-weight: 700;
            background: none;
            border: none;
            cursor: pointer;
          }
          .shop-drawer-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
            backdrop-filter: blur(3px);
            z-index: 1040;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
          }
          .shop-drawer-backdrop.active {
            opacity: 1;
            pointer-events: auto;
          }
          .shop-grid-layout {
            grid-template-columns: 1fr !important;
          }
          .shop-filters-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            width: 320px !important;
            max-width: 85vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            z-index: 1050 !important;
            transform: translateX(-105%) !important;
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
            border-radius: 0 !important;
            box-shadow: 0 10px 40px rgba(0,0,0,0.25) !important;
            overflow-y: auto !important;
            padding: 1.25rem !important;
            background: #FAF5EE !important;
          }
          .shop-filters-sidebar.drawer-open {
            transform: translateX(0) !important;
          }
          .mobile-drawer-close-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
