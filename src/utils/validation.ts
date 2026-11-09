export const LIMITES = {
  nome: 80,
  titulo: 120,
  publicacao: 5000,
  comentario: 2000,
  mensagem: 4000,
  fotoBase64: 180000,
} as const;
export function textoObrigatorio(value: string, label: string, max: number, min = 1): string {
  const text = value.trim();
  if (text.length < min) throw new Error(`${label}: informe pelo menos ${min} caractere(s).`);
  if (text.length > max) throw new Error(`${label}: limite de ${max} caracteres.`);
  return text;
}
export function validarEmail(value: string): string {
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new Error('Informe um e-mail válido.');
  }
  return email;
}
export function validarSenha(senha: string): void {
  if (senha.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.');
  if (senha.length > 128) throw new Error('A senha deve ter no máximo 128 caracteres.');
}
export function validarUid(uid: string): string {
  // Firebase-generated UIDs use these characters. ":" remains an unambiguous separator.
  if (typeof uid !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(uid))
    throw new Error('Identificador de usuário inválido.');
  return uid;
}
export function criarConversaId(uid1: string, uid2: string): string {
  validarUid(uid1);
  validarUid(uid2);
  if (uid1 === uid2) throw new Error('Escolha outro usuário para conversar.');
  return [uid1, uid2].sort().join(':');
}
export function validarFoto(foto: string | null): string | null {
  if (foto === null) return null;
  if (foto.length > LIMITES.fotoBase64)
    throw new Error('A imagem ficou muito grande. Selecione outra foto.');
  if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(foto)) {
    throw new Error('Formato da foto inválido.');
  }
  return foto;
}
export function fotoDoLegado(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const input = value.trim();
  // Old raw Base64 did not include a MIME type. Detect common magic bytes.
  const mime = input.startsWith('/9j/') ? 'jpeg' : input.startsWith('UklGR') ? 'webp' : 'png';
  const uri = input.startsWith('data:image/') ? input : `data:image/${mime};base64,${input}`;
  try {
    return validarFoto(uri);
  } catch {
    return null;
  }
}
export function normalizar(value: string): string {
  return value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
export function iniciais(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  return (
    (parts[0]?.[0] || '?') + (parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : '')
  ).toUpperCase();
}
export function numeroSeguro(value: unknown): number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : 0;
}
