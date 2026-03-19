import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useUISettings } from '../contexts/UISettingsContext';
import { ArrowLeft, Info, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const SYNC_SETTINGS_KEY = 'cloud_sync_settings';

const SYNC_FIELDS = [
  { id: 'content', label: 'Entry Text', description: 'The main journal entry content' },
  { id: 'date', label: 'Date & Time', description: 'When the entry was created', required: true },
  { id: 'tags', label: 'Tags & Mood', description: 'Tags and mood indicators' },
  { id: 'location', label: 'Location', description: 'GPS coordinates and location data' },
  { id: 'eventTime', label: 'Event Time', description: 'Specific time of the event' },
  { id: 'media', label: 'Photos & Audio', description: 'Images and audio recordings' },
  { id: 'timeRange', label: 'Time Range', description: 'Duration tracking data' },
];

export default function CloudSettingsPage() {
  const { theme, enableThemeSync } = useTheme();
  const { syncPreferences, toggleSyncPreferences } = useUISettings();
  const navigate = useNavigate();
  const [syncSettings, setSyncSettings] = useState({
    content: true,
    date: true,
    tags: true,
    location: false,
    eventTime: true,
    media: false,
    timeRange: true,
  });
  const accentText = theme.onAccentText || '#fff';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem(SYNC_SETTINGS_KEY);
      if (saved) {
        setSyncSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading sync settings:', error);
    }
  };

  const saveSettings = (newSettings) => {
    try {
      localStorage.setItem(SYNC_SETTINGS_KEY, JSON.stringify(newSettings));
      setSyncSettings(newSettings);
    } catch (error) {
      console.error('Error saving sync settings:', error);
    }
  };

  const toggleField = (fieldId) => {
    const newSettings = {
      ...syncSettings,
      [fieldId]: !syncSettings[fieldId]
    };
    saveSettings(newSettings);
  };

  const enableAll = () => {
    const allEnabled = {};
    SYNC_FIELDS.forEach(field => {
      allEnabled[field.id] = true;
    });
    saveSettings(allEnabled);
  };

  const disableAll = () => {
    const allDisabled = {};
    SYNC_FIELDS.forEach(field => {
      allDisabled[field.id] = field.required ? true : false;
    });
    saveSettings(allDisabled);
  };

  const styles = {
    container: {
      padding: '32px',
      maxWidth: '900px',
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '32px',
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      backgroundColor: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      color: theme.text,
      cursor: 'pointer',
      fontSize: '14px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: theme.text,
    },
    infoCard: {
      display: 'flex',
      gap: '16px',
      padding: '20px',
      backgroundColor: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: '12px',
      marginBottom: '24px',
    },
    infoIcon: {
      flexShrink: 0,
    },
    infoContent: {
      flex: 1,
    },
    infoTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: theme.text,
      marginBottom: '8px',
    },
    infoDescription: {
      fontSize: '14px',
      color: theme.textSecondary,
      lineHeight: '1.6',
    },
    quickActions: {
      display: 'flex',
      gap: '12px',
      marginBottom: '32px',
    },
    quickButton: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px',
      backgroundColor: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      color: theme.text,
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
    },
    section: {
      marginBottom: '24px',
    },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: '600',
      color: theme.textSecondary,
      letterSpacing: '0.5px',
      marginBottom: '16px',
    },
    fieldItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px',
      backgroundColor: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: '12px',
      marginBottom: '12px',
    },
    fieldLeft: {
      flex: 1,
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
    },
    fieldInfo: {
      flex: 1,
    },
    fieldTitleRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '6px',
    },
    fieldLabel: {
      fontSize: '16px',
      fontWeight: '600',
      color: theme.text,
    },
    requiredBadge: {
      padding: '2px 8px',
      backgroundColor: `${theme.accent}20`,
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      color: theme.accent,
    },
    fieldDescription: {
      fontSize: '13px',
      color: theme.textLight,
      lineHeight: '1.5',
    },
    toggle: {
      position: 'relative',
      width: '48px',
      height: '28px',
      backgroundColor: theme.border,
      borderRadius: '14px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    toggleActive: {
      backgroundColor: theme.accent,
    },
    toggleDisabled: {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
    toggleThumb: {
      position: 'absolute',
      top: '3px',
      left: '3px',
      width: '22px',
      height: '22px',
      backgroundColor: '#fff',
      borderRadius: '50%',
      transition: 'transform 0.2s',
    },
    toggleThumbActive: {
      backgroundColor: accentText,
      transform: 'translateX(20px)',
    },
    warningCard: {
      display: 'flex',
      gap: '12px',
      padding: '16px',
      backgroundColor: `${theme.danger}15`,
      border: `1px solid ${theme.danger}30`,
      borderRadius: '12px',
      alignItems: 'flex-start',
    },
    warningText: {
      flex: 1,
      fontSize: '13px',
      color: theme.textSecondary,
      lineHeight: '1.6',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/settings')}>
          <ArrowLeft size={16} />
          Back
        </button>
        <h1 style={styles.title}>Cloud Sync Settings</h1>
      </div>

      <div style={styles.infoCard}>
        <div style={styles.infoIcon}>
          <Info size={24} color={theme.accent} />
        </div>
        <div style={styles.infoContent}>
          <div style={styles.infoTitle}>Privacy Control</div>
          <div style={styles.infoDescription}>
            Choose which fields sync to cloud. Unchecked fields stay on your device only.
          </div>
        </div>
      </div>

      <div style={styles.quickActions}>
        <button style={styles.quickButton} onClick={enableAll}>
          <CheckCircle size={20} color={theme.accent} />
          Enable All
        </button>
        <button style={styles.quickButton} onClick={disableAll}>
          <XCircle size={20} color={theme.textSecondary} />
          Disable All
        </button>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>PREFERENCES SYNC</div>
        <div style={styles.fieldItem}>
          <div style={styles.fieldLeft}>
            <div style={styles.fieldInfo}>
              <div style={styles.fieldTitleRow}>
                <div style={styles.fieldLabel}>Sync Preferences</div>
              </div>
              <div style={styles.fieldDescription}>
                Sync theme, font, layout and other UI settings across all devices in real-time
              </div>
            </div>
          </div>
          <div
            style={{
              ...styles.toggle,
              ...(syncPreferences ? styles.toggleActive : {}),
            }}
            onClick={() => { toggleSyncPreferences(!syncPreferences); enableThemeSync(!syncPreferences); }}
          >
            <div style={{ ...styles.toggleThumb, ...(syncPreferences ? styles.toggleThumbActive : {}) }} />
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>SYNC TO CLOUD</div>
        
        {SYNC_FIELDS.map((field) => (
          <div key={field.id} style={styles.fieldItem}>
            <div style={styles.fieldLeft}>
              <div style={styles.fieldInfo}>
                <div style={styles.fieldTitleRow}>
                  <div style={styles.fieldLabel}>{field.label}</div>
                  {field.required && (
                    <span style={styles.requiredBadge}>Required</span>
                  )}
                </div>
                <div style={styles.fieldDescription}>{field.description}</div>
              </div>
            </div>
            
            <div
              style={{
                ...styles.toggle,
                ...(syncSettings[field.id] ? styles.toggleActive : {}),
                ...(field.required ? styles.toggleDisabled : {}),
              }}
              onClick={() => !field.required && toggleField(field.id)}
            >
              <div
                style={{
                  ...styles.toggleThumb,
                  ...(syncSettings[field.id] ? styles.toggleThumbActive : {}),
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={styles.warningCard}>
        <AlertTriangle size={20} color={theme.danger} />
        <div style={styles.warningText}>
          Disabled fields won't sync across devices. If you clear app data, those fields will be lost.
        </div>
      </div>
    </div>
  );
}
