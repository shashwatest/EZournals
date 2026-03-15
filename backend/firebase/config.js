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
    console.log('Using manifest.extra.firebaseConfig');
    return Constants.manifest.extra.firebaseConfig;
  }
  // EAS/production: expoConfig.extra
  if (Constants.expoConfig?.extra?.firebaseConfig) {
    console.log('Using expoConfig.extra.firebaseConfig');
    return Constants.expoConfig.extra.firebaseConfig;
  }
  // Newer Expo: manifest2.extra
  if (Constants.manifest2?.extra?.firebaseConfig) {
    console.log('Using manifest2.extra.firebaseConfig');
    return Constants.manifest2.extra.firebaseConfig;
  }
  
  console.error('No Firebase config found. Available Constants:', {
    hasManifest: !!Constants.manifest,
    hasExpoConfig: !!Constants.expoConfig,
    hasManifest2: !!Constants.manifest2,
  });
  throw new Error('No Firebase config found in Expo Constants. Make sure .env file exists in mobile-app directory.');
};

const firebaseConfig = getFirebaseConfig();

// Validate config
if (!firebaseConfig.projectId) {
  console.error('Firebase config missing projectId:', firebaseConfig);
  throw new Error('Firebase projectId not found in configuration');
}
if (!firebaseConfig.storageBucket) {
  console.error('Firebase config missing storageBucket:', firebaseConfig);
  throw new Error('Firebase storageBucket not found in configuration');
}

const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage - pass bucket URL explicitly to avoid _url: undefined issue
const bucketUrl = `gs://${firebaseConfig.storageBucket}`;
export const storage = getStorage(app, bucketUrl);

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
