
'use client';

/**
 * This file is maintained for backward compatibility. 
 * It redirects exports to the central Firebase initialization logic 
 * in src/firebase/index.ts to prevent dual-initialization errors.
 */
import { initializeFirebase } from "@/firebase";

const { app, firestore: db, auth } = initializeFirebase();

export { app, db, auth };
