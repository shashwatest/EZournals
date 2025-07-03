import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme, saveTheme, getUserTags, saveUserTag, deleteUserTag, getDarkMode, saveDarkMode } from '../utils/storage';
import { theme, themes } from '../styles/theme';

export default function SettingsScreen({ navigation }) {
  const [currentTheme, setCurrentTheme] = useState('blue');
  const [userTags, setUserTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const themeName = await getTheme();
      const tags = await getUserTags();
      const darkMode = await getDarkMode();
      
      // Ensure theme exists before setting
      const selectedTheme = themes[themeName] || themes.blue;
      
      setCurrentTheme(themeName);
      setUserTags(tags);
      setIsDarkMode(darkMode);
      theme.colors = darkMode ? themes.dark : selectedTheme;
    } catch (error) {
      console.error('Error loading settings:', error);
      // Fallback to defaults
      theme.colors = themes.blue;
      setCurrentTheme('blue');
      setIsDarkMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Don't render until theme is loaded
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const changeTheme = async (themeName) => {
    try {
      await saveTheme(themeName);
      setCurrentTheme(themeName);
      const selectedTheme = themes[themeName] || themes.blue;
      theme.colors = isDarkMode ? themes.dark : selectedTheme;
    } catch (error) {
      console.error('Error changing theme:', error);
    }
  };

  const toggleDarkMode = async () => {
    try {
      const newDarkMode = !isDarkMode;
      await saveDarkMode(newDarkMode);
      setIsDarkMode(newDarkMode);
      const selectedTheme = themes[currentTheme] || themes.blue;
      theme.colors = newDarkMode ? themes.dark : selectedTheme;
    } catch (error) {
      console.error('Error toggling dark mode:', error);
    }
  };

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

  const themeOptions = [
    { name: 'blue', label: 'Ocean Blue', color: themes.blue.primary },
    { name: 'green', label: 'Forest Green', color: themes.green.primary },
    { name: 'purple', label: 'Royal Purple', color: themes.purple.primary },
    { name: 'orange', label: 'Sunset Orange', color: themes.orange.primary },
    { name: 'pink', label: 'Rose Pink', color: themes.pink.primary },
    { name: 'teal', label: 'Ocean Teal', color: themes.teal.primary }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Appearance</Text>
            <TouchableOpacity style={[styles.darkModeToggle, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]} onPress={toggleDarkMode}>
              <Ionicons 
                name={isDarkMode ? 'moon' : 'sunny'} 
                size={20} 
                color={isDarkMode ? theme.colors.accent : theme.colors.textSecondary} 
              />
              <Text style={[styles.darkModeText, isDarkMode && styles.darkModeTextActive]}>
                {isDarkMode ? 'Dark' : 'Light'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.themeGrid}>
            {themeOptions.map(option => (
              <TouchableOpacity
                key={option.name}
                style={[styles.themeOption, { borderColor: theme.colors.border }, currentTheme === option.name && { borderColor: theme.colors.accent, backgroundColor: theme.colors.accent + '10' }]}
                onPress={() => changeTheme(option.name)}
              >
                <View style={[styles.themeColor, { backgroundColor: option.color }]} />
                <Text style={[styles.themeLabel, { color: theme.colors.text }]}>{option.label}</Text>
                {currentTheme === option.name && (
                  <Ionicons name="checkmark" size={20} color={theme.colors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Custom Tags</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={[styles.tagInput, { borderColor: theme.colors.border }]}
              placeholder="Create new tag"
              value={newTag}
              onChangeText={setNewTag}
              onSubmitEditing={addNewTag}
            />
            <TouchableOpacity style={[styles.addTagButton, { backgroundColor: theme.colors.accent }]} onPress={addNewTag}>
              <Ionicons name="add" size={20} color={theme.colors.surface} />
            </TouchableOpacity>
          </View>
          
          {userTags.length > 0 && (
            <View style={styles.tagsList}>
              <Text style={[styles.tagsListTitle, { color: theme.colors.textSecondary }]}>Your Tags:</Text>
              <View style={styles.tagsContainer}>
                {userTags.map(tag => (
                  <TouchableOpacity key={tag} style={[styles.tag, { backgroundColor: theme.colors.accent + '20' }]} onLongPress={() => deleteTag(tag)}>
                    <Text style={[styles.tagText, { color: theme.colors.accent }]}>{tag}</Text>
                    <Ionicons name="close-circle" size={16} color={theme.colors.danger} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About</Text>
          <View style={styles.aboutContainer}>
            <Text style={[styles.aboutText, { color: theme.colors.text }]}>Journal App v1.0</Text>
            <Text style={[styles.aboutSubtext, { color: theme.colors.textSecondary }]}>Capture your thoughts and memories</Text>
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
  }
});