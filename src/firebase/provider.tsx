'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { errorEmitter } from './error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from './errors';

interface FirebaseContextType {
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  firestore: null,
  auth: null,
});

export const useFirebase = () => useContext(FirebaseContext);
export const useFirebaseApp = () => useFirebase().app;
export const useFirestore = () => useFirebase().firestore;
export const useAuth = () => useFirebase().auth;

export const FirebaseProvider: React.FC<{
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  children: React.ReactNode;
}> = ({ app, firestore, auth, children }) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!app) return;
    
    const handleError = (error: any) => {
      // Detailed logging for debugging
      if (error instanceof FirestorePermissionError) {
        const { path, operation } = error.context;
        console.warn(`[Firestore Context] Path: ${path}, Operation: ${operation}`);

        // Silent Transition: Suppress UI for public paths during auth state changes
        const isPublicPath = path.includes('products') || path.includes('siteSettings');
        const isReadOperation = operation === 'list' || operation === 'get';

        if (isPublicPath && isReadOperation) {
          console.info('Initial public fetch suppressed during auth transition to ensure smooth UX.');
          return; // Exit without showing the error UI
        }
      } else {
        console.error("[Firebase Error]", error);
      }

      // Show destructive toast for actual unauthorized mutations or non-public errors
      toast({
        variant: "destructive",
        title: "خطأ في الصلاحيات",
        description: "لا تملك الصلاحية للقيام بهذا الإجراء. يرجى التأكد من حسابك.",
      });
    };

    errorEmitter.on('permission-error', handleError);
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [app, toast]);

  return (
    <FirebaseContext.Provider value={{ app, firestore, auth }}>
      {children}
    </FirebaseContext.Provider>
  );
};
