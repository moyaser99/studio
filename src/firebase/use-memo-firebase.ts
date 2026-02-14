'use client';

import { useMemo, DependencyList } from 'react';

/**
 * A wrapper around useMemo specifically for Firebase queries and references.
 * Ensures that references are only recreated when their actual dependencies change,
 * preventing infinite loops in Firestore hooks.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
