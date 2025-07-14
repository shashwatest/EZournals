import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserTags, saveUserTag, deleteUserTag } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import { themes } from '../styles/theme';

export default function SettingsScreen({ navigation }) {
  const { theme, currentTheme, customThemes, changeTheme, isLoading, reloadThemes } = useTheme();
  const [userTags, setUserTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  const loadSettings = async () => {
    try {
      const tags = await getUserTags();
      setUserTags(tags);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (isLoading || !theme) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const addNewTag = async () => {
    if (newTag.trim() && !userTags.includes(newTag.trim())) {
      const tag = newTag.trim();
      await saveUserTag(tag);
      setUserTags([...userTags, tag]);
      setNewTag('');
    } else {
      Alert.alert('Invalid Tag', 'Tag already exists or is empty');
    }
  };

  const deleteTag = async (tagToDelete) => {
    Alert.alert(
      'Delete Tag',
      `Are you sure you want to delete "${tagToDelete}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteUserTag(tagToDelete);
          setUserTags(userTags.filter(tag => tag !== tagToDelete));
        }}
      ]
    );
  };

  const deleteCustomTheme = async (themeId) => {
    const updatedThemes = customThemes.filter(t => t.id !== themeId);
    await AsyncStorage.setItem('customThemes', JSON.stringify(updatedThemes));
    if (currentTheme === themeId) {
      await changeTheme('oceanTeal');
    }
    await reloadThemes();
  };

  const editCustomTheme = (themeData) => {
    navigation.navigate('CustomTheme', { editTheme: themeData });
  };

  const themeOptions = [
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
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
          <TouchableOpacity
            style={styles.appearanceOption}
            onPress={() => navigation.navigate('UISettings')}
          >
            <Ionicons name="text-outline" size={24} color={theme.textSecondary} />
            <Text style={[styles.appearanceOptionText, { color: theme.text }]}>Display Settings</Text>
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
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Custom Tags</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={[styles.tagInput, { borderColor: theme.border, color: theme.text }]}
              placeholder="Create new tag"
              placeholderTextColor={theme.textLight}
              value={newTag}
              onChangeText={setNewTag}
              onSubmitEditing={addNewTag}
            />
            <TouchableOpacity style={[styles.addTagButton, { backgroundColor: theme.accent }]} onPress={addNewTag}>
              <Ionicons name="add" size={20} color={theme.surface} />
            </TouchableOpacity>
          </View>
          
          {userTags.length > 0 && (
            <View style={styles.tagsList}>
              <Text style={[styles.tagsListTitle, { color: theme.textSecondary }]}>Your Tags:</Text>
              <View style={styles.tagsContainer}>
                {userTags.map(tag => (
                  <TouchableOpacity key={tag} style={[styles.tag, { backgroundColor: theme.accent + '20' }]} onLongPress={() => deleteTag(tag)}>
                    <Text style={[styles.tagText, { color: theme.accent }]}>{tag}</Text>
                    <Ionicons name="close-circle" size={16} color={theme.danger} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
          <View style={styles.aboutContainer}>
            <Text style={[styles.aboutText, { color: theme.text }]}>EZournals v1.0</Text>
            <Text style={[styles.aboutSubtext, { color: theme.textSecondary }]}>Capture your thoughts and memories</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 52,
    backgroundColor: '#FFFFFF',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50'
  },
  placeholder: {
    width: 40
  },
  content: {
    flex: 1
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
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
    color: '#2C3E50'
  },
  darkModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECF0F1'
  },
  darkModeText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 4
  },
  darkModeTextActive: {
    color: '#3498DB',
    fontWeight: '500'
  },
  themeGrid: {
    gap: 8
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECF0F1'
  },
  selectedTheme: {
    borderColor: '#3498DB',
    backgroundColor: '#3498DB10'
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
    color: '#2C3E50'
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ECF0F1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 16,
    fontSize: 16,
    marginRight: 8
  },
  addTagButton: {
    backgroundColor: '#3498DB',
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
    color: '#7F8C8D',
    marginBottom: 8
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498DB20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4
  },
  tagText: {
    fontSize: 14,
    color: '#3498DB',
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
    color: '#2C3E50',
    marginBottom: 4
  },
  aboutSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
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
  }
});