import * as AppleAuthentication from 'expo-apple-authentication';
import { auth } from './firebase';
import { signInWithCredential, OAuthProvider } from 'firebase/auth';

export async function signInWithAppleAsync() {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    const provider = new OAuthProvider('apple.com');
    const firebaseCredential = provider.credential({
      idToken: credential.identityToken,
      rawNonce: credential.nonce,
    });
    await signInWithCredential(auth, firebaseCredential);
  } catch (e) {
    throw e;
  }
}
