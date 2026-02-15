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
        console.error(`[Firestore Permission Denied] Path: ${error.context.path}, Operation: ${error.context.operation}`);
        
        // Suppress UI Toast for public data paths that might flutter during auth state changes
        const isPublicPath = 
          error.context.path.includes('products') || 
          error.context.path.includes('siteSettings') ||
          error.context.operation === 'list' || 
          error.context.operation === 'get';

        if (isPublicPath) {
          return; // Don't show toast for public read operations
        }
      } else {
        console.error("[Firebase Error]", error);
      }

      toast({
        variant: "destructive",
        title: "خطأ في الصلاحيات",
        description: "لا تملك الصلاحية للقيام بهذا الإجراء. يرجى تسجيل الدخول بحساب المشرف.",
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
