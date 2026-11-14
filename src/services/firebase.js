import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

// Strict check: only activate Firebase if REAL environment credentials exist
export const isFirebaseConfigured = Boolean(
  apiKey &&
  projectId &&
  !apiKey.includes("Demo") &&
  !apiKey.includes("1234567890") &&
  apiKey.length > 20 &&
  projectId !== "floora-shop-demo"
);

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  try {
    const firebaseConfig = {
      apiKey: apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.warn("Firebase initialization failed, falling back to local mode:", error);
  }
} else {
  console.info("Floora running in local storage mode (Firebase not connected yet).");
}

/**
 * Cloud Firestore Helpers for Strict User Privacy
 */

// Save or update user profile document in Firestore: users/{uid}
export async function syncUserProfileToFirestore(uid, profileData) {
  if (!isFirebaseConfigured || !db || !uid) return;
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, { ...profileData, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn("Could not sync user profile to Firestore:", err);
  }
}

// Fetch user profile document from Firestore: users/{uid}
export async function fetchUserProfileFromFirestore(uid) {
  if (!isFirebaseConfigured || !db || !uid) return null;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn("Could not fetch user profile from Firestore:", err);
  }
  return null;
}

// Save an order in Firestore under user-specific subcollection: users/{uid}/orders/{orderId}
export async function syncOrderToFirestore(uid, order) {
  if (!isFirebaseConfigured || !db) {
    return { ok: true, synced: false };
  }
  if (!uid || !order?.orderId) {
    return { ok: false, error: 'Missing user or order ID for Firebase sync.' };
  }
  try {
    const orderDocRef = doc(db, 'users', uid, 'orders', order.orderId);
    await setDoc(orderDocRef, { ...order, userId: uid, syncedAt: new Date().toISOString() }, { merge: true });
    return { ok: true, synced: true };
  } catch (err) {
    console.warn("Could not sync order to Firestore:", err);
    return { ok: false, error: err?.message || 'Could not save order to Firebase.' };
  }
}

// Delete an order from Firestore under users/{uid}/orders/{orderId}
export async function deleteOrderFromFirestore(uid, orderId) {
  if (!isFirebaseConfigured || !db) {
    return { ok: true, synced: false };
  }
  if (!uid || !orderId) {
    return { ok: false, error: 'Missing user or order ID for deletion.' };
  }
  try {
    const orderDocRef = doc(db, 'users', uid, 'orders', orderId);
    await deleteDoc(orderDocRef);
    return { ok: true, synced: true };
  } catch (err) {
    console.warn("Could not delete order from Firestore:", err);
    return { ok: false, error: err?.message || 'Could not delete order from Firebase.' };
  }
}

// Fetch all orders for a specific user from Firestore: users/{uid}/orders
export async function fetchUserOrdersFromFirestore(uid) {
  if (!isFirebaseConfigured || !db || !uid) return null;
  try {
    const ordersColRef = collection(db, 'users', uid, 'orders');
    const snap = await getDocs(ordersColRef);
    const orders = [];
    snap.forEach(docSnap => {
      orders.push(docSnap.data());
    });
    return orders;
  } catch (err) {
    console.warn("Could not fetch user orders from Firestore:", err);
  }
  return null;
}

export { app, auth, db };


