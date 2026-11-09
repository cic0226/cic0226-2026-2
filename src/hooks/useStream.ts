import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import type { Unsubscribe } from 'firebase/firestore';
import { mensagemErro } from '@/utils/errors';

export type Stream<T> = (next: (value: T) => void, error: (error: Error) => void) => Unsubscribe;
/** Pass a useCallback-stabilized subscription. Listeners stop when leaving the screen. */
export function useStream<T>(subscribe: Stream<T>, initialValue: T) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError('');
      let stop: Unsubscribe | undefined;
      try {
        stop = subscribe(
          (value) => {
            if (active) {
              setData(value);
              setLoading(false);
            }
          },
          (e) => {
            if (active) {
              setError(mensagemErro(e));
              setLoading(false);
            }
          },
        );
      } catch (e) {
        setError(mensagemErro(e));
        setLoading(false);
      }
      return () => {
        active = false;
        stop?.();
      };
    }, [subscribe, revision]),
  );
  return { data, loading, error, retry: () => setRevision((value) => value + 1) };
}
