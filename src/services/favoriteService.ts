import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase/firestore';
import { auth } from './firebase/auth';
import type { Favorito } from '@/types/models';
function uid(): string {
  if (!auth.currentUser) throw new Error('Entre na sua conta.');
  return auth.currentUser.uid;
}
export const favoriteService = {
  escutar(next: (items: Favorito[]) => void, error: (error: Error) => void) {
    return onSnapshot(
      query(collection(db, 'usuarios', uid(), 'favoritos'), orderBy('criadoEm', 'desc')),
      (s) => next(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Favorito)),
      error,
    );
  },
  async alternar(item: Omit<Favorito, 'id'>): Promise<void> {
    const ref = doc(db, 'usuarios', uid(), 'favoritos', `${item.tipo}_${item.refId}`);
    await runTransaction(db, async (tx) => {
      const old = await tx.get(ref);
      if (old.exists()) tx.delete(ref);
      else tx.set(ref, { ...item, criadoEm: serverTimestamp() });
    });
  },
};
