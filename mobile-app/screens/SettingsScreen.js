import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, TextInput, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { themes } from '../styles/theme';
import { fullSync, getLastSyncTime } from '../../backend/firebase/cloudStorage';
import { auth } from '../../backend/firebase/config';
import { formatSyncTime } from '../utils/entryUtils';
import { showAlert, showConfirm } from '../utils/appAlert';
import { getMoodTags, addMoodTag, updateMoodTag, deleteMoodTag as removeMoodTag } from '../../backend/utils/moodTags';
import QuotaUsage from '../components/QuotaUsage';
import ColorPickerModal from '../components/ColorPicker';


export default function SettingsScreen({ navigation }) {
  const { theme, currentTheme, customThemes, changeTheme, deleteCustomTheme, isLoading } = useTheme();
  const accentText = theme?.onAccentText || '#fff';
  const [moodTags, setMoodTags] = useState([]);
  const [newMoodTag, setNewMoodTag] = useState('');
  const [editingMoodTag, setEditingMoodTag] = useState(null);
  const [editingMoodName, setEditingMoodName] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const loadSettings = async () => {
    try {
      setMoodTags(await getMoodTags());
      const syncTime = await getLastSyncTime();
      setLastSync(syncTime);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSync = async () => {
    if (!auth.currentUser) {
      await showAlert({ title: 'Not Logged In', message: 'Please log in to sync your data' });
      return;
    }

    setSyncing(true);
    try {
      await fullSync();
      const syncTime = await getLastSyncTime();
      setLastSync(syncTime);
      await showAlert({ title: 'Success', message: 'Your data has been synced successfully' });
    } catch (error) {
      console.error('Sync error:', error);
      await showAlert({ title: 'Sync Failed', message: error.message || 'Failed to sync data', confirmTone: 'danger' });
    } finally {
      setSyncing(false);
    }
  };

  if (isLoading || !theme) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme?.background || '#F0F0F0' }}>
        <Text style={{ color: theme?.text || '#1A1A1A' }}>Loading...</Text>
      </View>
    );
  }

  const addNewMoodTag = async () => {
    try {
      const updatedTags = await addMoodTag(newMoodTag, selectedColor);
      setMoodTags(updatedTags);
      setNewMoodTag('');
      setSelectedColor(null);
    } catch (error) {
      await showAlert({ title: 'Invalid Mood Tag', message: error.message });
    }
  };

  const saveMoodTagEdit = async () => {
    if (!editingMoodTag) return;
    try {
      const updatedTags = await updateMoodTag(editingMoodTag, editingMoodName, selectedColor);
      setMoodTags(updatedTags);
      setEditingMoodTag(null);
      setEditingMoodName('');
      setSelectedColor(null);
    } catch (error) {
      await showAlert({ title: 'Invalid Mood Tag', message: error.message });
    }
  };

  const deleteMoodTag = async (tagToDelete) => {
    const confirmed = await showConfirm({
      title: 'Delete Mood Tag',
      message: `Delete "${tagToDelete}" and remove it from existing entries?`,
      confirmLabel: 'Delete',
      confirmTone: 'danger',
    });
    if (!confirmed) return;

    const updatedTags = await removeMoodTag(tagToDelete);
    setMoodTags(updatedTags);
    if (editingMoodTag === tagToDelete) {
      setEditingMoodTag(null);
      setEditingMoodName('');
    }
  };

  const editCustomTheme = (themeData) => {
    navigation.navigate('CustomTheme', { editTheme: themeData });
  };

  const themeOptions = [
    { name: 'matteWhite', label: 'Matte White', color: themes.matteWhite?.accent || '#5A6B7A' },
    { name: 'matteBlack', label: 'Matte Black', color: themes.matteBlack?.accent || '#7C8A97' },
    { name: 'glassmorphism', label: 'Glassmorphism', color: themes.glassmorphism.accent },
    { name: 'classyBW', label: 'Classy Black & White', color: themes.classyBW.background },
    { name: 'oceanTeal', label: 'Ocean Teal', color: themes.oceanTeal.primary }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Cloud Sync</Text>
          <TouchableOpacity
            style={[styles.syncButton, { backgroundColor: syncing ? theme.border : theme.accent }]}
            onPress={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator color={accentText} />
            ) : (
              <Ionicons name="cloud-upload-outline" size={24} color={accentText} />
            )}
            <Text style={[styles.syncButtonText, { color: accentText }]}>
              {syncing ? 'Syncing...' : 'Sync Now'}
            </Text>
          </TouchableOpacity>
          {lastSync && (
            <Text style={[styles.lastSyncText, { color: theme.textSecondary }]}>
              Last synced: {formatSyncTime(lastSync)}
            </Text>
          )}
          <View style={{ marginTop: 16 }}>
            <QuotaUsage fontFamily={null} />
          </View>
        </View>
        
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
          <TouchableOpacity
            style={styles.appearanceOption}
            onPress={() => navigation.navigate('UISettings')}
          >
            <Ionicons name="text-outline" size={24} color={theme.textSecondary} />
            <Text style={[styles.appearanceOptionText, { color: theme.text }]}>Display Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.appearanceOption}
            onPress={() => navigation.navigate('CloudSettings')}
          >
            <Ionicons name="cloud-outline" size={24} color={theme.textSecondary} />
            <Text style={[styles.appearanceOptionText, { color: theme.text }]}>Cloud Sync Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <View style={styles.themeGrid}>
            {themeOptions.map(option => (
              <TouchableOpacity
                key={option.name}
                style={[styles.themeOption, { borderColor: theme.border }, currentTheme === option.name && { borderColor: theme.accent, backgroundColor: theme.accent + '10' }]}
                onPress={() => changeTheme(option.name)}
              >
                <View style={[styles.themeColor, { backgroundColor: option.color }]} />
                <Text style={[styles.themeLabel, { color: theme.text }]}>{option.label}</Text>
                {currentTheme === option.name && (
                  <Ionicons name="checkmark" size={20} color={theme.accent} />
                )}
              </TouchableOpacity>
            ))}
            
            {customThemes.map((customTheme) => (
              <View key={customTheme.id} style={[styles.themeOption, { borderColor: theme.border }, currentTheme === customTheme.id && { borderColor: theme.accent, backgroundColor: theme.accent + '10' }]}>
                <TouchableOpacity 
                  style={styles.themeMain}
                  onPress={() => changeTheme(customTheme.id)}
                >
                  <View style={[styles.themeColor, { backgroundColor: customTheme.primary }]} />
                  <Text style={[styles.themeLabel, { color: theme.text }]}>{customTheme.name}</Text>
                  {currentTheme === customTheme.id && (
                    <Ionicons name="checkmark" size={20} color={theme.accent} />
                  )}
                </TouchableOpacity>
                <View style={styles.themeActions}>
                  <TouchableOpacity onPress={() => editCustomTheme(customTheme)} style={styles.actionButton}>
                    <Ionicons name="pencil" size={16} color={theme.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteCustomTheme(customTheme.id)} style={styles.actionButton}>
                    <Ionicons name="trash" size={16} color={theme.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            <TouchableOpacity
              style={[styles.themeOption, styles.createThemeOption, { borderColor: theme.border }]}
              onPress={() => navigation.navigate('CustomTheme')}
            >
              <Ionicons name="add-circle" size={24} color={theme.primary} />
              <Text style={[styles.themeLabel, { color: theme.text }]}>Create Custom Theme</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Mood Tags</Text>
          
          <View style={styles.tagInputContainer}>
            <TextInput
              style={[styles.tagInput, { borderColor: theme.border, color: theme.text }]}
              placeholder="Create mood tag"
              placeholderTextColor={theme.textLight}
              value={newMoodTag}
              onChangeText={setNewMoodTag}
              onSubmitEditing={addNewMoodTag}
            />
            <TouchableOpacity style={[styles.addTagButton, { backgroundColor: theme.accent }]} onPress={addNewMoodTag}>
              <Ionicons name="add" size={20} color={accentText} />
            </TouchableOpacity>
          </View>
          
          {(newMoodTag.length > 0 || editingMoodTag) && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 8 }}>Choose a color:</Text>
              <TouchableOpacity 
                style={[styles.colorPickerButton, { borderColor: theme.border }]}
                onPress={() => setColorPickerVisible(true)}
              >
                <View style={[styles.colorPreviewCircle, { backgroundColor: selectedColor || theme.accent }]} />
                <Text style={{ color: theme.text, flex: 1 }}>
                  {selectedColor || 'Tap to select color'}
                </Text>
                <Ionicons name="color-palette" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          )}


          <View style={styles.tagsList}>
            <Text style={[styles.tagsListTitle, { color: theme.textSecondary }]}>Mood Tags:</Text>
            <View style={styles.tagRows}>
              {moodTags.map((tag) => (
                <View key={tag.name} style={[styles.tagRow, { borderColor: theme.border }]}>
                  <TouchableOpacity 
                    style={[styles.themeColor, { backgroundColor: tag.color, marginRight: 12 }]} 
                    onPress={() => {
                      if (editingMoodTag === tag.name) {
                        setSelectedColor(tag.color);
                        setColorPickerVisible(true);
                      }
                    }}
                  />
                  {editingMoodTag === tag.name ? (
                    <TextInput
                      style={[styles.moodEditInput, { borderColor: theme.border, color: theme.text }]}
                      value={editingMoodName}
                      onChangeText={setEditingMoodName}
                      autoFocus
                      onSubmitEditing={saveMoodTagEdit}
                    />
                  ) : (
                    <Text style={[styles.themeLabel, { color: theme.text }]}>{tag.name}</Text>
                  )}
                  {editingMoodTag === tag.name ? (
                    <>
                      <TouchableOpacity 
                        onPress={() => setColorPickerVisible(true)} 
                        style={styles.actionButton}
                      >
                        <Ionicons name="color-palette" size={16} color={theme.accent} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={saveMoodTagEdit} style={styles.actionButton}>
                        <Ionicons name="checkmark" size={18} color={theme.accent} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { setEditingMoodTag(null); setEditingMoodName(''); setSelectedColor(null); }} style={styles.actionButton}>
                        <Ionicons name="close" size={18} color={theme.textSecondary} />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity onPress={() => { setEditingMoodTag(tag.name); setEditingMoodName(tag.name); setSelectedColor(tag.color); }} style={styles.actionButton}>
                        <Ionicons name="pencil" size={16} color={theme.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteMoodTag(tag.name)} style={styles.actionButton}>
                        <Ionicons name="trash" size={16} color={theme.danger} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
          <View style={styles.aboutContainer}>
            <Text style={[styles.aboutText, { color: theme.text }]}>EZournals v1.0</Text>
            <Text style={[styles.aboutSubtext, { color: theme.textSecondary }]}>Capture your thoughts and memories</Text>
          </View>
        </View>

      </ScrollView>

      <ColorPickerModal
        visible={colorPickerVisible}
        onClose={() => setColorPickerVisible(false)}
        onSelectColor={(color) => setSelectedColor(color)}
        initialColor={selectedColor || '#2196F3'}
        title={editingMoodTag ? `Color for ${editingMoodName}` : 'Choose Mood Color'}
      />
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
    paddingTop: 52,
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40
  },
  content: {
    flex: 1
  },
  section: {
    margin: 16,
    borderRadius: 12,
    padding: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  darkModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  darkModeText: {
    fontSize: 14,
    marginLeft: 4
  },
  darkModeTextActive: {
    fontWeight: '500'
  },
  themeGrid: {
    gap: 8,
    marginTop: 16
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedTheme: {
  },
  themeColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 16
  },
  themeLabel: {
    flex: 1,
    fontSize: 16,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 16,
    fontSize: 16,
    marginRight: 8
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tagsList: {
    marginTop: 8
  },
  tagsListTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4
  },
  tagRows: {
    gap: 8,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  moodEditInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4
  },
  aboutContainer: {
    alignItems: 'center',
    paddingVertical: 16
  },
  aboutText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4
  },
  aboutSubtext: {
    fontSize: 14,
    textAlign: 'center'
  },
  createThemeOption: {
    borderStyle: 'dashed'
  },
  themeMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  themeActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionButton: {
    padding: 8,
    marginLeft: 4
  },

  appearanceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 16
  },
  appearanceOptionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 12,
  },
  syncButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  lastSyncText: {
    fontSize: 14,
    textAlign: 'center',
  },
  colorPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  colorPreviewCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});
