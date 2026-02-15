
'use client';

/**
 * This file is maintained for backward compatibility. 
 * It provides a safe way to access Firebase instances without top-level side effects.
 */
import { initializeFirebase } from "@/firebase";

export const getFirebase = () => {
  if (typeof window === 'undefined') {
    return { app: null, db: null, auth: null };
  }
  const instances = initializeFirebase();
  return { 
    app: instances.app, 
    db: instances.firestore, 
    auth: instances.auth 
  };
};

// Do not export constants here to avoid premature initialization
