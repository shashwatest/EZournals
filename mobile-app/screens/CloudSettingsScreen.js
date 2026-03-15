import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import PlatformStorage from '../../backend/utils/platformStorage';

const SYNC_SETTINGS_KEY = 'cloud_sync_settings';

const SYNC_FIELDS = [
  { id: 'content', label: 'Entry Text', icon: 'document-text-outline', description: 'The main journal entry content' },
  { id: 'date', label: 'Date & Time', icon: 'calendar-outline', description: 'When the entry was created', required: true },
  { id: 'tags', label: 'Tags & Mood', icon: 'pricetag-outline', description: 'Tags and mood indicators' },
  { id: 'location', label: 'Location', icon: 'location-outline', description: 'GPS coordinates and location data' },
  { id: 'eventTime', label: 'Event Time', icon: 'time-outline', description: 'Specific time of the event' },
  { id: 'media', label: 'Photos & Audio', icon: 'image-outline', description: 'Images and audio recordings' },
  { id: 'timeRange', label: 'Time Range', icon: 'timer-outline', description: 'Duration tracking data' },
];

export default function CloudSettingsScreen({ navigation }) {
  const { theme } = useTheme();
  const [syncSettings, setSyncSettings] = useState({
    content: true,
    date: true,
    tags: true,
    location: false,
    eventTime: true,
    media: false,
    timeRange: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await PlatformStorage.getItem(SYNC_SETTINGS_KEY);
      if (saved) {
        setSyncSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading sync settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await PlatformStorage.setItem(SYNC_SETTINGS_KEY, JSON.stringify(newSettings));
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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Cloud Sync Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="information-circle-outline" size={24} color={theme.accent} />
          <View style={styles.infoText}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>Privacy Control</Text>
            <Text style={[styles.infoDescription, { color: theme.textSecondary }]}>
              Choose which fields sync to cloud. Unchecked fields stay on your device only.
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.quickButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={enableAll}
          >
            <Ionicons name="checkmark-done-outline" size={20} color={theme.accent} />
            <Text style={[styles.quickButtonText, { color: theme.text }]}>Enable All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={disableAll}
          >
            <Ionicons name="close-outline" size={20} color={theme.textSecondary} />
            <Text style={[styles.quickButtonText, { color: theme.text }]}>Disable All</Text>
          </TouchableOpacity>
        </View>

        {/* Sync Fields */}
        <View style={styles.fieldsSection}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>SYNC TO CLOUD</Text>
          
          {SYNC_FIELDS.map((field) => (
            <View 
              key={field.id}
              style={[styles.fieldItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <View style={styles.fieldLeft}>
                <View style={[styles.iconContainer, { backgroundColor: theme.background }]}>
                  <Ionicons name={field.icon} size={22} color={theme.accent} />
                </View>
                <View style={styles.fieldInfo}>
                  <View style={styles.fieldTitleRow}>
                    <Text style={[styles.fieldLabel, { color: theme.text }]}>
                      {field.label}
                    </Text>
                    {field.required && (
                      <View style={[styles.requiredBadge, { backgroundColor: theme.accent + '20' }]}>
                        <Text style={[styles.requiredText, { color: theme.accent }]}>Required</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.fieldDescription, { color: theme.textLight }]}>
                    {field.description}
                  </Text>
                </View>
              </View>
              
              <Switch
                value={syncSettings[field.id]}
                onValueChange={() => !field.required && toggleField(field.id)}
                disabled={field.required}
                trackColor={{ false: theme.border, true: theme.accent }}
                thumbColor={Platform.OS === 'android' ? theme.surface : undefined}
              />
            </View>
          ))}
        </View>

        {/* Warning */}
        <View style={[styles.warningCard, { backgroundColor: theme.warning + '15', borderColor: theme.warning + '30' }]}>
          <Ionicons name="warning-outline" size={20} color={theme.warning} />
          <Text style={[styles.warningText, { color: theme.textSecondary }]}>
            Disabled fields won't sync across devices. If you clear app data, those fields will be lost.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fieldsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  fieldItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  fieldLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldInfo: {
    flex: 1,
  },
  fieldTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  requiredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredText: {
    fontSize: 11,
    fontWeight: '600',
  },
  fieldDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  warningCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
