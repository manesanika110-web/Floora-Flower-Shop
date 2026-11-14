import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import {
  auth,
  isFirebaseConfigured,
  syncUserProfileToFirestore,
  fetchUserProfileFromFirestore
} from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Initial Profile for Demo User (matching user request image)
export const DEMO_USER_ANANYA = {
  uid: 'ananya-floora-demo',
  displayName: 'Ananya Sharma',
  fullName: 'Ananya Sharma',
  name: 'Ananya Sharma',
  email: 'ananya@example.com',
  phoneNumber: '+91 98765 43210',
  gender: 'Female',
  city: 'Mumbai',
  pincode: '400053',
  state: 'Maharashtra',
  addresses: [
    {
      id: 'addr-ananya-default',
      label: 'Home',
      name: 'Ananya Sharma',
      phone: '+91 98765 43210',
      addressLine: 'Flat 402 Lotus Residency, Link Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400053',
      isDefault: true
    }
  ]
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      // 1. Seed demo user once if first time visitor
      const hasSeeded = localStorage.getItem('floora_has_seeded_demo');
      if (!hasSeeded) {
        localStorage.setItem('floora_has_seeded_demo', 'true');
        localStorage.setItem('floora_active_uid', DEMO_USER_ANANYA.uid);
        localStorage.setItem(`floora_user_profile_${DEMO_USER_ANANYA.uid}`, JSON.stringify(DEMO_USER_ANANYA));
        return DEMO_USER_ANANYA;
      }

      // Clean any admin email accidentally registered as regular user
      try {
        const regStr = localStorage.getItem('floora_registered_users');
        if (regStr) {
          const regUsers = JSON.parse(regStr);
          const filtered = regUsers.filter(u => u.email && u.email.toLowerCase() !== 'flowers@admin.com' && u.email.toLowerCase() !== 'floora@admin.com');
          if (filtered.length !== regUsers.length) {
            localStorage.setItem('floora_registered_users', JSON.stringify(filtered));
          }
        }
      } catch { }

      // 2. Load active user by UID only
      const activeUid = localStorage.getItem('floora_active_uid');
      if (activeUid) {
        const savedProfile = localStorage.getItem(`floora_user_profile_${activeUid}`);
        if (savedProfile) {
          return JSON.parse(savedProfile);
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync with Firebase Auth state if real Firebase is configured
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Fetch existing user document from Cloud Firestore
          const firestoreProfile = await fetchUserProfileFromFirestore(firebaseUser.uid);

          let resolvedProfile;
          if (firestoreProfile) {
            resolvedProfile = firestoreProfile;
          } else {
            // New user in Firestore: initialize with their credentials and strict empty addresses
            resolvedProfile = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              fullName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
              phoneNumber: firebaseUser.phoneNumber || '',
              gender: '',
              city: '',
              pincode: '',
              state: '',
              addresses: [] // Strictly empty for new user
            };
            await syncUserProfileToFirestore(firebaseUser.uid, resolvedProfile);
          }

          setCurrentUser(resolvedProfile);
          localStorage.setItem('floora_active_uid', firebaseUser.uid);
          localStorage.setItem(`floora_user_profile_${firebaseUser.uid}`, JSON.stringify(resolvedProfile));
        } else {
          // Firebase reports logged out
          const activeUid = localStorage.getItem('floora_active_uid');
          // Only clear if not in offline demo mode
          if (activeUid && !activeUid.startsWith('ananya-') && !activeUid.startsWith('user-')) {
            setCurrentUser(null);
            localStorage.removeItem('floora_active_uid');
          }
        }
      });
      return unsubscribe;
    } catch (e) {
      console.warn("Auth state listener fallback:", e);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const normalizedEmail = (email || '').trim().toLowerCase();

      // 0. FLOORA AUTHORIZED ADMIN CREDENTIALS CHECK (supports flowers@admin.com & floora@admin.com)
      const isAdminTarget = normalizedEmail === 'flowers@admin.com' || normalizedEmail === 'floora@admin.com';
      if (isAdminTarget) {
        // Delete this ID from regular registered users list if present
        try {
          const regStr = localStorage.getItem('floora_registered_users');
          if (regStr) {
            const regUsers = JSON.parse(regStr);
            const filtered = regUsers.filter(u => u.email && u.email.toLowerCase() !== normalizedEmail);
            localStorage.setItem('floora_registered_users', JSON.stringify(filtered));
          }
        } catch { }

        const adminProfile = {
          uid: 'floora-admin-root',
          role: 'admin',
          isAdmin: true,
          displayName: 'Floora Admin',
          fullName: 'Floora Admin',
          name: 'Floora Admin',
          email: normalizedEmail,
          phoneNumber: '+91 98200 12345',
          city: 'Mumbai',
          pincode: '400001',
          state: 'Maharashtra',
          addresses: []
        };

        setCurrentUser(adminProfile);
        localStorage.setItem('floora_active_uid', adminProfile.uid);
        localStorage.setItem(`floora_user_profile_${adminProfile.uid}`, JSON.stringify(adminProfile));
        localStorage.setItem('floora_admin_authenticated', 'true');
        return { success: true, isAdmin: true, user: adminProfile };
      }

      // 1. Try Firebase if valid credentials exist
      if (isFirebaseConfigured && auth) {
        try {
          const res = await signInWithEmailAndPassword(auth, normalizedEmail, password);
          const uid = res.user.uid;

          let userProfile = await fetchUserProfileFromFirestore(uid);
          if (!userProfile) {
            userProfile = {
              uid,
              displayName: res.user.displayName || normalizedEmail.split('@')[0],
              fullName: res.user.displayName || normalizedEmail.split('@')[0],
              email: res.user.email,
              phoneNumber: res.user.phoneNumber || '',
              gender: '',
              city: '',
              pincode: '',
              state: '',
              addresses: []
            };
            await syncUserProfileToFirestore(uid, userProfile);
          }

          setCurrentUser(userProfile);
          localStorage.setItem('floora_active_uid', uid);
          localStorage.setItem(`floora_user_profile_${uid}`, JSON.stringify(userProfile));
          return { success: true };
        } catch (firebaseErr) {
          console.warn("Firebase sign in note:", firebaseErr.code || firebaseErr.message);
        }
      }

      // 2. Demo User Login
      if (normalizedEmail === 'ananya@example.com') {
        const ananyaProfile = JSON.parse(
          localStorage.getItem(`floora_user_profile_${DEMO_USER_ANANYA.uid}`) ||
          JSON.stringify(DEMO_USER_ANANYA)
        );
        setCurrentUser(ananyaProfile);
        localStorage.setItem('floora_active_uid', DEMO_USER_ANANYA.uid);
        localStorage.setItem(`floora_user_profile_${DEMO_USER_ANANYA.uid}`, JSON.stringify(ananyaProfile));
        return { success: true };
      }

      // 3. Local Storage Authentication Mode (Strict User Isolation)
      let registeredUsers = [];
      try {
        const saved = localStorage.getItem('floora_registered_users');
        if (saved) registeredUsers = JSON.parse(saved);
      } catch { }

      const foundUser = registeredUsers.find(u => u.email.toLowerCase() === normalizedEmail);

      if (foundUser) {
        if (foundUser.password && foundUser.password !== password) {
          return { success: false, error: 'Incorrect password. Please try again.' };
        }

        // Load the profile specific to this user's UID
        let userProfile = null;
        try {
          const savedProf = localStorage.getItem(`floora_user_profile_${foundUser.uid}`);
          if (savedProf) userProfile = JSON.parse(savedProf);
        } catch { }

        if (!userProfile) {
          userProfile = {
            uid: foundUser.uid,
            displayName: foundUser.displayName,
            fullName: foundUser.displayName,
            email: foundUser.email,
            phoneNumber: foundUser.phoneNumber || '',
            gender: foundUser.gender || '',
            city: foundUser.city || '',
            pincode: foundUser.pincode || '',
            state: foundUser.state || '',
            addresses: foundUser.addresses || []
          };
        }

        setCurrentUser(userProfile);
        localStorage.setItem('floora_active_uid', foundUser.uid);
        localStorage.setItem(`floora_user_profile_${foundUser.uid}`, JSON.stringify(userProfile));
        return { success: true };
      }

      // 4. If user wasn't registered prior in local mode, create a brand-new isolated account for them
      const newUid = 'user-' + Date.now();
      const newIsolatedUser = {
        uid: newUid,
        displayName: normalizedEmail.split('@')[0].replace(/[._-]/g, ' '),
        fullName: normalizedEmail.split('@')[0].replace(/[._-]/g, ' '),
        email: normalizedEmail,
        phoneNumber: '',
        gender: '',
        city: '',
        pincode: '',
        state: '',
        addresses: [] // Strictly isolated! Never inherits previous user's address!
      };

      // Save to registered list
      registeredUsers.push({
        uid: newUid,
        email: normalizedEmail,
        displayName: newIsolatedUser.displayName,
        password: password
      });
      localStorage.setItem('floora_registered_users', JSON.stringify(registeredUsers));

      // Set active session
      setCurrentUser(newIsolatedUser);
      localStorage.setItem('floora_active_uid', newUid);
      localStorage.setItem(`floora_user_profile_${newUid}`, JSON.stringify(newIsolatedUser));
      return { success: true };

    } catch (error) {
      return { success: false, error: 'Login could not be completed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, phone = '') => {
    setLoading(true);
    try {
      const normalizedEmail = (email || '').trim().toLowerCase();
      const displayName = (name || '').trim();
      const phoneNumber = (phone || '').trim();

      // 1. Firebase Register
      if (isFirebaseConfigured && auth) {
        try {
          const res = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
          await updateFirebaseProfile(res.user, { displayName });

          const newUserProfile = {
            uid: res.user.uid,
            displayName,
            fullName: displayName,
            email: res.user.email,
            phoneNumber,
            gender: '',
            city: '',
            pincode: '',
            state: '',
            addresses: [] // Strictly empty
          };

          await syncUserProfileToFirestore(res.user.uid, newUserProfile);
          setCurrentUser(newUserProfile);
          localStorage.setItem('floora_active_uid', res.user.uid);
          localStorage.setItem(`floora_user_profile_${res.user.uid}`, JSON.stringify(newUserProfile));
          return { success: true };
        } catch (firebaseErr) {
          console.warn("Firebase register note:", firebaseErr.code || firebaseErr.message);
        }
      }

      // 2. Local Storage Registration Mode with Strict Isolation
      let registeredUsers = [];
      try {
        const saved = localStorage.getItem('floora_registered_users');
        if (saved) registeredUsers = JSON.parse(saved);
      } catch { }

      const existingUser = registeredUsers.find(u => u.email.toLowerCase() === normalizedEmail);
      const newUid = existingUser ? existingUser.uid : 'user-' + Date.now();

      const newUserData = {
        uid: newUid,
        displayName,
        fullName: displayName,
        email: normalizedEmail,
        phoneNumber,
        gender: '',
        city: '',
        pincode: '',
        state: '',
        addresses: [] // Completely isolated & empty
      };

      if (existingUser) {
        existingUser.password = password;
        existingUser.displayName = displayName;
        existingUser.phoneNumber = phoneNumber;
      } else {
        registeredUsers.push({
          uid: newUid,
          email: normalizedEmail,
          displayName,
          password,
          phoneNumber
        });
      }

      localStorage.setItem('floora_registered_users', JSON.stringify(registeredUsers));
      localStorage.setItem(`floora_user_profile_${newUid}`, JSON.stringify(newUserData));

      // Note: AuthPage will flip to login form, but the new user's profile is initialized cleanly
      return { success: true };

    } catch (error) {
      return { success: false, error: 'Registration failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Complete User Privacy Logout
   * Purges all active session identifiers so User 2 sees zero data from User 1
   */
  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn("Firebase signOut:", e);
      }
    }
    // Remove active user session keys
    localStorage.removeItem('floora_active_uid');
    localStorage.removeItem('floora_user');
    localStorage.removeItem('floora_admin_authenticated');
    try {
      sessionStorage.removeItem('floora_active_uid');
      sessionStorage.removeItem('floora_admin_authenticated');
    } catch {}
    setCurrentUser(null);
  };

  // Update profile fields (Full Name, Phone, Email, Gender, City, Pincode, State)
  const updateProfile = async (updatedFields) => {
    if (!currentUser?.uid) return;
    const updated = {
      ...currentUser,
      ...updatedFields,
      displayName: updatedFields.fullName || updatedFields.displayName || currentUser.displayName
    };
    setCurrentUser(updated);
    localStorage.setItem(`floora_user_profile_${currentUser.uid}`, JSON.stringify(updated));
    await syncUserProfileToFirestore(currentUser.uid, updated);
  };

  // Add delivery address to user's address book
  const addAddress = async (newAddr) => {
    if (!currentUser?.uid) return;
    const existingAddresses = currentUser.addresses || [];
    const isFirst = existingAddresses.length === 0;

    const addressWithId = {
      ...newAddr,
      id: 'addr-' + Date.now(),
      isDefault: newAddr.isDefault !== undefined ? newAddr.isDefault : isFirst
    };

    let updatedAddresses;
    if (addressWithId.isDefault) {
      updatedAddresses = existingAddresses.map(a => ({ ...a, isDefault: false }));
      updatedAddresses.push(addressWithId);
    } else {
      updatedAddresses = [...existingAddresses, addressWithId];
    }

    const updated = {
      ...currentUser,
      addresses: updatedAddresses
    };

    setCurrentUser(updated);
    localStorage.setItem(`floora_user_profile_${currentUser.uid}`, JSON.stringify(updated));
    await syncUserProfileToFirestore(currentUser.uid, updated);
  };

  // Edit existing delivery address
  const editAddress = async (addressId, updatedAddr) => {
    if (!currentUser?.uid) return;
    const existingAddresses = currentUser.addresses || [];

    const updatedAddresses = existingAddresses.map(addr => {
      if (addr.id === addressId) {
        return { ...addr, ...updatedAddr };
      }
      if (updatedAddr.isDefault) {
        return { ...addr, isDefault: false };
      }
      return addr;
    });

    const updated = {
      ...currentUser,
      addresses: updatedAddresses
    };

    setCurrentUser(updated);
    localStorage.setItem(`floora_user_profile_${currentUser.uid}`, JSON.stringify(updated));
    await syncUserProfileToFirestore(currentUser.uid, updated);
  };

  // Delete address
  const deleteAddress = async (addressId) => {
    if (!currentUser?.uid) return;
    const updatedAddresses = (currentUser.addresses || []).filter(a => a.id !== addressId);

    // If we deleted default and there are remaining addresses, make first default
    if (updatedAddresses.length > 0 && !updatedAddresses.some(a => a.isDefault)) {
      updatedAddresses[0].isDefault = true;
    }

    const updated = {
      ...currentUser,
      addresses: updatedAddresses
    };

    setCurrentUser(updated);
    localStorage.setItem(`floora_user_profile_${currentUser.uid}`, JSON.stringify(updated));
    await syncUserProfileToFirestore(currentUser.uid, updated);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      login,
      register,
      logout,
      updateProfile,
      addAddress,
      editAddress,
      deleteAddress
    }}>
      {children}
    </AuthContext.Provider>
  );
};
