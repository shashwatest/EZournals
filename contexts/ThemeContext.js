import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [currentTheme, setCurrentTheme] = useState('blue');
  const [isLoading, setIsLoading] = useState(true);

  const getActiveTheme = () => {
    return themes[currentTheme] || themes.blue;
  };

  const loadTheme = async () => {
    try {
      const themeName = await getTheme();
      setCurrentTheme(themeName);
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

  useEffect(() => {
    loadTheme();
  }, []);

  const value = {
    theme: getActiveTheme(),
    currentTheme,
    isLoading,
    changeTheme
  };

  if (isLoading) {
    return (
      <ThemeContext.Provider value={{ ...value, theme: themes.blue }}>
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