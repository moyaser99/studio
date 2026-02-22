'use client';

import React from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

export const FirebaseClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // نحصل على النسخ المستقرة مباشرة من الـ Singleton
  const { app, firestore, auth, storage } = initializeFirebase();

  return (
    <FirebaseProvider
      app={app}
      firestore={firestore}
      auth={auth}
      storage={storage}
    >
      {children}
    </FirebaseProvider>
  );
};
