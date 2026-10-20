import { useCallback, useSyncExternalStore } from 'react';
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '@/services/firebase/firestore';
import type { PerfilPublico } from '@/types/models';
import { fotoDoLegado } from '@/utils/validation';

interface Entry {
  data: PerfilPublico | null;
  listeners: Set<() => void>;
  stop?: Unsubscribe;
}
const entries = new Map<string, Entry>();
function entry(uid: string): Entry {
  let value = entries.get(uid);
  if (!value) {
    value = { data: null, listeners: new Set() };
    entries.set(uid, value);
  }
  return value;
}
export function clearPublicProfiles(): void {
  for (const e of entries.values()) {
    e.stop?.();
    e.data = null;
    e.stop = undefined;
    e.listeners.forEach((fn) => fn());
  }
  entries.clear();
}
/** One listener per distinct author, shared by every visible comment/post. */
export function usePublicProfile(uid: string): PerfilPublico | null {
  const subscribe = useCallback(
    (notify: () => void) => {
      if (!/^[A-Za-z0-9_-]{1,128}$/.test(uid)) return () => {};
      const e = entry(uid);
      e.listeners.add(notify);
      if (!e.stop)
        e.stop = onSnapshot(
          doc(db, 'perfisPublicos', uid),
          (s) => {
            e.data = s.exists()
              ? {
                  uid,
                  nome: String(s.data().nome || 'Usuário'),
                  fotoBase64: fotoDoLegado(s.data().fotoBase64),
                }
              : null;
            e.listeners.forEach((fn) => fn());
          },
          () => {
            e.data = null;
            e.listeners.forEach((fn) => fn());
          },
        );
      return () => {
        e.listeners.delete(notify);
        if (!e.listeners.size) {
          e.stop?.();
          entries.delete(uid);
        }
      };
    },
    [uid],
  );
  const snapshot = useCallback(() => (uid ? (entries.get(uid)?.data ?? null) : null), [uid]);
  return useSyncExternalStore(subscribe, snapshot, () => null);
}
