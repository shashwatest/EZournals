import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { auth } from '../../backend/firebase/config';
import { signInWithEmailAndPassword, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export default function LoginScreen({ navigation }) {
  const { theme } = useTheme();
  const googleClientId = Constants.expoConfig?.extra?.googleClientId;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleClientId,
    useProxy: true,
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(() => navigation.replace('Home'))
        .catch((e) => setErrors(prev => ({ ...prev, general: e.message })));
    }
  }, [response]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!validateEmail(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    return e;
  };

  const handleLogin = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace('Home');
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>Welcome back</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Sign in to your account to continue</Text>

        {/* Email */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
          <View style={[styles.inputRow, { borderColor: errors.email ? theme.danger : theme.border, backgroundColor: theme.surface }]}>
            <Ionicons name="mail-outline" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.inputInner, { color: theme.text }]}
              placeholder="your@email.com"
              placeholderTextColor={theme.textLight}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          {errors.email ? <Text style={[styles.fieldError, { color: theme.danger }]}>{errors.email}</Text> : null}
        </View>

        {/* Password */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
          <View style={[styles.inputRow, { borderColor: errors.password ? theme.danger : theme.border, backgroundColor: theme.surface }]}>
            <Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.inputInner, { color: theme.text }]}
              placeholder="••••••••"
              placeholderTextColor={theme.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={[styles.fieldError, { color: theme.danger }]}>{errors.password}</Text> : null}
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotRow}>
          <Text style={[styles.forgotText, { color: theme.textSecondary }]}>Forgot password?</Text>
        </TouchableOpacity>

        {errors.general ? <Text style={[styles.generalError, { color: theme.danger }]}>{errors.general}</Text> : null}

        <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleLogin} disabled={loading}>
          <Text style={[styles.buttonText, { color: '#fff' }]}>{loading ? 'Signing in...' : 'Sign In'}</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <Text style={[styles.dividerText, { color: theme.textSecondary }]}>or continue with</Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>

        <TouchableOpacity style={[styles.socialButton, { borderColor: theme.border, backgroundColor: theme.surface }]} onPress={() => promptAsync()} disabled={!request}>
          <Ionicons name="logo-google" size={18} color="#4285F4" />
          <Text style={[styles.socialButtonText, { color: theme.text }]}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.footerLink}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Don't have an account?{' '}
            <Text style={{ color: theme.accent, fontWeight: '600' }}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 80, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 15, marginBottom: 32 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  },
  inputInner: { flex: 1, fontSize: 15 },
  fieldError: { fontSize: 12, marginTop: 4 },
  forgotRow: { alignItems: 'flex-end', marginBottom: 8 },
  forgotText: { fontSize: 13 },
  generalError: { fontSize: 14, marginBottom: 12, textAlign: 'center' },
  button: {
    padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 20,
  },
  buttonText: { fontSize: 16, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13 },
  socialButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, padding: 13, borderRadius: 12, borderWidth: 1, marginBottom: 24,
  },
  socialButtonText: { fontSize: 15, fontWeight: '500' },
  footerLink: { alignItems: 'center' },
  footerText: { fontSize: 14 },
});
