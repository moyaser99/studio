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

// استخدام كائن عالمي لضمان عدم تكرار التهيئة أثناء الـ HMR في Next.js
const globalForFirebase = globalThis as unknown as {
  __firebase_instances: FirebaseInstances | undefined;
};

/**
 * وظيفة موحدة للحصول على كافة نسخ Firebase
 * تضمن استخدام نمط الـ Singleton بشكل صارم
 */
export function getFirebaseInstances(): FirebaseInstances | null {
  if (typeof window === 'undefined') return null;

  if (!globalForFirebase.__firebase_instances) {
    try {
      // محاولة الحصول على التطبيق الموجود أو تهيئة واحد جديد
      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const auth = getAuth(app);

      globalForFirebase.__firebase_instances = {
        app,
        firestore,
        auth
      };
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      return null;
    }
  }

  return globalForFirebase.__firebase_instances;
}

/**
 * دوال الحصول على النسخ الفردية متوافقة مع الكود الحالي
 */
export const getFirebaseApp = () => getFirebaseInstances()?.app || null;
export const getFirestoreInstance = () => getFirebaseInstances()?.firestore || null;
export const getAuthInstance = () => getFirebaseInstances()?.auth || null;
