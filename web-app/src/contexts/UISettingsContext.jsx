import React, { createContext, useContext, useState, useEffect } from 'react';

const UISettingsContext = createContext({});

export function useUISettings() {
  return useContext(UISettingsContext);
}

const defaultSettings = {
  fontSize: 'medium',
  fontFamily: 'system',
  cardLayout: 'list',
  sortBy: 'newest',
  cardSpacing: 'normal',
};

export function UISettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('uiSettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading UI settings:', e);
      }
    }
  }, []);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('uiSettings', JSON.stringify(newSettings));
  };

  const getFontSizes = () => {
    const sizes = {
      small: { base: 14, subtitle: 12, title: 16, header: 18 },
      medium: { base: 16, subtitle: 14, title: 18, header: 20 },
      large: { base: 18, subtitle: 16, title: 20, header: 22 },
      xlarge: { base: 20, subtitle: 18, title: 22, header: 24 },
    };
    return sizes[settings.fontSize] || sizes.medium;
  };

  const getFontFamily = () => {
    const families = {
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      serif: 'Georgia, "Times New Roman", serif',
      mono: '"Courier New", Courier, monospace',
      roboto: 'Roboto, sans-serif',
      openSans: '"Open Sans", sans-serif',
      lato: 'Lato, sans-serif',
    };
    return families[settings.fontFamily] || families.system;
  };

  const getSpacing = () => {
    const spacing = {
      tight: { card: 8, gap: 12 },
      normal: { card: 16, gap: 16 },
      loose: { card: 24, gap: 24 },
    };
    return spacing[settings.cardSpacing] || spacing.normal;
  };

  return (
    <UISettingsContext.Provider
      value={{
        settings,
        updateSetting,
        getFontSizes,
        getFontFamily,
        getSpacing,
      }}
    >
      {children}
    </UISettingsContext.Provider>
  );
}
