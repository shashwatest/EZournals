// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyAF8GkiqW7C9kh1Ss5AAveXZZr4rcmOY8U",
  authDomain: "ezournals.firebaseapp.com",
  projectId: "ezournals",
  storageBucket: "ezournals.firebasestorage.app",
  messagingSenderId: "809838918420",
  appId: "1:809838918420:web:c6f5bf07da87554eb6a001"
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
