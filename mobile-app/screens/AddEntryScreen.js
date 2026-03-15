import React, { useState } from 'react';
import { useUISettings } from '../contexts/UISettingsContext';
import { Image } from 'react-native';
import { pickImage } from '../utils/media';
import { getCurrentLocation, formatLocation } from '../utils/location';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveEntry } from '../../backend/utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import TagInput from '../components/TagInput';
import RichTextEditor from '../components/RichTextEditor';
import AudioPlayer from '../components/AudioPlayer';
import AudioRecorder from '../components/AudioRecorder';
import { uploadImage, uploadAudio } from '../../backend/utils/mediaUpload';


export default function AddEntryScreen({ navigation }) {
  const themeContext = useTheme();
  const { theme, isLoading } = themeContext;
  const { getFontFamily, getFontSizes } = useUISettings();
  const fontFamily = getFontFamily();
  const fontSizes = getFontSizes();
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [location, setLocation] = useState(null);
  const [eventTime, setEventTime] = useState('');

  // Show a loading fallback if theme is not ready or ThemeContext is loading
  if (isLoading || !theme) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Loading theme...</Text>
      </View>
    );
  }

  const handleTextChange = (text) => {
    setContent(text);
    setWordCount(text.trim().split(/\s+/).filter(word => word.length > 0).length);
  };

  // Removed stray misplaced async/await block
  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Empty Entry', 'Please write something before saving');
      return;
    }
    
    try {
      let uploadedImageUrl = null;
      let uploadedAudioUrl = null;

      // Upload image to Firebase Storage if exists
      if (imageUrl) {
        try {
          uploadedImageUrl = await uploadImage(imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
          Alert.alert('Warning', 'Failed to upload image, but entry will be saved');
        }
      }

      // Upload audio to Firebase Storage if exists
      if (audioUrl) {
        try {
          uploadedAudioUrl = await uploadAudio(audioUrl);
        } catch (error) {
          console.error('Error uploading audio:', error);
          Alert.alert('Warning', 'Failed to upload audio, but entry will be saved');
        }
      }

      await saveEntry({
        content: content.trim(),
        tags: selectedTags,
        audioUrl: uploadedAudioUrl,
        imageUrl: uploadedImageUrl,
        location,
        eventTime: eventTime || null,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save entry');
      console.error('[AddEntryScreen] Error saving entry:', error);
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
        <Text style={[styles.headerTitle, { fontFamily, fontSize: fontSizes.header }]}>Add Entry</Text>
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
            onAudioRecorded={(action) => {
              if (action === 'show') setShowAudioRecorder(true);
            }}
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
              Created: {new Date().toLocaleDateString()}
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
        {audioUrl && (
          <View style={{ marginTop: 12, alignItems: 'center' }}>
            <AudioPlayer audioUrl={audioUrl} />
          </View>
        )}
      </ScrollView>
      {showAudioRecorder && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: theme.surface, padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, elevation: 8 }}>
          <AudioRecorder onAudioRecorded={(uri) => {
            if (uri && uri !== 'show') setAudioUrl(uri);
            setShowAudioRecorder(false);
          }} />
        </View>
      )}
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