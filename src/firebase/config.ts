'use client';

import { initializeApp, getApps, FirebaseApp, getApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";

/**
 * Firebase configuration object secured by environment variables.
 * Values are pulled from the .env file using NEXT_PUBLIC_ prefix for client-side access.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

interface FirebaseInstances {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
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
    // Basic verification of essential config
    if (!firebaseConfig.apiKey) {
      console.error("Firebase API Key is missing. Check your .env file.");
      return null;
    }

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const auth = getAuth(app);
    const storage = getStorage(app);

    // Ensure local persistence for better iframe/dev environment support
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn("Failed to set auth persistence:", err);
    });

    const instances = { app, firestore, auth, storage };
    globalForFirebase.__firebase_instances = instances;
    
    return instances;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return null;
  }
}

export const getFirebaseApp = () => getFirebaseInstances()?.app || null;
export const getFirestoreInstance = () => getFirebaseInstances()?.firestore || null;
export const getAuthInstance = () => getFirebaseInstances()?.auth || null;
export const getStorageInstance = () => getFirebaseInstances()?.storage || null;
