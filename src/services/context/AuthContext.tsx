import { useRouter } from "expo-router";
import type { User } from "firebase/auth";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { Alert } from "react-native";

import { authService, type Usuario } from "../authService";

// ============================================================================
// GUARDIÃO DE AUTENTICAÇÃO
//
// Acompanha o Firebase Auth UMA vez, na raiz do app, e entrega o estado para
// todas as telas. Qualquer tela pode ser visitada sem login; para interagir
// (comentar, curtir, postar, mandar mensagem...) use `exigirLogin`.
//
// IMPORTANTE: isto é proteção de UX. A segurança real fica nas Firestore
// Security Rules (request.auth), que valem mesmo se alguém burlar o app.
// ============================================================================

interface AuthContextValue {
  user: User | null;
  perfil: Usuario | null;
  /** true até o Firebase Auth responder pela primeira vez */
  carregando: boolean;
  logado: boolean;
  /**
   * Executa `acao` se houver usuário logado. Se for visitante, pergunta se
   * quer entrar; ao logar, o app volta para a tela em que ele estava.
   */
  exigirLogin: (acao: () => void, motivo?: string) => void;
  /** Leva o visitante para a tela de login e depois de volta. */
  irParaLogin: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(authService.getUsuarioAtual());
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    const cancelar = authService.observarAuth((usuario) => {
      setUser(usuario);
      setCarregando(false);


      if (!usuario) {
        setPerfil(null);
        return;
      }

      authService
        .buscarUsuario(usuario.uid)
        .then((dados) => {
          if (ativo) setPerfil(dados);
        })
        .catch(() => {
          if (ativo) setPerfil(null);
        });
    });

    return () => {
      ativo = false;
      cancelar();
    };
  }, []);

  const irParaLogin = useCallback(() => {
    // voltar=1 avisa a tela de login para retornar à tela atual após entrar
    router.push({ pathname: "/", params: { voltar: "1" } } as any);
  }, [router]);

  const exigirLogin = useCallback(
    (
      acao: () => void,
      motivo = "Você precisa estar logado para realizar esta ação.",
    ) => {
      if (carregando) return;

      if (user) {
        acao();
        return;
      }

      Alert.alert("Login necessário", motivo, [
        { text: "Agora não", style: "cancel" },
        { text: "Entrar", onPress: irParaLogin },
      ]);
    },
    [carregando, user, irParaLogin],
  );

  const valor = useMemo<AuthContextValue>(
    () => ({
      user,
      perfil,
      carregando,
      logado: user !== null,
      exigirLogin,
      irParaLogin,
    }),
    [user, perfil, carregando, exigirLogin, irParaLogin],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>.");
  }
  console.log(contexto);

  return contexto;
}
