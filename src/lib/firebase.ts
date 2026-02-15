
'use client';

/**
 * This file is maintained for backward compatibility. 
 * It redirects exports to the central Firebase initialization logic 
 * in src/firebase/index.ts but avoids top-level execution side-effects.
 */
import { initializeFirebase } from "@/firebase";

export const getFirebase = () => {
  if (typeof window === 'undefined') {
    return { app: null, db: null, auth: null };
  }
  const { app, firestore, auth } = initializeFirebase();
  return { app, db: firestore, auth };
};

// Only export instances if we are on the client to avoid assertion errors
const instances = typeof window !== 'undefined' ? initializeFirebase() : null;

export const app = instances?.app;
export const db = instances?.firestore;
export const auth = instances?.auth;
