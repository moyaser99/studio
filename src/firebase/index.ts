'use client';

import { getFirebaseInstances } from './config';

/**
 * تهيئة وإرجاع نسخ Firebase.
 * تضمن هذه الوظيفة استخدام Singleton عبر التطبيق بأكمله.
 */
export function initializeFirebase() {
  const instances = getFirebaseInstances();
  if (!instances) {
    return { app: null, firestore: null, auth: null };
  }
  
  return { 
    app: instances.app, 
    firestore: instances.firestore, 
    auth: instances.auth 
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
export * from './use-memo-firebase';
