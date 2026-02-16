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
    // نظام "كتم" أخطاء الـ HMR المزعجة لمنع توقف التطوير بصرياً
    const onWindowError = (event: ErrorEvent) => {
      const errorMsg = event.error?.message || event.message || "";
      if (errorMsg.includes('INTERNAL ASSERTION FAILED') || errorMsg.includes('ca9')) {
        // منع ظهور الشاشة الحمراء لـ Next.js
        event.preventDefault();
        event.stopPropagation();
        console.warn("[Firebase HMR] Suppressed internal assertion error during development.");
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMsg = event.reason?.message || "";
      if (errorMsg.includes('INTERNAL ASSERTION FAILED') || errorMsg.includes('ca9')) {
        event.preventDefault();
        event.stopPropagation();
        console.warn("[Firebase HMR] Suppressed unhandled rejection (assertion) during development.");
      }
    };

    window.addEventListener('error', onWindowError, true);
    window.addEventListener('unhandledrejection', onUnhandledRejection, true);

    // مستمع الأخطاء العالمي للتعامل مع أخطاء الصلاحيات الحقيقية
    const handleError = (error: any) => {
      const errorMsg = error?.message || String(error);

      if (error instanceof FirestorePermissionError) {
        const { path, operation } = error.context;
        // تجاهل أخطاء الصلاحيات للمسارات العامة (للمستخدمين غير المسجلين)
        const isPublicPath = path.includes('products') || path.includes('siteSettings');
        if (isPublicPath) return;

        console.error(`[Firestore Permission Denied] Path: ${path}, Operation: ${operation}`);
      } else {
        // تجاهل أخطاء الـ Assertion في سجلات الـ UI أيضاً
        if (errorMsg.includes('INTERNAL ASSERTION FAILED') || errorMsg.includes('ca9')) return;
        console.error("[Firebase Error]", error);
      }

      toast({
        variant: "destructive",
        title: "خطأ في الصلاحيات",
        description: "لا تملك الصلاحية للقيام بهذا الإجراء أو انتهت صلاحية الجلسة.",
      });
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
