import {
    collection,
    doc,
    getDoc,
    increment,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    writeBatch,
    type DocumentData,
    type Unsubscribe,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

// ============================================================================
// TIPOS
// ============================================================================

export interface ForumItem {
  id: string; // ID do documento (gerado automaticamente pelo Firestore)
  regiao: string;
  descricao: string;
  ultimaAtividade: Date | null;
  totalComentarios: number;
}

export interface Comentario {
  id: string;
  autorId: string;
  autorNome: string;
  texto: string;
  criadoEm: Date | null;
}

// ============================================================================
// ESTRUTURA NO FIRESTORE
//
//   forum/{forumId}                      -> regiao, descricao, ultimaAtividade,
//                                           totalComentarios
//   forum/{forumId}/comentarios/{id}     -> autorId, autorNome, texto, criadoEm
// ============================================================================

const COLECAO_FORUM = "forum";
const SUBCOLECAO_COMENTARIOS = "comentarios";
const COLECAO_USUARIOS = "usuarios";

// ============================================================================
// CONVERSORES (documento do Firestore -> objeto do app)
// ============================================================================

function paraData(valor: unknown): Date | null {
  return valor instanceof Timestamp ? valor.toDate() : null;
}

function converterForum(id: string, data: DocumentData): ForumItem {
  return {
    id,
    regiao: typeof data.regiao === "string" ? data.regiao : "Sem região",
    descricao: typeof data.descricao === "string" ? data.descricao : "",
    // Aceita também o nome antigo do campo ("ultima-atividade")
    ultimaAtividade: paraData(data.ultimaAtividade ?? data["ultima-atividade"]),
    totalComentarios:
      typeof data.totalComentarios === "number" ? data.totalComentarios : 0,
  };
}

function converterComentario(id: string, data: DocumentData): Comentario {
  return {
    id,
    autorId: typeof data.autorId === "string" ? data.autorId : "",
    autorNome:
      typeof data.autorNome === "string" && data.autorNome.trim()
        ? data.autorNome
        : "Morador",
    texto: typeof data.texto === "string" ? data.texto : "",
    criadoEm: paraData(data.criadoEm),
  };
}

// ============================================================================
// LEITURA EM TEMPO REAL
// Cada função devolve a função que cancela a escuta (use no cleanup do useEffect)
// ============================================================================

/** Escuta toda a coleção "forum", da atividade mais recente para a mais antiga. */
export function escutarForuns(
  aoReceber: (itens: ForumItem[]) => void,
  aoErrar: (erro: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, COLECAO_FORUM),
    (snapshot) => {
      const itens = snapshot.docs
        .map((d) =>
          converterForum(d.id, d.data({ serverTimestamps: "estimate" })),
        )
        // Ordena aqui (e não no Firestore) para que documentos sem o campo
        // de atividade também apareçam na lista.
        .sort(
          (a, b) =>
            (b.ultimaAtividade?.getTime() ?? 0) -
            (a.ultimaAtividade?.getTime() ?? 0),
        );

      aoReceber(itens);
    },
    aoErrar,
  );
}

/** Escuta um único fórum (usado no cabeçalho da conversa). */
export function escutarForum(
  forumId: string,
  aoReceber: (item: ForumItem | null) => void,
  aoErrar: (erro: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, COLECAO_FORUM, forumId),
    (snapshot) => {
      aoReceber(
        snapshot.exists()
          ? converterForum(
              snapshot.id,
              snapshot.data({ serverTimestamps: "estimate" }),
            )
          : null,
      );
    },
    aoErrar,
  );
}

/** Escuta os comentários de um fórum, do mais antigo para o mais novo. */
export function escutarComentarios(
  forumId: string,
  aoReceber: (comentarios: Comentario[]) => void,
  aoErrar: (erro: Error) => void,
): Unsubscribe {
  const consulta = query(
    collection(db, COLECAO_FORUM, forumId, SUBCOLECAO_COMENTARIOS),
    orderBy("criadoEm", "asc"),
  );

  return onSnapshot(
    consulta,
    (snapshot) => {
      aoReceber(
        snapshot.docs.map((d) =>
          converterComentario(d.id, d.data({ serverTimestamps: "estimate" })),
        ),
      );
    },
    aoErrar,
  );
}

// ============================================================================
// ESCRITA
// ============================================================================

/**
 * Descobre o nome a exibir no comentário lendo o campo "nome" do documento
 * "usuarios/{uid}" e, se não achar, usa o nome do perfil do Firebase Auth ou
 * o começo do e-mail.
 */
async function buscarNomeAutor(uid: string): Promise<string> {
  try {
    const snapshot = await getDoc(doc(db, COLECAO_USUARIOS, uid));
    const nome = snapshot.data()?.nome;

    if (typeof nome === "string" && nome.trim()) {
      return nome.trim();
    }
  } catch (error) {
    console.log("Não foi possível ler o nome do usuário:", error);
  }

  const atual = auth.currentUser;

  return atual?.displayName ?? atual?.email?.split("@")[0] ?? "Morador";
}

/**
 * Publica um comentário e, na mesma operação atômica, atualiza o fórum:
 * "ultimaAtividade" recebe a hora do servidor e "totalComentarios" soma 1.
 */
export async function enviarComentario(
  forumId: string,
  texto: string,
): Promise<void> {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Usuário não autenticado.");
  }

  const textoLimpo = texto.trim();

  if (!textoLimpo) return;

  const autorNome = await buscarNomeAutor(usuario.uid);

  const forumRef = doc(db, COLECAO_FORUM, forumId);
  const comentarioRef = doc(collection(forumRef, SUBCOLECAO_COMENTARIOS));

  const lote = writeBatch(db);

  lote.set(comentarioRef, {
    autorId: usuario.uid,
    autorNome,
    texto: textoLimpo,
    criadoEm: serverTimestamp(),
  });

  lote.update(forumRef, {
    ultimaAtividade: serverTimestamp(),
    totalComentarios: increment(1),
  });

  await lote.commit();
}

// ============================================================================
// FORMATAÇÃO DE TEXTO
// ============================================================================

function doisDigitos(n: number): string {
  return String(n).padStart(2, "0");
}

export function rotuloComentarios(total: number): string {
  return `${total} ${total === 1 ? "comentário" : "comentários"}`;
}

/** "Ativa agora · 12min", "Última atividade: ontem" etc. */
export function formatarAtividade(data: Date | null): {
  texto: string;
  ativoAgora: boolean;
} {
  if (!data) return { texto: "Sem atividade", ativoAgora: false };

  const minutos = Math.floor((Date.now() - data.getTime()) / 60000);

  if (minutos < 1) return { texto: "Ativa agora", ativoAgora: true };

  if (minutos < 60) {
    return { texto: `Ativa agora · ${minutos}min`, ativoAgora: true };
  }

  const horas = Math.floor(minutos / 60);

  if (horas < 24) {
    return { texto: `Última atividade: ${horas}h`, ativoAgora: false };
  }

  const dias = Math.floor(horas / 24);

  if (dias === 1) {
    return { texto: "Última atividade: ontem", ativoAgora: false };
  }

  if (dias < 7) {
    return { texto: `Última atividade: ${dias} dias`, ativoAgora: false };
  }

  return {
    texto: `Última atividade: ${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}`,
    ativoAgora: false,
  };
}

/** "hoje 14:05", "ontem 09:30" ou "03/10 18:20". */
export function formatarDataHora(data: Date | null): string {
  if (!data) return "agora";

  const hora = `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;

  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  const mesmoDia = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (mesmoDia(data, hoje)) return `hoje ${hora}`;
  if (mesmoDia(data, ontem)) return `ontem ${hora}`;

  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)} ${hora}`;
}