// Compatibility entry point for code ported from the legacy project.
export { app } from './app';
export { auth } from './auth';
export { db } from './firestore';
// No Storage instance: profile images are stored as Base64 in Firestore.
