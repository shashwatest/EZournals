import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useUISettings } from '../contexts/UISettingsContext';
import { ArrowLeft, Type, Layout, SortAsc, Space, Mic, GitMerge } from 'lucide-react';

export default function UISettingsPage() {
  const { theme } = useTheme();
  const { settings, updateSetting, getFontSizes } = useUISettings();
  const navigate = useNavigate();
  const fontSizes = getFontSizes();

  const SettingOption = ({ title, description, options, currentValue, onSelect, icon: Icon }) => (
    <div style={styles.settingSection}>
      <div style={styles.settingHeader}>
        {Icon && <Icon size={20} color={theme.accent} />}
        <div style={styles.settingInfo}>
          <h3 style={{ ...styles.settingTitle, fontSize: fontSizes.title }}>{title}</h3>
          <p style={{ ...styles.settingDescription, fontSize: fontSizes.subtitle }}>{description}</p>
        </div>
      </div>
      <div style={styles.optionsContainer}>
        {options.map((option) => (
          <button
            key={option.value}
            style={{
              ...styles.optionButton,
              ...(currentValue === option.value ? styles.optionButtonActive : {}),
              fontSize: fontSizes.base,
            }}
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

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
    settingSection: {
      backgroundColor: theme.surface,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    settingHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      marginBottom: '20px',
    },
    settingInfo: {
      flex: 1,
    },
    settingTitle: {
      fontWeight: '600',
      color: theme.text,
      marginBottom: '6px',
    },
    settingDescription: {
      color: theme.textSecondary,
      lineHeight: '1.5',
    },
    optionsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
    },
    optionButton: {
      padding: '10px 20px',
      borderRadius: '20px',
      border: `1px solid ${theme.border}`,
      backgroundColor: 'transparent',
      color: theme.text,
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s',
    },
    optionButtonActive: {
      borderColor: theme.accent,
      backgroundColor: `${theme.accent}20`,
      color: theme.accent,
      fontWeight: '600',
    },
    previewSection: {
      backgroundColor: theme.surface,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    previewTitle: {
      fontSize: fontSizes.title,
      fontWeight: '600',
      color: theme.text,
      marginBottom: '16px',
    },
    previewCard: {
      backgroundColor: theme.background,
      borderRadius: '12px',
      padding: '20px',
      border: `1px solid ${theme.border}`,
    },
    previewText: {
      fontSize: fontSizes.base,
      color: theme.text,
      marginBottom: '8px',
    },
    previewSubtext: {
      fontSize: fontSizes.subtitle,
      color: theme.textSecondary,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/settings')}>
          <ArrowLeft size={16} />
          Back
        </button>
        <h1 style={styles.title}>Display Settings</h1>
      </div>

      <div style={styles.previewSection}>
        <h2 style={styles.previewTitle}>Preview</h2>
        <div style={styles.previewCard}>
          <div style={styles.previewText}>This is how your text will look</div>
          <div style={styles.previewSubtext}>Secondary text appears like this</div>
        </div>
      </div>

      <SettingOption
        title="Text Size"
        description="Adjust the size of text throughout the app"
        icon={Type}
        options={[
          { label: 'Small', value: 'small' },
          { label: 'Medium', value: 'medium' },
          { label: 'Large', value: 'large' },
          { label: 'Extra Large', value: 'xlarge' },
        ]}
        currentValue={settings.fontSize}
        onSelect={(value) => updateSetting('fontSize', value)}
      />

      <SettingOption
        title="Font Style"
        description="Choose your preferred font family"
        icon={Type}
        options={[
          { label: 'System', value: 'system' },
          { label: 'Serif', value: 'serif' },
          { label: 'Monospace', value: 'mono' },
          { label: 'Roboto', value: 'roboto' },
          { label: 'Open Sans', value: 'openSans' },
          { label: 'Lato', value: 'lato' },
        ]}
        currentValue={settings.fontFamily}
        onSelect={(value) => updateSetting('fontFamily', value)}
      />

      <SettingOption
        title="Card Layout"
        description="How entries are displayed on the home screen"
        icon={Layout}
        options={[
          { label: 'List', value: 'list' },
          { label: 'Grid', value: 'grid' },
        ]}
        currentValue={settings.cardLayout}
        onSelect={(value) => updateSetting('cardLayout', value)}
      />

      <SettingOption
        title="Sort Entries"
        description="Default sorting order for your entries"
        icon={SortAsc}
        options={[
          { label: 'Newest First', value: 'newest' },
          { label: 'Oldest First', value: 'oldest' },
          { label: 'Alphabetical', value: 'alphabetical' },
        ]}
        currentValue={settings.sortBy}
        onSelect={(value) => updateSetting('sortBy', value)}
      />

      <SettingOption
        title="Card Spacing"
        description="Space between entry cards"
        icon={Space}
        options={[
          { label: 'Tight', value: 'tight' },
          { label: 'Normal', value: 'normal' },
          { label: 'Loose', value: 'loose' },
        ]}
        currentValue={settings.cardSpacing}
        onSelect={(value) => updateSetting('cardSpacing', value)}
      />

      <SettingOption
        title="New Entry Button"
        description="Choose the default action for the button on the home screen"
        icon={Mic}
        options={[
          { label: 'Text', value: 'text' },
          { label: 'Voice', value: 'voice' },
        ]}
        currentValue={settings.defaultEntryMode}
        onSelect={(value) => updateSetting('defaultEntryMode', value)}
      />
    </div>
  );
}
