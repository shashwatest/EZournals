// Google Sign-In for Expo Go uses expo-auth-session with the Expo proxy
// The hook (useIdTokenAuthRequest) must be used directly in the component, not here.
// This file just exports the credential helper.

import { auth } from '../../backend/firebase/config';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';

export async function handleGoogleCredential(idToken) {
  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
}
