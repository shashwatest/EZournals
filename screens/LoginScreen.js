import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { auth } from '../utils/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { signInWithGoogleAsync } from '../utils/googleSignIn';
import * as Google from 'expo-auth-session/providers/google';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { signInWithAppleAsync } from '../utils/appleSignIn';
import { signInWithFacebookAsync } from '../utils/facebookSignIn';

export default function LoginScreen({ navigation }) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '809838918420-sspuq7kg1bilibf5be065sr8re5h0ki0.apps.googleusercontent.com', // Replace with your actual client ID
  });

  React.useEffect(() => {
    const signInWithGoogle = async () => {
      if (response?.type === 'success') {
        const { id_token } = response.params;
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
  }, [response]);
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('Home');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      <Text style={[styles.title, { color: theme.text }]}>Login</Text>
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
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleLogin} disabled={loading}>
        <Text style={[styles.buttonText, { color: theme.surface }]}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={[styles.link, { color: theme.textSecondary }]}>Forgot Password?</Text>
      </TouchableOpacity>
      <Text style={[styles.or, { color: theme.textSecondary }]}>OR</Text>
      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#4285F4' }]} onPress={() => promptAsync()} disabled={!request}>
        <Ionicons name="logo-google" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={[styles.socialButtonText, { color: '#fff' }]}>Login with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#000' }]} onPress={async () => { try { await signInWithAppleAsync(); navigation.replace('Home'); } catch (e) { setError(e.message); } }}>
        <Ionicons name="logo-apple" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={[styles.socialButtonText, { color: '#fff' }]}>Login with Apple</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#3b5998' }]} onPress={async () => { try { await signInWithFacebookAsync(); navigation.replace('Home'); } catch (e) { setError(e.message); } }}>
        <Ionicons name="logo-facebook" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={[styles.socialButtonText, { color: '#fff' }]}>Login with Facebook</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={[styles.link, { color: theme.accent }]}>Create a new account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24
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
