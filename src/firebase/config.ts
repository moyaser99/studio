'use client';

import { initializeApp, getApps, FirebaseApp, getApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyBSddySKMJUmlTCFS3eKIEmkLYM73FzfJA",
  authDomain: "gen-lang-client-0789065518.firebaseapp.com",
  projectId: "gen-lang-client-0789065518",
  storageBucket: "gen-lang-client-0789065518.firebasestorage.app",
  messagingSenderId: "92249399292",
  appId: "1:92249399292:web:0ee22bf568c737205e1c79",
  measurementId: "G-NEBTS4V7CT"
};

interface FirebaseInstances {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

/**
 * استخدام كائن عالمي لضمان بقاء النسخ ثابتة حتى مع إعادة تحميل الكود (HMR).
 * هذا يمنع خطأ "Unexpected state (ID: ca9)" الناتج عن تكرار التهيئة.
 */
const globalForFirebase = globalThis as unknown as {
  __firebase_instances: FirebaseInstances | undefined;
};

export function getFirebaseInstances(): FirebaseInstances | null {
  if (typeof window === 'undefined') return null;

  if (!globalForFirebase.__firebase_instances) {
    try {
      // الحصول على التطبيق الحالي أو إنشاء واحد جديد
      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      
      // تهيئة الخدمات مرة واحدة فقط وتخزينها
      const firestore = getFirestore(app);
      const auth = getAuth(app);

      globalForFirebase.__firebase_instances = {
        app,
        firestore,
        auth
      };
      
      console.log("[Firebase] Singleton initialized successfully.");
    } catch (error) {
      console.error("[Firebase] Initialization failed:", error);
      return null;
    }
  }

  return globalForFirebase.__firebase_instances;
}

/**
 * دوال وصول سريعة ومتوافقة مع كامل أجزاء التطبيق
 */
export const getFirebaseApp = () => getFirebaseInstances()?.app || null;
export const getFirestoreInstance = () => getFirebaseInstances()?.firestore || null;
export const getAuthInstance = () => getFirebaseInstances()?.auth || null;
