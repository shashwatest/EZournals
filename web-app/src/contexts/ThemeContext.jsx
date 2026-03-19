import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { savePreferencesToCloud, getPreferencesFromCloud, subscribeToPreferences } from '../utils/preferencesService';

const defaultThemes = {
  glassmorphism: {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    background: 'rgba(0, 0, 0, 0.82)',
    surface: 'rgba(8, 8, 8, 0.52)',
    surfaceHover: 'rgba(14, 14, 14, 0.62)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.78)',
    textLight: 'rgba(255, 255, 255, 0.5)',
    accent: '#FFFFFF',
    primary: '#FFFFFF',
    border: 'rgba(255, 255, 255, 0.16)',
    danger: '#FF8DA1',
    success: '#9EF7E7',
    warning: '#FFE7A6',
    onAccentText: '#000000',
    edit: '#FFFFFF',
    editGlow: 'rgba(255, 255, 255, 0.12)',
    dangerGlow: 'rgba(255, 141, 161, 0.16)',
    buttonBg: 'rgba(10, 10, 10, 0.48)',
    buttonHoverBg: 'rgba(18, 18, 18, 0.62)',
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
    onAccentText: '#FFFFFF',
    edit: '#7C8A97',
    editGlow: 'rgba(124, 138, 151, 0.15)',
    dangerGlow: 'rgba(184, 92, 92, 0.15)',
    buttonBg: '#181818',
    buttonHoverBg: '#232323',
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
    onAccentText: '#FFFFFF',
    edit: '#5A6B7A',
    editGlow: 'rgba(90, 107, 122, 0.12)',
    dangerGlow: 'rgba(196, 90, 90, 0.12)',
    buttonBg: '#E8E8E8',
    buttonHoverBg: '#E0E0E0',
  },
  classyBW: {
    id: 'classyBW',
    name: 'Classy Black & White',
    background: '#000000',
    surface: '#1A1A1A',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textLight: '#888888',
    accent: '#FFD700',
    primary: '#FFFFFF',
    border: '#333333',
    danger: '#FF5252',
    success: '#4CAF50',
    warning: '#FFC107',
    onAccentText: '#000000',
    edit: '#FFD700',
    editGlow: 'rgba(255, 215, 0, 0.12)',
    dangerGlow: 'rgba(255, 82, 82, 0.12)',
    buttonBg: '#141414',
    buttonHoverBg: '#1B1B1B',
  },
  oceanTeal: {
    id: 'oceanTeal',
    name: 'Ocean Teal',
    background: '#E0F2F1',
    surface: '#FFFFFF',
    text: '#004D40',
    textSecondary: '#00695C',
    textLight: '#80CBC4',
    accent: '#00ACC1',
    primary: '#00897B',
    border: '#B2DFDB',
    danger: '#D32F2F',
    success: '#388E3C',
    warning: '#F57C00',
    onAccentText: '#FFFFFF',
    edit: '#00897B',
    editGlow: 'rgba(0, 137, 123, 0.12)',
    dangerGlow: 'rgba(211, 47, 47, 0.12)',
    buttonBg: '#E7F6F4',
    buttonHoverBg: '#D9F0ED',
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

  const mergeThemeMap = (themeList = []) => {
    const merged = { ...defaultThemes };
    themeList.forEach(theme => {
      merged[theme.id] = theme;
    });
    return merged;
  };

  const enableThemeSync = (enabled) => {
    syncRef.current = enabled;
    if (unsubscribeRef.current) { unsubscribeRef.current(); unsubscribeRef.current = null; }
    if (enabled) {
      unsubscribeRef.current = subscribeToPreferences((prefs) => {
        let mergedThemes = allThemes;
        if (prefs.customThemes) {
          setCustomThemes(prefs.customThemes);
          localStorage.setItem('customThemes', JSON.stringify(prefs.customThemes));
          mergedThemes = mergeThemeMap(prefs.customThemes);
          setAllThemes(mergedThemes);
        }
        if (prefs.currentTheme && mergedThemes[prefs.currentTheme]) {
          setCurrentTheme(prefs.currentTheme);
          localStorage.setItem('theme', prefs.currentTheme);
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
          setAllThemes(mergeThemeMap(parsed));
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
          setAllThemes(mergeThemeMap(prefs.customThemes));
          parsed = prefs.customThemes;
        }
        if (prefs?.currentTheme) {
          const mergedThemes = mergeThemeMap(parsed);
          if (mergedThemes[prefs.currentTheme]) {
            setCurrentTheme(prefs.currentTheme);
            localStorage.setItem('theme', prefs.currentTheme);
          }
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
    const newTheme = { ...themeData, id: themeData.id || `custom-${Date.now()}` };
    const updated = [...customThemes, newTheme];
    setCustomThemes(updated);
    localStorage.setItem('customThemes', JSON.stringify(updated));
    setAllThemes(mergeThemeMap(updated));
    if (syncRef.current) savePreferencesToCloud({ customThemes: updated });
    return newTheme.id;
  };

  const updateCustomTheme = (themeId, themeData) => {
    const updated = customThemes.map(t => t.id === themeId ? { ...themeData, id: themeId } : t);
    setCustomThemes(updated);
    localStorage.setItem('customThemes', JSON.stringify(updated));
    setAllThemes(mergeThemeMap(updated));
    if (syncRef.current) savePreferencesToCloud({ customThemes: updated });
  };

  const deleteCustomTheme = (themeId) => {
    const updated = customThemes.filter(t => t.id !== themeId);
    setCustomThemes(updated);
    localStorage.setItem('customThemes', JSON.stringify(updated));
    setAllThemes(mergeThemeMap(updated));
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
