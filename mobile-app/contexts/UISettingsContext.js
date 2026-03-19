import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { savePreferencesToCloud, getPreferencesFromCloud, subscribeToPreferences } from '../../backend/firebase/cloudStorage';
import { auth } from '../../backend/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

const UISettingsContext = createContext();

export const useUISettings = () => {
  const context = useContext(UISettingsContext);
  if (!context) throw new Error('useUISettings must be used within UISettingsProvider');
  return context;
};

const defaultSettings = {
  fontSize: 'medium',
  fontFamily: 'system',
  cardLayout: 'list',
  sortBy: 'newest',
  cardSpacing: 'normal',
  textSpacing: 'normal',
};

export const UISettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [syncPreferences, setSyncPreferences] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    loadSettings();
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

  useEffect(() => {
    if (unsubscribeRef.current) { unsubscribeRef.current(); unsubscribeRef.current = null; }
    if (syncPreferences) {
      unsubscribeRef.current = subscribeToPreferences((prefs) => {
        if (prefs.uiSettings) {
          setSettings(s => ({ ...s, ...prefs.uiSettings }));
          AsyncStorage.setItem('uiSettings', JSON.stringify({ ...settings, ...prefs.uiSettings }));
        }
      });
    }
  }, [syncPreferences]);

  const loadSettings = async () => {
    try {
      const [savedSettings, savedSync] = await Promise.all([
        AsyncStorage.getItem('uiSettings'),
        AsyncStorage.getItem('syncPreferences'),
      ]);
      if (savedSettings) setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      const syncEnabled = savedSync ? JSON.parse(savedSync) : false;
      setSyncPreferences(syncEnabled);

      // If sync was enabled, fetch latest from cloud on load
      if (syncEnabled) {
        const prefs = await getPreferencesFromCloud();
        if (prefs?.uiSettings) {
          const merged = { ...defaultSettings, ...JSON.parse(savedSettings || '{}'), ...prefs.uiSettings };
          setSettings(merged);
          await AsyncStorage.setItem('uiSettings', JSON.stringify(merged));
        }
      }
    } catch (e) {
      console.error('Error loading UI settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await AsyncStorage.setItem('uiSettings', JSON.stringify(newSettings));
    if (syncPreferences) savePreferencesToCloud({ uiSettings: newSettings });
  };

  const toggleSyncPreferences = async (value) => {
    setSyncPreferences(value);
    await AsyncStorage.setItem('syncPreferences', JSON.stringify(value));
    if (value) savePreferencesToCloud({ uiSettings: settings });
  };

  const getFontSizes = () => {
    const sizes = {
      small: { base: 14, header: 20, title: 16, subtitle: 12 },
      medium: { base: 16, header: 24, title: 18, subtitle: 14 },
      large: { base: 18, header: 28, title: 20, subtitle: 16 },
      xlarge: { base: 20, header: 32, title: 22, subtitle: 18 },
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
      lato: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-light',
    };
    return families[settings.fontFamily] || families.system;
  };

  const getSpacing = () => {
    const spacing = {
      tight: { card: 8, text: 1.2, padding: 12 },
      normal: { card: 16, text: 1.5, padding: 16 },
      loose: { card: 24, text: 1.8, padding: 20 },
    };
    return spacing[settings.cardSpacing] || spacing.normal;
  };

  return (
    <UISettingsContext.Provider value={{
      settings, updateSetting, getFontSizes, getFontFamily, getSpacing,
      isLoading, syncPreferences, toggleSyncPreferences,
    }}>
      {children}
    </UISettingsContext.Provider>
  );
};
