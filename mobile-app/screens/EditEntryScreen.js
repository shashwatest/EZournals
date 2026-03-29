import React, { useState } from 'react';
import { useUISettings } from '../contexts/UISettingsContext';
import { Image } from 'react-native';
import { pickImage } from '../utils/media';
import { getCurrentLocation, formatLocation } from '../utils/location';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateEntry } from '../../backend/utils/storage';
import { countWords } from '../utils/entryUtils';
import { useTheme } from '../contexts/ThemeContext';
import TagInput from '../components/TagInput';
import RichTextEditor from '../components/RichTextEditor';
import { uploadImage, isLocalUri } from '../../backend/utils/mediaUpload';
import { isAIEnabled, getAISettings } from '../../backend/utils/aiSettings';
import { detectMoodTags } from '../../backend/utils/geminiService';
import { showAlert } from '../utils/appAlert';

export default function EditEntryScreen({ route, navigation }) {
  const { theme } = useTheme();
  const accentText = theme.onAccentText || '#fff';
  const { getFontFamily, getFontSizes } = useUISettings();
  const fontFamily = getFontFamily();
  const fontSizes = getFontSizes();
  const { entry } = route.params;
  const [content, setContent] = useState(entry.content);
  const [wordCount, setWordCount] = useState(countWords(entry.content));
  const [selectedTags, setSelectedTags] = useState(entry.tags || []);
  const [imageUrl, setImageUrl] = useState(entry.imageUrl || null);
  const [location, setLocation] = useState(entry.location || null);
  const [eventTime, setEventTime] = useState(entry.eventTime || '');
  const [aiEnabled, setAiEnabled] = useState(false);
  const [detectingMood, setDetectingMood] = useState(false);

  if (!theme) return null;

  React.useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    const enabled = await isAIEnabled();
    const settings = await getAISettings();
    setAiEnabled(enabled && settings.features.moodDetection);
  };

  const handleTextChange = (text) => {
    setContent(text);
    setWordCount(countWords(text.trim()));
  };

  const handleDetectMood = async () => {
    if (content.length > 50000) {
      await showAlert({ title: 'Entry Too Long', message: 'Your entry exceeds the maximum allowed length (50,000 characters). Please condense it before saving.', confirmTone: 'danger' });
      return;
    }

    if (!content.trim()) {
      await showAlert({ title: 'No Content', message: 'Please write something before detecting mood' });
      return;
    }

    setDetectingMood(true);
    try {
      const suggestedTags = await detectMoodTags(content);
      const newTags = [...selectedTags];
      suggestedTags.forEach(tag => {
        if (!newTags.includes(tag)) {
          newTags.push(tag);
        }
      });
      setSelectedTags(newTags);
      await showAlert({ title: 'Mood Detected', message: `Added tags: ${suggestedTags.join(', ')}` });
    } catch (error) {
      console.error('Mood detection error:', error);
      await showAlert({ title: 'Mood Detection Failed', message: error.message || 'Failed to detect mood', confirmTone: 'danger' });
    } finally {
      setDetectingMood(false);
    }
  };

  // Removed stray misplaced async/await block
  const handleSave = async () => {
    if (!content.trim()) {
      await showAlert({ title: 'Empty Entry', message: 'Please write something before saving' });
      return;
    }
    
    try {
      let uploadedImageUrl = imageUrl;

      // Upload new image to Firebase Storage if it's a local URI
      if (imageUrl && isLocalUri(imageUrl)) {
        try {
          uploadedImageUrl = await uploadImage(imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
          await showAlert({ title: 'Warning', message: 'Failed to upload image, but entry will be saved', confirmTone: 'danger' });
        }
      }

      await updateEntry(entry.id, {
        content: content.trim(),
        tags: selectedTags,
        imageUrl: uploadedImageUrl,
        location,
        eventTime: eventTime || null,
      });
      navigation.goBack();
    } catch (error) {
      await showAlert({ title: 'Error', message: 'Failed to update entry', confirmTone: 'danger' });
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
            onImageSelected={setImageUrl}
            onLocationTagged={setLocation}
          />
        </View>

        <View style={styles.metaContainer}>
          <TagInput 
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
          {aiEnabled && (
            <TouchableOpacity
              style={[styles.moodDetectButton, { backgroundColor: theme.accent, marginTop: 12 }]}
              onPress={handleDetectMood}
              disabled={detectingMood}
            >
              {detectingMood ? (
                <Ionicons name="reload" size={18} color={accentText} />
              ) : (
                <Ionicons name="sparkles" size={18} color={accentText} />
              )}
              <Text style={[styles.moodDetectButtonText, { fontFamily, fontSize: fontSizes.base }]}>
                {detectingMood ? 'Detecting Mood...' : 'AI Detect Mood'}
              </Text>
            </TouchableOpacity>
          )}
          <View style={styles.footer}>
            <Text style={[styles.wordCount, { fontFamily, fontSize: fontSizes.base }]}> 
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </Text>
            <Text style={[styles.timestamp, { fontFamily, fontSize: fontSizes.base }]}> 
              Created: {new Date(entry.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        {imageUrl && (
          <View style={{ marginTop: 12, alignItems: 'center' }}>
            <Image source={{ uri: imageUrl }} style={{ width: 120, height: 120, borderRadius: 8 }} />
          </View>
        )}
        {location && (
          <View style={{ marginTop: 8, alignItems: 'center' }}>
            <Ionicons name="location-outline" size={18} color={theme.primary} />
            <Text style={{ color: theme.textSecondary, fontSize: 13, fontFamily }}>Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme) => StyleSheet.create({
// ...existing code...
// ...existing code...
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
    color: theme.onAccentText || '#fff',
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
  },
  moodDetectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  moodDetectButtonText: {
    color: theme.onAccentText || '#fff',
    fontSize: 14,
    fontWeight: '600',
  }
});
