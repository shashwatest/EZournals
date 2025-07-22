import * as Facebook from 'expo-auth-session/providers/facebook';
import { auth } from './firebase';
import { signInWithCredential, FacebookAuthProvider } from 'firebase/auth';

export async function signInWithFacebookAsync() {
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: 'YOUR_FACEBOOK_APP_ID', // Replace with your Facebook App ID
  });

  if (response?.type === 'success') {
    const { access_token } = response.params;
    const credential = FacebookAuthProvider.credential(access_token);
    await signInWithCredential(auth, credential);
  }

  return { request, promptAsync };
}
