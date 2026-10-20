import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { favoriteService } from '@/services/favoriteService';
import type { Favorito } from '@/types/models';
import { mensagemErro } from '@/utils/errors';
interface State {
  items: Favorito[];
  loading: boolean;
  error: string;
  has(tipo: Favorito['tipo'], id: string): boolean;
  toggle(item: Omit<Favorito, 'id'>): Promise<void>;
}
const Context = createContext<State | null>(null);
export function FavoritesProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<Favorito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const busy = useRef(new Set<string>());
  useEffect(
    () =>
      favoriteService.escutar(
        (data) => {
          setItems(data);
          setLoading(false);
          setError('');
        },
        (e) => {
          setError(mensagemErro(e));
          setLoading(false);
        },
      ),
    [],
  );
  async function toggle(item: Omit<Favorito, 'id'>) {
    if (loading || error) throw new Error(error || 'Aguarde o carregamento dos favoritos.');
    const key = `${item.tipo}_${item.refId}`;
    if (busy.current.has(key)) return;
    busy.current.add(key);
    try {
      await favoriteService.alternar(item);
    } finally {
      busy.current.delete(key);
    }
  }
  return (
    <Context.Provider
      value={{
        items,
        loading,
        error,
        has: (tipo, id) => items.some((v) => v.tipo === tipo && v.refId === id),
        toggle,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useFavorites() {
  const c = useContext(Context);
  if (!c) throw new Error('FavoritesProvider ausente.');
  return c;
}
