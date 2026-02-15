
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
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

let app: FirebaseApp | undefined;
let firestore: Firestore | undefined;
let auth: Auth | undefined;

export function getFirebaseApp() {
  if (typeof window === 'undefined') return null as any;
  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirestoreInstance() {
  if (typeof window === 'undefined') return null as any;
  const currentApp = getFirebaseApp();
  if (!currentApp) return null as any;
  if (!firestore) {
    firestore = getFirestore(currentApp);
  }
  return firestore;
}

export function getAuthInstance() {
  if (typeof window === 'undefined') return null as any;
  const currentApp = getFirebaseApp();
  if (!currentApp) return null as any;
  if (!auth) {
    auth = getAuth(currentApp);
  }
  return auth;
}
