
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

let app: FirebaseApp;
let firestore: Firestore;
let auth: Auth;

export function getFirebaseApp() {
  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirestoreInstance() {
  if (!firestore) {
    firestore = getFirestore(getFirebaseApp());
  }
  return firestore;
}

export function getAuthInstance() {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}
