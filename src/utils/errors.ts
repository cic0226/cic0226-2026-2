export function mensagemErro(error: unknown): string {
  const item = error as { code?: string; message?: string };
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/invalid-login-credentials': 'E-mail ou senha incorretos.',
    'auth/user-not-found': 'E-mail ou senha incorretos.',
    'auth/wrong-password': 'E-mail ou senha incorretos.',
    'auth/email-already-in-use': 'Este e-mail já tem uma conta. Entre ou recupere sua senha.',
    'auth/invalid-email': 'Informe um e-mail válido.',
    'auth/weak-password': 'Escolha uma senha mais forte.',
    'auth/password-does-not-meet-requirements':
      'A senha não atende à política configurada no Firebase.',
    'auth/network-request-failed': 'Sem conexão. Verifique sua internet e tente novamente.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.',
    'auth/operation-not-allowed': 'Ative o provedor E-mail/senha no Firebase Authentication.',
    'permission-denied':
      'Operação não autorizada. Confira as regras do Firebase, seu perfil e possíveis bloqueios.',
    'failed-precondition':
      'O Firestore precisa de configuração. Publique os índices enviados junto ao projeto.',
    unavailable: 'Conexão indisponível. Seu texto foi mantido; tente novamente.',
    'resource-exhausted': 'O limite do Firebase foi atingido. Tente mais tarde.',
  };
  if (item?.code && messages[item.code]) return messages[item.code]!;
  return item?.message || 'Não foi possível concluir. Tente novamente.';
}
