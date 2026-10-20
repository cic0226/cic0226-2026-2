import type { Timestamp } from 'firebase/firestore';
export interface Usuario {
  uid: string;
  nome: string;
  email: string;
  fotoBase64: string | null;
  regiao: string;
  criadoEm?: Timestamp | null;
  atualizadoEm?: Timestamp | null;
}
export interface PerfilPublico {
  uid: string;
  nome: string;
  fotoBase64: string | null;
}
export const CATEGORIAS = [
  'Geral',
  'Moradia',
  'Segurança',
  'Transporte',
  'Lazer',
  'Custo de vida',
] as const;
export type Categoria = (typeof CATEGORIAS)[number];
export interface Publicacao {
  id: string;
  titulo: string;
  texto: string;
  autorId: string;
  autorNomeLegado?: string;
  categoria: Categoria;
  regiao: string;
  totalComentarios: number;
  totalCurtidas: number;
  criadoEm: Timestamp | null;
  ultimaAtividade: Timestamp | null;
  editadoEm?: Timestamp | null;
}
export interface Comentario {
  id: string;
  texto: string;
  autorId: string;
  autorNomeLegado?: string;
  criadoEm: Timestamp | null;
}
export interface Conversa {
  id: string;
  participantes: [string, string];
  criadoEm: Timestamp | null;
  atualizadoEm: Timestamp | null;
  ultimaMensagem: string;
  ultimaMensagemAutorId: string;
  ultimaMensagemId: string;
}
export interface Mensagem {
  id: string;
  autorId: string;
  texto: string;
  criadoEm: Timestamp | null;
}
export interface Favorito {
  id: string;
  tipo: 'regiao' | 'forum';
  refId: string;
  titulo: string;
}
export interface Regiao {
  id: string;
  nome: string;
  subtitulo: string;
}
