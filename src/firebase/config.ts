'use client';

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
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

interface FirebaseInstances {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Global cache to prevent re-initialization during HMR in Next.js development
const globalForFirebase = globalThis as unknown as {
  instances: FirebaseInstances | undefined;
};

/**
 * Robust singleton getter for all Firebase instances.
 * Ensures consistent state across the entire application lifecycle.
 */
export function getFirebaseInstances(): FirebaseInstances | null {
  if (typeof window === 'undefined') return null;

  if (!globalForFirebase.instances) {
    const existingApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    const firestore = getFirestore(existingApp);
    const auth = getAuth(existingApp);

    globalForFirebase.instances = {
      app: existingApp,
      firestore,
      auth
    };
  }

  return globalForFirebase.instances;
}

/**
 * Individual getters for compatibility with existing code.
 * These now rely on the same unified singleton.
 */
export const getFirebaseApp = () => getFirebaseInstances()?.app || null;
export const getFirestoreInstance = () => getFirebaseInstances()?.firestore || null;
export const getAuthInstance = () => getFirebaseInstances()?.auth || null;
