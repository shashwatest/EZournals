import React, { createContext, useContext, useState, useEffect } from 'react';
import PlatformStorage from '../utils/platformStorage';
import { getTheme, saveTheme, getDarkMode, saveDarkMode } from '../utils/storage';
import { themes } from '../styles/theme';

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
    reloadThemes
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