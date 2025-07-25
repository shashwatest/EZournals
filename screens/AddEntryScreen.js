import React, { useState } from 'react';
import { useUISettings } from '../contexts/UISettingsContext';
import { Image } from 'react-native';
import { pickImage } from '../utils/media';
import { getCurrentLocation, formatLocation } from '../utils/location';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveEntry } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import TagInput from '../components/TagInput';
import RichTextEditor from '../components/RichTextEditor';
import AudioPlayer from '../components/AudioPlayer';

export default function AddEntryScreen({ navigation }) {
  const { theme } = useTheme();
  const { getFontFamily, getFontSizes } = useUISettings();
  const fontFamily = getFontFamily();
  const fontSizes = getFontSizes();
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [audioUri, setAudioUri] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState(null);

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
      await saveEntry({ 
        content: content.trim(),
        tags: selectedTags,
        audioUri,
        imageUri,
        location: location ? formatLocation(location) : null
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save entry');
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
        <Text style={[styles.headerTitle, { fontFamily, fontSize: fontSizes.header }]}>New Entry</Text>
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
            onAudioRecorded={setAudioUri}
            onImageSelected={setImageUri}
            onLocationTagged={setLocation}
          />
        </View>

        <View style={styles.metaContainer}>
          {audioUri && (
            <View style={styles.audioContainer}>
              <Text style={styles.audioLabel}>Audio Recording:</Text>
              <AudioPlayer audioUri={audioUri} />
            </View>
          )}
          
          <TagInput 
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
          
          <View style={styles.footer}>
            <Text style={[styles.timestamp, { fontFamily, fontSize: fontSizes.base }]}> 
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
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
    minHeight: 200,
    paddingBottom: 60
  },
  suggestionsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 24,
    right: 24,
    flexDirection: 'row',
    gap: 4
  },
  timestampSuggestion: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border
  },
  timeRangeSuggestion: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border
  },
  timestampText: {
    fontSize: 12,
    color: theme.textLight,
    marginLeft: 4
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
    alignItems: 'center',
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
  },
  audioContainer: {
    marginBottom: 16
  },
  audioLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 8
  }
});