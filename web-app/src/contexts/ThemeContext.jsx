import React, { createContext, useContext, useState, useEffect } from 'react';

const themes = {
  glassmorphism: {
    background: '#000000',
    surface: '#0a0a0a',
    text: '#FFFFFF',
    textSecondary: '#D1D1E0',
    textLight: '#9090A8',
    accent: '#A78BFA',
    border: 'rgba(167, 139, 250, 0.25)',
    danger: '#FF6B9D',
    success: '#4ECDC4',
  }
};

const ThemeContext = createContext({});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('glassmorphism');
  const theme = themes[currentTheme];

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved && themes[saved]) {
      setCurrentTheme(saved);
    }
  }, []);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem('theme', themeName);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
