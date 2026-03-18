import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import PlatformStorage from '../../backend/utils/platformStorage';
import { getTheme, saveTheme } from '../../backend/utils/storage';
import { themes } from '../styles/theme';
import { savePreferencesToCloud, getPreferencesFromCloud, subscribeToPreferences } from '../../backend/firebase/cloudStorage';
import { auth } from '../../backend/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('glassmorphism');
  const [customThemes, setCustomThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const syncPreferencesRef = useRef(false);
  const unsubscribeRef = useRef(null);

  // Keep ref in sync with UISettingsContext syncPreferences
  // ThemeContext subscribes when syncPreferences is enabled — called externally via enableThemeSync
  const enableThemeSync = (enabled) => {
    syncPreferencesRef.current = enabled;
    if (unsubscribeRef.current) { unsubscribeRef.current(); unsubscribeRef.current = null; }
    if (enabled) {
      unsubscribeRef.current = subscribeToPreferences(async (prefs) => {
        if (prefs.currentTheme) {
          setCurrentTheme(prefs.currentTheme);
          await saveTheme(prefs.currentTheme);
        }
        if (prefs.customThemes) {
          setCustomThemes(prefs.customThemes);
          await PlatformStorage.setItem('customThemes', JSON.stringify(prefs.customThemes));
        }
      });
    }
  };

  useEffect(() => {
    // Tear down listener on sign-out
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user && unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  // Merge custom theme with glassmorphism to ensure all properties exist
  const mergeWithDefault = (themeObj) => {
    const merged = { ...themes.glassmorphism, ...themeObj };
    // Fill any missing keys from glassmorphism
    Object.keys(themes.glassmorphism).forEach(key => {
      if (merged[key] === undefined) merged[key] = themes.glassmorphism[key];
    });
    return merged;
  };
  const getActiveTheme = () => {
    if (currentTheme && currentTheme.startsWith('custom-')) {
      const customTheme = customThemes.find(t => t.id === currentTheme);
      return customTheme ? mergeWithDefault(customTheme) : themes.glassmorphism;
    }
    // If theme is missing or incomplete, fallback to glassmorphism
    const themeObj = themes[currentTheme];
    if (!themeObj) return themes.glassmorphism;
    // Fill missing keys for built-in themes too
    return mergeWithDefault(themeObj);
  };

  const loadTheme = async () => {
    try {
      const themeName = await getTheme();
      setCurrentTheme(themeName);
      
      // Load all custom themes
      const customThemesData = await PlatformStorage.getItem('customThemes');
      if (customThemesData) {
        setCustomThemes(JSON.parse(customThemesData));
      }

      // If sync was enabled, fetch latest theme from cloud
      const savedSync = await PlatformStorage.getItem('syncPreferences');
      if (savedSync && JSON.parse(savedSync)) {
        const prefs = await getPreferencesFromCloud();
        if (prefs?.currentTheme) {
          setCurrentTheme(prefs.currentTheme);
          await saveTheme(prefs.currentTheme);
        }
        if (prefs?.customThemes) {
          setCustomThemes(prefs.customThemes);
          await PlatformStorage.setItem('customThemes', JSON.stringify(prefs.customThemes));
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeTheme = async (themeName) => {
    try {
      await saveTheme(themeName);
      setCurrentTheme(themeName);
      if (syncPreferencesRef.current) savePreferencesToCloud({ currentTheme: themeName });
    } catch (error) {
      console.error('Error changing theme:', error);
    }
  };

  const saveCustomTheme = async (themeData) => {
    try {
      const themeId = `custom-${Date.now()}`;
      const newTheme = { ...themeData, id: themeId };
      const updatedThemes = [...customThemes, newTheme];
      await PlatformStorage.setItem('customThemes', JSON.stringify(updatedThemes));
      await saveTheme(themeId);
      setCustomThemes(updatedThemes);
      setCurrentTheme(themeId);
      if (syncPreferencesRef.current) savePreferencesToCloud({ currentTheme: themeId, customThemes: updatedThemes });
    } catch (error) {
      console.error('Error saving custom theme:', error);
    }
  };

  useEffect(() => {
    loadTheme();
    // If no theme is set, force glassmorphism as default
    getTheme().then(themeName => {
      if (!themeName || !themes[themeName]) {
        saveTheme('glassmorphism');
        setCurrentTheme('glassmorphism');
      }
    });
  }, []);

  const reloadThemes = async () => {
    const customThemesData = await PlatformStorage.getItem('customThemes');
    if (customThemesData) {
      setCustomThemes(JSON.parse(customThemesData));
    }
  };

  // Warn if theme is missing any required property
  const activeTheme = getActiveTheme();
  if (process.env.NODE_ENV !== 'production') {
    Object.keys(themes.glassmorphism).forEach(key => {
      if (activeTheme[key] === undefined) {
        console.warn(`Theme property '${key}' is missing in active theme. Falling back to glassmorphism.`);
      }
    });
  }
  const value = {
    theme: activeTheme,
    currentTheme,
    customThemes,
    isLoading,
    changeTheme,
    saveCustomTheme,
    reloadThemes,
    enableThemeSync,
  };

  if (isLoading) {
    return (
      <ThemeContext.Provider value={{ ...value, theme: themes.glassmorphism }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};