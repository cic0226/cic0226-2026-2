import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
  deleteDoc,
  type Unsubscribe,
  type Timestamp,
} from 'firebase/firestore';
import { auth } from './firebase/auth';
import { db } from './firebase/firestore';
import type { Conversa, Mensagem } from '@/types/models';
import { millis } from '@/utils/date';
import { criarConversaId, LIMITES, textoObrigatorio, validarUid } from '@/utils/validation';
function uidAtual(): string {
  if (!auth.currentUser) throw new Error('Entre na sua conta para continuar.');
  return auth.currentUser.uid;
}
export const chatService = {
  async abrirConversa(outroUid: string): Promise<string> {
    const uid = uidAtual();
    const id = criarConversaId(uid, outroUid);
    const participantes = [uid, outroUid].sort();
    const ref = doc(db, 'conversas', id);
    await runTransaction(db, async (tx) => {
      const snapshot = await tx.get(ref);
      if (!snapshot.exists())
        tx.set(ref, {
          participantes,
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp(),
          ultimaMensagem: '',
          ultimaMensagemAutorId: '',
          ultimaMensagemId: '',
        });
    });
    return id;
  },
  escutarConversas(
    quantidade: number,
    next: (items: Conversa[]) => void,
    error: (error: Error) => void,
  ): Unsubscribe {
    const uid = uidAtual();
    const q = query(
      collection(db, 'conversas'),
      where('participantes', 'array-contains', uid),
      orderBy('atualizadoEm', 'desc'),
      limit(quantidade),
    );
    return onSnapshot(
      q,
      (s) => next(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Conversa)),
      error,
    );
  },
  escutarMensagens(
    id: string,
    quantidade: number,
    next: (items: Mensagem[]) => void,
    error: (error: Error) => void,
  ): Unsubscribe {
    const q = query(
      collection(db, 'conversas', id, 'mensagens'),
      orderBy('criadoEm', 'desc'),
      limit(quantidade),
    );
    return onSnapshot(
      q,
      (s) => next(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Mensagem)),
      error,
    );
  },
  novaMensagemId(conversaId: string): string {
    return doc(collection(db, 'conversas', conversaId, 'mensagens')).id;
  },
  async enviar(conversaId: string, input: string, mensagemId: string): Promise<void> {
    const uid = uidAtual();
    const texto = textoObrigatorio(input, 'Mensagem', LIMITES.mensagem);
    const ref = doc(db, 'conversas', conversaId);
    const messageRef = doc(ref, 'mensagens', mensagemId);
    await runTransaction(db, async (tx) => {
      const conversa = await tx.get(ref);
      const prior = await tx.get(messageRef);
      if (!conversa.exists() || !conversa.data().participantes.includes(uid))
        throw new Error('Conversa indisponível.');
      if (prior.exists()) {
        if (prior.data().autorId !== uid || prior.data().texto !== texto)
          throw new Error('Conflito no envio. Tente novamente.');
        return;
      }
      tx.set(messageRef, { autorId: uid, texto, criadoEm: serverTimestamp() });
      tx.update(ref, {
        ultimaMensagem: texto,
        ultimaMensagemAutorId: uid,
        ultimaMensagemId: mensagemId,
        atualizadoEm: serverTimestamp(),
      });
    });
  },
  async marcarLida(id: string, mensagem: Mensagem): Promise<void> {
    const seen = millis(mensagem.criadoEm);
    if (seen === null) return;
    const ref = doc(db, 'conversas', id, 'leituras', uidAtual());
    await runTransaction(db, async (tx) => {
      const previous = await tx.get(ref);
      if ((millis(previous.data()?.lidoEm) ?? -1) >= seen) return;
      // Use the timestamp of a message actually displayed, NOT the later commit time.
      tx.set(ref, { lidoEm: mensagem.criadoEm, mensagemId: mensagem.id });
    });
  },
  escutarLeitura(
    id: string,
    uid: string,
    next: (date: Timestamp | null) => void,
    error: (error: Error) => void,
  ): Unsubscribe {
    return onSnapshot(
      doc(db, 'conversas', id, 'leituras', uid),
      (s) => next(s.data()?.lidoEm ?? null),
      error,
    );
  },
  escutarBloqueio(
    outroUid: string,
    next: (value: boolean) => void,
    error: (error: Error) => void,
  ): Unsubscribe {
    return onSnapshot(
      doc(db, 'usuarios', uidAtual(), 'bloqueados', validarUid(outroUid)),
      (s) => next(s.exists()),
      error,
    );
  },
  async bloquear(outroUid: string): Promise<void> {
    const uid = uidAtual();
    criarConversaId(uid, outroUid);
    const ref = doc(db, 'usuarios', uid, 'bloqueados', outroUid);
    await runTransaction(db, async (tx) => {
      const current = await tx.get(ref);
      if (!current.exists()) tx.set(ref, { uid: outroUid, criadoEm: serverTimestamp() });
    });
  },
  desbloquear(outroUid: string): Promise<void> {
    return deleteDoc(doc(db, 'usuarios', uidAtual(), 'bloqueados', validarUid(outroUid)));
  },
};
