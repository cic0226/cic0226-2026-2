import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FirebaseAuth from 'firebase/auth';
import type { Auth, Persistence } from 'firebase/auth';
import { app } from './app';
import { emulatorHost, useEmulators } from '@/config/firebase.config';

// Some Firebase declaration entry points omit the RN-only export. The runtime
// guard below reports a real resolver error instead of silently losing session persistence.
const nativeAuth = FirebaseAuth as typeof FirebaseAuth & {
  getReactNativePersistence?: (storage: typeof AsyncStorage) => Persistence;
};
function initializeNativeAuth(): Auth {
  if (typeof nativeAuth.getReactNativePersistence !== 'function') {
    throw new Error(
      'Firebase nativo não resolvido. Reinstale as dependências e execute npx expo start --clear. Não force a condição browser no Metro.',
    );
  }
  try {
    return FirebaseAuth.initializeAuth(app, {
      persistence: nativeAuth.getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if ((error as { code?: string }).code === 'auth/already-initialized') {
      return FirebaseAuth.getAuth(app);
    }
    throw error;
  }
}
export const auth = initializeNativeAuth();
if (useEmulators && !auth.emulatorConfig) {
  FirebaseAuth.connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
}
