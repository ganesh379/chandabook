import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  limit
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

// Real Firebase Web App Config for chandabook-utsav
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBUgvaew_XA3QRZzlQ_eEv1JA375IfgZKs",
  authDomain: "chandabook-utsav.firebaseapp.com",
  projectId: "chandabook-utsav",
  storageBucket: "chandabook-utsav.firebasestorage.app",
  messagingSenderId: "870424515514",
  appId: "1:870424515514:web:375d8cd414437deba3c383",
  measurementId: "G-TC1R9DC2B6"
};

let db = null;
let auth = null;
let googleProvider = null;
let firebaseApp = null;

export const initFirebase = (customConfig = null) => {
  try {
    const config = customConfig || JSON.parse(localStorage.getItem('chandabook_firebase_config')) || DEFAULT_FIREBASE_CONFIG;
    if (!config || !config.apiKey) {
      return null;
    }
    
    if (!getApps().length) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }
    db = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
    googleProvider = new GoogleAuthProvider();
    return db;
  } catch (err) {
    console.warn("ChandaBook Firebase Init Note:", err.message);
    return null;
  }
};

export const getFirestoreDB = () => db;
export const getFirebaseAuth = () => auth;

// Google Sign-In Handler
export const signInWithGoogle = async () => {
  if (!auth) {
    initFirebase();
  }
  if (!auth) {
    throw new Error("Firebase Auth not initialized.");
  }
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
};

// Sign Out Handler
export const logoutUser = async () => {
  if (auth) {
    await signOut(auth);
  }
};

// Listen to Auth state changes
export const subscribeToAuth = (callback) => {
  if (!auth) initFirebase();
  if (auth) {
    return onAuthStateChanged(auth, callback);
  }
  return () => {};
};

// Real-time listener for Group data
export const subscribeToGroupRealtime = (groupId, onDataUpdate) => {
  if (!db || !groupId) return null;
  try {
    const groupRef = doc(db, 'groups', groupId);
    const unsubscribe = onSnapshot(groupRef, (docSnap) => {
      if (docSnap.exists()) {
        onDataUpdate(docSnap.data());
      }
    }, (error) => {
      console.warn("Firestore Realtime warning:", error);
    });
    return unsubscribe;
  } catch (e) {
    return null;
  }
};

// Fetch a group by its 6-digit join code directly from Firestore.
// Needed for anyone who doesn't already have the group cached locally
// (fresh device following a WhatsApp invite link, donor receipt lookup,
// or the public transparency page).
export const fetchGroupByCode = async (code) => {
  if (!db) initFirebase();
  if (!db || !code) return null;
  try {
    const groupsRef = collection(db, 'groups');
    const q = query(groupsRef, where('code', '==', code), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data();
  } catch (err) {
    console.warn("Failed to fetch group by code:", err);
    return null;
  }
};

// Sync whole group payload to Firestore
export const syncGroupToFirestore = async (groupData) => {
  if (!db || !groupData || !groupData.id) return false;
  try {
    const groupRef = doc(db, 'groups', groupData.id);
    await setDoc(groupRef, {
      ...groupData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn("Failed to sync group to Firestore:", err);
    return false;
  }
};
