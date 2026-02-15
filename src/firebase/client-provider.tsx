'use client';

import React, { useMemo } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

export const FirebaseClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use useMemo to ensure instances are retrieved once per mount and are stable
  const instances = useMemo(() => {
    return initializeFirebase();
  }, []);

  return (
    <FirebaseProvider
      app={instances.app}
      firestore={instances.firestore}
      auth={instances.auth}
    >
      {children}
    </FirebaseProvider>
  );
};
