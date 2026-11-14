import { PRODUCTS, CATEGORIES } from '../data/products';
import { isFirebaseConfigured, db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const PRODUCTS_STORAGE_KEY = 'floora_admin_products';
const CATEGORIES_STORAGE_KEY = 'floora_admin_categories';
const RETIRED_CATALOG_IDS = new Set(['fl-bday-03', 'fl-wed-03', 'fl-ann-01', 'fl-pot-05', 'fl-pot-06', 'fl-pot-07', 'fl-pot-08']);

/**
 * Sync stored/Firestore products list with current catalog definitions:
 * - Syncs occasions, image, and gallery for built-in catalog items so occasion filters stay accurate (4 per occasion)
 * - Removes retired duplicate IDs from earlier catalog revisions
 * - Appends any new catalog products not yet in storage
 * - Preserves custom admin-added products and admin price/stock/name edits
 */
function syncProductsWithCatalog(list) {
  if (!Array.isArray(list) || list.length === 0) return PRODUCTS;
  const catalogMap = new Map(PRODUCTS.map(p => [p.id, p]));

  const synced = list
    .filter(item => !RETIRED_CATALOG_IDS.has(item.id))
    .map(item => {
      const def = catalogMap.get(item.id);
      if (def) {
        return {
          ...item,
          category: (def.id === 'fl-mock-03' || def.id === 'fl-int-08') ? def.category : (item.category || def.category),
          bouquetType: (def.id === 'fl-mock-03' || def.id === 'fl-int-08') ? def.bouquetType : (item.bouquetType || def.bouquetType),
          occasions: def.occasions,
          image: def.image,
          gallery: def.gallery
        };
      }
      if (!item.occasions || !Array.isArray(item.occasions) || item.occasions.length === 0) {
        return { ...item, occasions: ['Birthday', 'Congratulations'] };
      }
      return item;
    });

  const storedIds = new Set(synced.map(p => p.id));
  const newCatalogProducts = PRODUCTS.filter(p => !storedIds.has(p.id));
  return newCatalogProducts.length > 0 ? [...synced, ...newCatalogProducts] : synced;
}

/**
 * Get active products list from localStorage, synced with catalog definitions
 */
export function getStoredProducts() {
  try {
    const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return syncProductsWithCatalog(parsed);
      }
    }
  } catch (e) {
    console.warn('Error reading stored products:', e);
  }
  return PRODUCTS;
}

/**
 * Save products list to localStorage, dispatch update events, and sync to Firebase
 */
export async function saveStoredProducts(newList) {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(newList));
    window.dispatchEvent(new CustomEvent('floora_products_updated', { detail: newList }));
    window.dispatchEvent(new Event('storage'));

    if (isFirebaseConfigured && db) {
      try {
        const prodDocRef = doc(db, 'site_content', 'products');
        await setDoc(prodDocRef, { list: newList, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.warn('Firestore products save warning:', err);
      }
    }
    return true;
  } catch (e) {
    console.error('Failed to save products:', e);
    return false;
  }
}

/**
 * Subscribe to real-time changes in products
 */
export function subscribeProducts(callback) {
  const handleCustom = (e) => {
    callback(e.detail || getStoredProducts());
  };

  const handleStorage = (e) => {
    if (e.key === PRODUCTS_STORAGE_KEY) {
      callback(getStoredProducts());
    }
  };

  window.addEventListener('floora_products_updated', handleCustom);
  window.addEventListener('storage', handleStorage);

  let unsubscribeFirestore = null;
  if (isFirebaseConfigured && db) {
    try {
      const prodDocRef = doc(db, 'site_content', 'products');
      unsubscribeFirestore = onSnapshot(prodDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.list) && data.list.length > 0) {
            const syncedList = syncProductsWithCatalog(data.list);
            localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(syncedList));
            callback(syncedList);
          }
        }
      }, (err) => {
        console.warn('Firestore snapshot error on products:', err);
      });
    } catch (e) {}
  }

  return () => {
    window.removeEventListener('floora_products_updated', handleCustom);
    window.removeEventListener('storage', handleStorage);
    if (unsubscribeFirestore) unsubscribeFirestore();
  };
}

/**
 * Get active categories list from localStorage or fallback
 */
export function getStoredCategories() {
  try {
    const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  return CATEGORIES;
}

/**
 * Save categories list and dispatch updates
 */
export async function saveStoredCategories(newList) {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(newList));
    window.dispatchEvent(new CustomEvent('floora_categories_updated', { detail: newList }));
    window.dispatchEvent(new Event('storage'));

    if (isFirebaseConfigured && db) {
      try {
        const catDocRef = doc(db, 'site_content', 'categories');
        await setDoc(catDocRef, { list: newList, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {}
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Subscribe to real-time changes in categories
 */
export function subscribeCategories(callback) {
  const handleCustom = (e) => {
    callback(e.detail || getStoredCategories());
  };

  const handleStorage = (e) => {
    if (e.key === CATEGORIES_STORAGE_KEY) {
      callback(getStoredCategories());
    }
  };

  window.addEventListener('floora_categories_updated', handleCustom);
  window.addEventListener('storage', handleStorage);

  let unsubscribeFirestore = null;
  if (isFirebaseConfigured && db) {
    try {
      const catDocRef = doc(db, 'site_content', 'categories');
      unsubscribeFirestore = onSnapshot(catDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.list) && data.list.length > 0) {
            localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(data.list));
            callback(data.list);
          }
        }
      }, () => {});
    } catch (e) {}
  }

  return () => {
    window.removeEventListener('floora_categories_updated', handleCustom);
    window.removeEventListener('storage', handleStorage);
    if (unsubscribeFirestore) unsubscribeFirestore();
  };
}

