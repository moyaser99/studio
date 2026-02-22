'use client';

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseStorage } from 'firebase/storage';
import { errorEmitter } from './error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from './errors';

interface FirebaseContextType {
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  storage: FirebaseStorage | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  firestore: null,
  auth: null,
  storage: null,
});

export const useFirebase = () => useContext(FirebaseContext);
export const useFirebaseApp = () => useFirebase().app;
export const useFirestore = () => useFirebase().firestore;
export const useAuth = () => useFirebase().auth;
export const useStorage = () => useFirebase().storage;

export const FirebaseProvider: React.FC<{
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  storage: FirebaseStorage | null;
  children: React.ReactNode;
}> = ({ app, firestore, auth, storage, children }) => {
  const { toast } = useToast();

  const contextValue = useMemo(() => ({
    app,
    firestore,
    auth,
    storage
  }), [app, firestore, auth, storage]);

  useEffect(() => {
    // كتم أخطاء الـ HMR المزعجة في بيئة التطوير
    const onWindowError = (event: ErrorEvent) => {
      const errorMsg = event.error?.message || event.message || "";
      if (errorMsg.includes('INTERNAL ASSERTION FAILED') || errorMsg.includes('ca9')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMsg = event.reason?.message || "";
      if (errorMsg.includes('INTERNAL ASSERTION FAILED') || errorMsg.includes('ca9')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('error', onWindowError, true);
    window.addEventListener('unhandledrejection', onUnhandledRejection, true);

    const handleError = (error: any) => {
      if (error instanceof FirestorePermissionError) {
        const { path, operation } = error.context;
        const isPublicPath = path.includes('products') || path.includes('siteSettings');
        
        // لا تظهر أي رسائل خطأ للمسارات العامة، ولا تسجلها في الكونسول لتجنب شاشة Next.js الحمراء
        if (isPublicPath) return;

        // معالجة مخصصة للتحقق من بيانات المستخدمين
        if (path === 'users' && operation === 'list') {
          toast({
            variant: "destructive",
            title: "تنبيه",
            description: "عذراً، لا يمكن التحقق من البيانات حالياً، يرجى المحاولة لاحقاً.",
          });
          return;
        }

        toast({
          variant: "destructive",
          title: "خطأ في الصلاحيات",
          description: "لا تملك الصلاحية للقيام بهذا الإجراء.",
        });
      }
    };

    errorEmitter.on('permission-error', handleError);
    
    return () => {
      window.removeEventListener('error', onWindowError, true);
      window.removeEventListener('unhandledrejection', onUnhandledRejection, true);
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};
