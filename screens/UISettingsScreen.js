import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useUISettings } from '../contexts/UISettingsContext';

export default function UISettingsScreen({ navigation }) {
  const { theme } = useTheme();
  const { settings, updateSetting, getFontSizes } = useUISettings();

  const fontSizes = getFontSizes();

  const SettingOption = ({ title, description, options, currentValue, onSelect }) => (
    <View style={styles.settingSection}>
      <Text style={[styles.settingTitle, { color: theme.text, fontSize: fontSizes.title }]}>{title}</Text>
      <Text style={[styles.settingDescription, { color: theme.textSecondary, fontSize: fontSizes.subtitle }]}>{description}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              { borderColor: theme.border },
              currentValue === option.value && { borderColor: theme.accent, backgroundColor: theme.accent + '20' }
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text style={[
              styles.optionText,
              { color: theme.text, fontSize: fontSizes.base },
              currentValue === option.value && { color: theme.accent, fontWeight: '600' }
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const styles = createStyles(theme, fontSizes);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Display Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <SettingOption
          title="Text Size"
          description="Adjust the size of text throughout the app"
          options={[
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' },
            { label: 'Extra Large', value: 'xlarge' }
          ]}
          currentValue={settings.fontSize}
          onSelect={(value) => updateSetting('fontSize', value)}
        />

        <SettingOption
          title="Font Style"
          description="Choose your preferred font family"
          options={[
            { label: 'System', value: 'system' },
            { label: 'Serif', value: 'serif' },
            { label: 'Monospace', value: 'mono' },
            { label: 'Roboto', value: 'roboto' },
            { label: 'Open Sans', value: 'openSans' },
            { label: 'Lato', value: 'lato' }
          ]}
          currentValue={settings.fontFamily}
          onSelect={(value) => updateSetting('fontFamily', value)}
        />

        <SettingOption
          title="Card Layout"
          description="How entries are displayed on the home screen"
          options={[
            { label: 'List', value: 'list' },
            { label: 'Grid', value: 'grid' }
          ]}
          currentValue={settings.cardLayout}
          onSelect={(value) => updateSetting('cardLayout', value)}
        />

        <SettingOption
          title="Sort Entries"
          description="Default sorting order for your entries"
          options={[
            { label: 'Newest First', value: 'newest' },
            { label: 'Oldest First', value: 'oldest' },
            { label: 'Alphabetical', value: 'alphabetical' }
          ]}
          currentValue={settings.sortBy}
          onSelect={(value) => updateSetting('sortBy', value)}
        />

        <SettingOption
          title="Card Spacing"
          description="Space between entry cards"
          options={[
            { label: 'Tight', value: 'tight' },
            { label: 'Normal', value: 'normal' },
            { label: 'Loose', value: 'loose' }
          ]}
          currentValue={settings.cardSpacing}
          onSelect={(value) => updateSetting('cardSpacing', value)}
        />
      </ScrollView>
    </View>
  );
}

const createStyles = (theme, fontSizes) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 52,
    backgroundColor: theme.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    fontSize: fontSizes.header,
    fontWeight: '600',
    color: theme.text
  },
  placeholder: {
    width: 40
  },
  content: {
    flex: 1,
    padding: 16
  },
  settingSection: {
    backgroundColor: theme.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  settingTitle: {
    fontWeight: '600',
    marginBottom: 4
  },
  settingDescription: {
    marginBottom: 16
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8
  },
  optionText: {
    textAlign: 'center'
  }
});