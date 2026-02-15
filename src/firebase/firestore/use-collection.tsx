'use client';

import { useState, useEffect } from 'react';
import { Query, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // The onSnapshot listener will automatically re-attempt connection 
    // and sync data when permissions or auth state changes.
    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        } as T & { id: string }));
        setData(items);
        setError(null);
        setLoading(false);
      },
      async (serverError) => {
        // Extract path for detailed logging and suppression logic
        const path = (query as any)._query?.path?.segments?.join('/') || 'unknown_collection';
        
        const permissionError = new FirestorePermissionError({
          path,
          operation: 'list',
        });
        
        // Emit for global handler (which now silently handles public paths)
        errorEmitter.emit('permission-error', permissionError);
        
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
