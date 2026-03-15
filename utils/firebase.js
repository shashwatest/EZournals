// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Try all possible locations for firebaseConfig in Expo
const getFirebaseConfig = () => {
  // Expo Go and dev: manifest.extra
  if (Constants.manifest?.extra?.firebaseConfig) {
    return Constants.manifest.extra.firebaseConfig;
  }
  // EAS/production: expoConfig.extra
  if (Constants.expoConfig?.extra?.firebaseConfig) {
    return Constants.expoConfig.extra.firebaseConfig;
  }
  // Newer Expo: manifest2.extra
  if (Constants.manifest2?.extra?.firebaseConfig) {
    return Constants.manifest2.extra.firebaseConfig;
  }
  throw new Error('No Firebase config found in Expo Constants.');
};

const firebaseConfig = getFirebaseConfig();

const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Use different auth initialization for web vs native
export const auth = Platform.OS === 'web' 
  ? (() => {
      const webAuth = getAuth(app);
      webAuth.setPersistence(browserLocalPersistence);
      return webAuth;
    })()
  : initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
