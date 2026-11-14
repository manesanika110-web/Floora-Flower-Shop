import { isFirebaseConfigured, db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export const DEFAULT_HOME_CONTENT = {
  heroBanners: {
    autoPlay: true,
    interval: 3000,
    banners: [
      {
        id: 'banner-1',
        image: '/banners/banner_mixed_bouquets.jpg',
        alt: 'Floora Mixed Bouquet Edition – Fresh Flowers, Delivered with Love',
        title: 'Mixed Bouquet Edition',
        subtitle: 'Fresh Flowers, Delivered with Love',
        buttonText: 'Explore Bouquets',
        buttonLink: '/shop?category=Bouquets'
      },
      {
        id: 'banner-2',
        image: '/banners/banner_white_lilies.jpg',
        alt: 'Floora Flowers – Fresh White Lilies',
        title: 'Fresh White Lilies',
        subtitle: 'Purity, Elegance & Grace',
        buttonText: 'Shop Lilies',
        buttonLink: '/shop?flower=Lilies'
      },
      {
        id: 'banner-3',
        image: '/banners/banner_natures_beauty.jpg',
        alt: "Floora – Nature's Beauty Roses & Sunflowers",
        title: "Nature's Beauty",
        subtitle: 'Roses & Sunflowers Handpicked for You',
        buttonText: 'Shop Roses',
        buttonLink: '/shop?flower=Roses'
      },
      {
        id: 'banner-4',
        image: '/banners/banner_exotic_orchids.jpg',
        alt: 'Floora Exotic Orchids Collection',
        title: 'Exotic Orchids Collection',
        subtitle: 'Vibrant Colors from Tropical Gardens',
        buttonText: 'Explore Orchids',
        buttonLink: '/shop?flower=Orchids'
      },
      {
        id: 'banner-5',
        image: '/banners/banner_sunflower_bloom.jpg',
        alt: 'Bloom Like a Sunflower – Always Turn Towards the Sunshine',
        title: 'Sunflower Sunshine',
        subtitle: 'Always Turn Towards The Sunshine',
        buttonText: 'Shop Sunflowers',
        buttonLink: '/shop'
      }
    ]
  },

  categorySection: {
    title: 'Explore By Category',
    subtitle: 'Browse all categories of fresh blooms and handcrafted bouquets'
  },

  specialOffers: {
    sectionSubtitle: 'Exclusive Deals',
    sectionTitle: 'Special Offers & Promotions',
    sectionNote: 'Use coupon codes at checkout for instant discounts',
    offers: [
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
    ]
  },

  catalogSection: {
    sectionSubtitle: 'Fresh Floral Catalog',
    sectionTitle: 'All Flowers & Bouquets',
    sectionDescription: 'Explore our signature collections: traditional Indian blooms, artisanal bouquets, exotic international stems & living flower pots.',
    exploreAllText: 'Explore All in Shop',
    exploreAllLink: '/shop',
    rows: {
      indian: {
        title: 'Indian Flowers',
        subtitle: 'Sacred ceremonial blooms, fragrant jasmine & festival garlands',
        buttonText: 'Explore Indian Flowers',
        buttonLink: '/shop?origin=Indian'
      },
      bouquets: {
        title: 'Bouquets (Different Flowers)',
        subtitle: 'Hand-tied artisanal arrangements for love, celebration & luxury gifting',
        buttonText: 'Explore Bouquets',
        buttonLink: '/shop?category=Bouquets'
      },
      international: {
        title: 'International Flowers',
        subtitle: 'Exotic Dutch tulips, Ecuadorian roses, Thai orchids & Australian blooms',
        buttonText: 'Explore International Flowers',
        buttonLink: '/shop?origin=International'
      },
      pots: {
        title: 'Flower Pots & Indoor Plants',
        subtitle: 'Evergreen flowering pots & decorative desktop floral planters',
        buttonText: 'Explore Flower Pots',
        buttonLink: '/shop?category=Flower%20Pots'
      }
    }
  },

  reviewsSection: {
    sectionTitle: 'Customer Reviews',
    sectionSubtitle: 'Real feedback from our delighted customers across India',
    reviews: [
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
    ]
  },

  footer: {
    brandBio: 'Artisanal blooms, sacred Indian flowers & luxury hand-tied bouquets, delivered fresh.',
    socialLinks: {
      facebook: '#',
      instagram: '#',
      twitter: '#',
      youtube: '#'
    },
    promiseList: [
      '🌿 100% Dawn-Harvested Fresh',
      '💧 Chilled Moisture Delivery',
      '🚚 Express Same-Day Shipping',
      '✨ Handcrafted by Floral Artists'
    ],
    copyrightNote: 'Floora Flower Boutique. All rights reserved.'
  }
};

const LOCAL_STORAGE_KEY = 'floora_home_content';

/**
 * Load homepage content synchronously from localStorage with fallback to DEFAULT_HOME_CONTENT
 */
export function getHomeContent() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return DEFAULT_HOME_CONTENT;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_HOME_CONTENT,
      ...parsed,
      heroBanners: { ...DEFAULT_HOME_CONTENT.heroBanners, ...(parsed.heroBanners || {}) },
      categorySection: { ...DEFAULT_HOME_CONTENT.categorySection, ...(parsed.categorySection || {}) },
      specialOffers: { ...DEFAULT_HOME_CONTENT.specialOffers, ...(parsed.specialOffers || {}) },
      catalogSection: {
        ...DEFAULT_HOME_CONTENT.catalogSection,
        ...(parsed.catalogSection || {}),
        rows: { ...DEFAULT_HOME_CONTENT.catalogSection.rows, ...(parsed.catalogSection?.rows || {}) }
      },
      reviewsSection: { ...DEFAULT_HOME_CONTENT.reviewsSection, ...(parsed.reviewsSection || {}) },
      footer: { ...DEFAULT_HOME_CONTENT.footer, ...(parsed.footer || {}) }
    };
  } catch (err) {
    console.error('Error loading home content:', err);
    return DEFAULT_HOME_CONTENT;
  }
}

/**
 * Save homepage content to localStorage AND to Cloud Firestore (if configured)
 */
export async function saveHomeContent(updatedContent) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedContent));
    window.dispatchEvent(new CustomEvent('floora_home_content_updated', { detail: updatedContent }));

    // Firebase Firestore Sync
    if (isFirebaseConfigured && db) {
      try {
        const homeDocRef = doc(db, 'site_content', 'homepage');
        await setDoc(homeDocRef, {
          ...updatedContent,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log('Successfully synced homepage content to Firebase Firestore!');
      } catch (fbErr) {
        console.warn('Could not sync homepage to Firestore:', fbErr);
      }
    }
    return true;
  } catch (err) {
    console.error('Failed to save home content:', err);
    return false;
  }
}

/**
 * Subscribe to real-time changes in homepage content across tabs and Firestore
 */
export function subscribeHomeContent(callback) {
  const handleUpdate = (e) => {
    callback(e.detail || getHomeContent());
  };

  const handleStorage = (e) => {
    if (e.key === LOCAL_STORAGE_KEY) {
      callback(getHomeContent());
    }
  };

  window.addEventListener('floora_home_content_updated', handleUpdate);
  window.addEventListener('storage', handleStorage);

  let unsubscribeFirestore = null;
  if (isFirebaseConfigured && db) {
    try {
      const homeDocRef = doc(db, 'site_content', 'homepage');
      unsubscribeFirestore = onSnapshot(homeDocRef, (snap) => {
        if (snap.exists()) {
          const remoteData = snap.data();
          const merged = {
            ...DEFAULT_HOME_CONTENT,
            ...remoteData,
            heroBanners: { ...DEFAULT_HOME_CONTENT.heroBanners, ...(remoteData.heroBanners || {}) },
            categorySection: { ...DEFAULT_HOME_CONTENT.categorySection, ...(remoteData.categorySection || {}) },
            specialOffers: { ...DEFAULT_HOME_CONTENT.specialOffers, ...(remoteData.specialOffers || {}) },
            catalogSection: {
              ...DEFAULT_HOME_CONTENT.catalogSection,
              ...(remoteData.catalogSection || {}),
              rows: { ...DEFAULT_HOME_CONTENT.catalogSection.rows, ...(remoteData.catalogSection?.rows || {}) }
            },
            reviewsSection: { ...DEFAULT_HOME_CONTENT.reviewsSection, ...(remoteData.reviewsSection || {}) },
            footer: { ...DEFAULT_HOME_CONTENT.footer, ...(remoteData.footer || {}) }
          };
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
          callback(merged);
        }
      }, (err) => {
        console.warn('Firestore snapshot error on homepage:', err);
      });
    } catch (e) {
      console.warn('Could not attach Firestore listener:', e);
    }
  }

  return () => {
    window.removeEventListener('floora_home_content_updated', handleUpdate);
    window.removeEventListener('storage', handleStorage);
    if (unsubscribeFirestore) unsubscribeFirestore();
  };
}

