import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { savePreferencesToCloud, getPreferencesFromCloud, subscribeToPreferences } from '../utils/preferencesService';

const defaultThemes = {
  glassmorphism: {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    background: '#000000',
    surface: '#0a0a0a',
    text: '#FFFFFF',
    textSecondary: '#D1D1E0',
    textLight: '#9090A8',
    accent: '#A78BFA',
    primary: '#A78BFA',
    border: 'rgba(167, 139, 250, 0.25)',
    danger: '#FF6B9D',
    success: '#4ECDC4',
  },
  light: {
    id: 'light',
    name: 'Light',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    textLight: '#999999',
    accent: '#6366F1',
    primary: '#6366F1',
    border: '#E5E5E5',
    danger: '#EF4444',
    success: '#10B981',
  },
  light3d: {
    id: 'light3d',
    name: 'Light 3D',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceHover: '#F0F0F0',
    text: '#1A1A1A',
    textSecondary: '#666666',
    textLight: '#999999',
    accent: '#6366F1',
    primary: '#6366F1',
    border: '#E5E5E5',
    borderGlow: '#D1D5DB',
    danger: '#EF4444',
    success: '#10B981',
    is3D: true, // Custom flag to trigger 3D effects
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    background: '#1A1A1A',
    surface: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textLight: '#808080',
    accent: '#8B5CF6',
    primary: '#8B5CF6',
    border: '#404040',
    danger: '#F87171',
    success: '#34D399',
  }
};

const ThemeContext = createContext({});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('glassmorphism');
  const [customThemes, setCustomThemes] = useState([]);
  const [allThemes, setAllThemes] = useState(defaultThemes);
  const syncRef = useRef(false);
  const unsubscribeRef = useRef(null);

  const enableThemeSync = (enabled) => {
    syncRef.current = enabled;
    if (unsubscribeRef.current) { unsubscribeRef.current(); unsubscribeRef.current = null; }
    if (enabled) {
      unsubscribeRef.current = subscribeToPreferences((prefs) => {
        if (prefs.currentTheme && allThemes[prefs.currentTheme]) {
          setCurrentTheme(prefs.currentTheme);
          localStorage.setItem('theme', prefs.currentTheme);
        }
        if (prefs.customThemes) {
          setCustomThemes(prefs.customThemes);
          localStorage.setItem('customThemes', JSON.stringify(prefs.customThemes));
          const merged = { ...defaultThemes };
          prefs.customThemes.forEach(t => { merged[t.id] = t; });
          setAllThemes(merged);
        }
      });
    }
  };

  useEffect(() => {
    return () => { if (unsubscribeRef.current) unsubscribeRef.current(); };
  }, []);

  useEffect(() => {
    const init = async () => {
      // Load saved theme
      const saved = localStorage.getItem('theme');
      if (saved) setCurrentTheme(saved);

      // Load custom themes
      const savedCustomThemes = localStorage.getItem('customThemes');
      let parsed = [];
      if (savedCustomThemes) {
        try {
          parsed = JSON.parse(savedCustomThemes);
          setCustomThemes(parsed);
          const merged = { ...defaultThemes };
          parsed.forEach(theme => { merged[theme.id] = theme; });
          setAllThemes(merged);
        } catch (e) {
          console.error('Error loading custom themes:', e);
        }
      }

      // If sync was enabled, fetch latest from cloud
      const savedSync = localStorage.getItem('syncPreferences');
      if (savedSync && JSON.parse(savedSync)) {
        const prefs = await getPreferencesFromCloud();
        if (prefs?.customThemes) {
          setCustomThemes(prefs.customThemes);
          localStorage.setItem('customThemes', JSON.stringify(prefs.customThemes));
          const merged = { ...defaultThemes };
          prefs.customThemes.forEach(t => { merged[t.id] = t; });
          setAllThemes(merged);
          parsed = prefs.customThemes;
        }
        if (prefs?.currentTheme) {
          setCurrentTheme(prefs.currentTheme);
          localStorage.setItem('theme', prefs.currentTheme);
        }
      }
    };
    init();
  }, []);

  const theme = allThemes[currentTheme] || defaultThemes.glassmorphism;

  const changeTheme = (themeName) => {
    if (allThemes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem('theme', themeName);
      if (syncRef.current) savePreferencesToCloud({ currentTheme: themeName });
    }
  };

  const saveCustomTheme = (themeData) => {
    const newTheme = { ...themeData, id: themeData.id || `custom_${Date.now()}` };
    const updated = [...customThemes, newTheme];
    setCustomThemes(updated);
    localStorage.setItem('customThemes', JSON.stringify(updated));
    const merged = { ...defaultThemes };
    updated.forEach(t => { merged[t.id] = t; });
    setAllThemes(merged);
    if (syncRef.current) savePreferencesToCloud({ customThemes: updated });
    return newTheme.id;
  };

  const updateCustomTheme = (themeId, themeData) => {
    const updated = customThemes.map(t => t.id === themeId ? { ...themeData, id: themeId } : t);
    setCustomThemes(updated);
    localStorage.setItem('customThemes', JSON.stringify(updated));
    const merged = { ...defaultThemes };
    updated.forEach(t => { merged[t.id] = t; });
    setAllThemes(merged);
    if (syncRef.current) savePreferencesToCloud({ customThemes: updated });
  };

  const deleteCustomTheme = (themeId) => {
    const updated = customThemes.filter(t => t.id !== themeId);
    setCustomThemes(updated);
    localStorage.setItem('customThemes', JSON.stringify(updated));
    const merged = { ...defaultThemes };
    updated.forEach(t => { merged[t.id] = t; });
    setAllThemes(merged);
    if (currentTheme === themeId) changeTheme('glassmorphism');
    if (syncRef.current) savePreferencesToCloud({ customThemes: updated });
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, currentTheme, changeTheme, customThemes,
      allThemes, defaultThemes, saveCustomTheme,
      updateCustomTheme, deleteCustomTheme, enableThemeSync,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
