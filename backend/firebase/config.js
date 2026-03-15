import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getFirebaseConfig = () => {
  const cfg =
    Constants.expoConfig?.extra?.firebaseConfig ||
    Constants.manifest2?.extra?.expoClient?.extra?.firebaseConfig ||
    Constants.manifest?.extra?.firebaseConfig;

  if (!cfg?.projectId || !cfg?.apiKey) {
    console.error('Firebase config missing or incomplete. Constants.expoConfig.extra:', Constants.expoConfig?.extra);
    return {
      apiKey: 'missing',
      authDomain: 'missing',
      projectId: 'missing',
      storageBucket: 'missing',
      messagingSenderId: 'missing',
      appId: 'missing',
    };
  }
  return cfg;
};

const firebaseConfig = getFirebaseConfig();

// Guard against duplicate initialization (e.g. hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);

const bucketUrl = `gs://${firebaseConfig.storageBucket}`;
export const storage = getStorage(app, bucketUrl);

export const auth = Platform.OS === 'web'
  ? (() => {
      const webAuth = getAuth(app);
      webAuth.setPersistence(browserLocalPersistence);
      return webAuth;
    })()
  : (() => {
      try {
        return initializeAuth(app, {
          persistence: getReactNativePersistence(ReactNativeAsyncStorage)
        });
      } catch {
        // Already initialized — just return the existing instance
        return getAuth(app);
      }
    })();
