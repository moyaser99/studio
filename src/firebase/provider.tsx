'use client';

import React, { createContext, useContext, useEffect, useMemo } from 'react';
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

  const contextValue = useMemo(() => ({
    app,
    firestore,
    auth
  }), [app, firestore, auth]);

  useEffect(() => {
    if (!app) return;
    
    const handleError = (error: any) => {
      if (error instanceof FirestorePermissionError) {
        const { path, operation } = error.context;
        
        // Suppress logs for known public paths to keep console clean during development
        const isPublicPath = path.includes('products') || path.includes('siteSettings');
        if (isPublicPath) return;

        console.error(`[Firestore Permission Denied] Path: ${path}, Operation: ${operation}`);
      } else {
        // Only log major unexpected errors, ignore standard SDK assertion failures during HMR
        if (!error.message?.includes('INTERNAL ASSERTION FAILED')) {
          console.error("[Firebase Error]", error);
        }
      }

      toast({
        variant: "destructive",
        title: "خطأ في الصلاحيات",
        description: "لا تملك الصلاحية للقيام بهذا الإجراء أو انتهت صلاحية الجلسة.",
      });
    };

    errorEmitter.on('permission-error', handleError);
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [app, toast]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};
