import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [currentTheme, setCurrentTheme] = useState('oceanTeal');
  const [customThemes, setCustomThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getActiveTheme = () => {
    if (currentTheme.startsWith('custom-')) {
      const customTheme = customThemes.find(t => t.id === currentTheme);
      return customTheme || themes.oceanTeal;
    }
    return themes[currentTheme] || themes.oceanTeal;
  };

  const loadTheme = async () => {
    try {
      const themeName = await getTheme();
      setCurrentTheme(themeName);
      
      // Load all custom themes
      const customThemesData = await AsyncStorage.getItem('customThemes');
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
      await AsyncStorage.setItem('customThemes', JSON.stringify(updatedThemes));
      await saveTheme(themeId);
      
      setCustomThemes(updatedThemes);
      setCurrentTheme(themeId);
    } catch (error) {
      console.error('Error saving custom theme:', error);
    }
  };

  useEffect(() => {
    loadTheme();
  }, []);

  const reloadThemes = async () => {
    const customThemesData = await AsyncStorage.getItem('customThemes');
    if (customThemesData) {
      setCustomThemes(JSON.parse(customThemesData));
    }
  };

  const value = {
    theme: getActiveTheme(),
    currentTheme,
    customThemes,
    isLoading,
    changeTheme,
    saveCustomTheme,
    reloadThemes
  };

  if (isLoading) {
    return (
      <ThemeContext.Provider value={{ ...value, theme: themes.oceanTeal }}>
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