import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { syncOrderToFirestore, fetchUserOrdersFromFirestore, deleteOrderFromFirestore } from '../services/firebase';

const OrdersContext = createContext();

export const useOrders = () => useContext(OrdersContext);

const DEMO_ORDER_ANANYA = {
  orderId: 'FL-89241',
  date: 'Today, 09:30 AM',
  items: [
    {
      id: 'fl-int-01',
      name: 'Velvet Red Dutch Roses',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      price: 1299,
      quantity: 1
    }
  ],
  subtotal: 1299,
  discount: 0,
  deliveryFee: 0,
  total: 1299,
  deliverySlot: 'Express 2-Hour Delivery',
  status: 'Out for Delivery',
  statusStep: 3, // 1: Placed, 2: Packed, 3: Out for Delivery, 4: Delivered
  shippingAddress: {
    name: 'Ananya Sharma',
    phone: '+91 98765 43210',
    addressLine: 'Flat 402, Lotus Residency, Link Road',
    city: 'Mumbai',
    pincode: '400050'
  },
  paymentMethod: 'UPI (Paid)'
};

export const OrdersProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);

  // React to user login / logout / switch to ensure strict data privacy
  useEffect(() => {
    let isMounted = true;

    async function loadUserOrders() {
      if (!currentUser?.uid) {
        // Complete Privacy: If no user is logged in, orders list is strictly empty
        setOrders([]);
        return;
      }

      const uid = currentUser.uid;

      // 1. Try fetching from Cloud Firestore
      const firestoreOrders = await fetchUserOrdersFromFirestore(uid);
      if (firestoreOrders && firestoreOrders.length > 0 && isMounted) {
        setOrders(firestoreOrders);
        localStorage.setItem(`floora_orders_${uid}`, JSON.stringify(firestoreOrders));
        return;
      }

      // 2. Try fetching from user-scoped localStorage
      try {
        const saved = localStorage.getItem(`floora_orders_${uid}`);
        if (saved) {
          if (isMounted) setOrders(JSON.parse(saved));
          return;
        }
      } catch (e) {
        console.warn("Could not read orders from localStorage:", e);
      }

      // 3. If demo user, seed initial order strictly for Ananya
      if (uid === 'ananya-floora-demo') {
        const seeded = [{ ...DEMO_ORDER_ANANYA, userId: uid }];
        if (isMounted) setOrders(seeded);
        localStorage.setItem(`floora_orders_${uid}`, JSON.stringify(seeded));
        return;
      }

      // 4. For any other user (User 2, User 3, etc.), orders list is strictly EMPTY!
      if (isMounted) setOrders([]);
    }

    loadUserOrders();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.uid]);

  const placeOrder = async (orderData) => {
    const uid = currentUser?.uid || 'guest';
    const newOrder = {
      ...orderData,
      userId: uid,
      orderId: 'FL-' + Math.floor(10000 + Math.random() * 90000),
      date: 'Just now',
      status: 'Placed',
      statusStep: 1
    };

    // Save strictly to Firebase first for authenticated users; abort if Firebase save fails
    if (uid !== 'guest') {
      const syncResult = await syncOrderToFirestore(uid, newOrder);
      if (syncResult && syncResult.ok === false) {
        throw new Error(syncResult.error || 'Failed to save order to Firebase. Please try again.');
      }
    }

    const updated = [newOrder, ...orders];
    setOrders(updated);

    if (uid !== 'guest') {
      try {
        localStorage.setItem(`floora_orders_${uid}`, JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save user orders:", e);
      }
    }

    // Also record into Admin Panel Orders so Notification Bell immediately receives new customer order
    try {
      const adminOrdersRaw = localStorage.getItem('floora_admin_orders');
      const adminOrders = adminOrdersRaw ? JSON.parse(adminOrdersRaw) : [];
      const adminEntry = {
        id: '#' + newOrder.orderId,
        customer: orderData.shippingAddress?.fullName || currentUser?.name || 'Customer',
        amount: `₹${Number(orderData.total || 0).toLocaleString('en-IN')}`,
        status: 'Pending',
        date: 'Today',
        timestamp: new Date().toISOString(),
        items: orderData.items?.length || 1,
        isNew: true
      };
      localStorage.setItem('floora_admin_orders', JSON.stringify([adminEntry, ...adminOrders]));
      // Trigger a storage event so open admin windows update live
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn("Could not record admin order notification:", e);
    }

    return newOrder;
  };

  const deleteOrder = async (orderId) => {
    if (!orderId) return;
    const uid = currentUser?.uid || 'guest';

    if (uid !== 'guest') {
      const delResult = await deleteOrderFromFirestore(uid, orderId);
      if (delResult && delResult.ok === false) {
        throw new Error(delResult.error || 'Failed to delete order from Firebase.');
      }
    }

    const updated = orders.filter(o => o.orderId !== orderId);
    setOrders(updated);

    if (uid !== 'guest') {
      try {
        localStorage.setItem(`floora_orders_${uid}`, JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not update user orders in storage:", e);
      }
    }

    try {
      const adminOrdersRaw = localStorage.getItem('floora_admin_orders');
      if (adminOrdersRaw) {
        const adminOrders = JSON.parse(adminOrdersRaw);
        const filteredAdmin = adminOrders.filter(a => a.id !== `#${orderId}` && a.id !== orderId);
        localStorage.setItem('floora_admin_orders', JSON.stringify(filteredAdmin));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.warn("Could not update admin orders:", e);
    }
  };

  return (
    <OrdersContext.Provider value={{
      orders,
      placeOrder,
      deleteOrder
    }}>
      {children}
    </OrdersContext.Provider>
  );
};
