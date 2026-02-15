
'use client';

import { getFirebaseApp, getFirestoreInstance, getAuthInstance } from './config';

/**
 * Initializes and returns the Firebase instances.
 * This is a safe getter that ensures singleton pattern.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { app: null, firestore: null, auth: null };
  }
  return { 
    app: getFirebaseApp(), 
    firestore: getFirestoreInstance(), 
    auth: getAuthInstance() 
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
export * from './use-memo-firebase';
