import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useUISettings } from '../contexts/UISettingsContext';
import { Image, Alert, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { pickImage } from '../utils/media';
import { getCurrentLocation, formatLocation } from '../utils/location';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveEntry } from '../../backend/utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import TagInput from '../components/TagInput';
import RichTextEditor from '../components/RichTextEditor';
import AudioPlayer from '../components/AudioPlayer';
import AudioRecorder from '../components/AudioRecorder';
import { uploadImage, uploadAudio } from '../../backend/utils/mediaUpload';
import { isAIEnabled, getAISettings } from '../../backend/utils/aiSettings';
import { detectMoodTags } from '../../backend/utils/geminiService';
import { StatusBar } from 'react-native';
import { getGlassPanelStyle, getGlassSheenStyle, isGlassTheme as isGlassThemeEnabled } from '../utils/glassStyles';
import { showAlert } from '../utils/appAlert';
import { useSpeechRecognition } from '../utils/speechRecognition';
import { saveDraft, loadDraft, clearDraft } from '../../backend/utils/drafts';


export default function AddEntryScreen({ navigation, route }) {
  const themeContext = useTheme();
  const { theme, isLoading, currentTheme } = themeContext;
  const isGlassTheme = isGlassThemeEnabled(currentTheme);
  const accentText = theme?.onAccentText || '#fff';
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
  const [aiEnabled, setAiEnabled] = useState(false);
  const [detectingMood, setDetectingMood] = useState(false);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [pendingDraft, setPendingDraft] = useState(null);
  const autoSaveTimerRef = useRef(null);
  const contentRef = useRef('');

  useEffect(() => { contentRef.current = content; }, [content]);

  const handleSpeechResult = useCallback((text) => {
    const prev = contentRef.current;
    const separator = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
    const newContent = prev + separator + text;
    setContent(newContent);
    setWordCount(newContent.trim().split(/\s+/).filter(w => w.length > 0).length);
  }, []);

  const handleSpeechError = useCallback((error) => {
    if (error === 'not-allowed') {
      showAlert({ title: 'Microphone Blocked', message: 'Please allow microphone access in your device settings to use voice dictation.', confirmTone: 'danger' });
    } else {
      showAlert({ title: 'Voice Error', message: `Speech recognition error: ${error}`, confirmTone: 'danger' });
    }
  }, []);

  const { isListening, interimText, startListening, stopListening } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onError: handleSpeechError,
  });

  useEffect(() => {
    checkAIStatus();
    checkForDraft();
  }, []);

  const checkForDraft = async () => {
    const draft = await loadDraft();
    if (draft && draft.content && !content.trim()) {
      setPendingDraft(draft);
      setShowDraftPrompt(true);
    }
  };

  const resumeDraft = () => {
    if (pendingDraft) {
      setContent(pendingDraft.content);
      setSelectedTags(pendingDraft.tags || []);
      setEventTime(pendingDraft.eventTime || '');
    }
    setShowDraftPrompt(false);
  };

  const discardDraft = () => {
    clearDraft();
    setShowDraftPrompt(false);
  };

  // Auto-save logic
  useEffect(() => {
    if (!content.trim() && selectedTags.length === 0) return;
    
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    
    autoSaveTimerRef.current = setTimeout(() => {
      saveDraft({
        content,
        tags: selectedTags,
        eventTime,
      });
    }, 3000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [content, selectedTags, eventTime]);

  // Auto-start voice when navigated with voice: true
  useEffect(() => {
    if (route?.params?.voice) {
      startListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDictation = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const checkAIStatus = async () => {
    const enabled = await isAIEnabled();
    const settings = await getAISettings();
    setAiEnabled(enabled && settings.features.moodDetection);
  };

  const handleDetectMood = async () => {
    if (!content.trim()) {
      await showAlert({ title: 'No Content', message: 'Please write something before detecting mood' });
      return;
    }

    setDetectingMood(true);
    try {
      const suggestedTags = await detectMoodTags(content);
      
      // Add suggested tags that aren't already selected
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

  const handleSave = async () => {
    if (!content.trim()) {
      await showAlert({ title: 'Empty Entry', message: 'Please write something before saving' });
      return;
    }
    if (content.length > 50000) {
      await showAlert({ title: 'Entry Too Long', message: 'Your entry exceeds the maximum allowed length (50,000 characters). Please condense it before saving.', confirmTone: 'danger' });
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
          await showAlert({ title: 'Warning', message: 'Failed to upload image, but entry will be saved', confirmTone: 'danger' });
        }
      }

      // Upload audio to Firebase Storage if exists
      if (audioUrl) {
        try {
          uploadedAudioUrl = await uploadAudio(audioUrl);
        } catch (error) {
          console.error('Error uploading audio:', error);
          await showAlert({ title: 'Warning', message: 'Failed to upload audio, but entry will be saved', confirmTone: 'danger' });
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
      
      // Clear draft on success
      await clearDraft();
      
      navigation.goBack();
    } catch (error) {
      await showAlert({ title: 'Error', message: 'Failed to save entry', confirmTone: 'danger' });
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
        {showDraftPrompt && (
          <View style={[styles.draftPrompt, isGlassTheme && getGlassPanelStyle(theme, currentTheme)]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.draftTitle, { fontFamily }]}>Unsaved draft found</Text>
              <Text style={[styles.draftSubtitle, { fontFamily }]}>
                From {new Date(pendingDraft?.updatedAt).toLocaleString()}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={discardDraft} style={styles.draftDiscard}>
                <Text style={{ color: theme.danger, fontSize: 13, fontWeight: '600' }}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={resumeDraft} style={[styles.draftResume, { backgroundColor: theme.accent }]}>
                <Text style={{ color: accentText, fontSize: 13, fontWeight: '600' }}>Resume</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={styles.editorContainer}>
          <RichTextEditor
            value={content}
            onChangeText={handleTextChange}
            placeholder={isListening ? 'Listening... speak now' : "What's on your mind?"}
            onImageSelected={setImageUrl}
            onLocationTagged={setLocation}
            onAudioRecorded={(action) => {
              if (action === 'show') setShowAudioRecorder(true);
            }}
          />
        </View>

        <View style={{ marginHorizontal: 16, marginBottom: 8 }}>
          <TouchableOpacity
            style={[
              styles.moodDetectButton,
              {
                backgroundColor: isListening ? theme.accent : theme.surface,
                borderWidth: 1,
                borderColor: isListening ? theme.accent : theme.border,
              },
            ]}
            onPress={toggleDictation}
          >
            <Ionicons
              name={isListening ? 'mic-off-outline' : 'mic-outline'}
              size={18}
              color={isListening ? accentText : theme.text}
            />
            <Text style={[styles.moodDetectButtonText, { fontFamily, fontSize: fontSizes.base, color: isListening ? accentText : theme.text }]}>
              {isListening ? 'Stop Dictating' : 'Dictate'}
            </Text>
          </TouchableOpacity>

          {interimText ? (
            <View style={{ marginTop: 8, padding: 8, borderRadius: 8, backgroundColor: theme.accent + '15' }}>
              <Text style={{ color: theme.textSecondary, fontSize: 14, fontStyle: 'italic', fontFamily }}>{interimText}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.metaContainer}>
          <TagInput 
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
          
          {/* AI Mood Detection Button */}
          {aiEnabled && (
            <TouchableOpacity
              style={[styles.moodDetectButton, { backgroundColor: theme.accent, marginTop: 12 }]}
              onPress={handleDetectMood}
              disabled={detectingMood}
            >
              {detectingMood ? (
                <ActivityIndicator size="small" color={accentText} />
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
        <View
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              padding: 16,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              borderWidth: 1,
            },
            isGlassTheme
              ? getGlassPanelStyle(theme, currentTheme, { borderTopLeftRadius: 16, borderTopRightRadius: 16 })
              : { backgroundColor: theme.surface, borderColor: theme.border, elevation: 8 },
          ]}
        >
          {isGlassTheme && <BlurView intensity={100} tint="dark" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />}
          {isGlassTheme && <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.audioSheetSheen, getGlassSheenStyle(currentTheme)]} />}
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
  },
  audioSheetSheen: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  draftPrompt: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  draftTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 2,
  },
  draftSubtitle: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  draftDiscard: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.border,
  },
  draftResume: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
});
