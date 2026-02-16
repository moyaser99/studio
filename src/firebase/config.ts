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
 * استخدام كائن عالمي ثابت تماماً لضمان عدم تكرار التهيئة تحت أي ظرف.
 * هذا هو الحل الجذري لخطأ "INTERNAL ASSERTION FAILED (ID: ca9)".
 */
const globalForFirebase = globalThis as unknown as {
  __firebase_instances: FirebaseInstances | undefined;
};

export function getFirebaseInstances(): FirebaseInstances | null {
  if (typeof window === 'undefined') return null;

  // إذا كانت النسخ موجودة مسبقاً، نرجعها فوراً دون أي استدعاءات إضافية للمكتبة
  if (globalForFirebase.__firebase_instances) {
    return globalForFirebase.__firebase_instances;
  }

  try {
    // التأكد من عدم وجود تطبيق مهيأ مسبقاً في نظام Firebase نفسه
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    // تهيئة الخدمات مرة واحدة فقط وتخزينها عالمياً
    const firestore = getFirestore(app);
    const auth = getAuth(app);

    const instances = { app, firestore, auth };
    globalForFirebase.__firebase_instances = instances;
    
    console.log("[Firebase] Singleton initialized successfully.");
    return instances;
  } catch (error) {
    console.error("[Firebase] Initialization failed:", error);
    return null;
  }
}

export const getFirebaseApp = () => getFirebaseInstances()?.app || null;
export const getFirestoreInstance = () => getFirebaseInstances()?.firestore || null;
export const getAuthInstance = () => getFirebaseInstances()?.auth || null;
