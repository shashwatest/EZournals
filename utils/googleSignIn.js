import * as Google from 'expo-auth-session/providers/google';
import { auth } from './firebase';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';

export async function signInWithGoogleAsync() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: 'EnterYourOwn.apps.googleusercontent.com', // Replace with your web client ID from Firebase
  });

  if (response?.type === 'success') {
    const { id_token } = response.params;
    const credential = GoogleAuthProvider.credential(id_token);
    await signInWithCredential(auth, credential);
  }

  return { request, promptAsync };
}
