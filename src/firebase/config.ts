'use client';

import { initializeApp, getApps, FirebaseApp, getApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth, setPersistence, browserLocalPersistence } from "firebase/auth";

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

const globalForFirebase = globalThis as unknown as {
  __firebase_instances: FirebaseInstances | undefined;
};

export function getFirebaseInstances(): FirebaseInstances | null {
  if (typeof window === 'undefined') return null;

  if (globalForFirebase.__firebase_instances) {
    return globalForFirebase.__firebase_instances;
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const auth = getAuth(app);

    // Ensure local persistence for better iframe/dev environment support
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn("Failed to set auth persistence:", err);
    });

    const instances = { app, firestore, auth };
    globalForFirebase.__firebase_instances = instances;
    
    return instances;
  } catch (error) {
    return null;
  }
}

export const getFirebaseApp = () => getFirebaseInstances()?.app || null;
export const getFirestoreInstance = () => getFirebaseInstances()?.firestore || null;
export const getAuthInstance = () => getFirebaseInstances()?.auth || null;
