import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  Flower2,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import {
  INDIAN_FLOWERS,
  INTERNATIONAL_FLOWERS,
  BOUQUET_TYPES
} from '../data/products';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileAccordions, setMobileAccordions] = useState({
    indian: false,
    international: false,
    bouquets: false
  });
  const [isScrolled, setIsScrolled] = useState(false);

  const { totalItemsCount } = useCart();
  const [cartBouncing, setCartBouncing] = useState(false);
  const prevCountRef = React.useRef(totalItemsCount);

  useEffect(() => {
    if (totalItemsCount > prevCountRef.current) {
      setCartBouncing(true);
      const timer = setTimeout(() => setCartBouncing(false), 650);
      prevCountRef.current = totalItemsCount;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = totalItemsCount;
  }, [totalItemsCount]);
  const { wishlistCount } = useWishlist();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Track window scroll for transparent-to-solid navbar transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setIsScrolled(window.scrollY > 30);
  }, [location.pathname, location.search]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const toggleAccordion = (key) => {
    setMobileAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isHome = location.pathname === '/' || location.pathname === '';
  const isTransparent = isHome && !isScrolled && !mobileMenuOpen && !searchOpen;

  const headerBgColor = isTransparent
    ? 'transparent'
    : (isHome && isScrolled ? 'rgba(255, 255, 255, 0.68)' : 'rgba(255, 255, 255, 0.76)');

  return (
    <>
      <header
        className={`site-header ${isTransparent ? 'navbar-transparent' : 'navbar-solid'}`}
        style={{
          position: isHome ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          zIndex: 1000,
          backgroundColor: headerBgColor,
          backdropFilter: isTransparent ? 'none' : 'blur(16px) saturate(140%)',
          WebkitBackdropFilter: isTransparent ? 'none' : 'blur(16px) saturate(140%)',
          borderBottom: isTransparent ? 'none' : '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: isTransparent ? 'none' : '0 4px 20px rgba(45, 37, 32, 0.05), inset 0 -1px 0 rgba(236, 227, 215, 0.6)',
          width: '100%',
          transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease'
        }}
      >
        <div className="container site-header-container">

          {/* 1. FLOORA LOGO */}
          <Link to="/" className="navbar-logo-link">
            <img
              src="/floora_logo_icon.png"
              alt="Floora Logo"
              className="logo-icon-img"
            />
            <div className="logo-text-block">
              <span className="font-serif logo-title">
                Floora
              </span>
              <span className="logo-sub">
                Flower Boutique
              </span>
            </div>
          </Link>

          {/* 2. DESKTOP MAIN NAVIGATION */}
          <nav className="desktop-navbar" style={{ display: 'none' }}>

            {/* Home */}
            <NavLink
              to="/"
              className={({ isActive }) => `nav-item-link ${isActive && location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </NavLink>

            {/* Shop All */}
            <NavLink
              to="/shop"
              className={({ isActive }) => `nav-item-link ${isActive && location.pathname === '/shop' && !location.search ? 'active' : ''}`}
            >
              Shop All
            </NavLink>

            {/* Indian Flowers Dropdown */}
            <div
              className="nav-dropdown-wrapper"
              onMouseEnter={() => setActiveDropdown('indian')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                className={`nav-dropdown-trigger ${activeDropdown === 'indian' ? 'open' : ''}`}
                onClick={() => setActiveDropdown(activeDropdown === 'indian' ? null : 'indian')}
              >
                <span>Indian Flowers</span>
                <ChevronDown size={14} className="dropdown-arrow" />
              </button>

              <div className={`nav-dropdown-menu ${activeDropdown === 'indian' ? 'show' : ''}`}>
                <div className="dropdown-header-banner">
                  <span className="dropdown-banner-title">Authentic Indian Harvest</span>
                  <Link to="/shop?origin=Indian" className="dropdown-view-all">View All →</Link>
                </div>
                <div className="dropdown-items-grid col-1">
                  {INDIAN_FLOWERS.map(flower => (
                    <Link
                      key={flower}
                      to={`/shop?flower=${encodeURIComponent(flower)}`}
                      className="dropdown-item-row"
                    >
                      <span className="flower-bullet">🌸</span>
                      <span className="flower-label">{flower}</span>
                    </Link>

                  ))}
                </div>
              </div>
            </div>

            {/* International Flowers Dropdown */}
            <div
              className="nav-dropdown-wrapper"
              onMouseEnter={() => setActiveDropdown('international')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                className={`nav-dropdown-trigger ${activeDropdown === 'international' ? 'open' : ''}`}
                onClick={() => setActiveDropdown(activeDropdown === 'international' ? null : 'international')}
              >
                <span>International Flowers</span>
                <ChevronDown size={14} className="dropdown-arrow" />
              </button>

              <div className={`nav-dropdown-menu ${activeDropdown === 'international' ? 'show' : ''}`} style={{ minWidth: '320px' }}>
                <div className="dropdown-header-banner">
                  <span className="dropdown-banner-title">Imported & Exotic Stems</span>
                  <Link to="/shop?origin=International" className="dropdown-view-all">View All →</Link>
                </div>
                <div className="dropdown-items-grid col-2">
                  {INTERNATIONAL_FLOWERS.map(flower => (
                    <Link
                      key={flower}
                      to={`/shop?flower=${encodeURIComponent(flower)}`}
                      className="dropdown-item-row"
                    >
                      <span className="flower-bullet">🌷</span>
                      <span className="flower-label">{flower}</span>
                    </Link>

                  ))}
                </div>
              </div>
            </div>

            {/* Bouquets Dropdown */}
            <div
              className="nav-dropdown-wrapper"
              onMouseEnter={() => setActiveDropdown('bouquets')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                className={`nav-dropdown-trigger ${activeDropdown === 'bouquets' ? 'open' : ''}`}
                onClick={() => setActiveDropdown(activeDropdown === 'bouquets' ? null : 'bouquets')}
              >
                <span>Bouquets</span>
                <ChevronDown size={14} className="dropdown-arrow" />
              </button>

              <div className={`nav-dropdown-menu ${activeDropdown === 'bouquets' ? 'show' : ''}`} style={{ minWidth: '270px' }}>
                <div className="dropdown-header-banner">
                  <span className="dropdown-banner-title">Artisanal Floral Bouquets</span>
                  <Link to="/shop?category=Bouquets" className="dropdown-view-all">View All →</Link>
                </div>
                <div className="dropdown-items-grid col-1">
                  {BOUQUET_TYPES.map(bq => (
                    <Link
                      key={bq}
                      to={`/shop?bouquet=${encodeURIComponent(bq)}`}
                      className="dropdown-item-row"
                    >
                      <span className="flower-bullet">💐</span>
                      <span className="flower-label">{bq}</span>
                    </Link>

                  ))}
                </div>
              </div>
            </div>

          </nav>

          {/* 3. RIGHT-SIDE ICONS: Search, Wishlist, Profile, Cart, Hamburger */}
          <div className="navbar-right-actions">

            {/* 1. Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className={`action-icon-btn ${searchOpen ? 'active' : ''}`}
              title="Search Flowers"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* 2. Wishlist Button with Live Count Badge */}
            <Link
              to="/wishlist"
              className="action-icon-btn"
              title="My Wishlist"
              aria-label="Wishlist"
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="nav-badge-count">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* 3. Profile / My Account Button */}
            <Link
              to={currentUser ? "/profile" : "/auth"}
              className="account-link-btn"
              title={currentUser ? (currentUser.fullName || currentUser.displayName || "My Profile") : "My Account / Sign In"}
              aria-label="Profile"
            >
              {currentUser ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <div className="account-avatar-dot">
                    {(currentUser.fullName || currentUser.displayName || 'A')[0].toUpperCase()}
                  </div>
                  <span className="account-text-label" style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                    {(currentUser.fullName || currentUser.displayName || 'Account').split(' ')[0]}
                  </span>
                </div>
              ) : (
                <>
                  <User size={18} />
                  <span className="account-text-label">Sign In</span>
                </>
              )}
            </Link>

            {/* 4. Shopping Cart Button with Live Count Badge */}
            <Link
              to="/cart"
              className={`action-icon-btn ${cartBouncing ? 'nav-cart-bounce' : ''}`}
              title="Shopping Cart"
              aria-label="Cart"
            >
              <ShoppingBag size={18} />
              {totalItemsCount > 0 && (
                <span className="nav-badge-count">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* Direct Logout Button when user is logged in (desktop only) */}
            {currentUser && (
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate('/auth');
                }}
                className="action-icon-btn nav-logout-btn"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={17} />
              </button>
            )}

            {/* 5. Mobile Hamburger Toggle */}
            <button
              type="button"
              className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

          </div>

        </div>

        {/* SEARCH EXPANDABLE OVERLAY */}
        {searchOpen && (
          <div className="search-expand-bar animate-fade-in">
            <form onSubmit={handleSearchSubmit} className="container search-form-box">
              <Search size={18} style={{ color: 'var(--text-muted)', marginLeft: '10px', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search flowers, bouquets, colors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="search-input-field"
              />
              <button type="submit" className="btn btn-primary btn-sm search-submit-btn">
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="search-close-btn"
                aria-label="Close Search"
              >
                <X size={18} />
              </button>
            </form>
          </div>
        )}

        {/* MOBILE BACKDROP OVERLAY */}
        {mobileMenuOpen && (
          <div
            className="mobile-drawer-backdrop animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* MOBILE RESPONSIVE DRAWER */}
        {mobileMenuOpen && (
          <div className="mobile-drawer animate-fade-in" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
            <div className="container mobile-drawer-inner">

              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                <span>🏡 Home</span>
                <span className="mobile-link-arrow">→</span>
              </Link>


              <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                <span>🛍️ Shop All</span>
                <span className="mobile-link-arrow">→</span>
              </Link>


              {/* Mobile Accordion: Indian Flowers */}
              <div className="mobile-accordion-section">
                <button
                  type="button"
                  onClick={() => toggleAccordion('indian')}
                  className="mobile-accordion-header"
                >
                  <span>🌸 Indian Flowers</span>
                  <ChevronDown size={16} className={`accordion-caret ${mobileAccordions.indian ? 'rotated' : ''}`} />
                </button>
                {mobileAccordions.indian && (
                  <div className="mobile-accordion-body">
                    <Link to="/shop?origin=Indian" onClick={() => setMobileMenuOpen(false)} className="mobile-sublink highlight">
                      All Indian Flowers →
                    </Link>

                    {INDIAN_FLOWERS.map(f => (
                      <Link
                        key={f}
                        to={`/shop?flower=${encodeURIComponent(f)}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="mobile-sublink"
                      >
                        {f}
                      </Link>

                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Accordion: International Flowers */}
              <div className="mobile-accordion-section">
                <button
                  type="button"
                  onClick={() => toggleAccordion('international')}
                  className="mobile-accordion-header"
                >
                  <span>🌷 International Flowers</span>
                  <ChevronDown size={16} className={`accordion-caret ${mobileAccordions.international ? 'rotated' : ''}`} />
                </button>
                {mobileAccordions.international && (
                  <div className="mobile-accordion-body">
                    <Link to="/shop?origin=International" onClick={() => setMobileMenuOpen(false)} className="mobile-sublink highlight">
                      All International Flowers →
                    </Link>

                    {INTERNATIONAL_FLOWERS.map(f => (
                      <Link
                        key={f}
                        to={`/shop?flower=${encodeURIComponent(f)}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="mobile-sublink"
                      >
                        {f}
                      </Link>

                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Accordion: Bouquets */}
              <div className="mobile-accordion-section">
                <button
                  type="button"
                  onClick={() => toggleAccordion('bouquets')}
                  className="mobile-accordion-header"
                >
                  <span>💐 Bouquets</span>
                  <ChevronDown size={16} className={`accordion-caret ${mobileAccordions.bouquets ? 'rotated' : ''}`} />
                </button>
                {mobileAccordions.bouquets && (
                  <div className="mobile-accordion-body">
                    <Link to="/shop?category=Bouquets" onClick={() => setMobileMenuOpen(false)} className="mobile-sublink highlight">
                      All Bouquets →
                    </Link>

                    {BOUQUET_TYPES.map(b => (
                      <Link
                        key={b}
                        to={`/shop?bouquet=${encodeURIComponent(b)}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="mobile-sublink"
                      >
                        {b}
                      </Link>

                    ))}
                  </div>
                )}
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.75rem 0' }} />

              <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                <span>📦 My Orders</span>
              </Link>


              <Link
                to={currentUser ? "/profile" : "/auth"}
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
                style={{ color: 'var(--primary)', fontWeight: 600 }}
              >
                <span>👤 {currentUser ? "My Account" : "Sign In / Register"}</span>
              </Link>
              {currentUser && (
                <button
                  type="button"
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                    navigate('/auth');
                  }}
                  className="mobile-nav-link"
                  style={{
                    color: '#E03131',
                    fontWeight: 600,
                    background: 'none',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 0'
                  }}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              )}


            </div>
          </div>
        )}

      </header>

      {/* NAVBAR STYLES */}
      <style>{`
        /* Transparent Navbar on Home */
        .navbar-transparent {
          background-color: transparent !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          border-bottom: none !important;
          box-shadow: none !important;
        }

        .navbar-transparent .nav-item-link,
        .navbar-transparent .nav-dropdown-trigger {
          color: var(--text-dark);
          font-weight: 550;
        }

        .navbar-transparent .nav-item-link:hover,
        .navbar-transparent .nav-item-link.active,
        .navbar-transparent .nav-dropdown-trigger:hover,
        .navbar-transparent .nav-dropdown-trigger.open {
          color: var(--primary);
        }

        .navbar-transparent .account-link-btn {
          background-color: rgba(255, 255, 255, 0.68);
          border: 1px solid rgba(220, 210, 200, 0.7);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .navbar-transparent .account-link-btn:hover {
          background-color: #FFFFFF;
          border-color: var(--primary);
          color: var(--primary);
        }

        .navbar-transparent .action-icon-btn {
          background-color: rgba(255, 255, 255, 0.75);
          border: 1px solid rgba(220, 210, 200, 0.6);
        }

        .navbar-transparent .action-icon-btn:hover {
          background-color: #FFFFFF;
          border-color: var(--primary);
          color: var(--primary);
        }

        @media (min-width: 960px) {
          .desktop-navbar {
            display: flex !important;
            align-items: center;
            gap: 1.5rem;
          }
          .mobile-menu-toggle {
            display: none !important;
          }
        }

        .nav-item-link {
          font-size: 0.92rem;
          font-weight: 500;
          color: var(--text);
          padding: 0.5rem 0.2rem;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          transition: var(--transition);
          white-space: nowrap;
          border-bottom: 2px solid transparent;
        }

        /* Smooth Golden Underline Hover & Active Animation */
        .nav-item-link,
        .nav-dropdown-trigger {
          position: relative;
        }

        .nav-item-link::after,
        .nav-dropdown-trigger::after {
          content: '';
          position: absolute;
          bottom: 0px;
          left: 0;
          width: 100%;
          height: 2.5px;
          background: linear-gradient(90deg, #D4AF37 0%, #F5CE66 50%, #D4AF37 100%);
          border-radius: 4px;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.32s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.32s ease;
          opacity: 0;
          box-shadow: 0 1px 6px rgba(212, 175, 55, 0.5);
          pointer-events: none;
        }

        .nav-item-link:hover::after,
        .nav-item-link.active::after,
        .nav-dropdown-trigger:hover::after,
        .nav-dropdown-trigger.open::after,
        .nav-dropdown-wrapper:hover .nav-dropdown-trigger::after {
          transform: scaleX(1);
          opacity: 1;
        }

        .nav-item-link:hover, .nav-item-link.active {
          color: var(--primary);
          border-bottom-color: transparent;
        }

        /* Dropdown wrapper & triggers */
        .nav-dropdown-wrapper {
          position: relative;
          padding: 0.5rem 0;
        }

        .nav-dropdown-trigger {
          font-size: 0.92rem;
          font-weight: 500;
          color: var(--text);
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.5rem 0.2rem;
          transition: var(--transition);
          white-space: nowrap;
          cursor: pointer;
          background: none;
          border: none;
        }

        .nav-dropdown-trigger:hover, .nav-dropdown-trigger.open {
          color: var(--primary);
        }

        .dropdown-arrow {
          transition: transform 0.2s ease;
          color: var(--text-muted);
        }

        .nav-dropdown-trigger.open .dropdown-arrow,
        .nav-dropdown-wrapper:hover .dropdown-arrow {
          transform: rotate(180deg);
          color: var(--primary);
        }

        /* Dropdown menu card */
        .nav-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background-color: rgba(255, 255, 255, 0.76);
          backdrop-filter: blur(20px) saturate(140%);
          -webkit-backdrop-filter: blur(20px) saturate(140%);
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 255, 255, 0.85);
          box-shadow: 0 16px 36px rgba(28, 55, 40, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.9);
          padding: 0.85rem;
          min-width: 240px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1050;
        }

        .nav-dropdown-wrapper:hover .nav-dropdown-menu,
        .nav-dropdown-menu.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-header-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.4rem 0.6rem 0.75rem;
          margin-bottom: 0.4rem;
          border-bottom: 1px solid var(--border);
        }

        .dropdown-banner-title {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-weight: 700;
          color: var(--primary);
        }

        .dropdown-view-all {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          transition: var(--transition);
        }

        .dropdown-view-all:hover {
          color: var(--primary);
        }

        .dropdown-items-grid {
          display: grid;
          gap: 0.2rem;
        }

        .dropdown-items-grid.col-1 {
          grid-template-columns: 1fr;
        }

        .dropdown-items-grid.col-2 {
          grid-template-columns: 1fr 1fr;
          column-gap: 0.85rem;
        }

        .dropdown-item-row {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.45rem 0.65rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text);
          transition: var(--transition);
          white-space: nowrap;
        }

        .dropdown-item-row:hover {
          background-color: var(--card-bg);
          color: var(--primary);
          transform: translateX(3px);
        }

        .flower-bullet {
          font-size: 0.95rem;
          line-height: 1;
        }

        .flower-label {
          line-height: 1.2;
        }

        .color-swatch-dot {
          width: 13px;
          height: 13px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }

        /* Site Header Container & Responsive Heights */
        .site-header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 75px;
          gap: 1rem;
          width: 100%;
        }

        /* Responsive Floora Logo */
        .navbar-logo-link {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-shrink: 0;
          text-decoration: none;
        }

        .logo-icon-img {
          width: 42px;
          height: 42px;
          object-fit: contain;
          flex-shrink: 0;
          transition: transform 0.25s ease;
        }

        .logo-text-block {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          font-size: 1.65rem;
          font-weight: 700;
          color: var(--primary);
          letter-spacing: -0.5px;
          line-height: 1;
        }

        .logo-sub {
          font-size: 0.62rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .site-header-container {
            height: 60px;
            gap: 0.4rem;
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }

          .navbar-logo-link {
            gap: 0.4rem;
          }

          .logo-icon-img {
            width: 34px;
            height: 34px;
          }

          .logo-title {
            font-size: 1.35rem;
          }

          .logo-sub {
            font-size: 0.52rem;
            letter-spacing: 0.6px;
          }
        }

        @media (max-width: 480px) {
          .site-header-container {
            height: 56px;
            gap: 0.25rem;
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }

          .navbar-logo-link {
            gap: 0.3rem;
          }

          .logo-icon-img {
            width: 28px;
            height: 28px;
          }

          .logo-title {
            font-size: 1.2rem;
          }

          .logo-sub {
            display: none;
          }
        }

        @media (max-width: 360px) {
          .site-header-container {
            padding-left: 0.35rem !important;
            padding-right: 0.35rem !important;
            gap: 0.15rem;
          }
          .navbar-logo-link {
            gap: 0.25rem;
          }
          .logo-icon-img {
            width: 26px;
            height: 26px;
          }
          .logo-title {
            font-size: 1.1rem;
          }
        }

        /* Right Side Actions */
        .navbar-right-actions {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-shrink: 0;
          flex-wrap: nowrap;
        }

        @media (max-width: 768px) {
          .navbar-right-actions {
            gap: 0.35rem;
            flex-wrap: nowrap;
          }
        }

        @media (max-width: 480px) {
          .navbar-right-actions {
            gap: 0.2rem;
            flex-wrap: nowrap;
          }
        }

        @media (max-width: 360px) {
          .navbar-right-actions {
            gap: 0.15rem;
          }
        }

        /* Action Buttons */
        .action-icon-btn {
          position: relative;
          color: var(--text);
          width: 40px;
          height: 40px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: var(--transition);
          background: transparent;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
        }

        .action-icon-btn:hover,
        .action-icon-btn.active {
          background-color: var(--card-bg);
          color: var(--primary);
        }

        .nav-badge-count {
          position: absolute;
          top: -2px;
          right: -2px;
          background-color: var(--primary);
          color: #FFFFFF;
          font-size: 0.68rem;
          font-weight: 700;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #FFFFFF;
        }

        .account-link-btn {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.45rem 0.95rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border);
          background-color: var(--card-bg);
          color: var(--text);
          font-size: 0.85rem;
          font-weight: 600;
          transition: var(--transition);
          flex-shrink: 0;
        }

        .account-link-btn:hover {
          background-color: #FFFFFF;
          border-color: var(--primary);
          color: var(--primary);
        }

        .account-avatar-dot {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #C5A97A;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.88rem;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .account-text-label {
            display: none !important;
          }
          .account-link-btn {
            padding: 0 !important;
            width: 36px;
            height: 36px;
            justify-content: center;
            border-radius: 50%;
          }
          .account-avatar-dot {
            width: 28px;
            height: 28px;
            font-size: 0.82rem;
          }
          .action-icon-btn {
            width: 36px;
            height: 36px;
          }
          .nav-logout-btn {
            display: none !important;
          }
        }

        @media (max-width: 480px) {
          .action-icon-btn {
            width: 32px;
            height: 32px;
          }
          .account-link-btn {
            width: 32px;
            height: 32px;
          }
          .account-avatar-dot {
            width: 26px;
            height: 26px;
            font-size: 0.78rem;
          }
          .nav-badge-count {
            top: -3px;
            right: -3px;
            width: 15px;
            height: 15px;
            font-size: 0.6rem;
          }
        }

        @media (max-width: 360px) {
          .action-icon-btn,
          .account-link-btn,
          .mobile-menu-toggle {
            width: 29px !important;
            height: 29px !important;
          }
          .account-avatar-dot {
            width: 22px !important;
            height: 22px !important;
            font-size: 0.7rem !important;
          }
        }

        /* Mobile Hamburger Toggle */
        .mobile-menu-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid rgba(220, 210, 200, 0.7);
          color: var(--text);
          cursor: pointer;
          transition: var(--transition);
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        }

        .mobile-menu-toggle:hover,
        .mobile-menu-toggle.open {
          background-color: #FFFFFF;
          border-color: var(--primary);
          color: var(--primary);
        }

        @media (max-width: 959px) {
          .mobile-menu-toggle {
            display: flex !important;
          }
        }

        @media (max-width: 768px) {
          .mobile-menu-toggle {
            width: 36px;
            height: 36px;
          }
        }

        @media (max-width: 480px) {
          .mobile-menu-toggle {
            width: 32px;
            height: 32px;
          }
        }

        /* Expandable search bar */
        .search-expand-bar {
          background-color: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(18px) saturate(140%);
          -webkit-backdrop-filter: blur(18px) saturate(140%);
          border-top: 1px solid rgba(255, 255, 255, 0.8);
          border-bottom: 1px solid rgba(236, 227, 215, 0.8);
          padding: 0.75rem 0;
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }

        .search-form-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          max-width: 680px;
          background-color: #FFFFFF;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-full);
          padding: 4px 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }

        .search-input-field {
          flex: 1;
          min-width: 0;
          border: none;
          background: transparent;
          font-size: 0.92rem;
          color: var(--text);
          padding: 0.4rem 0.5rem;
          outline: none;
        }

        @media (max-width: 480px) {
          .search-input-field {
            font-size: 0.85rem;
          }
          .search-submit-btn {
            padding: 0.35rem 0.85rem !important;
            font-size: 0.82rem !important;
          }
        }

        .search-close-btn {
          color: var(--text-muted);
          padding: 6px;
          border-radius: 50%;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Mobile Backdrop Overlay */
        .mobile-drawer-backdrop {
          position: fixed;
          top: 75px;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 998;
        }

        @media (max-width: 768px) {
          .mobile-drawer-backdrop {
            top: 65px;
          }
        }

        @media (max-width: 480px) {
          .mobile-drawer-backdrop {
            top: 60px;
          }
        }

        /* Mobile Drawer */
        .mobile-drawer {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          max-height: calc(100vh - 75px);
          overflow-y: auto;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          background-color: rgba(255, 255, 255, 0.97);
          backdrop-filter: blur(24px) saturate(150%);
          -webkit-backdrop-filter: blur(24px) saturate(150%);
          border-top: 1px solid rgba(236, 227, 215, 0.9);
          border-bottom: 1px solid rgba(236, 227, 215, 0.9);
          box-shadow: 0 16px 36px rgba(28, 55, 40, 0.16);
          z-index: 999;
        }

        @media (max-width: 768px) {
          .mobile-drawer {
            max-height: calc(100vh - 65px);
          }
        }

        @media (max-width: 480px) {
          .mobile-drawer {
            max-height: calc(100vh - 60px);
          }
        }

        .mobile-drawer-inner {
          padding: 1rem 0.85rem 2.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .mobile-nav-link {
          padding: 0.75rem 1rem;
          font-weight: 550;
          font-size: 0.96rem;
          color: var(--text);
          border-radius: var(--radius-sm);
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .mobile-link-arrow {
          color: var(--text-muted);
          font-size: 0.88rem;
          transition: transform 0.2s ease;
        }

        .mobile-nav-link:hover,
        .mobile-nav-link.active {
          background-color: rgba(28, 55, 40, 0.06);
          color: var(--primary);
        }

        .mobile-nav-link:hover .mobile-link-arrow {
          transform: translateX(3px);
          color: var(--primary);
        }

        .mobile-accordion-section {
          border-radius: var(--radius-sm);
          background: rgba(251, 248, 243, 0.65);
          border: 1px solid rgba(236, 227, 215, 0.75);
          overflow: hidden;
          margin-bottom: 0.25rem;
        }

        .mobile-accordion-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text);
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
        }

        .mobile-accordion-header:hover {
          color: var(--primary);
        }

        .accordion-caret {
          transition: transform 0.2s ease;
          color: var(--text-muted);
        }

        .accordion-caret.rotated {
          transform: rotate(180deg);
          color: var(--primary);
        }

        .mobile-accordion-body {
          padding: 0.5rem 1rem 0.9rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.45rem 0.75rem;
          border-top: 1px dashed rgba(236, 227, 215, 0.9);
          background: rgba(255, 255, 255, 0.75);
        }

        .mobile-accordion-body .mobile-sublink.highlight {
          grid-column: 1 / -1;
          padding-bottom: 0.4rem;
          border-bottom: 1px solid rgba(236, 227, 215, 0.6);
          font-weight: 700;
          color: var(--primary);
        }

        .mobile-sublink {
          font-size: 0.88rem;
          color: var(--text-muted);
          padding: 0.35rem 0;
          transition: var(--transition);
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mobile-sublink:hover {
          color: var(--primary);
        }

        .color-flex {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .color-grid-mobile {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
      `}</style>
    </>
  );
};
