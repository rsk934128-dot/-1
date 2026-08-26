import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, Order, OrderStatus } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google Workspace & Gmail Scopes
export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly'
];

export const googleProvider = new GoogleAuthProvider();
// Add Gmail scopes
GMAIL_SCOPES.forEach(scope => googleProvider.addScope(scope));

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Cache the access token in memory (never in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const getCachedAccessToken = (): string | null => cachedAccessToken;
export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

// Initialize Firestore
export const db = getFirestore(app);

// Helper to check if an auth error is caused by user cancelling/closing the popup
export function isAuthCancellation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === 'auth/popup-closed-by-user' ||
    err.code === 'auth/cancelled-popup-request' ||
    err.code === 'auth/user-cancelled' ||
    Boolean(err.message && err.message.includes('popup-closed-by-user'))
  );
}

/**
 * Recursively removes all undefined values from an object or array before sending to Firestore,
 * preventing 'Unsupported field value: undefined' errors.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as unknown as T;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (value !== undefined) {
      cleaned[key] = sanitizeForFirestore(value);
    }
  }
  return cleaned as T;
}

// Auth helper functions
export async function signInWithGoogle(): Promise<{ user: UserProfile; firebaseUser: FirebaseUser; accessToken: string } | null> {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }

    const userDocRef = doc(db, 'users', fbUser.uid);
    const userSnapshot = await getDoc(userDocRef);

    let appUser: UserProfile;

    if (userSnapshot.exists()) {
      const data = userSnapshot.data();
      appUser = {
        id: fbUser.uid,
        uid: fbUser.uid,
        name: data.name || fbUser.displayName || 'সম্মানিত অতিথি',
        phone: data.phone || '০১৭xxxxxxxx',
        email: data.email || fbUser.email || '',
        address: data.address || 'রেলওয়ে স্টেশন রোড, হোটেল আল শেখ ফরিদ এলাকা',
        stationAreaDetails: data.stationAreaDetails || 'রেলস্টেশন এলাকা',
        role: data.role || 'customer',
        avatar: fbUser.photoURL || undefined,
        photoURL: fbUser.photoURL || undefined,
        savedAddresses: data.savedAddresses || [
          { id: '1', title: 'বাসা / হোটেল', address: data.address || 'স্টেশন রোড' }
        ],
        joinedDate: data.joinedDate || '২০২৬',
        totalOrdersCount: data.totalOrdersCount || 0,
      };
    } else {
      // New user registration via Google Auth
      appUser = {
        id: fbUser.uid,
        uid: fbUser.uid,
        name: fbUser.displayName || 'সম্মানিত অতিথি',
        phone: '০১৭xxxxxxxx',
        email: fbUser.email || '',
        address: 'রেলওয়ে স্টেশন রোড, হোটেল আল শেখ ফরিদ এলাকা',
        stationAreaDetails: 'রেলস্টেশন এলাকা',
        role: 'customer',
        avatar: fbUser.photoURL || undefined,
        photoURL: fbUser.photoURL || undefined,
        savedAddresses: [
          { id: '1', title: 'বাসা / হোটেল', address: 'রেলওয়ে স্টেশন রোড' }
        ],
        joinedDate: '২০২৬',
        totalOrdersCount: 0,
      };

      await setDoc(userDocRef, sanitizeForFirestore({
        uid: fbUser.uid,
        name: appUser.name,
        email: appUser.email,
        phone: appUser.phone,
        address: appUser.address,
        photoURL: fbUser.photoURL || null,
        role: 'customer',
        joinedDate: '২০২৬',
        totalOrdersCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }

    return { 
      user: appUser, 
      firebaseUser: fbUser,
      accessToken: cachedAccessToken || ''
    };
  } catch (err: unknown) {
    if (isAuthCancellation(err)) {
      // User closed the popup or cancelled auth flow - gracefully return null without error
      return null;
    }
    throw err;
  } finally {
    isSigningIn = false;
  }
}

export async function logOut(): Promise<void> {
  await signOut(auth);
  cachedAccessToken = null;
}

export async function updateUserProfileInFirestore(uid: string, user: Partial<UserProfile>): Promise<void> {
  if (!uid) return;
  const userDocRef = doc(db, 'users', uid);
  await setDoc(userDocRef, sanitizeForFirestore({
    name: user.name || '',
    phone: user.phone || '',
    email: user.email || '',
    address: user.address || '',
    stationAreaDetails: user.stationAreaDetails || null,
    avatar: user.avatar || user.photoURL || null,
    photoURL: user.photoURL || null,
    role: user.role || 'customer',
    savedAddresses: user.savedAddresses || [],
    loyaltyPoints: user.loyaltyPoints ?? 0,
    loyaltyTier: user.loyaltyTier || 'bronze',
    pointsHistory: user.pointsHistory || [],
    updatedAt: new Date().toISOString(),
  }), { merge: true });
}

export async function saveOrderToFirestore(order: Order, uid?: string): Promise<void> {
  try {
    const orderDocRef = doc(db, 'orders', order.id);
    const sanitizedOrder = sanitizeForFirestore({
      ...order,
      customerId: uid || order.customerId || null,
      createdAt: order.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await setDoc(orderDocRef, sanitizedOrder);
  } catch (error) {
    console.error('Error saving order to Firestore:', error);
  }
}

export async function updateOrderStatusInFirestore(orderId: string, status: OrderStatus): Promise<void> {
  try {
    const orderDocRef = doc(db, 'orders', orderId);
    await updateDoc(orderDocRef, sanitizeForFirestore({
      status,
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error updating order status in Firestore:', error);
  }
}

export function subscribeToOrders(
  uid: string | undefined, 
  isAdmin: boolean,
  callback: (orders: Order[]) => void
): () => void {
  const ordersCollection = collection(db, 'orders');

  let ordersQuery = query(ordersCollection);
  if (!isAdmin && uid) {
    ordersQuery = query(ordersCollection, where('customerId', '==', uid));
  }

  const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
    const fetchedOrders: Order[] = [];
    snapshot.forEach((doc) => {
      fetchedOrders.push(doc.data() as Order);
    });

    // Sort by createdAt descending
    fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (fetchedOrders.length > 0) {
      callback(fetchedOrders);
    }
  }, (error) => {
    console.error('Orders snapshot error:', error);
  });

  return unsubscribe;
}
