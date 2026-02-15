
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyBSddySKMJUmlTCFS3eKIEmkLYM73FzfJA",
  authDomain: "gen-lang-client-0789065518.firebaseapp.com",
  projectId: "gen-lang-client-0789065518",
  storageBucket: "gen-lang-client-0789065518.firebasestorage.app",
  messagingSenderId: "92249399292",
  appId: "1:92249399292:web:0ee22bf568c737205e1c79",
  measurementId: "G-NEBTS4V7CT"
};

// Global cache to prevent re-initialization during HMR
const globalForFirebase = globalThis as unknown as {
  app: FirebaseApp | undefined;
  firestore: Firestore | undefined;
  auth: Auth | undefined;
};

export function getFirebaseApp() {
  if (typeof window === 'undefined') return null;
  if (!globalForFirebase.app) {
    globalForFirebase.app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return globalForFirebase.app;
}

export function getFirestoreInstance() {
  if (typeof window === 'undefined') return null;
  const currentApp = getFirebaseApp();
  if (!currentApp) return null;
  if (!globalForFirebase.firestore) {
    globalForFirebase.firestore = getFirestore(currentApp);
  }
  return globalForFirebase.firestore;
}

export function getAuthInstance() {
  if (typeof window === 'undefined') return null;
  const currentApp = getFirebaseApp();
  if (!currentApp) return null;
  if (!globalForFirebase.auth) {
    globalForFirebase.auth = getAuth(currentApp);
  }
  return globalForFirebase.auth;
}
