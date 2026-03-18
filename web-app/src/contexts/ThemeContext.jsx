import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { savePreferencesToCloud, getPreferencesFromCloud, subscribeToPreferences } from '../utils/preferencesService';

const defaultThemes = {
  glassmorphism: {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    background: '#000000',
    surface: '#0a0a0a',
    surfaceHover: '#141414',
    text: '#FFFFFF',
    textSecondary: '#D1D1E0',
    textLight: '#9090A8',
    accent: '#A78BFA',
    primary: '#A78BFA',
    border: 'rgba(167, 139, 250, 0.25)',
    danger: '#FF6B9D',
    success: '#4ECDC4',
  },
  matteBlack: {
    id: 'matteBlack',
    name: 'Matte Black',
    background: '#121212',
    surface: '#141414',
    surfaceHover: '#171717',
    text: '#F0F0F0',
    textSecondary: '#B0B0B0',
    textLight: '#6A6A6A',
    accent: '#7C8A97',
    primary: '#7C8A97',
    border: '#1E1E1E',
    danger: '#B85C5C',
    success: '#6B9E8A',
    warning: '#C9A84C',
    edit: '#7C8A97',
    editGlow: 'rgba(124, 138, 151, 0.15)',
    dangerGlow: 'rgba(184, 92, 92, 0.15)',
    buttonBg: '#181818',
  },
  matteWhite: {
    id: 'matteWhite',
    name: 'Matte White',
    background: '#F0F0F0',
    surface: '#FFFFFF',
    surfaceHover: '#FAFAFA',
    text: '#1A1A1A',
    textSecondary: '#5A5A5A',
    textLight: '#8A8A8A',
    accent: '#5A6B7A',
    primary: '#5A6B7A',
    border: '#E0E0E0',
    danger: '#C45A5A',
    success: '#5A8E7A',
    warning: '#B8974A',
    edit: '#5A6B7A',
    editGlow: 'rgba(90, 107, 122, 0.12)',
    dangerGlow: 'rgba(196, 90, 90, 0.12)',
    buttonBg: '#E8E8E8',
  },
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
