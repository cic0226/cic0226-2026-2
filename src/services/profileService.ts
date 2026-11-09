import type { User } from 'firebase/auth';
import { doc, runTransaction, serverTimestamp, type DocumentData } from 'firebase/firestore';
import { db } from './firebase/firestore';
import { auth } from './firebase/auth';
import type { Usuario } from '@/types/models';
import { fotoDoLegado, LIMITES, textoObrigatorio, validarFoto } from '@/utils/validation';

export function mapearUsuario(uid: string, data: DocumentData): Usuario {
  return {
    uid,
    nome: typeof data.nome === 'string' ? data.nome : 'Usuário',
    email: typeof data.email === 'string' ? data.email : '',
    fotoBase64: fotoDoLegado(data.fotoBase64 !== undefined ? data.fotoBase64 : data.avatarBase64),
    regiao: typeof data.regiao === 'string' ? data.regiao : '',
    criadoEm: data.criadoEm ?? null,
    atualizadoEm: data.atualizadoEm ?? null,
  };
}
async function sincronizar(
  user: User,
  changes?: { nome: string; fotoBase64: string | null; regiao: string },
): Promise<void> {
  const ownRef = doc(db, 'usuarios', user.uid);
  const publicRef = doc(db, 'perfisPublicos', user.uid);
  await runTransaction(db, async (transaction) => {
    // Both reads happen before any write. Transactions also prevent races during signup.
    const own = await transaction.get(ownRef);
    const publicDoc = await transaction.get(publicRef);
    const old = own.exists() ? mapearUsuario(user.uid, own.data()) : null;
    const nome = changes?.nome ?? old?.nome ?? user.displayName ?? 'Novo usuário';
    const fotoBase64 = changes ? changes.fotoBase64 : (old?.fotoBase64 ?? null);
    const regiao = changes?.regiao ?? old?.regiao ?? '';
    const email = user.email ?? old?.email ?? '';
    const publicData = { uid: user.uid, nome, fotoBase64 };
    const prior = publicDoc.data();
    const synced =
      own.exists() &&
      own.data().fotoBase64 !== undefined &&
      own.data().regiao !== undefined &&
      prior?.uid === user.uid &&
      prior?.nome === nome &&
      prior?.fotoBase64 === fotoBase64;
    if (!changes && synced) return;
    transaction.set(
      ownRef,
      {
        uid: user.uid,
        nome,
        email,
        fotoBase64,
        regiao,
        ...(!own.exists() ? { criadoEm: serverTimestamp() } : {}),
        atualizadoEm: serverTimestamp(),
      },
      { merge: true },
    );
    // No email, CPF or other private field is replicated.
    transaction.set(publicRef, { ...publicData, atualizadoEm: serverTimestamp() });
  });
}
export const profileService = {
  garantirPerfil(user: User) {
    return sincronizar(user);
  },
  async salvar(input: { nome: string; fotoBase64: string | null; regiao: string }): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Entre na sua conta para continuar.');
    const nome = textoObrigatorio(input.nome, 'Nome', LIMITES.nome, 2);
    const fotoBase64 = validarFoto(input.fotoBase64);
    const regiao = input.regiao.trim();
    if (regiao.length > 80) throw new Error('Nome da região muito longo.');
    await sincronizar(user, { nome, fotoBase64, regiao });
  },
};
