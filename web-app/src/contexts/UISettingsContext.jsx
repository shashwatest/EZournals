import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { savePreferencesToCloud, getPreferencesFromCloud, subscribeToPreferences } from '../utils/preferencesService';

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
  defaultEntryMode: 'text',
  mergedDates: [],
};

export function UISettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [syncPreferences, setSyncPreferences] = useState(false);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const saved = localStorage.getItem('uiSettings');
      const savedSync = localStorage.getItem('syncPreferences');
      if (saved) { try { setSettings(JSON.parse(saved)); } catch (e) {} }
      const syncEnabled = savedSync ? JSON.parse(savedSync) : false;
      setSyncPreferences(syncEnabled);

      // If sync was enabled, fetch latest from cloud on load
      if (syncEnabled) {
        const prefs = await getPreferencesFromCloud();
        if (prefs?.uiSettings) {
          const base = saved ? JSON.parse(saved) : {};
          const merged = { ...defaultSettings, ...base, ...prefs.uiSettings };
          setSettings(merged);
          localStorage.setItem('uiSettings', JSON.stringify(merged));
        }
      }
    };
    init();
    return () => { if (unsubscribeRef.current) unsubscribeRef.current(); };
  }, []);

  useEffect(() => {
    if (unsubscribeRef.current) { unsubscribeRef.current(); unsubscribeRef.current = null; }
    if (syncPreferences) {
      unsubscribeRef.current = subscribeToPreferences((prefs) => {
        if (prefs.uiSettings) {
          setSettings(s => ({ ...s, ...prefs.uiSettings }));
          localStorage.setItem('uiSettings', JSON.stringify({ ...settings, ...prefs.uiSettings }));
        }
      });
    }
  }, [syncPreferences]);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('uiSettings', JSON.stringify(newSettings));
    if (syncPreferences) savePreferencesToCloud({ uiSettings: newSettings });
  };

  const toggleSyncPreferences = (value) => {
    setSyncPreferences(value);
    localStorage.setItem('syncPreferences', JSON.stringify(value));
    if (value) savePreferencesToCloud({ uiSettings: settings });
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
    <UISettingsContext.Provider value={{
      settings, updateSetting, getFontSizes, getFontFamily, getSpacing,
      syncPreferences, toggleSyncPreferences,
    }}>
      {children}
    </UISettingsContext.Provider>
  );
}
