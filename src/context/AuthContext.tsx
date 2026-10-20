import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { auth } from '@/services/firebase/auth';
import { db } from '@/services/firebase/firestore';
import { mapearUsuario, profileService } from '@/services/profileService';
import type { Usuario } from '@/types/models';
import { mensagemErro } from '@/utils/errors';
import { clearPublicProfiles } from '@/hooks/usePublicProfile';
interface AuthState {
  user: User | null;
  perfil: Usuario | null;
  loading: boolean;
  error: string;
  retry(): void;
}
const Context = createContext<AuthState | null>(null);
export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let generation = 0;
    let active = true;
    let stopProfile: Unsubscribe | undefined;
    const stopAuth = onAuthStateChanged(
      auth,
      async (current) => {
        const token = ++generation;
        stopProfile?.();
        clearPublicProfiles();
        setUser(current);
        setPerfil(null);
        setError('');
        setLoading(true);
        if (!current) {
          setLoading(false);
          return;
        }
        try {
          await profileService.garantirPerfil(current);
          if (!active || token !== generation) return;
          stopProfile = onSnapshot(
            doc(db, 'usuarios', current.uid),
            (snapshot) => {
              if (!active || token !== generation) return;
              if (snapshot.exists()) {
                setPerfil(mapearUsuario(current.uid, snapshot.data()));
                setLoading(false);
              } else {
                setError('Seu perfil não foi encontrado. Tente sincronizar novamente.');
                setLoading(false);
              }
            },
            (e) => {
              if (active && token === generation) {
                setError(mensagemErro(e));
                setLoading(false);
              }
            },
          );
        } catch (e) {
          if (active && token === generation) {
            setError(mensagemErro(e));
            setLoading(false);
          }
        }
      },
      (e) => {
        if (active) {
          setError(mensagemErro(e));
          setLoading(false);
        }
      },
    );
    return () => {
      active = false;
      ++generation;
      stopAuth();
      stopProfile?.();
      clearPublicProfiles();
    };
  }, [revision]);
  return (
    <Context.Provider
      value={{ user, perfil, loading, error, retry: () => setRevision((v) => v + 1) }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAuth(): AuthState {
  const value = useContext(Context);
  if (!value) throw new Error('AuthProvider não encontrado.');
  return value;
}
