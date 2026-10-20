// Metro uses this file on Web, and auth.native.ts on Android/iOS.
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { app } from './app';
import { emulatorHost, useEmulators } from '@/config/firebase.config';
export const auth = getAuth(app);
if (useEmulators && !auth.emulatorConfig) {
  connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
}
