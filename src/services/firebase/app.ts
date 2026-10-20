import { getApp, getApps, initializeApp } from 'firebase/app';
import { firebaseConfig, missingFirebaseKeys } from '@/config/firebase.config';
// A configuration screen blocks authentication when required values are absent.
// This placeholder is never used for an online request by the UI.
const config = missingFirebaseKeys.length
  ? { apiKey: 'missing-configuration', projectId: 'demo-mapeei', appId: 'missing' }
  : firebaseConfig;
export const app = getApps().length ? getApp() : initializeApp(config);
