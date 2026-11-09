import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  setDoc,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase/firestore';
import { auth } from './firebase/auth';
import { CATEGORIAS, type Categoria, type Comentario, type Publicacao } from '@/types/models';
import { LIMITES, numeroSeguro, textoObrigatorio } from '@/utils/validation';

function usuarioId(): string {
  if (!auth.currentUser) throw new Error('Entre na sua conta para continuar.');
  return auth.currentUser.uid;
}
export function mapearPublicacao(id: string, data: DocumentData): Publicacao {
  return {
    id,
    titulo: String(data.titulo ?? data.title ?? 'Publicação'),
    texto: String(data.texto ?? data.descricao ?? data.conteudo ?? ''),
    autorId: typeof data.autorId === 'string' ? data.autorId : '',
    autorNomeLegado: typeof data.autorNome === 'string' ? data.autorNome : undefined,
    categoria: CATEGORIAS.includes(data.categoria) ? data.categoria : 'Geral',
    regiao: typeof data.regiao === 'string' ? data.regiao : '',
    totalComentarios: numeroSeguro(data.totalComentarios),
    totalCurtidas: numeroSeguro(data.totalCurtidas),
    criadoEm: data.criadoEm ?? null,
    ultimaAtividade: data.ultimaAtividade ?? data.criadoEm ?? null,
    editadoEm: data.editadoEm ?? null,
  };
}
function campos(input: { titulo: string; texto: string; categoria: Categoria; regiao: string }) {
  if (!CATEGORIAS.includes(input.categoria)) throw new Error('Categoria inválida.');
  if (input.regiao.trim().length > 80) throw new Error('Nome da região muito longo.');
  return {
    titulo: textoObrigatorio(input.titulo, 'Título', LIMITES.titulo, 3),
    texto: textoObrigatorio(input.texto, 'Publicação', LIMITES.publicacao),
    categoria: input.categoria,
    regiao: input.regiao.trim(),
  };
}
export const forumService = {
  escutar(
    quantidade: number,
    next: (items: Publicacao[]) => void,
    error: (error: Error) => void,
  ): Unsubscribe {
    const q = query(collection(db, 'forum'), orderBy('ultimaAtividade', 'desc'), limit(quantidade));
    return onSnapshot(
      q,
      (snapshot) => next(snapshot.docs.map((d) => mapearPublicacao(d.id, d.data()))),
      error,
    );
  },
  escutarPublicacao(
    id: string,
    next: (item: Publicacao | null) => void,
    error: (error: Error) => void,
  ): Unsubscribe {
    return onSnapshot(
      doc(db, 'forum', id),
      (s) => next(s.exists() ? mapearPublicacao(s.id, s.data()) : null),
      error,
    );
  },
  async buscar(id: string): Promise<Publicacao | null> {
    const s = await getDoc(doc(db, 'forum', id));
    return s.exists() ? mapearPublicacao(s.id, s.data()) : null;
  },
  async publicar(input: {
    titulo: string;
    texto: string;
    categoria: Categoria;
    regiao: string;
  }): Promise<string> {
    const autorId = usuarioId();
    const ref = doc(collection(db, 'forum'));
    await setDoc(ref, {
      ...campos(input),
      autorId,
      criadoEm: serverTimestamp(),
      ultimaAtividade: serverTimestamp(),
      totalComentarios: 0,
      totalCurtidas: 0,
      ultimoComentarioId: null,
      ultimaCurtidaUid: null,
    });
    return ref.id;
  },
  async editar(
    id: string,
    input: { titulo: string; texto: string; categoria: Categoria; regiao: string },
  ): Promise<void> {
    usuarioId();
    await updateDoc(doc(db, 'forum', id), { ...campos(input), editadoEm: serverTimestamp() });
  },
  escutarComentarios(
    id: string,
    quantidade: number,
    next: (items: Comentario[]) => void,
    error: (error: Error) => void,
  ): Unsubscribe {
    return onSnapshot(
      query(
        collection(db, 'forum', id, 'comentarios'),
        orderBy('criadoEm', 'desc'),
        limit(quantidade),
      ),
      (s) =>
        next(
          s.docs.map((d) => ({
            id: d.id,
            texto: String(d.data().texto ?? d.data().comentario ?? ''),
            autorId: String(d.data().autorId ?? ''),
            autorNomeLegado:
              typeof d.data().autorNome === 'string' ? d.data().autorNome : undefined,
            criadoEm: d.data().criadoEm ?? null,
          })),
        ),
      error,
    );
  },
  novoComentarioId(postId: string): string {
    return doc(collection(db, 'forum', postId, 'comentarios')).id;
  },
  async comentar(postId: string, input: string, comentarioId: string): Promise<void> {
    const uid = usuarioId();
    const texto = textoObrigatorio(input, 'Comentário', LIMITES.comentario);
    const postRef = doc(db, 'forum', postId);
    const commentRef = doc(postRef, 'comentarios', comentarioId);
    await runTransaction(db, async (tx) => {
      const post = await tx.get(postRef);
      const prior = await tx.get(commentRef);
      if (!post.exists()) throw new Error('Esta publicação não está mais disponível.');
      if (prior.exists()) {
        if (prior.data().autorId !== uid || prior.data().texto !== texto)
          throw new Error('Conflito no envio. Tente novamente.');
        return; // Safe retry of the same operation ID.
      }
      tx.set(commentRef, { autorId: uid, texto, criadoEm: serverTimestamp() });
      tx.update(postRef, {
        totalComentarios: numeroSeguro(post.data().totalComentarios) + 1,
        ultimaAtividade: serverTimestamp(),
        ultimoComentarioId: comentarioId,
      });
    });
  },
  escutarCurtida(
    postId: string,
    uid: string,
    next: (liked: boolean) => void,
    error: (error: Error) => void,
  ): Unsubscribe {
    return onSnapshot(doc(db, 'forum', postId, 'curtidas', uid), (s) => next(s.exists()), error);
  },
  async alternarCurtida(postId: string): Promise<void> {
    const uid = usuarioId();
    const postRef = doc(db, 'forum', postId);
    const likeRef = doc(postRef, 'curtidas', uid);
    await runTransaction(db, async (tx) => {
      const post = await tx.get(postRef);
      const like = await tx.get(likeRef);
      if (!post.exists()) throw new Error('Publicação não encontrada.');
      const delta = like.exists() ? -1 : 1;
      const count = numeroSeguro(post.data().totalCurtidas) + delta;
      if (count < 0) throw new Error('Contador legado inconsistente. Consulte o guia de migração.');
      if (like.exists()) tx.delete(likeRef);
      else tx.set(likeRef, { usuarioId: uid, criadoEm: serverTimestamp() });
      tx.update(postRef, { totalCurtidas: count, ultimaCurtidaUid: uid });
    });
  },
};
