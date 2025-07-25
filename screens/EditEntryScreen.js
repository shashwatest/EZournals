import React, { useState } from 'react';
import { useUISettings } from '../contexts/UISettingsContext';
import { Image } from 'react-native';
import { pickImage } from '../utils/media';
import { getCurrentLocation, formatLocation } from '../utils/location';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateEntry } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import TagInput from '../components/TagInput';
import RichTextEditor from '../components/RichTextEditor';

export default function EditEntryScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { getFontFamily, getFontSizes } = useUISettings();
  const fontFamily = getFontFamily();
  const fontSizes = getFontSizes();
  const { entry } = route.params;
  const [content, setContent] = useState(entry.content);
  const [wordCount, setWordCount] = useState(entry.content.split(' ').filter(word => word.length > 0).length);
  const [selectedTags, setSelectedTags] = useState(entry.tags || []);
  const [imageUri, setImageUri] = useState(entry.imageUri || null);
  const [location, setLocation] = useState(entry.location || null);

  if (!theme) return null;

  const handleTextChange = (text) => {
    setContent(text);
    setWordCount(text.trim().split(/\s+/).filter(word => word.length > 0).length);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Empty Entry', 'Please write something before saving');
      return;
    }

    try {
      await updateEntry(entry.id, { 
        content: content.trim(),
        tags: selectedTags,
        imageUri,
        location: location ? formatLocation(location) : null
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update entry');
    }
  };

  const styles = createStyles(theme);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily, fontSize: fontSizes.header }]}>Edit Entry</Text>
        <TouchableOpacity 
          onPress={handleSave}
          style={[styles.saveButton, !content.trim() && styles.saveButtonDisabled]}
          disabled={!content.trim()}
        >
          <Text style={[styles.saveButtonText, !content.trim() && styles.saveButtonTextDisabled, { fontFamily, fontSize: fontSizes.base }]}> 
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.editorContainer}>
          <RichTextEditor
            value={content}
            onChangeText={handleTextChange}
            placeholder="What's on your mind?"
            onImageSelected={setImageUri}
            onLocationTagged={setLocation}
          />
        </View>

        <View style={styles.metaContainer}>
          <TagInput 
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
          <View style={styles.footer}>
            <Text style={[styles.wordCount, { fontFamily, fontSize: fontSizes.base }]}> 
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </Text>
            <Text style={[styles.timestamp, { fontFamily, fontSize: fontSizes.base }]}> 
              Created: {new Date(entry.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        {imageUri && (
          <View style={{ marginTop: 12, alignItems: 'center' }}>
            <Image source={{ uri: imageUri }} style={{ width: 120, height: 120, borderRadius: 8 }} />
          </View>
        )}
        {location && location.coords && (
          <View style={{ marginTop: 8, alignItems: 'center' }}>
            <Ionicons name="location-outline" size={18} color={theme.primary} />
            <Text style={{ color: theme.textSecondary, fontSize: 13, fontFamily }}>Location: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme) => StyleSheet.create({
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
    fontSize: 18,
    fontWeight: '600',
    color: theme.text
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.accent,
    borderRadius: 8
  },
  saveButtonDisabled: {
    backgroundColor: theme.border
  },
  saveButtonText: {
    color: theme.surface,
    fontWeight: '600',
    fontSize: 16
  },
  saveButtonTextDisabled: {
    color: theme.textLight
  },
  scrollContainer: {
    flex: 1
  },
  editorContainer: {
    margin: 16,
    backgroundColor: theme.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 200
  },
  textInput: {
    padding: 24,
    fontSize: 17,
    lineHeight: 26,
    color: theme.text,
    fontWeight: '400',
    minHeight: 200
  },
  metaContainer: {
    margin: 16,
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border
  },
  wordCount: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500'
  },
  timestamp: {
    fontSize: 14,
    color: theme.textLight
  }
});