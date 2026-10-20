// Client configuration only. Never add a service-account private key here.
// Expo requires literal process.env.EXPO_PUBLIC_* accesses for substitution.
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
export const missingFirebaseKeys = (['apiKey', 'authDomain', 'projectId', 'appId'] as const).filter(
  (key) => !firebaseConfig[key]?.trim(),
);
export const useEmulators = process.env.EXPO_PUBLIC_USE_EMULATORS === 'true';
export const emulatorHost = process.env.EXPO_PUBLIC_EMULATOR_HOST || '127.0.0.1';
