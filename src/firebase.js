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
  limit,
  deleteDoc
} from 'firebase/firestore';
import { getMessaging, getToken, deleteToken, onMessage, isSupported as isMessagingSupported } from 'firebase/messaging';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

// Web Push certificate public key ("VAPID key") for chandabook-utsav.
// Firebase console > Project Settings > Cloud Messaging > Web Push certificates.
//
// This is a PUBLIC key and belongs in the bundle right alongside the config
// below — it is served to every browser regardless. Only the matching private
// key is secret, and that never leaves Google's servers. Because it is a build
// constant, no user ever configures it: members just tap "Enable".
const FCM_VAPID_KEY = "BCd2vfssLWasspS8xnqM1H3wStGl83HiVVj2z00RrcdAUJ6h6v2IpTN4NcKCMUjHbZUvI3j2-1FjPGpCQCa9KJg";

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

// How long to wait on a read/write before treating the network as unreachable.
// Firestore promises do not settle at all while offline, so without this a
// caller can hang forever with no error to report. Kept generous on purpose:
// the FIRST Firestore call of a session also pays connection setup (transport
// negotiation), which on a slow mobile link can take many seconds. A tight
// timeout here would report "offline" for a group that loads fine a moment
// later — a false error is worse than a slightly longer spinner.
const NETWORK_TIMEOUT_MS = 30000;

const withTimeout = (promise) => Promise.race([
  promise,
  new Promise((_, reject) =>
    setTimeout(() => reject({ code: 'unavailable' }), NETWORK_TIMEOUT_MS)
  )
]);

// Firestore caps a document at 1 MiB. A base64 logo can blow past that on its
// own, which fails the whole group write — so it gets its own reason code
// rather than being lumped in with 'unknown'.
const classifyFirestoreError = (err) => {
  if (err?.code === 'permission-denied') return 'permission-denied';
  if (err?.code === 'unavailable') return 'offline';
  if (err?.code === 'invalid-argument' || err?.code === 'resource-exhausted') return 'too-large';
  if (/exceeds the maximum allowed size|too large/i.test(err?.message || '')) return 'too-large';
  return 'unknown';
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
// Returns { group, error }. `error` is null on success (including a genuine
// "no such code"), otherwise a reason string. Callers that show the result to
// a user need this distinction: a blocked read or an offline device is NOT the
// same as "that code doesn't exist", and reporting the latter for the former
// leaves people with no way to tell a typo from a misconfigured backend.
export const fetchGroupByCodeResult = async (code) => {
  if (!db) initFirebase();
  if (!code) return { group: null, error: null };
  if (!db) return { group: null, error: 'not-configured' };
  try {
    const groupsRef = collection(db, 'groups');
    const q = query(groupsRef, where('code', '==', code), limit(1));
    // getDocs never settles while the network is unreachable, which would
    // otherwise leave a visitor on an endless spinner. Cap the wait so a dead
    // connection surfaces as a retryable error instead.
    const snap = await withTimeout(getDocs(q));
    if (snap.empty) return { group: null, error: null };
    return { group: snap.docs[0].data(), error: null };
  } catch (err) {
    console.warn("Failed to fetch group by code:", err);
    return { group: null, error: classifyFirestoreError(err) };
  }
};

export const fetchGroupByCode = async (code) => {
  const { group } = await fetchGroupByCodeResult(code);
  return group;
};

// Sync whole group payload to Firestore.
// Returns { ok, error, detail } — the reason matters here because a failed sync
// silently breaks every feature that depends on the cloud copy (public report,
// join-by-code, receipt lookup), and "it didn't work" alone is unactionable.
export const syncGroupToFirestoreResult = async (groupData) => {
  if (!db) initFirebase();
  if (!groupData || !groupData.id) return { ok: false, error: 'unknown' };
  if (!db) return { ok: false, error: 'not-configured' };

  const payload = { ...groupData, updatedAt: new Date().toISOString() };

  // Check the size before sending: Firestore rejects the whole document over
  // 1 MiB, and a base64 logo is by far the most likely thing to push it over.
  const approxBytes = new Blob([JSON.stringify(payload)]).size;
  if (approxBytes > 1000000) {
    console.warn(`Group document is ~${Math.round(approxBytes / 1024)} KB, over Firestore's 1 MiB limit.`);
    return { ok: false, error: 'too-large', detail: `${Math.round(approxBytes / 1024)} KB` };
  }

  try {
    const groupRef = doc(db, 'groups', groupData.id);
    await withTimeout(setDoc(groupRef, payload, { merge: true }));
    return { ok: true, error: null };
  } catch (err) {
    console.warn("Failed to sync group to Firestore:", err);
    return { ok: false, error: classifyFirestoreError(err), detail: err?.message };
  }
};

export const syncGroupToFirestore = async (groupData) => {
  const { ok } = await syncGroupToFirestoreResult(groupData);
  return ok;
};

// ---------------------------------------------------------------------------
// Push notifications (Firebase Cloud Messaging)
//
// Each device that opts in stores its FCM token in a top-level `pushTokens`
// collection — deliberately NOT on the group document, which is already close
// to Firestore's 1 MiB ceiling. A Cloud Function reads these tokens when the
// group's collections/expenses change and pushes to every device but the one
// that recorded the entry.
// ---------------------------------------------------------------------------

// Single source of truth: the build constant, with an optional env override for
// anyone building their own copy against a different Firebase project.
export const getVapidKey = () =>
  (FCM_VAPID_KEY || import.meta.env?.VITE_FCM_VAPID_KEY || '').trim();

// True when this build can actually register devices for push at all. If false
// it is a deployment/config problem for whoever built the app — never something
// a committee member can fix from the UI.
export const isPushConfigured = () => !!getVapidKey();

let messaging = null;

const initMessaging = async () => {
  if (messaging) return messaging;
  if (!(await isMessagingSupported())) return null;
  if (!db) initFirebase();
  if (!firebaseApp) return null;
  try {
    messaging = getMessaging(firebaseApp);
    return messaging;
  } catch (err) {
    console.warn('FCM init failed:', err);
    return null;
  }
};

export const isPushSupported = async () => {
  try {
    return !!(await isMessagingSupported()) && 'serviceWorker' in navigator;
  } catch (e) {
    return false;
  }
};

// The FCM token doubles as the document ID, which lets the security rules
// prove a device only ever writes its own record. FCM tokens are base64url
// plus ':' so they never contain '/', but reject anything that does rather
// than rewriting it — a mangled ID would silently split into a nested path.
const tokenDocId = (token) => {
  if (typeof token !== 'string' || token.includes('/')) return null;
  return token;
};

// Registers this device for a group's activity notifications.
// Returns { ok, error } — 'no-vapid-key', 'denied', 'unsupported', 'offline'…
export const registerPushToken = async (group, memberName) => {
  if (!group?.id) return { ok: false, error: 'unknown' };

  const vapidKey = getVapidKey();
  if (!vapidKey) return { ok: false, error: 'no-vapid-key' };

  if (!(await isPushSupported())) return { ok: false, error: 'unsupported' };

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { ok: false, error: 'denied' };

  const msg = await initMessaging();
  if (!msg) return { ok: false, error: 'unsupported' };

  try {
    const token = await getToken(msg, { vapidKey });
    if (!token) return { ok: false, error: 'no-token' };

    const docId = tokenDocId(token);
    if (!docId) return { ok: false, error: 'no-token' };

    await withTimeout(setDoc(doc(db, 'pushTokens', docId), {
      token,
      groupId: group.id,
      groupCode: group.code || '',
      // Lets the Cloud Function skip the device that recorded the entry.
      memberName: memberName || '',
      platform: navigator.userAgent.slice(0, 180),
      updatedAt: new Date().toISOString()
    }, { merge: true }));

    localStorage.setItem('chandabook_push_token', token);
    return { ok: true, error: null, token };
  } catch (err) {
    console.warn('Push registration failed:', err);
    return { ok: false, error: classifyFirestoreError(err), detail: err?.message };
  }
};

export const unregisterPushToken = async () => {
  const token = localStorage.getItem('chandabook_push_token');
  localStorage.removeItem('chandabook_push_token');
  if (!token) return { ok: true };
  try {
    if (!db) initFirebase();
    const docId = tokenDocId(token);
    if (db && docId) await withTimeout(deleteDoc(doc(db, 'pushTokens', docId)));
    const msg = await initMessaging();
    if (msg) await deleteToken(msg);
    return { ok: true };
  } catch (err) {
    console.warn('Push unregistration failed:', err);
    return { ok: false, error: classifyFirestoreError(err) };
  }
};

export const getStoredPushToken = () => {
  try {
    return localStorage.getItem('chandabook_push_token');
  } catch (e) {
    return null;
  }
};

// Foreground messages don't trigger the service worker, so the app shows them
// itself. Returns an unsubscribe function.
export const subscribeToForegroundPush = async (handler) => {
  const msg = await initMessaging();
  if (!msg) return () => {};
  try {
    return onMessage(msg, (payload) => handler(payload?.data || {}));
  } catch (err) {
    return () => {};
  }
};
