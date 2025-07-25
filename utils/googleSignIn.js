import * as Google from 'expo-auth-session/providers/google';
import { auth } from './firebase';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';

export async function signInWithGoogleAsync() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
<<<<<<< HEAD
    clientId: process.env.GOOGLE_CLIENT_ID,
=======
    enter your own 
>>>>>>> 1e00331725058a3d097dc9af997516a714817180
  });

  if (response?.type === 'success') {
    const { id_token } = response.params;
    const credential = GoogleAuthProvider.credential(id_token);
    await signInWithCredential(auth, credential);
  }

  return { request, promptAsync };
}
