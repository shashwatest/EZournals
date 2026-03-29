import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';

export default function CustomThemePage() {
  const { theme, saveCustomTheme, updateCustomTheme, defaultThemes } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const editTheme = location.state?.editTheme;

  const [themeName, setThemeName] = useState(editTheme?.name || 'My Custom Theme');
  const [customColors, setCustomColors] = useState(editTheme || {
    background: '#000000',
    surface: '#0a0a0a',
    text: '#FFFFFF',
    textSecondary: '#D1D1E0',
    textLight: '#9090A8',
    accent: '#A78BFA',
    primary: '#A78BFA',
    border: '#a78bfa',
    danger: '#FF6B9D',
    success: '#4ECDC4',
  });

  const accentText = theme?.onAccentText || '#fff';

  // Guard against undefined theme
  if (!theme) {
    return <div style={{ padding: '32px', textAlign: 'center' }}>Loading...</div>;
  }

  const colorFields = [
    { key: 'background', label: 'Background', description: 'Main app background' },
    { key: 'surface', label: 'Surface', description: 'Cards and panels' },
    { key: 'text', label: 'Text', description: 'Primary text color' },
    { key: 'textSecondary', label: 'Secondary Text', description: 'Subtitle text' },
    { key: 'textLight', label: 'Light Text', description: 'Placeholder text' },
    { key: 'accent', label: 'Accent', description: 'Buttons and highlights' },
    { key: 'primary', label: 'Primary', description: 'Main theme color' },
    { key: 'danger', label: 'Danger', description: 'Error and delete actions' },
    { key: 'success', label: 'Success', description: 'Success messages' },
    { key: 'border', label: 'Border', description: 'Lines and separators' }
  ];

  const updateColor = (key, value) => {
    // allow typing rgba( or hex
    setCustomColors(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const themeData = {
      ...customColors,
      name: themeName
    };

    if (editTheme) {
      updateCustomTheme(editTheme.id, themeData);
    } else {
      saveCustomTheme(themeData);
    }

    navigate('/settings');
  };

  const resetToDefault = () => {
    setCustomColors(defaultThemes.glassmorphism);
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
      justifyContent: 'space-between',
      marginBottom: '32px',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
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
    saveButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      backgroundColor: customColors.accent,
      color: accentText,
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
    },
    nameSection: {
      backgroundColor: theme.surface,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: theme.text,
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      padding: '12px',
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      backgroundColor: theme.background,
      color: theme.text,
      fontSize: '14px',
      boxSizing: 'border-box',
    },
    previewSection: {
      backgroundColor: theme.surface,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    previewTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: theme.text,
      marginBottom: '16px',
    },
    previewCard: {
      backgroundColor: customColors.surface,
      borderRadius: '12px',
      padding: '20px',
      border: `1px solid ${customColors.border}`,
    },
    previewText: {
      fontSize: '16px',
      color: customColors.text,
      marginBottom: '8px',
    },
    previewSecondary: {
      fontSize: '14px',
      color: customColors.textSecondary,
      marginBottom: '16px',
    },
    previewButton: {
      display: 'inline-flex',
      padding: '10px 20px',
      backgroundColor: customColors.accent,
      color: customColors.surface,
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      border: 'none',
    },
    colorsSection: {
      backgroundColor: theme.surface,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '16px'
    },
    colorField: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      border: `1px solid ${theme.border}`,
      borderRadius: '12px',
      backgroundColor: theme.background
    },
    colorInfo: {
      flex: 1,
      marginRight: '12px'
    },
    colorLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: theme.text,
      marginBottom: '4px',
    },
    colorDescription: {
      fontSize: '12px',
      color: theme.textSecondary,
    },
    colorInputWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '8px',
    },
    colorNative: {
      width: '40px',
      height: '40px',
      padding: '0',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      backgroundColor: 'transparent'
    },
    colorTextInput: {
      width: '80px',
      padding: '6px',
      border: `1px solid ${theme.border}`,
      borderRadius: '6px',
      backgroundColor: theme.surface,
      color: theme.text,
      fontSize: '12px',
      fontFamily: 'monospace',
      textAlign: 'center'
    },
    resetButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      gridColumn: '1 / -1',
      padding: '12px',
      backgroundColor: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      color: theme.danger,
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      marginTop: '16px',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backButton} onClick={() => navigate('/settings')}>
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 style={styles.title}>Custom Theme</h1>
        </div>
        <button style={styles.saveButton} onClick={handleSave}>
          <Save size={16} />
          Save Theme
        </button>
      </div>

      <div style={styles.nameSection}>
        <label style={styles.label}>Theme Name</label>
        <input
          type="text"
          style={styles.input}
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
          placeholder="Enter theme name"
        />
      </div>

      <div style={styles.previewSection}>
        <h2 style={styles.previewTitle}>Preview</h2>
        <div style={styles.previewCard}>
          <div style={styles.previewText}>Sample Text</div>
          <div style={styles.previewSecondary}>Secondary text</div>
          <button style={styles.previewButton}>Button</button>
        </div>
      </div>

      <div style={styles.colorsSection}>
        {colorFields.map((field) => {
          // input[type=color] requires exactly #RRGGBB.
          const hexMatch = customColors[field.key].match(/^#[0-9A-Fa-f]{6}$/) ? customColors[field.key] : '#000000';
          return (
            <div key={field.key} style={styles.colorField}>
              <div style={styles.colorInfo}>
                <div style={styles.colorLabel}>{field.label}</div>
                <div style={styles.colorDescription}>{field.description}</div>
              </div>
              <div style={styles.colorInputWrapper}>
                <input
                  type="color"
                  style={styles.colorNative}
                  value={hexMatch}
                  onChange={(e) => updateColor(field.key, e.target.value)}
                />
                <input
                  type="text"
                  style={styles.colorTextInput}
                  value={customColors[field.key]}
                  onChange={(e) => updateColor(field.key, e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          );
        })}

        <button style={styles.resetButton} onClick={resetToDefault}>
          <RotateCcw size={16} />
          Reset to Default
        </button>
      </div>
    </div>
  );
}
