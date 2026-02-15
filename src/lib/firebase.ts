
'use client';

/**
 * Optimized Firebase access bridge.
 * Uses the stable singleton instances from the canonical config.
 */
import { getFirebaseApp, getFirestoreInstance, getAuthInstance } from "@/firebase/config";

export const getFirebase = () => {
  if (typeof window === 'undefined') {
    return { app: null, db: null, auth: null };
  }
  
  return { 
    app: getFirebaseApp(), 
    db: getFirestoreInstance(), 
    auth: getAuthInstance() 
  };
};
