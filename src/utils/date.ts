/** Accept legacy missing/invalid dates without crashing a screen. */
export function millis(value: unknown): number | null {
  if (
    !value ||
    typeof value !== 'object' ||
    !('toMillis' in value) ||
    typeof value.toMillis !== 'function'
  )
    return null;
  try {
    const result: unknown = value.toMillis();
    return typeof result === 'number' && Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}
export function tempoRelativo(value: unknown): string {
  const time = millis(value);
  if (time === null) return 'agora';
  const minutes = Math.max(0, Math.floor((Date.now() - time) / 60000));
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  if (minutes < 1440) return `há ${Math.floor(minutes / 60)} h`;
  if (minutes < 10080) return `há ${Math.floor(minutes / 1440)} d`;
  return new Date(time).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
export function horaMensagem(value: unknown): string {
  const time = millis(value);
  return time !== null
    ? new Date(time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : 'Enviando';
}
export function diaMensagem(value: unknown): string {
  const time = millis(value);
  return time !== null ? new Date(time).toLocaleDateString('pt-BR') : 'Hoje';
}
