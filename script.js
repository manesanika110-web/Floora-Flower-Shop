/**
 * ============================================================================
 * PHOOLWALA - FLOWER SHOP E-COMMERCE ENGINE
 * Brand: Phoolwala ("Fresh flowers, delivered with love")
 * Single Page Application logic: 3D Flip Cards, Cart, Wishlist, Checkout,
 * Orders Tracker, Profile/Address Book, Dark Mode, and Micro-Animations.
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. BRAND & APP CONFIGURATION
  // --------------------------------------------------------------------------
  const APP_CONFIG = {
    brandName: 'Phoolwala',
    tagline: 'Fresh flowers, delivered with love',
    currencySymbol: '₹',
    freeShippingThreshold: 999,
    deliveryFee: 99,
    validCoupons: {
      'FLORA10': 0.10,   // 10% discount
      'BLOOM20': 0.20,   // 20% discount
      'FREESHIP': 'FREE' // Free shipping
    }
  };

  // --------------------------------------------------------------------------
  // 2. FLORAL ARTWORK GENERATOR (INLINE SVG ILLUSTRATIONS)
  // Generates clean, vibrant vector art for each flower variety
  // --------------------------------------------------------------------------
  const FlowerArt = {
    roses: () => `
      <svg viewBox="0 0 200 200" class="flower-svg-art" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="roseRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FF4D6D" />
            <stop offset="50%" stop-color="#D6336C" />
            <stop offset="100%" stop-color="#800F2F" />
          </linearGradient>
          <linearGradient id="leafGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#51CF66" />
            <stop offset="100%" stop-color="#2F9E6B" />
          </linearGradient>
        </defs>
        <!-- Stem & Leaves -->
        <path d="M100 110 Q98 150 100 185" stroke="url(#leafGreen)" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M100 145 Q70 135 60 155 Q80 165 100 150" fill="url(#leafGreen)"/>
        <path d="M100 130 Q130 115 140 135 Q120 150 100 135" fill="url(#leafGreen)"/>
        <!-- Rose Outer Petals -->
        <circle cx="100" cy="85" r="45" fill="url(#roseRed)" opacity="0.95"/>
        <path d="M70 70 Q100 40 130 70 Q145 105 100 120 Q55 105 70 70Z" fill="#C2255C"/>
        <!-- Mid Petals -->
        <path d="M80 75 Q100 55 120 75 Q130 98 100 110 Q70 98 80 75Z" fill="#E64980"/>
        <!-- Inner Spiral -->
        <path d="M90 80 Q100 68 110 80 Q118 95 100 102 Q82 95 90 80Z" fill="#FF758F"/>
        <circle cx="100" cy="86" r="6" fill="#F4B942"/>
        <!-- Dewdrops -->
        <circle cx="118" cy="72" r="2.5" fill="#FFFFFF" opacity="0.8"/>
      </svg>
    `,
    lilies: () => `
      <svg viewBox="0 0 200 200" class="flower-svg-art" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lilyPink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFF0F6" />
            <stop offset="50%" stop-color="#F783AC" />
            <stop offset="100%" stop-color="#D6336C" />
          </linearGradient>
        </defs>
        <!-- Stem -->
        <path d="M100 115 Q102 150 100 185" stroke="#2F9E6B" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M100 140 Q135 130 145 150 Q120 160 100 145" fill="#40C057"/>
        <!-- Lily Star Petals -->
        <path d="M100 40 C90 70 95 85 100 100 C105 85 110 70 100 40Z" fill="url(#lilyPink)"/>
        <path d="M50 70 C75 80 85 90 100 100 C85 95 70 90 50 70Z" fill="url(#lilyPink)"/>
        <path d="M150 70 C125 80 115 90 100 100 C115 95 130 90 150 70Z" fill="url(#lilyPink)"/>
        <path d="M65 130 C85 115 90 105 100 100 C90 115 85 125 65 130Z" fill="url(#lilyPink)"/>
        <path d="M135 130 C115 115 110 105 100 100 C110 115 115 125 135 130Z" fill="url(#lilyPink)"/>
        <!-- Speckles & Stamens -->
        <circle cx="95" cy="88" r="1.5" fill="#800F2F"/>
        <circle cx="105" cy="85" r="1.5" fill="#800F2F"/>
        <circle cx="98" cy="94" r="1.5" fill="#800F2F"/>
        <line x1="100" y1="100" x2="88" y2="70" stroke="#F4B942" stroke-width="2"/>
        <circle cx="87" cy="69" r="3" fill="#D9480F"/>
        <line x1="100" y1="100" x2="112" y2="70" stroke="#F4B942" stroke-width="2"/>
        <circle cx="113" cy="69" r="3" fill="#D9480F"/>
        <line x1="100" y1="100" x2="100" y2="65" stroke="#F4B942" stroke-width="2"/>
        <circle cx="100" cy="64" r="3" fill="#D9480F"/>
      </svg>
    `,
    sunflowers: () => `
      <svg viewBox="0 0 200 200" class="flower-svg-art" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sunGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFE066" />
            <stop offset="60%" stop-color="#F4B942" />
            <stop offset="100%" stop-color="#F76707" />
          </linearGradient>
          <radialGradient id="sunCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#49281A" />
            <stop offset="70%" stop-color="#361A0C" />
            <stop offset="100%" stop-color="#210F07" />
          </radialGradient>
        </defs>
        <!-- Stem -->
        <path d="M100 115 Q98 150 100 185" stroke="#2F9E6B" stroke-width="7" stroke-linecap="round" fill="none"/>
        <path d="M100 145 Q65 130 50 155 Q80 165 100 150" fill="#2F9E6B"/>
        <!-- Radiating Petals (12 petals in circle) -->
        <g transform="translate(100, 90)">
          ${Array.from({ length: 14 }).map((_, i) => `
            <path d="M-9 -28 C-12 -58 0 -68 0 -68 C0 -68 12 -58 9 -28 Z" fill="url(#sunGold)" transform="rotate(${i * (360 / 14)})"/>
          `).join('')}
          <!-- Textured Core Center -->
          <circle cx="0" cy="0" r="30" fill="url(#sunCore)"/>
          <circle cx="0" cy="0" r="24" stroke="#F4B942" stroke-width="2" stroke-dasharray="3 3" fill="none" opacity="0.6"/>
          <circle cx="0" cy="0" r="16" stroke="#FFE066" stroke-width="2" stroke-dasharray="2 2" fill="none" opacity="0.5"/>
        </g>
      </svg>
    `,
    orchids: () => `
      <svg viewBox="0 0 200 200" class="flower-svg-art" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="orchidPurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F3D9FA" />
            <stop offset="50%" stop-color="#CC5DE8" />
            <stop offset="100%" stop-color="#862E9C" />
          </linearGradient>
        </defs>
        <!-- Arching Stem -->
        <path d="M70 185 Q90 140 100 90 Q105 60 120 40" stroke="#2F9E6B" stroke-width="5" stroke-linecap="round" fill="none"/>
        <!-- Upper Bloom -->
        <g transform="translate(115, 65)">
          <path d="M0 -30 C-15 -15 -10 5 0 10 C10 5 15 -15 0 -30Z" fill="url(#orchidPurple)"/>
          <path d="M-30 -5 C-15 -15 5 -10 10 0 C5 10 -15 15 -30 -5Z" fill="url(#orchidPurple)"/>
          <path d="M30 -5 C15 -15 -5 -10 -10 0 C-5 10 15 15 30 -5Z" fill="url(#orchidPurple)"/>
          <!-- Labellum / Lip -->
          <path d="M-10 5 Q0 25 10 5 Q5 0 -10 5Z" fill="#F06595"/>
          <circle cx="0" cy="4" r="3" fill="#F4B942"/>
        </g>
        <!-- Main Flower Bloom -->
        <g transform="translate(95, 115)">
          <path d="M0 -35 C-20 -18 -12 8 0 12 C12 8 20 -18 0 -35Z" fill="url(#orchidPurple)"/>
          <path d="M-36 -8 C-18 -18 8 -12 12 0 C8 12 -18 18 -36 -8Z" fill="url(#orchidPurple)"/>
          <path d="M36 -8 C18 -18 -8 -12 -12 0 C-8 12 18 18 36 -8Z" fill="url(#orchidPurple)"/>
          <path d="M-14 8 Q0 30 14 8 Q8 0 -14 8Z" fill="#D6336C"/>
          <circle cx="0" cy="6" r="4" fill="#F4B942"/>
        </g>
      </svg>
    `,
    bouquets: () => `
      <svg viewBox="0 0 200 200" class="flower-svg-art" xmlns="http://www.w3.org/2000/svg">
        <!-- Craft Paper Wrap -->
        <path d="M70 110 L85 185 L115 185 L130 110 Z" fill="#D8B48F" stroke="#B08968" stroke-width="2"/>
        <path d="M75 145 Q100 155 125 145" stroke="#D6336C" stroke-width="4" fill="none"/>
        <!-- Ribbon bow -->
        <circle cx="100" cy="148" r="5" fill="#D6336C"/>
        <!-- Flower Cluster -->
        <circle cx="85" cy="80" r="22" fill="#FF8787"/>
        <circle cx="115" cy="75" r="24" fill="#D6336C"/>
        <circle cx="100" cy="98" r="20" fill="#F783AC"/>
        <circle cx="70" cy="95" r="16" fill="#FFA8A8"/>
        <circle cx="130" cy="95" r="17" fill="#FCC2D7"/>
        <!-- Centers & accents -->
        <circle cx="85" cy="80" r="6" fill="#F4B942"/>
        <circle cx="115" cy="75" r="7" fill="#FFF"/>
        <circle cx="100" cy="98" r="5" fill="#F4B942"/>
        <!-- Eucalyptus greenery -->
        <circle cx="55" cy="75" r="8" fill="#51CF66" opacity="0.8"/>
        <circle cx="145" cy="70" r="9" fill="#2F9E6B" opacity="0.8"/>
      </svg>
    `,
    peonies: () => `
      <svg viewBox="0 0 200 200" class="flower-svg-art" xmlns="http://www.w3.org/2000/svg">
        <!-- Stem -->
        <path d="M100 120 Q102 155 100 185" stroke="#2F9E6B" stroke-width="6" stroke-linecap="round"/>
        <path d="M100 140 Q130 130 140 150 Q115 160 100 145" fill="#40C057"/>
        <!-- Peony Petal Layers (Ivory/Blush) -->
        <circle cx="100" cy="85" r="46" fill="#FFF0F6"/>
        <path d="M60 80 Q100 35 140 80 Q145 120 100 125 Q55 120 60 80Z" fill="#FFDEEB"/>
        <path d="M72 82 Q100 48 128 82 Q132 110 100 115 Q68 110 72 82Z" fill="#FCC2D7"/>
        <path d="M82 82 Q100 60 118 82 Q122 100 100 105 Q78 100 82 82Z" fill="#FAA2C1"/>
        <circle cx="100" cy="85" r="12" fill="#F4B942" opacity="0.85"/>
      </svg>
    `,
    gerberas: () => `
      <svg viewBox="0 0 200 200" class="flower-svg-art" xmlns="http://www.w3.org/2000/svg">
        <!-- Stem -->
        <path d="M100 110 Q98 150 100 185" stroke="#2F9E6B" stroke-width="6" stroke-linecap="round"/>
        <!-- Gerbera Radiating Petals -->
        <g transform="translate(100, 85)">
          ${Array.from({ length: 16 }).map((_, i) => `
            <ellipse cx="0" cy="-42" rx="6" ry="18" fill="#FF6B6B" transform="rotate(${i * 22.5})"/>
          `).join('')}
          ${Array.from({ length: 16 }).map((_, i) => `
            <ellipse cx="0" cy="-28" rx="4" ry="12" fill="#FF8787" transform="rotate(${i * 22.5 + 11.25})"/>
          `).join('')}
          <circle cx="0" cy="0" r="18" fill="#F4B942"/>
          <circle cx="0" cy="0" r="10" fill="#49281A"/>
        </g>
      </svg>
    `,
    pooja: () => `
      <svg viewBox="0 0 200 200" class="flower-svg-art" xmlns="http://www.w3.org/2000/svg">
        <!-- Brass Bowl Base -->
        <ellipse cx="100" cy="165" rx="55" ry="16" fill="#F4B942" stroke="#E8590C" stroke-width="2"/>
        <path d="M45 165 Q100 195 155 165 Z" fill="#D9480F"/>
        <!-- Marigold Garland Ring -->
        <circle cx="65" cy="150" r="12" fill="#F76707"/>
        <circle cx="85" cy="158" r="13" fill="#F4B942"/>
        <circle cx="115" cy="158" r="13" fill="#F76707"/>
        <circle cx="135" cy="150" r="12" fill="#F4B942"/>
        <!-- Sacred Lotus Bloom -->
        <g transform="translate(100, 110)">
          <!-- Outer Lotus Petals -->
          <path d="M0 -45 C-25 -20 -15 15 0 20 C15 15 25 -20 0 -45Z" fill="#F783AC"/>
          <path d="M-35 -15 C-25 -35 0 0 0 20 C-15 15 -30 5 -35 -15Z" fill="#FF8787"/>
          <path d="M35 -15 C25 -35 0 0 0 20 C15 15 30 5 35 -15Z" fill="#FF8787"/>
          <!-- Inner Petals -->
          <path d="M-18 -30 C-10 -40 0 5 0 18 C-10 12 -15 0 -18 -30Z" fill="#FFD8A8"/>
          <path d="M18 -30 C10 -40 0 5 0 18 C10 12 15 0 18 -30Z" fill="#FFD8A8"/>
          <circle cx="0" cy="10" r="8" fill="#F4B942"/>
        </g>
      </svg>
    `,
    tulips: () => `
      <svg viewBox="0 0 200 200" class="flower-svg-art" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tulipCoral" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFA94D" />
            <stop offset="60%" stop-color="#FF6B6B" />
            <stop offset="100%" stop-color="#D6336C" />
          </linearGradient>
        </defs>
        <!-- Stem & Smooth Leaves -->
        <path d="M100 110 Q98 150 100 185" stroke="#2F9E6B" stroke-width="6" stroke-linecap="round"/>
        <path d="M100 160 Q60 120 65 75 Q85 110 100 145" fill="#40C057"/>
        <path d="M100 150 Q140 115 135 70 Q115 105 100 135" fill="#2F9E6B"/>
        <!-- Tulip Cup Bloom -->
        <path d="M72 75 C68 115 132 115 128 75 C118 95 82 95 72 75Z" fill="url(#tulipCoral)"/>
        <path d="M85 60 C80 90 120 90 115 60 C108 75 92 75 85 60Z" fill="#FF8787"/>
        <path d="M72 75 C75 55 95 62 100 80 C88 80 76 78 72 75Z" fill="#FA5252"/>
        <path d="M128 75 C125 55 105 62 100 80 C112 80 124 78 128 75Z" fill="#E03131"/>
      </svg>
    `,
    whiteLilies: () => `
      <svg viewBox="0 0 200 200" class="flower-svg-art" xmlns="http://www.w3.org/2000/svg">
        <!-- Stem -->
        <path d="M100 115 Q102 150 100 185" stroke="#2F9E6B" stroke-width="6" stroke-linecap="round"/>
        <!-- White Casablanca Lilies -->
        <path d="M100 45 C88 75 94 90 100 105 C106 90 112 75 100 45Z" fill="#FFFFFF" stroke="#E9ECEF" stroke-width="1.5"/>
        <path d="M52 75 C76 85 86 95 100 105 C85 100 70 95 52 75Z" fill="#F8F9FA" stroke="#E9ECEF" stroke-width="1.5"/>
        <path d="M148 75 C124 85 114 95 100 105 C115 100 130 95 148 75Z" fill="#F8F9FA" stroke="#E9ECEF" stroke-width="1.5"/>
        <path d="M68 135 C88 120 92 110 100 105 C90 120 85 130 68 135Z" fill="#FFFFFF" stroke="#E9ECEF" stroke-width="1.5"/>
        <path d="M132 135 C112 120 108 110 100 105 C110 120 115 130 132 135Z" fill="#FFFFFF" stroke="#E9ECEF" stroke-width="1.5"/>
        <!-- Golden Anthers -->
        <circle cx="88" cy="72" r="3" fill="#F4B942"/>
        <circle cx="112" cy="72" r="3" fill="#F4B942"/>
        <circle cx="100" cy="65" r="3" fill="#F4B942"/>
      </svg>
    `,
    heartRoses: () => `
      <svg viewBox="0 0 200 200" class="flower-svg-art" xmlns="http://www.w3.org/2000/svg">
        <!-- Heart Wrapping Outline -->
        <path d="M100 170 C40 125 30 75 70 55 C90 45 100 65 100 65 C100 65 110 45 130 55 C170 75 160 125 100 170Z" fill="#FFE3EC" stroke="#D6336C" stroke-width="3"/>
        <!-- Heart of Red Roses -->
        <circle cx="75" cy="75" r="14" fill="#D6336C"/>
        <circle cx="100" cy="80" r="15" fill="#C2255C"/>
        <circle cx="125" cy="75" r="14" fill="#D6336C"/>
        <circle cx="85" cy="105" r="15" fill="#E64980"/>
        <circle cx="115" cy="105" r="15" fill="#E64980"/>
        <circle cx="100" cy="130" r="14" fill="#C2255C"/>
        <circle cx="100" cy="80" r="4" fill="#F4B942"/>
        <circle cx="85" cy="105" r="3" fill="#FFF"/>
        <circle cx="115" cy="105" r="3" fill="#FFF"/>
      </svg>
    `,
    sunflowerMix: () => `
      <svg viewBox="0 0 200 200" class="flower-svg-art" xmlns="http://www.w3.org/2000/svg">
        <!-- Ceramic Pastel Pot -->
        <path d="M75 135 L80 185 L120 185 L125 135 Z" fill="#FFE8CC" stroke="#FFA94D" stroke-width="2"/>
        <!-- Sunflowers & Chrysanthemums -->
        <circle cx="85" cy="95" r="22" fill="#F4B942"/>
        <circle cx="85" cy="95" r="10" fill="#361A0C"/>
        <circle cx="120" cy="85" r="25" fill="#FFE066"/>
        <circle cx="120" cy="85" r="12" fill="#361A0C"/>
        <circle cx="100" cy="120" r="15" fill="#FF922B"/>
        <circle cx="100" cy="120" r="6" fill="#F4B942"/>
        <circle cx="60" cy="115" r="10" fill="#51CF66" opacity="0.8"/>
        <circle cx="140" cy="110" r="10" fill="#2F9E6B" opacity="0.8"/>
      </svg>
    `
  };

  // --------------------------------------------------------------------------
  // 3. DUMMY PRODUCT CATALOG (12 HANDPICKED PRODUCTS)
  // Complete data attributes: id, name, category, price, oldPrice, rating,
  // reviewCount, badge, description, artKey, highlights
  // --------------------------------------------------------------------------
  const PRODUCTS_CATALOG = [
    {
      id: 'flow-01',
      name: 'Crimson Passion Roses',
      category: 'Roses',
      price: 1499,
      oldPrice: 1899,
      rating: 4.9,
      reviewCount: 142,
      badge: 'Bestseller',
      badgeClass: 'badge-bestseller',
      description: 'Twelve velvety deep red Dutch roses hand-tied with gypsophila and tied with a luxury satin ribbon.',
      artKey: 'roses',
      highlights: ['🌿 100% Farm Fresh Guarantee', '⏱️ 2-Hour Express Delivery', '🏺 Glass Vase Included']
    },
    {
      id: 'flow-02',
      name: 'Stargazer Pink Lilies',
      category: 'Lilies',
      price: 1899,
      oldPrice: 2299,
      rating: 4.8,
      reviewCount: 96,
      badge: '20% OFF',
      badgeClass: 'badge-discount',
      description: 'Exotic fragrant pink Oriental lilies with fresh silver eucalyptus foliage that blooms gracefully for 10 days.',
      artKey: 'lilies',
      highlights: ['🌿 Long-lasting 10-Day Bloom', '⏱️ 2-Hour Express Delivery', '🏺 Handcrafted Ceramic Pot']
    },
    {
      id: 'flow-03',
      name: 'Golden Radiance Sunflowers',
      category: 'Sunflowers',
      price: 1299,
      oldPrice: 1599,
      rating: 4.9,
      reviewCount: 88,
      badge: 'Popular',
      badgeClass: 'badge-new',
      description: 'Sun-drenched golden blooms radiating joy and optimism, paired with cheerful yellow button solidago.',
      artKey: 'sunflowers',
      highlights: ['🌿 Sourced Direct from Nashik', '⏱️ Same-Day Safe Delivery', '🏺 Craft Paper Wrapping']
    },
    {
      id: 'flow-04',
      name: 'Royal Purple Orchids',
      category: 'Orchids',
      price: 2199,
      oldPrice: 2699,
      rating: 5.0,
      reviewCount: 110,
      badge: 'Luxury',
      badgeClass: 'badge-bestseller',
      description: 'Ten exotic purple Dendrobium orchid stems representing royalty, admiration, and refined elegance.',
      artKey: 'orchids',
      highlights: ['🌿 Exotic Hydroponic Grown', '⏱️ 2-Hour Express Delivery', '🏺 Cylindrical Glass Vase']
    },
    {
      id: 'flow-05',
      name: 'Pastel Meadow Bouquet',
      category: 'Bouquets',
      price: 1699,
      oldPrice: 2099,
      rating: 4.8,
      reviewCount: 75,
      badge: 'Artisan',
      badgeClass: 'badge-new',
      description: 'A soothing symphony of peach roses, soft blush carnations, and misty white baby’s breath.',
      artKey: 'bouquets',
      highlights: ['🌿 Master Florist Designed', '⏱️ 2-Hour Express Delivery', '🏺 Free Greeting Card']
    },
    {
      id: 'flow-06',
      name: 'Bridal Bliss White Peonies',
      category: 'Wedding',
      price: 2499,
      oldPrice: 2999,
      rating: 4.9,
      reviewCount: 64,
      badge: 'Wedding Special',
      badgeClass: 'badge-bestseller',
      description: 'Opulent ivory and cream peonies paired with champagne spray roses, crafted for joyous milestones.',
      artKey: 'peonies',
      highlights: ['🌿 Premium Wedding Grade', '⏱️ Guaranteed Morning Slot', '🏺 Silk Ribbon Finish']
    },
    {
      id: 'flow-07',
      name: 'Confetti Birthday Bloom',
      category: 'Birthday',
      price: 1399,
      oldPrice: 1699,
      rating: 4.7,
      reviewCount: 118,
      badge: '18% OFF',
      badgeClass: 'badge-discount',
      description: 'Vibrant celebratory mix of multicolored gerberas and yellow carnations designed to bring instant smiles.',
      artKey: 'gerberas',
      highlights: ['🌿 Joyful Multicolor Mix', '⏱️ Midnight Slot Available', '🏺 Free Birthday Candle & Card']
    },
    {
      id: 'flow-08',
      name: 'Sacred Marigolds & Lotus',
      category: 'Pooja',
      price: 999,
      oldPrice: 1299,
      rating: 5.0,
      reviewCount: 154,
      badge: 'Auspicious',
      badgeClass: 'badge-bestseller',
      description: 'Auspicious fresh orange marigold garlands paired with two pristine sacred pink lotus blossoms.',
      artKey: 'pooja',
      highlights: ['🌿 Clean & Sacred Blessed Harvest', '⏱️ 6 AM - 8 AM Morning Slot', '🏺 Brass Decor Vessel']
    },
    {
      id: 'flow-09',
      name: 'Sunset Glow Tulips',
      category: 'Bouquets',
      price: 1799,
      oldPrice: 2199,
      rating: 4.8,
      reviewCount: 52,
      badge: 'Seasonal',
      badgeClass: 'badge-new',
      description: 'Imported coral and orange sunset-hued tulips that open gracefully to reveal golden stamens.',
      artKey: 'tulips',
      highlights: ['🌿 Direct Dutch Import', '⏱️ Cold-Chain Fresh Transport', '🏺 Minimalist Nordic Vase']
    },
    {
      id: 'flow-10',
      name: 'Pure Peace Casablanca',
      category: 'Lilies',
      price: 1999,
      oldPrice: 2399,
      rating: 4.9,
      reviewCount: 43,
      badge: 'Serene',
      badgeClass: 'badge-discount',
      description: 'Majestic snowy-white trumpet lilies with an intoxicating sweet fragrance that fills any room.',
      artKey: 'whiteLilies',
      highlights: ['🌿 Hypoallergenic Stamens', '⏱️ 2-Hour Express Delivery', '🏺 White Ceramic Planter']
    },
    {
      id: 'flow-11',
      name: 'Ruby Valentine Heart Bunch',
      category: 'Roses',
      price: 2299,
      oldPrice: 2899,
      rating: 5.0,
      reviewCount: 210,
      badge: 'Signature',
      badgeClass: 'badge-bestseller',
      description: 'Twenty scarlet red roses hand-sculpted in a romantic heart shape, wrapped in blush embossed tissue.',
      artKey: 'heartRoses',
      highlights: ['🌿 Signature Heart Arrangement', '⏱️ Midnight Surprise Eligible', '🏺 Velvet Gift Box']
    },
    {
      id: 'flow-12',
      name: 'Golden Sunshine Mixed Florals',
      category: 'Sunflowers',
      price: 1499,
      oldPrice: 1799,
      rating: 4.7,
      reviewCount: 78,
      badge: 'Cheerful',
      badgeClass: 'badge-new',
      description: 'Bright sunflowers harmonized with gold chrysanthemums, amber daisies, and fresh lemon mint sprigs.',
      artKey: 'sunflowerMix',
      highlights: ['🌿 Long Shelf Life Guarantee', '⏱️ 2-Hour Express Delivery', '🏺 Hand-Painted Earthen Pot']
    }
  ];

  // --------------------------------------------------------------------------
  // 4. REACTIVE STATE STORE WITH LOCALSTORAGE PERSISTENCE
  // --------------------------------------------------------------------------
  const State = {
    cart: [],
    wishlist: [],
    orders: [],
    activeCoupon: null,
    discountPercentage: 0,
    selectedCategory: 'all',
    searchQuery: '',
    sortBy: 'featured',
    user: {
      isLoggedIn: true,
      name: 'Ananya Sen',
      email: 'ananya.sen@example.com',
      phone: '+91 98765 43210',
      addresses: [
        {
          id: 'addr-1',
          label: 'Home',
          recipient: 'Ananya Sen • +91 98765 43210',
          details: 'Flat 402, Lotus Residency, Link Road',
          city: 'Mumbai',
          pincode: '400050',
          isDefault: true
        },
        {
          id: 'addr-2',
          label: 'Office',
          recipient: 'Ananya Sen • +91 98765 43210',
          details: '9th Floor, Bloom Tech Park, BKC',
          city: 'Mumbai',
          pincode: '400051',
          isDefault: false
        }
      ]
    },

    init() {
      // 1. Load Cart
      try {
        const savedCart = localStorage.getItem('phoolwala_cart');
        if (savedCart) this.cart = JSON.parse(savedCart);
      } catch (e) { this.cart = []; }

      // 2. Load Wishlist
      try {
        const savedWishlist = localStorage.getItem('phoolwala_wishlist');
        if (savedWishlist) this.wishlist = JSON.parse(savedWishlist);
      } catch (e) { this.wishlist = []; }

      // 3. Load Orders
      try {
        const savedOrders = localStorage.getItem('phoolwala_orders');
        if (savedOrders) {
          this.orders = JSON.parse(savedOrders);
        } else {
          // Pre-seed with one realistic active order
          this.orders = [
            {
              orderId: '#PHOOL-78219',
              date: 'Today, 10:15 AM',
              items: [
                { name: 'Crimson Passion Roses', qty: 1, price: 1499 }
              ],
              total: 1499,
              status: 'Out for Delivery', // Placed > Packed > Out for Delivery > Delivered
              statusStep: 3, // 1 to 4
              deliverySlot: 'Express 2-Hour Delivery',
              address: 'Flat 402, Lotus Residency, Link Road, Mumbai - 400050'
            }
          ];
          this.saveOrders();
        }
      } catch (e) { this.orders = []; }

      // 4. Load User Profile
      try {
        const savedUser = localStorage.getItem('phoolwala_user');
        if (savedUser) this.user = JSON.parse(savedUser);
      } catch (e) {}
    },

    saveCart() {
      try { localStorage.setItem('phoolwala_cart', JSON.stringify(this.cart)); } catch (e) {}
      UI.updateCartBadges();
      UI.renderCartDrawer();
    },

    saveWishlist() {
      try { localStorage.setItem('phoolwala_wishlist', JSON.stringify(this.wishlist)); } catch (e) {}
      UI.updateWishlistBadges();
      UI.renderWishlistModal();
      UI.updateProductCardWishlistIcons();
    },

    saveOrders() {
      try { localStorage.setItem('phoolwala_orders', JSON.stringify(this.orders)); } catch (e) {}
      UI.renderOrders();
    },

    saveUser() {
      try { localStorage.setItem('phoolwala_user', JSON.stringify(this.user)); } catch (e) {}
      UI.renderProfile();
    }
  };

  // --------------------------------------------------------------------------
  // 5. TOAST NOTIFICATIONS MANAGER
  // --------------------------------------------------------------------------
  const Toast = {
    show(message, type = 'success') {
      const container = document.getElementById('toastContainer');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      
      const icon = type === 'success' ? '🌸' : '⚠️';
      toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
      
      container.appendChild(toast);

      // Auto dismiss after 3.2 seconds
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3200);
    }
  };

  // --------------------------------------------------------------------------
  // 6. UI RENDERING & EVENT CONTROLLER
  // --------------------------------------------------------------------------
  const UI = {
    init() {
      this.cacheDom();
      this.bindEvents();
      this.setupObservers();
      this.renderProducts();
      this.updateCartBadges();
      this.updateWishlistBadges();
      this.renderCartDrawer();
      this.renderOrders();
      this.renderProfile();
      this.initDatePicker();

      // Fade out page loader
      window.addEventListener('load', () => {
        setTimeout(() => {
          const loader = document.getElementById('pageLoader');
          if (loader) loader.classList.add('loaded');
        }, 500);
      });
    },

    cacheDom() {
      this.dom = {
        productsGrid: document.getElementById('productsGrid'),
        resultsCount: document.getElementById('resultsCount'),
        emptySearchState: document.getElementById('emptySearchState'),
        categoryFilterContainer: document.getElementById('categoryFilterContainer'),
        sortSelector: document.getElementById('sortSelector'),
        globalSearchInput: document.getElementById('globalSearchInput'),
        clearSearchBtn: document.getElementById('clearSearchBtn'),
        mobileSearchInput: document.getElementById('mobileSearchInput'),
        themeToggleBtn: document.getElementById('themeToggleBtn'),
        hamburgerBtn: document.getElementById('hamburgerBtn'),
        mobileDrawer: document.getElementById('mobileDrawer'),
        cartTriggerBtn: document.getElementById('cartTriggerBtn'),
        cartDialog: document.getElementById('cartDialog'),
        closeCartBtn: document.getElementById('closeCartBtn'),
        cartItemsContainer: document.getElementById('cartItemsContainer'),
        emptyCartNotice: document.getElementById('emptyCartNotice'),
        cartFooterArea: document.getElementById('cartFooterArea'),
        cartSubtotal: document.getElementById('cartSubtotal'),
        cartDiscountLine: document.getElementById('cartDiscountLine'),
        cartDiscountAmount: document.getElementById('cartDiscountAmount'),
        cartDeliveryFee: document.getElementById('cartDeliveryFee'),
        cartTotal: document.getElementById('cartTotal'),
        cartCountBadge: document.getElementById('cartCountBadge'),
        freeShippingNotice: document.getElementById('freeShippingNotice'),
        freeShippingProgress: document.getElementById('freeShippingProgress'),
        cartCouponInput: document.getElementById('cartCouponInput'),
        applyCouponBtn: document.getElementById('applyCouponBtn'),
        couponStatusMessage: document.getElementById('couponStatusMessage'),
        proceedToCheckoutBtn: document.getElementById('proceedToCheckoutBtn'),
        cartShopNowBtn: document.getElementById('cartShopNowBtn'),
        wishlistTriggerBtn: document.getElementById('wishlistTriggerBtn'),
        wishlistDialog: document.getElementById('wishlistDialog'),
        closeWishlistBtn: document.getElementById('closeWishlistBtn'),
        wishlistItemsContainer: document.getElementById('wishlistItemsContainer'),
        emptyWishlistNotice: document.getElementById('emptyWishlistNotice'),
        wishlistCountBadge: document.getElementById('wishlistCountBadge'),
        productDetailsDialog: document.getElementById('productDetailsDialog'),
        closeProductDetailsBtn: document.getElementById('closeProductDetailsBtn'),
        modalProductSvgWrap: document.getElementById('modalProductSvgWrap'),
        modalProductCategory: document.getElementById('modalProductCategory'),
        modalProductTitle: document.getElementById('modalProductTitle'),
        modalProductRatingStars: document.getElementById('modalProductRatingStars'),
        modalProductRatingScore: document.getElementById('modalProductRatingScore'),
        modalProductPrice: document.getElementById('modalProductPrice'),
        modalProductOldPrice: document.getElementById('modalProductOldPrice'),
        modalProductDiscount: document.getElementById('modalProductDiscount'),
        modalProductDesc: document.getElementById('modalProductDesc'),
        modalQtyInput: document.getElementById('modalQtyInput'),
        modalQtyMinus: document.getElementById('modalQtyMinus'),
        modalQtyPlus: document.getElementById('modalQtyPlus'),
        modalDeliveryDate: document.getElementById('modalDeliveryDate'),
        modalCardMessage: document.getElementById('modalCardMessage'),
        modalAddToCartBtn: document.getElementById('modalAddToCartBtn'),
        modalBuyNowBtn: document.getElementById('modalBuyNowBtn'),
        modalWishlistBtn: document.getElementById('modalWishlistBtn'),
        checkoutDialog: document.getElementById('checkoutDialog'),
        closeCheckoutBtn: document.getElementById('closeCheckoutBtn'),
        checkoutForm: document.getElementById('checkoutForm'),
        checkoutItemsList: document.getElementById('checkoutItemsList'),
        checkoutSubtotal: document.getElementById('checkoutSubtotal'),
        checkoutDiscountRow: document.getElementById('checkoutDiscountRow'),
        checkoutDiscount: document.getElementById('checkoutDiscount'),
        checkoutDelivery: document.getElementById('checkoutDelivery'),
        checkoutGrandTotal: document.getElementById('checkoutGrandTotal'),
        orderSuccessDialog: document.getElementById('orderSuccessDialog'),
        successOrderId: document.getElementById('successOrderId'),
        successViewOrdersBtn: document.getElementById('successViewOrdersBtn'),
        successContinueBtn: document.getElementById('successContinueBtn'),
        ordersListContainer: document.getElementById('ordersListContainer'),
        profileTriggerBtn: document.getElementById('profileTriggerBtn'),
        authDialog: document.getElementById('authDialog'),
        closeAuthBtn: document.getElementById('closeAuthBtn'),
        tabLoginBtn: document.getElementById('tabLoginBtn'),
        tabRegisterBtn: document.getElementById('tabRegisterBtn'),
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        profileDisplayName: document.getElementById('profileDisplayName'),
        profileDisplayEmail: document.getElementById('profileDisplayEmail'),
        profileDisplayPhone: document.getElementById('profileDisplayPhone'),
        profileAvatarText: document.getElementById('profileAvatarText'),
        addressListContainer: document.getElementById('addressListContainer'),
        addNewAddressBtn: document.getElementById('addNewAddressBtn'),
        addressModal: document.getElementById('addressModal'),
        closeAddressModalBtn: document.getElementById('closeAddressModalBtn'),
        newAddressForm: document.getElementById('newAddressForm'),
        logoutBtn: document.getElementById('logoutBtn'),
        copyPromoBtn: document.getElementById('copyPromoBtn'),
        newsletterForm: document.getElementById('newsletterForm'),
        resetFiltersBtn: document.getElementById('resetFiltersBtn')
      };
    },

    bindEvents() {
      // 1. Search Bar Input Handlers
      if (this.dom.globalSearchInput) {
        this.dom.globalSearchInput.addEventListener('input', (e) => {
          State.searchQuery = e.target.value.trim().toLowerCase();
          if (this.dom.clearSearchBtn) {
            this.dom.clearSearchBtn.hidden = !State.searchQuery;
          }
          this.renderProducts();
        });
      }

      if (this.dom.clearSearchBtn) {
        this.dom.clearSearchBtn.addEventListener('click', () => {
          this.dom.globalSearchInput.value = '';
          State.searchQuery = '';
          this.dom.clearSearchBtn.hidden = true;
          this.renderProducts();
        });
      }

      if (this.dom.mobileSearchInput) {
        this.dom.mobileSearchInput.addEventListener('input', (e) => {
          State.searchQuery = e.target.value.trim().toLowerCase();
          this.renderProducts();
        });
      }

      // 2. Category Filter Pills
      if (this.dom.categoryFilterContainer) {
        this.dom.categoryFilterContainer.addEventListener('click', (e) => {
          const pill = e.target.closest('.filter-pill');
          if (!pill) return;

          this.dom.categoryFilterContainer.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');

          State.selectedCategory = pill.dataset.filter;
          this.renderProducts();
        });
      }

      // 3. Home Category Tiles click -> scroll & filter
      const categoryTiles = document.querySelectorAll('.category-tile');
      categoryTiles.forEach(tile => {
        tile.addEventListener('click', () => {
          const cat = tile.dataset.category;
          this.filterByCategory(cat);
          const productsSec = document.getElementById('products');
          if (productsSec) productsSec.scrollIntoView({ behavior: 'smooth' });
        });
      });

      // 4. Sort Selector
      if (this.dom.sortSelector) {
        this.dom.sortSelector.addEventListener('change', (e) => {
          State.sortBy = e.target.value;
          this.renderProducts();
        });
      }

      // 5. Dark Mode Toggle
      if (this.dom.themeToggleBtn) {
        this.dom.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
      }

      // 6. Mobile Hamburger Drawer
      if (this.dom.hamburgerBtn) {
        this.dom.hamburgerBtn.addEventListener('click', () => {
          const isOpen = this.dom.mobileDrawer.classList.toggle('open');
          this.dom.hamburgerBtn.setAttribute('aria-expanded', isOpen);
        });
      }

      // Mobile drawer links auto-close
      document.querySelectorAll('.mobile-nav-item').forEach(link => {
        link.addEventListener('click', () => {
          this.dom.mobileDrawer.classList.remove('open');
          this.dom.hamburgerBtn.setAttribute('aria-expanded', 'false');
        });
      });

      // 7. Modals: Cart Drawer Open/Close
      if (this.dom.cartTriggerBtn) {
        this.dom.cartTriggerBtn.addEventListener('click', () => this.openCart());
      }
      if (this.dom.closeCartBtn) {
        this.dom.closeCartBtn.addEventListener('click', () => this.closeCart());
      }
      if (this.dom.cartShopNowBtn) {
        this.dom.cartShopNowBtn.addEventListener('click', () => {
          this.closeCart();
          document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
        });
      }

      // 8. Wishlist Modal Open/Close
      if (this.dom.wishlistTriggerBtn) {
        this.dom.wishlistTriggerBtn.addEventListener('click', () => this.openWishlist());
      }
      if (this.dom.closeWishlistBtn) {
        this.dom.closeWishlistBtn.addEventListener('click', () => this.closeWishlist());
      }

      // 9. Product Details Modal Close
      if (this.dom.closeProductDetailsBtn) {
        this.dom.closeProductDetailsBtn.addEventListener('click', () => this.closeProductDetails());
      }

      // 10. Checkout Open & Place Order
      if (this.dom.proceedToCheckoutBtn) {
        this.dom.proceedToCheckoutBtn.addEventListener('click', () => this.openCheckout());
      }
      if (this.dom.closeCheckoutBtn) {
        this.dom.closeCheckoutBtn.addEventListener('click', () => this.closeCheckout());
      }
      if (this.dom.checkoutForm) {
        this.dom.checkoutForm.addEventListener('submit', (e) => this.handlePlaceOrder(e));
      }

      // Payment method radio switches in Checkout
      const payRadios = document.querySelectorAll('input[name="paymentMethod"]');
      payRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
          const val = e.target.value;
          document.getElementById('payDetailsUpi').hidden = (val !== 'UPI');
          document.getElementById('payDetailsCard').hidden = (val !== 'Card');
          document.getElementById('payDetailsCod').hidden = (val !== 'COD');
        });
      });

      // 11. Order Success Dialog actions
      if (this.dom.successViewOrdersBtn) {
        this.dom.successViewOrdersBtn.addEventListener('click', () => {
          this.dom.orderSuccessDialog.close();
          document.getElementById('ordersSection')?.scrollIntoView({ behavior: 'smooth' });
        });
      }
      if (this.dom.successContinueBtn) {
        this.dom.successContinueBtn.addEventListener('click', () => {
          this.dom.orderSuccessDialog.close();
          document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
        });
      }

      // 12. Auth Modal (Login / Register)
      if (this.dom.profileTriggerBtn) {
        this.dom.profileTriggerBtn.addEventListener('click', () => {
          document.getElementById('profileSection')?.scrollIntoView({ behavior: 'smooth' });
        });
      }
      const mobileLoginBtn = document.getElementById('mobileLoginBtn');
      if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', () => {
          this.dom.mobileDrawer.classList.remove('open');
          this.openAuthModal();
        });
      }
      if (this.dom.closeAuthBtn) {
        this.dom.closeAuthBtn.addEventListener('click', () => this.dom.authDialog.close());
      }
      if (this.dom.tabLoginBtn && this.dom.tabRegisterBtn) {
        this.dom.tabLoginBtn.addEventListener('click', () => {
          this.dom.tabLoginBtn.classList.add('active');
          this.dom.tabRegisterBtn.classList.remove('active');
          this.dom.loginForm.hidden = false;
          this.dom.registerForm.hidden = true;
        });
        this.dom.tabRegisterBtn.addEventListener('click', () => {
          this.dom.tabRegisterBtn.classList.add('active');
          this.dom.tabLoginBtn.classList.remove('active');
          this.dom.loginForm.hidden = true;
          this.dom.registerForm.hidden = false;
        });
      }
      if (this.dom.loginForm) {
        this.dom.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
      }
      if (this.dom.registerForm) {
        this.dom.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
      }
      if (this.dom.logoutBtn) {
        this.dom.logoutBtn.addEventListener('click', () => {
          Toast.show('Signed out successfully.');
          this.openAuthModal();
        });
      }

      // 13. Address Book Modal
      if (this.dom.addNewAddressBtn) {
        this.dom.addNewAddressBtn.addEventListener('click', () => this.dom.addressModal.showModal());
      }
      if (this.dom.closeAddressModalBtn) {
        this.dom.closeAddressModalBtn.addEventListener('click', () => this.dom.addressModal.close());
      }
      if (this.dom.newAddressForm) {
        this.dom.newAddressForm.addEventListener('submit', (e) => this.handleSaveAddress(e));
      }

      // 14. Coupon Apply Button
      if (this.dom.applyCouponBtn) {
        this.dom.applyCouponBtn.addEventListener('click', () => this.applyCoupon());
      }

      // 15. Copy Promo Code on click
      if (this.dom.copyPromoBtn) {
        this.dom.copyPromoBtn.addEventListener('click', () => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText('FLORA10');
            Toast.show('Coupon FLORA10 copied to clipboard! 📋');
          } else {
            Toast.show('Use coupon code FLORA10 for 10% OFF!');
          }
        });
      }

      // 16. Newsletter Form
      if (this.dom.newsletterForm) {
        this.dom.newsletterForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const email = document.getElementById('newsletterEmail')?.value;
          if (email) {
            Toast.show(`Subscribed! 10% coupon FLORA10 unlocked for ${email}`);
            this.dom.newsletterForm.reset();
          }
        });
      }

      // 17. Reset Filters Button
      if (this.dom.resetFiltersBtn) {
        this.dom.resetFiltersBtn.addEventListener('click', () => {
          State.searchQuery = '';
          State.selectedCategory = 'all';
          if (this.dom.globalSearchInput) this.dom.globalSearchInput.value = '';
          if (this.dom.categoryFilterContainer) {
            this.dom.categoryFilterContainer.querySelectorAll('.filter-pill').forEach((p, idx) => {
              p.classList.toggle('active', idx === 0);
            });
          }
          this.renderProducts();
        });
      }

      // Modern Web Guidance: Light Dismiss for native <dialog>
      const dialogs = document.querySelectorAll('dialog');
      dialogs.forEach(dlg => {
        dlg.addEventListener('click', (e) => {
          const rect = dlg.getBoundingClientRect();
          const isInDialog = (
            rect.top <= e.clientY &&
            e.clientY <= rect.top + rect.height &&
            rect.left <= e.clientX &&
            e.clientX <= rect.left + rect.width
          );
          if (!isInDialog) {
            dlg.close();
          }
        });
      });
    },

    setupObservers() {
      // IntersectionObserver for scroll fade-up reveal
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
    },

    filterByCategory(categoryName) {
      State.selectedCategory = categoryName;
      if (this.dom.categoryFilterContainer) {
        this.dom.categoryFilterContainer.querySelectorAll('.filter-pill').forEach(pill => {
          pill.classList.toggle('active', pill.dataset.filter.toLowerCase() === categoryName.toLowerCase());
        });
      }
      this.renderProducts();
    },

    initDatePicker() {
      // Set min date to today for delivery
      const today = new Date().toISOString().split('T')[0];
      if (this.dom.modalDeliveryDate) {
        this.dom.modalDeliveryDate.min = today;
        this.dom.modalDeliveryDate.value = today;
      }
    },

    // ------------------------------------------------------------------------
    // RENDER PRODUCT FLIP CARDS GRID (12 PRODUCTS)
    // ------------------------------------------------------------------------
    renderProducts() {
      let filtered = PRODUCTS_CATALOG.filter(prod => {
        const matchesCategory = (State.selectedCategory === 'all' || prod.category.toLowerCase() === State.selectedCategory.toLowerCase());
        const matchesSearch = (!State.searchQuery || 
          prod.name.toLowerCase().includes(State.searchQuery) ||
          prod.description.toLowerCase().includes(State.searchQuery) ||
          prod.category.toLowerCase().includes(State.searchQuery));
        return matchesCategory && matchesSearch;
      });

      // Sorting
      if (State.sortBy === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (State.sortBy === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (State.sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (State.sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      }

      // Update Result Count
      if (this.dom.resultsCount) {
        this.dom.resultsCount.textContent = `Showing ${filtered.length} Flower${filtered.length === 1 ? '' : 's'}`;
      }

      // Handle Empty State
      if (filtered.length === 0) {
        this.dom.productsGrid.innerHTML = '';
        if (this.dom.emptySearchState) this.dom.emptySearchState.hidden = false;
        return;
      }
      if (this.dom.emptySearchState) this.dom.emptySearchState.hidden = true;

      // Render Cards
      this.dom.productsGrid.innerHTML = filtered.map(prod => {
        const isWishlisted = State.wishlist.includes(prod.id);
        const svgContent = FlowerArt[prod.artKey] ? FlowerArt[prod.artKey]() : FlowerArt.roses();

        return `
          <div class="flip-card fade-up visible" tabindex="0" data-id="${prod.id}" aria-label="${prod.name}, press Enter or Space to flip card">
            <div class="flip-card-inner" id="card-inner-${prod.id}">
              
              <!-- ================= FRONT FACE ================= -->
              <div class="flip-card-front">
                <div class="card-top-row">
                  <span class="card-badge ${prod.badgeClass}">${prod.badge}</span>
                  <button type="button" class="card-wishlist-quick ${isWishlisted ? 'active' : ''}" 
                          data-wishlist-id="${prod.id}" 
                          aria-label="Save ${prod.name} to wishlist">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>

                <!-- SVG Flower Artwork -->
                <div class="card-image-wrap">
                  ${svgContent}
                </div>

                <!-- Product Front Meta -->
                <div class="card-front-info">
                  <div class="card-category-tag">${prod.category}</div>
                  <h3 class="font-serif card-title">${prod.name}</h3>
                  <div class="card-rating-line">
                    <span class="stars-gold">★★★★★</span>
                    <span class="rating-score">${prod.rating}</span>
                    <span class="rating-count">(${prod.reviewCount})</span>
                  </div>
                  <div class="card-price-line">
                    <div class="price-box">
                      <span class="price-current">${APP_CONFIG.currencySymbol}${prod.price}</span>
                      <span class="price-old">${APP_CONFIG.currencySymbol}${prod.oldPrice}</span>
                    </div>
                    <span class="tap-hint-pill">Tap to flip ↺</span>
                  </div>
                </div>
              </div>

              <!-- ================= BACK FACE ================= -->
              <div class="flip-card-back">
                <div class="card-back-header">
                  <div>
                    <h4 class="font-serif back-title">${prod.name}</h4>
                    <span class="card-category-tag">${prod.category}</span>
                  </div>
                  <button type="button" class="flip-back-btn" data-flip-back="${prod.id}" title="Flip back" aria-label="Flip card back">↺</button>
                </div>

                <p class="back-desc">${prod.description}</p>

                <!-- 3 Highlights Badges -->
                <div class="back-highlights-list">
                  <div class="highlight-row">${prod.highlights[0]}</div>
                  <div class="highlight-row">${prod.highlights[1]}</div>
                  <div class="highlight-row">${prod.highlights[2]}</div>
                </div>

                <!-- Price & Stepper -->
                <div class="back-controls-row">
                  <div class="back-price-tag">${APP_CONFIG.currencySymbol}${prod.price}</div>
                  <div class="stepper-mini" onclick="event.stopPropagation()">
                    <button type="button" class="stepper-sub" data-stepper-sub="${prod.id}" aria-label="Decrease quantity">-</button>
                    <input type="text" id="stepper-input-${prod.id}" value="1" readonly>
                    <button type="button" class="stepper-add" data-stepper-add="${prod.id}" aria-label="Increase quantity">+</button>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="back-actions-group" onclick="event.stopPropagation()">
                  <button type="button" class="btn btn-primary btn-add-cart-card" data-add-cart="${prod.id}">
                    <span>Add to Cart 🛒</span>
                  </button>
                  <div class="back-actions-split">
                    <button type="button" class="btn-details-card" data-view-details="${prod.id}">
                      View Details & Card Note ➔
                    </button>
                    <button type="button" class="icon-btn card-wishlist-quick ${isWishlisted ? 'active' : ''}" 
                            data-wishlist-id="${prod.id}" aria-label="Add to wishlist">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        `;
      }).join('');

      this.bindCardInteractions();
    },

    // ------------------------------------------------------------------------
    // BIND 3D FLIP CARD HOVER, MOBILE TAP, KEYBOARD & BUTTON EVENTS
    // ------------------------------------------------------------------------
    bindCardInteractions() {
      const cards = this.dom.productsGrid.querySelectorAll('.flip-card');

      cards.forEach(card => {
        const prodId = card.dataset.id;
        const inner = card.querySelector('.flip-card-inner');

        // 1. Click / Tap to Flip (mobile support or clicking card body)
        card.addEventListener('click', (e) => {
          // If user clicked an interactive control, don't toggle flip
          if (e.target.closest('button, input, a, .card-wishlist-quick, .stepper-mini')) return;
          inner.classList.toggle('is-flipped');
        });

        // 2. Keyboard Support: Enter or Space to Flip
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if (e.target === card) {
              e.preventDefault();
              inner.classList.toggle('is-flipped');
            }
          }
        });

        // 3. Flip Back Button
        const flipBackBtn = card.querySelector(`[data-flip-back="${prodId}"]`);
        if (flipBackBtn) {
          flipBackBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            inner.classList.remove('is-flipped');
          });
        }

        // 4. Quantity Stepper inside Flip Card Back
        const stepperInput = card.querySelector(`#stepper-input-${prodId}`);
        const addBtn = card.querySelector(`[data-stepper-add="${prodId}"]`);
        const subBtn = card.querySelector(`[data-stepper-sub="${prodId}"]`);

        if (addBtn && stepperInput) {
          addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            let val = parseInt(stepperInput.value, 10) || 1;
            if (val < 20) stepperInput.value = val + 1;
          });
        }

        if (subBtn && stepperInput) {
          subBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            let val = parseInt(stepperInput.value, 10) || 1;
            if (val > 1) stepperInput.value = val - 1;
          });
        }

        // 5. Add to Cart from Flip Card Back
        const addCartBtn = card.querySelector(`[data-add-cart="${prodId}"]`);
        if (addCartBtn) {
          addCartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const qty = parseInt(stepperInput?.value, 10) || 1;
            this.addToCart(prodId, qty);
          });
        }

        // 6. View Details Modal Button
        const detailsBtn = card.querySelector(`[data-view-details="${prodId}"]`);
        if (detailsBtn) {
          detailsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openProductDetails(prodId);
          });
        }
      });

      // 7. Wishlist Quick Buttons
      this.dom.productsGrid.querySelectorAll('.card-wishlist-quick').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const pId = btn.dataset.wishlistId;
          this.toggleWishlist(pId);
        });
      });
    },

    // ------------------------------------------------------------------------
    // CART OPERATIONS
    // ------------------------------------------------------------------------
    addToCart(productId, quantity = 1, options = {}) {
      const product = PRODUCTS_CATALOG.find(p => p.id === productId);
      if (!product) return;

      const existingIndex = State.cart.findIndex(item => item.id === productId);

      if (existingIndex > -1) {
        State.cart[existingIndex].quantity += quantity;
      } else {
        State.cart.push({
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          artKey: product.artKey,
          quantity: quantity,
          deliveryDate: options.deliveryDate || 'Today (Express)',
          cardMessage: options.cardMessage || ''
        });
      }

      State.saveCart();

      // Trigger Cart Bounce & Badge Pop Micro-Animations
      if (this.dom.cartTriggerBtn) {
        this.dom.cartTriggerBtn.classList.add('animate-pop');
        setTimeout(() => this.dom.cartTriggerBtn.classList.remove('animate-pop'), 600);
      }
      if (this.dom.cartCountBadge) {
        this.dom.cartCountBadge.classList.add('animate-badge');
        setTimeout(() => this.dom.cartCountBadge.classList.remove('animate-badge'), 500);
      }

      Toast.show(`Added ${quantity} × "${product.name}" to cart! 🌸`);
    },

    removeFromCart(productId) {
      State.cart = State.cart.filter(item => item.id !== productId);
      State.saveCart();
      Toast.show('Item removed from cart.');
    },

    updateCartQuantity(productId, delta) {
      const item = State.cart.find(i => i.id === productId);
      if (!item) return;

      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        State.saveCart();
      }
    },

    applyCoupon() {
      const code = this.dom.cartCouponInput.value.trim().toUpperCase();
      if (!code) return;

      if (APP_CONFIG.validCoupons[code] !== undefined) {
        State.activeCoupon = code;
        State.discountPercentage = (typeof APP_CONFIG.validCoupons[code] === 'number') ? APP_CONFIG.validCoupons[code] : 0;
        this.dom.couponStatusMessage.innerHTML = `<span class="text-success">✓ Coupon <strong>${code}</strong> applied successfully!</span>`;
        Toast.show(`Coupon ${code} applied for 10% discount! 🎉`);
      } else {
        this.dom.couponStatusMessage.innerHTML = `<span class="text-danger">✗ Invalid coupon code. Try <strong>FLORA10</strong></span>`;
      }
      this.renderCartDrawer();
    },

    calculateCartTotals() {
      const subtotal = State.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      let discount = 0;

      if (State.activeCoupon === 'FLORA10') {
        discount = Math.round(subtotal * 0.10);
      }

      const isFreeDelivery = (subtotal >= APP_CONFIG.freeShippingThreshold) || (State.activeCoupon === 'FREESHIP');
      const deliveryFee = (subtotal === 0 || isFreeDelivery) ? 0 : APP_CONFIG.deliveryFee;
      const total = Math.max(0, subtotal - discount + deliveryFee);

      return { subtotal, discount, deliveryFee, total, isFreeDelivery };
    },

    renderCartDrawer() {
      if (!this.dom.cartItemsContainer) return;

      const { subtotal, discount, deliveryFee, total, isFreeDelivery } = this.calculateCartTotals();

      if (State.cart.length === 0) {
        this.dom.cartItemsContainer.innerHTML = '';
        this.dom.emptyCartNotice.hidden = false;
        this.dom.cartFooterArea.hidden = true;
        this.dom.freeShippingNotice.textContent = `Add ${APP_CONFIG.currencySymbol}${APP_CONFIG.freeShippingThreshold} for FREE Delivery!`;
        this.dom.freeShippingProgress.style.width = '0%';
        return;
      }

      this.dom.emptyCartNotice.hidden = true;
      this.dom.cartFooterArea.hidden = false;

      // Free shipping progress
      const progressPercent = Math.min(100, Math.round((subtotal / APP_CONFIG.freeShippingThreshold) * 100));
      this.dom.freeShippingProgress.style.width = `${progressPercent}%`;
      if (isFreeDelivery) {
        this.dom.freeShippingNotice.innerHTML = `🎉 <strong>Congratulations!</strong> You get FREE Express Delivery!`;
      } else {
        const remaining = APP_CONFIG.freeShippingThreshold - subtotal;
        this.dom.freeShippingNotice.innerHTML = `Add <strong>${APP_CONFIG.currencySymbol}${remaining}</strong> more for <strong>FREE Delivery!</strong>`;
      }

      // Render line items
      this.dom.cartItemsContainer.innerHTML = State.cart.map(item => {
        const svgContent = FlowerArt[item.artKey] ? FlowerArt[item.artKey]() : FlowerArt.roses();

        return `
          <div class="cart-item-row">
            <div class="cart-item-thumb">
              ${svgContent}
            </div>
            <div class="cart-item-info">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">${APP_CONFIG.currencySymbol}${item.price} each</div>
              ${item.cardMessage ? `<small class="text-muted" style="font-size:0.75rem;">💌 "${item.cardMessage}"</small>` : ''}
            </div>
            <div class="cart-item-actions">
              <div class="stepper-mini">
                <button type="button" onclick="window.PhoolwalaApp.updateCartQty('${item.id}', -1)" aria-label="Decrease quantity">-</button>
                <input type="text" value="${item.quantity}" readonly>
                <button type="button" onclick="window.PhoolwalaApp.updateCartQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
              </div>
              <button type="button" class="btn-text text-danger" style="background:none;border:none;font-size:0.78rem;cursor:pointer;margin-top:4px;" 
                      onclick="window.PhoolwalaApp.removeCartItem('${item.id}')">
                Remove
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Summary lines
      this.dom.cartSubtotal.textContent = `${APP_CONFIG.currencySymbol}${subtotal}`;
      if (discount > 0) {
        this.dom.cartDiscountLine.hidden = false;
        this.dom.cartDiscountAmount.textContent = `-${APP_CONFIG.currencySymbol}${discount}`;
      } else {
        this.dom.cartDiscountLine.hidden = true;
      }
      this.dom.cartDeliveryFee.textContent = deliveryFee === 0 ? 'FREE' : `${APP_CONFIG.currencySymbol}${deliveryFee}`;
      this.dom.cartTotal.textContent = `${APP_CONFIG.currencySymbol}${total}`;
    },

    updateCartBadges() {
      const count = State.cart.reduce((sum, item) => sum + item.quantity, 0);
      if (this.dom.cartCountBadge) {
        this.dom.cartCountBadge.textContent = count;
      }
    },

    openCart() {
      this.renderCartDrawer();
      this.dom.cartDialog.showModal();
    },

    closeCart() {
      this.dom.cartDialog.close();
    },

    // ------------------------------------------------------------------------
    // WISHLIST OPERATIONS
    // ------------------------------------------------------------------------
    toggleWishlist(productId) {
      const idx = State.wishlist.indexOf(productId);
      const product = PRODUCTS_CATALOG.find(p => p.id === productId);

      if (idx > -1) {
        State.wishlist.splice(idx, 1);
        Toast.show(`Removed "${product ? product.name : 'item'}" from wishlist.`);
      } else {
        State.wishlist.push(productId);
        Toast.show(`Saved "${product ? product.name : 'item'}" to your wishlist! 💖`);
      }

      State.saveWishlist();
    },

    updateWishlistBadges() {
      if (this.dom.wishlistCountBadge) {
        this.dom.wishlistCountBadge.textContent = State.wishlist.length;
      }
    },

    updateProductCardWishlistIcons() {
      const allWishBtns = document.querySelectorAll('.card-wishlist-quick');
      allWishBtns.forEach(btn => {
        const id = btn.dataset.wishlistId;
        const isActive = State.wishlist.includes(id);
        btn.classList.toggle('active', isActive);
      });
    },

    openWishlist() {
      this.renderWishlistModal();
      this.dom.wishlistDialog.showModal();
    },

    closeWishlist() {
      this.dom.wishlistDialog.close();
    },

    renderWishlistModal() {
      if (!this.dom.wishlistItemsContainer) return;

      if (State.wishlist.length === 0) {
        this.dom.wishlistItemsContainer.innerHTML = '';
        this.dom.emptyWishlistNotice.hidden = false;
        return;
      }

      this.dom.emptyWishlistNotice.hidden = true;

      const wishlistProducts = PRODUCTS_CATALOG.filter(p => State.wishlist.includes(p.id));

      this.dom.wishlistItemsContainer.innerHTML = wishlistProducts.map(prod => {
        const svgContent = FlowerArt[prod.artKey] ? FlowerArt[prod.artKey]() : FlowerArt.roses();

        return `
          <div class="cart-item-row" style="grid-template-columns: 60px 1fr auto auto;">
            <div class="cart-item-thumb">
              ${svgContent}
            </div>
            <div>
              <div class="cart-item-name">${prod.name}</div>
              <div class="cart-item-price">${APP_CONFIG.currencySymbol}${prod.price}</div>
            </div>
            <button type="button" class="btn btn-primary btn-sm" onclick="window.PhoolwalaApp.moveWishlistToCart('${prod.id}')">
              Move to Cart 🛒
            </button>
            <button type="button" class="icon-btn" style="width:32px;height:32px;border:none;" 
                    onclick="window.PhoolwalaApp.toggleWishlist('${prod.id}')" aria-label="Remove from wishlist">
              &times;
            </button>
          </div>
        `;
      }).join('');
    },

    // ------------------------------------------------------------------------
    // PRODUCT DETAILS MODAL (POPULATED DYNAMICALLY)
    // ------------------------------------------------------------------------
    openProductDetails(productId) {
      const product = PRODUCTS_CATALOG.find(p => p.id === productId);
      if (!product) return;

      const svgContent = FlowerArt[product.artKey] ? FlowerArt[product.artKey]() : FlowerArt.roses();

      this.dom.modalProductSvgWrap.innerHTML = svgContent;
      this.dom.modalProductCategory.textContent = product.category;
      this.dom.modalProductTitle.textContent = product.name;
      this.dom.modalProductRatingScore.textContent = product.rating;
      this.dom.modalProductPrice.textContent = `${APP_CONFIG.currencySymbol}${product.price}`;
      this.dom.modalProductOldPrice.textContent = `${APP_CONFIG.currencySymbol}${product.oldPrice}`;
      this.dom.modalProductDiscount.textContent = product.badge;
      this.dom.modalProductDesc.textContent = product.description;
      this.dom.modalQtyInput.value = 1;
      this.dom.modalCardMessage.value = '';

      // Quantity controls
      this.dom.modalQtyMinus.onclick = () => {
        let val = parseInt(this.dom.modalQtyInput.value, 10) || 1;
        if (val > 1) this.dom.modalQtyInput.value = val - 1;
      };
      this.dom.modalQtyPlus.onclick = () => {
        let val = parseInt(this.dom.modalQtyInput.value, 10) || 1;
        if (val < 20) this.dom.modalQtyInput.value = val + 1;
      };

      // Add to Cart
      this.dom.modalAddToCartBtn.onclick = () => {
        const qty = parseInt(this.dom.modalQtyInput.value, 10) || 1;
        const delDate = this.dom.modalDeliveryDate.value;
        const note = this.dom.modalCardMessage.value.trim();
        this.addToCart(product.id, qty, { deliveryDate: delDate, cardMessage: note });
        this.closeProductDetails();
      };

      // Buy Now (Add to cart & open checkout)
      this.dom.modalBuyNowBtn.onclick = () => {
        const qty = parseInt(this.dom.modalQtyInput.value, 10) || 1;
        const delDate = this.dom.modalDeliveryDate.value;
        const note = this.dom.modalCardMessage.value.trim();
        this.addToCart(product.id, qty, { deliveryDate: delDate, cardMessage: note });
        this.closeProductDetails();
        this.openCheckout();
      };

      // Wishlist toggle
      const isWish = State.wishlist.includes(product.id);
      this.dom.modalWishlistBtn.classList.toggle('active', isWish);
      this.dom.modalWishlistBtn.onclick = () => {
        this.toggleWishlist(product.id);
        const updated = State.wishlist.includes(product.id);
        this.dom.modalWishlistBtn.classList.toggle('active', updated);
      };

      this.dom.productDetailsDialog.showModal();
    },

    closeProductDetails() {
      this.dom.productDetailsDialog.close();
    },

    // ------------------------------------------------------------------------
    // CHECKOUT & ORDER CREATION
    // ------------------------------------------------------------------------
    openCheckout() {
      if (State.cart.length === 0) {
        Toast.show('Your cart is empty! Add flowers first.', 'error');
        return;
      }
      this.closeCart();

      const { subtotal, discount, deliveryFee, total } = this.calculateCartTotals();

      // Render checkout summary sidebar
      this.dom.checkoutItemsList.innerHTML = State.cart.map(item => `
        <div class="summary-line" style="font-size:0.85rem;margin-bottom:0.4rem;">
          <span>${item.quantity} × ${item.name}</span>
          <span>${APP_CONFIG.currencySymbol}${item.price * item.quantity}</span>
        </div>
      `).join('');

      this.dom.checkoutSubtotal.textContent = `${APP_CONFIG.currencySymbol}${subtotal}`;
      if (discount > 0) {
        this.dom.checkoutDiscountRow.hidden = false;
        this.dom.checkoutDiscount.textContent = `-${APP_CONFIG.currencySymbol}${discount}`;
      } else {
        this.dom.checkoutDiscountRow.hidden = true;
      }
      this.dom.checkoutDelivery.textContent = deliveryFee === 0 ? 'FREE' : `${APP_CONFIG.currencySymbol}${deliveryFee}`;
      this.dom.checkoutGrandTotal.textContent = `${APP_CONFIG.currencySymbol}${total}`;

      this.dom.checkoutDialog.showModal();
    },

    closeCheckout() {
      this.dom.checkoutDialog.close();
    },

    handlePlaceOrder(e) {
      e.preventDefault();

      const form = this.dom.checkoutForm;
      const fullName = document.getElementById('checkoutFullName')?.value.trim();
      const phone = document.getElementById('checkoutPhone')?.value.trim();
      const address = document.getElementById('checkoutAddress')?.value.trim();
      const pincode = document.getElementById('checkoutPincode')?.value.trim();

      // Simple validation
      let hasError = false;
      if (!fullName) { this.setFormError('checkoutFullName', 'Please enter your full name'); hasError = true; }
      else { this.clearFormError('checkoutFullName'); }

      if (!phone || phone.length < 10) { this.setFormError('checkoutPhone', 'Please enter a valid 10-digit mobile number'); hasError = true; }
      else { this.clearFormError('checkoutPhone'); }

      if (!address) { this.setFormError('checkoutAddress', 'Delivery street address is required'); hasError = true; }
      else { this.clearFormError('checkoutAddress'); }

      if (!pincode || pincode.length !== 6) { this.setFormError('checkoutPincode', 'Enter valid 6-digit pincode'); hasError = true; }
      else { this.clearFormError('checkoutPincode'); }

      if (hasError) return;

      const deliverySlot = form.querySelector('input[name="deliverySlot"]:checked')?.value || 'Express 2-Hour';
      const paymentMethod = form.querySelector('input[name="paymentMethod"]:checked')?.value || 'UPI';
      const { total } = this.calculateCartTotals();

      // Create new order object
      const newOrderId = `#PHOOL-${Math.floor(10000 + Math.random() * 90000)}`;
      const newOrder = {
        orderId: newOrderId,
        date: 'Just now',
        items: State.cart.map(i => ({ name: i.name, qty: i.quantity, price: i.price })),
        total: total,
        status: 'Placed',
        statusStep: 1, // 1: Placed, 2: Packed, 3: Out for Delivery, 4: Delivered
        deliverySlot: deliverySlot,
        paymentMethod: paymentMethod,
        address: `${address}, ${document.getElementById('checkoutCity')?.value || 'Mumbai'} - ${pincode}`
      };

      // Prepend to orders
      State.orders.unshift(newOrder);
      State.saveOrders();

      // Clear cart
      State.cart = [];
      State.activeCoupon = null;
      State.discountPercentage = 0;
      State.saveCart();

      // Close checkout & Open Success Dialog
      this.closeCheckout();
      this.dom.successOrderId.textContent = newOrderId;
      this.dom.orderSuccessDialog.showModal();
      Toast.show(`Order ${newOrderId} placed successfully! 🌸`);
    },

    setFormError(fieldId, errorText) {
      const field = document.getElementById(fieldId);
      if (!field) return;
      field.style.borderColor = '#FA5252';
      const errorMsg = field.parentElement.querySelector('.error-msg');
      if (errorMsg) errorMsg.textContent = errorText;
    },

    clearFormError(fieldId) {
      const field = document.getElementById(fieldId);
      if (!field) return;
      field.style.borderColor = '';
      const errorMsg = field.parentElement.querySelector('.error-msg');
      if (errorMsg) errorMsg.textContent = '';
    },

    // ------------------------------------------------------------------------
    // MY ORDERS & STATUS TRACKER RENDERING
    // ------------------------------------------------------------------------
    renderOrders() {
      if (!this.dom.ordersListContainer) return;

      if (State.orders.length === 0) {
        this.dom.ordersListContainer.innerHTML = `
          <div class="empty-cart-state" style="background:var(--surface);border-radius:var(--radius-lg);padding:3rem 1rem;">
            <div class="empty-cart-icon">📦</div>
            <h3 class="font-serif">No Past Orders Found</h3>
            <p>You haven't ordered any fresh flowers yet. Pick your favorite bloom today!</p>
            <a href="#products" class="btn btn-primary" style="margin-top:1rem;">Explore Flowers</a>
          </div>
        `;
        return;
      }

      this.dom.ordersListContainer.innerHTML = State.orders.map(order => {
        const step = order.statusStep || 1;
        const progressWidth = step === 1 ? '10%' : step === 2 ? '40%' : step === 3 ? '75%' : '100%';

        return `
          <div class="order-record-card">
            <div class="order-header-row">
              <div>
                <span class="order-id-tag">${order.orderId}</span>
                <span class="order-date-text"> • Placed on ${order.date}</span>
              </div>
              <div>
                <strong>${APP_CONFIG.currencySymbol}${order.total}</strong>
                <span class="badge-code" style="margin-left:0.5rem;">${order.deliverySlot}</span>
              </div>
            </div>

            <!-- 4-Step Tracker Timeline -->
            <div class="order-tracker-timeline">
              <div class="tracker-progress-line" style="width: ${progressWidth};"></div>
              
              <div class="tracker-step ${step >= 1 ? 'completed active' : ''}">
                <div class="step-node">✓</div>
                <div class="step-label">Placed</div>
              </div>

              <div class="tracker-step ${step >= 2 ? 'completed active' : ''}">
                <div class="step-node">🌸</div>
                <div class="step-label">Packed</div>
              </div>

              <div class="tracker-step ${step >= 3 ? 'completed active' : ''}">
                <div class="step-node">🚚</div>
                <div class="step-label">Out for Delivery</div>
              </div>

              <div class="tracker-step ${step >= 4 ? 'completed active' : ''}">
                <div class="step-node">🏡</div>
                <div class="step-label">Delivered</div>
              </div>
            </div>

            <!-- Items and address summary -->
            <div class="order-items-summary-list">
              <div style="font-size:0.85rem;margin-bottom:0.5rem;font-weight:600;">Items in this bouquet shipment:</div>
              ${order.items.map(item => `
                <div style="font-size:0.82rem;color:var(--muted);display:flex;justify-content:space-between;">
                  <span>${item.qty} × ${item.name}</span>
                  <span>${APP_CONFIG.currencySymbol}${item.price * item.qty}</span>
                </div>
              `).join('')}
              <div style="font-size:0.8rem;color:var(--muted);margin-top:0.75rem;border-top:1px dashed var(--border);padding-top:0.5rem;">
                📍 Deliver to: ${order.address}
              </div>
            </div>

          </div>
        `;
      }).join('');
    },

    // ------------------------------------------------------------------------
    // PROFILE & SAVED ADDRESSES
    // ------------------------------------------------------------------------
    renderProfile() {
      if (this.dom.profileDisplayName) this.dom.profileDisplayName.textContent = State.user.name;
      if (this.dom.profileDisplayEmail) this.dom.profileDisplayEmail.textContent = State.user.email;
      if (this.dom.profileDisplayPhone) this.dom.profileDisplayPhone.textContent = State.user.phone;
      if (this.dom.profileAvatarText) {
        const initials = State.user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        this.dom.profileAvatarText.textContent = initials || 'PW';
      }

      // Render addresses
      if (!this.dom.addressListContainer) return;
      this.dom.addressListContainer.innerHTML = State.user.addresses.map(addr => `
        <div class="address-item-card">
          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
            <span class="addr-badge">${addr.label}</span>
            ${addr.isDefault ? '<small class="text-success font-weight-bold">Default</small>' : ''}
          </div>
          <strong style="font-size:0.9rem;display:block;">${addr.recipient}</strong>
          <p style="font-size:0.85rem;color:var(--muted);margin-top:0.3rem;">${addr.details}, ${addr.city} - ${addr.pincode}</p>
          <div class="addr-actions">
            <button type="button" class="btn btn-outline btn-sm" onclick="window.PhoolwalaApp.deleteAddress('${addr.id}')">Delete</button>
          </div>
        </div>
      `).join('');
    },

    handleSaveAddress(e) {
      e.preventDefault();
      const label = document.getElementById('addrLabel')?.value.trim();
      const recipient = document.getElementById('addrRecipient')?.value.trim();
      const details = document.getElementById('addrDetails')?.value.trim();
      const city = document.getElementById('addrCity')?.value.trim();
      const pincode = document.getElementById('addrPincode')?.value.trim();

      if (!label || !recipient || !details || !city || !pincode) {
        Toast.show('Please fill in all address fields.', 'error');
        return;
      }

      State.user.addresses.push({
        id: `addr-${Date.now()}`,
        label,
        recipient,
        details,
        city,
        pincode,
        isDefault: false
      });

      State.saveUser();
      this.dom.addressModal.close();
      this.dom.newAddressForm.reset();
      Toast.show('New address saved to your address book!');
    },

    deleteAddress(addressId) {
      State.user.addresses = State.user.addresses.filter(a => a.id !== addressId);
      State.saveUser();
      Toast.show('Address removed.');
    },

    // ------------------------------------------------------------------------
    // AUTH MODAL LOGIC (LOGIN & REGISTER)
    // ------------------------------------------------------------------------
    openAuthModal() {
      this.dom.authDialog.showModal();
    },

    handleLogin(e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail')?.value.trim();
      const password = document.getElementById('loginPassword')?.value.trim();

      if (!email || !password) {
        Toast.show('Please enter both email and password.', 'error');
        return;
      }

      State.user.isLoggedIn = true;
      State.user.email = email;
      State.saveUser();
      this.dom.authDialog.close();
      Toast.show(`Welcome back, ${State.user.name}! 🌸`);
    },

    handleRegister(e) {
      e.preventDefault();
      const name = document.getElementById('regName')?.value.trim();
      const email = document.getElementById('regEmail')?.value.trim();
      const phone = document.getElementById('regPhone')?.value.trim();
      const password = document.getElementById('regPassword')?.value.trim();

      if (!name || !email || !phone || !password) {
        Toast.show('Please fill in all registration fields.', 'error');
        return;
      }

      State.user.name = name;
      State.user.email = email;
      State.user.phone = phone;
      State.user.isLoggedIn = true;
      State.saveUser();
      this.dom.authDialog.close();
      Toast.show(`Welcome to the Phoolwala Bloom Club, ${name}!`);
    },

    // ------------------------------------------------------------------------
    // THEME CONTROLLER (LIGHT / DARK SYNC)
    // ------------------------------------------------------------------------
    toggleTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', nextTheme);
      const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
      if (metaColorScheme) metaColorScheme.content = nextTheme;

      try {
        localStorage.setItem('phoolwala_theme', nextTheme);
      } catch (e) {}

      Toast.show(`Switched to ${nextTheme === 'dark' ? 'Midnight Plum (Dark)' : 'Blush Garden (Light)'} theme 🌓`);
    }
  };

  // --------------------------------------------------------------------------
  // 7. INITIALIZE APPLICATION
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    State.init();
    UI.init();
  });

  // Global hooks for inline event triggers
  window.PhoolwalaApp = {
    updateCartQty: (id, delta) => UI.updateCartQuantity(id, delta),
    removeCartItem: (id) => UI.removeFromCart(id),
    toggleWishlist: (id) => UI.toggleWishlist(id),
    moveWishlistToCart: (id) => {
      UI.addToCart(id, 1);
      UI.toggleWishlist(id);
    },
    deleteAddress: (id) => UI.deleteAddress(id)
  };

  window.filterByCategory = (cat) => UI.filterByCategory(cat);

})();
