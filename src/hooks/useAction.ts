import { useRef, useState } from 'react';
import { mensagemErro } from '@/utils/errors';
export function useAction() {
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function run(task: () => Promise<unknown>): Promise<boolean> {
    if (locked.current) return false;
    locked.current = true;
    setBusy(true);
    setError('');
    try {
      await task();
      return true;
    } catch (e) {
      setError(mensagemErro(e));
      return false;
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  return { busy, error, run, clearError: () => setError('') };
}
