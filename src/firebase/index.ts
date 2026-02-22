'use client';

import { getFirebaseInstances } from './config';

/**
 * وظيفة موحدة لإرجاع نسخ Firebase بشكل Singleton.
 * تضمن هذه الوظيفة عدم حدوث تعارض في الحالة الداخلية لـ Firestore.
 */
export function initializeFirebase() {
  const instances = getFirebaseInstances();
  if (!instances) {
    return { app: null, firestore: null, auth: null, storage: null };
  }
  
  return { 
    app: instances.app, 
    firestore: instances.firestore, 
    auth: instances.auth,
    storage: instances.storage
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
export * from './use-memo-firebase';
