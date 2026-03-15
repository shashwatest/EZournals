import React, { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    // Load saved theme
    const saved = localStorage.getItem('theme');
    if (saved) {
      setCurrentTheme(saved);
    }

    // Load custom themes
    const savedCustomThemes = localStorage.getItem('customThemes');
    if (savedCustomThemes) {
      try {
        const parsed = JSON.parse(savedCustomThemes);
        setCustomThemes(parsed);
        
        // Merge custom themes with default themes
        const merged = { ...defaultThemes };
        parsed.forEach(theme => {
          merged[theme.id] = theme;
        });
        setAllThemes(merged);
      } catch (e) {
        console.error('Error loading custom themes:', e);
      }
    }
  }, []);

  const theme = allThemes[currentTheme] || defaultThemes.glassmorphism;

  const changeTheme = (themeName) => {
    if (allThemes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem('theme', themeName);
    }
  };

  const saveCustomTheme = (themeData) => {
    const newTheme = {
      ...themeData,
      id: themeData.id || `custom_${Date.now()}`,
    };

    const updated = [...customThemes, newTheme];
    setCustomThemes(updated);
    localStorage.setItem('customThemes', JSON.stringify(updated));

    // Update all themes
    const merged = { ...defaultThemes };
    updated.forEach(theme => {
      merged[theme.id] = theme;
    });
    setAllThemes(merged);

    return newTheme.id;
  };

  const updateCustomTheme = (themeId, themeData) => {
    const updated = customThemes.map(t => 
      t.id === themeId ? { ...themeData, id: themeId } : t
    );
    setCustomThemes(updated);
    localStorage.setItem('customThemes', JSON.stringify(updated));

    // Update all themes
    const merged = { ...defaultThemes };
    updated.forEach(theme => {
      merged[theme.id] = theme;
    });
    setAllThemes(merged);
  };

  const deleteCustomTheme = (themeId) => {
    const updated = customThemes.filter(t => t.id !== themeId);
    setCustomThemes(updated);
    localStorage.setItem('customThemes', JSON.stringify(updated));

    // Update all themes
    const merged = { ...defaultThemes };
    updated.forEach(theme => {
      merged[theme.id] = theme;
    });
    setAllThemes(merged);

    // If deleted theme was active, switch to default
    if (currentTheme === themeId) {
      changeTheme('glassmorphism');
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      currentTheme, 
      changeTheme, 
      customThemes,
      allThemes,
      defaultThemes,
      saveCustomTheme,
      updateCustomTheme,
      deleteCustomTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
