import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let unsubscribe;
    try {
      unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          setUser(user);
          setLoading(false);
        },
        (error) => {
          console.error('[AuthContext] Auth state error:', error);
          setAuthError(error.message);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('[AuthContext] Failed to subscribe to auth state:', error);
      setAuthError(error.message);
      setLoading(false);
    }

    return () => unsubscribe?.();
  }, []);

  if (authError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '24px', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: '#e53e3e', marginBottom: '12px' }}>Firebase Configuration Error</h2>
        <p style={{ color: '#666', textAlign: 'center', maxWidth: '500px' }}>{authError}</p>
        <p style={{ color: '#999', fontSize: '14px', marginTop: '12px' }}>Check that Authentication is enabled in your Firebase project and that your .env credentials are correct.</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
