import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
      setEmail('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
      padding: '20px',
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: '16px',
      padding: '40px',
      width: '100%',
      maxWidth: '450px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px',
      marginBottom: '24px',
      border: 'none',
      backgroundColor: 'transparent',
      color: theme.text,
      cursor: 'pointer',
      fontSize: '14px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: theme.text,
      marginBottom: '8px',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: '14px',
      color: theme.textSecondary,
      marginBottom: '32px',
      textAlign: 'center',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: theme.text,
    },
    input: {
      padding: '12px 16px',
      borderRadius: '8px',
      border: `1px solid ${theme.border}`,
      backgroundColor: theme.background,
      color: theme.text,
      fontSize: '14px',
      outline: 'none',
    },
    button: {
      padding: '14px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: theme.accent,
      color: '#fff',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '8px',
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    message: {
      padding: '12px',
      borderRadius: '8px',
      fontSize: '14px',
      textAlign: 'center',
    },
    successMessage: {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb',
    },
    errorMessage: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button style={styles.backButton} onClick={() => navigate('/login')}>
          <ArrowLeft size={16} />
          Back to Login
        </button>

        <h1 style={styles.title}>Reset Password</h1>
        <p style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password
        </p>

        {message && (
          <div style={{ ...styles.message, ...styles.successMessage }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ ...styles.message, ...styles.errorMessage }}>
            {error}
          </div>
        )}

        <form style={styles.form} onSubmit={handleResetPassword}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
