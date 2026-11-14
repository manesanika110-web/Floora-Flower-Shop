import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flower2, Instagram, Facebook, Twitter, Youtube, Heart } from 'lucide-react';
import { getHomeContent, subscribeHomeContent } from '../services/homeContentService';

export const Footer = () => {
  const [footerData, setFooterData] = useState(() => getHomeContent().footer);

  useEffect(() => {
    const unsub = subscribeHomeContent((content) => {
      if (content && content.footer) {
        setFooterData(content.footer);
      }
    });
    return unsub;
  }, []);

  return (
    <footer style={{
      backgroundColor: '#FFFFFF',
      color: '#1C3728',
      paddingTop: '2.5rem',
      paddingBottom: '1.5rem',
      marginTop: 'auto',
      borderTop: '1px solid #ECE3D7'
    }}>
      <div className="container">

        {/* Main Footer Grid - 4 Compact Columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.75rem 2rem',
          paddingBottom: '1.75rem',
          borderBottom: '1px solid #ECE3D7'
        }} className="footer-compact-grid">

          {/* Column 1: Brand Info */}
          <div style={{ maxWidth: '280px' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem', textDecoration: 'none' }}>
              <img 
                src="/floora_logo_icon.png" 
                alt="Floora" 
                style={{
                  width: '32px',
                  height: '32px',
                  objectFit: 'contain',
                  flexShrink: 0
                }}
              />
              <span className="font-serif" style={{ fontSize: '1.45rem', fontWeight: 700, color: '#1C3728', lineHeight: 1 }}>
                Floora
              </span>
            </Link>

            <p style={{ fontSize: '0.84rem', color: '#2D4B37', lineHeight: 1.5, margin: '0 0 0.95rem' }}>
              {footerData.brandBio || 'Artisanal blooms, sacred Indian flowers & luxury hand-tied bouquets, delivered fresh.'}
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {footerData.socialLinks?.facebook && (
                <a href={footerData.socialLinks.facebook} className="footer-mini-social" title="Facebook" aria-label="Facebook">
                  <Facebook size={13} />
                </a>
              )}
              {footerData.socialLinks?.instagram && (
                <a href={footerData.socialLinks.instagram} className="footer-mini-social" title="Instagram" aria-label="Instagram">
                  <Instagram size={13} />
                </a>
              )}
              {footerData.socialLinks?.twitter && (
                <a href={footerData.socialLinks.twitter} className="footer-mini-social" title="Twitter" aria-label="Twitter">
                  <Twitter size={13} />
                </a>
              )}
              {footerData.socialLinks?.youtube && (
                <a href={footerData.socialLinks.youtube} className="footer-mini-social" title="YouTube" aria-label="YouTube">
                  <Youtube size={13} />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Floral Collections */}
          <div>
            <h4 className="footer-mini-heading">Collections</h4>
            <ul className="footer-mini-list">
              <li><Link to="/shop?origin=Indian" className="footer-mini-link">Indian Flowers</Link></li>
              <li><Link to="/shop?origin=International" className="footer-mini-link">International Flowers</Link></li>
              <li><Link to="/shop?category=Bouquets" className="footer-mini-link">Bouquets</Link></li>
              <li><Link to="/shop?category=Flower%20Pots" className="footer-mini-link">Flower Pots</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h4 className="footer-mini-heading">Customer Care</h4>
            <ul className="footer-mini-list">
              <li><Link to="/shop" className="footer-mini-link">Shop All Flowers</Link></li>
              <li><Link to="/orders" className="footer-mini-link">Track Orders</Link></li>
              <li><Link to="/wishlist" className="footer-mini-link">Wishlist</Link></li>
              <li><Link to="/profile" className="footer-mini-link">My Account</Link></li>
            </ul>
          </div>

          {/* Column 4: Quality & Trust */}
          <div>
            <h4 className="footer-mini-heading">Floora Promise</h4>
            <ul className="footer-mini-list">
              {(footerData.promiseList && footerData.promiseList.length > 0 ? footerData.promiseList : [
                '🌿 100% Dawn-Harvested Fresh',
                '💧 Chilled Moisture Delivery',
                '🚚 Express Same-Day Shipping',
                '✨ Handcrafted by Floral Artists'
              ]).map((promise, idx) => (
                <li key={idx} className="footer-promise-item">{promise}</li>
              ))}
            </ul>
          </div>

        </div>

        {/* Slim Bottom Bar */}
        <div style={{
          paddingTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.6rem',
          fontSize: '0.78rem',
          color: '#3B5945'
        }}>
          <div>
            &copy; {new Date().getFullYear()} {footerData.copyrightNote || 'Floora Flower Boutique. All rights reserved.'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#3B5945' }}>
            <span>Handcrafted with</span>
            <Heart size={12} style={{ color: '#E06D53', fill: '#E06D53' }} />
            <span>for heartfelt moments</span>
          </div>
        </div>

      </div>

      {/* Scoped CSS for Clean White Footer with Green Text and Gold Hover */}
      <style>{`
        .footer-mini-heading {
          font-size: 0.88rem;
          font-weight: 700;
          color: #1C3728;
          margin-bottom: 0.75rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .footer-mini-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          padding: 0;
          margin: 0;
        }

        .footer-mini-link {
          font-size: 0.83rem;
          color: #274C37;
          text-decoration: none;
          transition: transform 0.2s ease, color 0.2s ease;
          display: inline-block;
          font-weight: 500;
        }

        .footer-mini-link:hover {
          color: #C89B59 !important;
          transform: translateX(3px);
          font-weight: 600;
        }

        .footer-promise-item {
          font-size: 0.82rem;
          color: #274C37;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 500;
        }

        .footer-mini-social {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid #C4D6CA;
          background-color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1C3728;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .footer-mini-social:hover {
          background-color: #C89B59;
          color: #FFFFFF;
          border-color: #C89B59;
          transform: translateY(-2px);
        }

        @media (max-width: 600px) {
          .footer-compact-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 1.5rem 1rem !important;
          }
        }
      `}</style>
    </footer>
  );
};
