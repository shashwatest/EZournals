import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import { BookOpen, Mail, Lock } from 'lucide-react';

const googleProvider = new GoogleAuthProvider();
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export default function LoginPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
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

  const handleLogin = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setErrors({});
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate('/');
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setErrors({});
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrors({ general: err.message });
      }
    }
  };

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: theme.background,
      overflowY: 'auto',
    },
    leftPanel: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '48px',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '48px',
    },
    logoText: {
      fontSize: '32px',
      fontWeight: '700',
      color: theme.text,
    },
    form: {
      width: '100%',
      maxWidth: '400px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '600',
      color: theme.text,
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '16px',
      color: theme.textSecondary,
      marginBottom: '32px',
    },
    inputGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: theme.textSecondary,
      marginBottom: '8px',
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    icon: {
      position: 'absolute',
      left: '16px',
      color: theme.textLight,
    },
    input: {
      width: '100%',
      padding: '12px 16px 12px 48px',
      borderRadius: '12px',
      border: `1px solid ${theme.border}`,
      backgroundColor: theme.surface,
      color: theme.text,
      fontSize: '16px',
      outline: 'none',
    },
    button: {
      width: '100%',
      padding: '14px',
      borderRadius: '12px',
      border: 'none',
      backgroundColor: theme.accent,
      color: '#fff',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '8px',
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      margin: '24px 0',
      color: theme.textLight,
      fontSize: '14px',
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      backgroundColor: theme.border,
    },
    socialButton: {
      width: '100%',
      padding: '12px',
      borderRadius: '12px',
      border: `1px solid ${theme.border}`,
      backgroundColor: theme.surface,
      color: theme.text,
      fontSize: '15px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '12px',
    },
    error: {
      color: theme.danger,
      fontSize: '13px',
      marginTop: '4px',
    },
    generalError: {
      color: theme.danger,
      fontSize: '14px',
      marginTop: '12px',
      padding: '10px 14px',
      backgroundColor: `${theme.danger}15`,
      borderRadius: '8px',
    },
    footer: {
      marginTop: '24px',
      textAlign: 'center',
      fontSize: '14px',
      color: theme.textSecondary,
    },
    link: {
      color: theme.accent,
      textDecoration: 'none',
      fontWeight: '500',
    },
  };

  return (
    <div className="auth-page" style={styles.container}>
      <div style={styles.leftPanel}>
        <div style={styles.logo}>
          <BookOpen size={40} color={theme.accent} />
          <span style={styles.logoText}>EZournals</span>
        </div>

        <form style={styles.form} onSubmit={handleLogin}>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Sign in to your account to continue</p>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrapper}>
              <Mail size={20} style={styles.icon} />
              <input
                type="email"
                style={{ ...styles.input, borderColor: errors.email ? theme.danger : theme.border }}
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {errors.email && <div style={styles.error}>{errors.email}</div>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={20} style={styles.icon} />
              <input
                type={showPassword ? 'text' : 'password'}
                style={{ ...styles.input, borderColor: errors.password ? theme.danger : theme.border, paddingRight: '48px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary, display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <div style={styles.error}>{errors.password}</div>}
          </div>

          {errors.general && <div style={styles.generalError}>{errors.general}</div>}

          <div style={{ textAlign: 'right', marginBottom: '8px' }}>
            <Link to="/forgot-password" style={{ ...styles.link, fontSize: '14px' }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            or continue with
            <div style={styles.dividerLine} />
          </div>

          <button type="button" style={styles.socialButton} onClick={() => handleSocialLogin(googleProvider)}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div style={styles.footer}>
            Don't have an account?{' '}
            <Link to="/signup" style={styles.link}>Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
