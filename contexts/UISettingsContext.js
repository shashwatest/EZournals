import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UISettingsContext = createContext();

export const useUISettings = () => {
  const context = useContext(UISettingsContext);
  if (!context) {
    throw new Error('useUISettings must be used within UISettingsProvider');
  }
  return context;
};

const defaultSettings = {
  fontSize: 'medium', // small, medium, large, xlarge
  fontFamily: 'system', // system, serif, mono
  cardLayout: 'list', // list, grid
  sortBy: 'newest', // newest, oldest, alphabetical
  cardSpacing: 'normal', // tight, normal, loose
  textSpacing: 'normal' // tight, normal, loose
};

export const UISettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('uiSettings');
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Error loading UI settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await AsyncStorage.setItem('uiSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving UI setting:', error);
    }
  };

  const getFontSizes = () => {
    const sizes = {
      small: { base: 14, header: 20, title: 16, subtitle: 12 },
      medium: { base: 16, header: 24, title: 18, subtitle: 14 },
      large: { base: 18, header: 28, title: 20, subtitle: 16 },
      xlarge: { base: 20, header: 32, title: 22, subtitle: 18 }
    };
    return sizes[settings.fontSize] || sizes.medium;
  };

  const getFontFamily = () => {
    const families = {
      system: Platform.OS === 'ios' ? 'System' : 'Roboto',
      serif: Platform.OS === 'ios' ? 'Georgia' : 'serif',
      mono: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      roboto: Platform.OS === 'ios' ? 'Helvetica' : 'Roboto',
      openSans: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
      lato: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-light'
    };
    return families[settings.fontFamily] || families.system;
  };

  const getSpacing = () => {
    const spacing = {
      tight: { card: 8, text: 1.2, padding: 12 },
      normal: { card: 16, text: 1.5, padding: 16 },
      loose: { card: 24, text: 1.8, padding: 20 }
    };
    return spacing[settings.cardSpacing] || spacing.normal;
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const value = {
    settings,
    updateSetting,
    getFontSizes,
    getFontFamily,
    getSpacing,
    isLoading
  };

  return (
    <UISettingsContext.Provider value={value}>
      {children}
    </UISettingsContext.Provider>
  );
};