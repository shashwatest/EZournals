// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

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
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
