import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { auth } from '../utils/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useResponsive } from '../utils/responsive';
import { signInWithGoogleAsync } from '../utils/googleSignIn';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { signInWithCredential, GoogleAuthProvider, OAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { signInWithAppleAsync } from '../utils/appleSignIn';
import { signInWithFacebookAsync } from '../utils/facebookSignIn';

export default function SignupScreen({ navigation }) {
  const { theme } = useTheme();
  const { isDesktop, isMobile } = useResponsive();
  // Google AuthSession
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useIdTokenAuthRequest({
    clientId: '809838918420-sspuq7kg1bilibf5be065sr8re5h0ki0.apps.googleusercontent.com', // Replace with your actual client ID
  });

  // Facebook AuthSession
  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: 'YOUR_FACEBOOK_APP_ID', // Replace with your Facebook App ID
  });

  React.useEffect(() => {
    const signInWithGoogle = async () => {
      if (googleResponse?.type === 'success') {
        const { id_token } = googleResponse.params;
        const credential = GoogleAuthProvider.credential(id_token);
        try {
          await signInWithCredential(auth, credential);
          navigation.replace('Home');
        } catch (e) {
          setError(e.message);
        }
      }
    };
    signInWithGoogle();
  }, [googleResponse]);

  React.useEffect(() => {
    const signInWithFacebook = async () => {
      if (fbResponse?.type === 'success') {
        const { access_token } = fbResponse.params;
        const credential = FacebookAuthProvider.credential(access_token);
        try {
          await signInWithCredential(auth, credential);
          navigation.replace('Home');
        } catch (e) {
          setError(e.message);
        }
      }
    };
    signInWithFacebook();
  }, [fbResponse]);

  const handleAppleSignup = async () => {
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
      navigation.replace('Home');
    } catch (e) {
      setError(e.message);
    }
  };
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.replace('Home');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const dynamicStyles = createDynamicStyles(isDesktop, isMobile);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      {isDesktop && (
        <View style={[styles.desktopSplit, { backgroundColor: theme.surface }]}>
          <View style={styles.brandSection}>
            <Ionicons name="book" size={64} color={theme.accent} />
            <Text style={[styles.brandTitle, { color: theme.text }]}>EZournals</Text>
            <Text style={[styles.brandSubtitle, { color: theme.textSecondary }]}>
              Start your journaling journey today
            </Text>
          </View>
        </View>
      )}
      <View style={[dynamicStyles.formContainer, { backgroundColor: theme.background }]}>
        <View style={dynamicStyles.formContent}>
          <Text style={[styles.title, { color: theme.text }]}>
            {isDesktop ? 'Create Account' : 'Sign Up'}
          </Text>
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        placeholder="Email"
        placeholderTextColor={theme.textLight}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        placeholder="Password"
        placeholderTextColor={theme.textLight}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleSignup} disabled={loading}>
        <Text style={[styles.buttonText, { color: theme.surface }]}>{loading ? 'Creating...' : 'Create Account'}</Text>
      </TouchableOpacity>
      <Text style={[styles.or, { color: theme.textSecondary }]}>OR</Text>
      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#4285F4' }]} onPress={() => googlePromptAsync()} disabled={!googleRequest}>
        <Ionicons name="logo-google" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={[styles.socialButtonText, { color: '#fff' }]}>Sign up with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#000' }]} onPress={handleAppleSignup}>
        <Ionicons name="logo-apple" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={[styles.socialButtonText, { color: '#fff' }]}>Sign up with Apple</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#3b5998' }]} onPress={() => fbPromptAsync()} disabled={!fbRequest}>
        <Ionicons name="logo-facebook" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={[styles.socialButtonText, { color: '#fff' }]}>Sign up with Facebook</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={[styles.link, { color: theme.accent }]}>Already have an account? Login</Text>
      </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createDynamicStyles = (isDesktop, isMobile) => StyleSheet.create({
  formContainer: {
    flex: isDesktop ? 1 : undefined,
    width: isDesktop ? '50%' : '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContent: {
    width: '100%',
    maxWidth: isDesktop ? 440 : undefined,
    padding: isMobile ? 24 : 40,
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
  },
  desktopSplit: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
  },
  brandSection: {
    alignItems: 'center',
    maxWidth: 400,
  },
  brandTitle: {
    fontSize: 48,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  brandSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 32
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  error: {
    marginBottom: 8
  },
  or: {
    textAlign: 'center',
    marginVertical: 16
  },
  link: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: 'center'
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600'
  }
});
