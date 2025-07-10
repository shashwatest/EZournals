import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveEntry } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import TagInput from '../components/TagInput';
import FloatingTimestamp from '../components/FloatingTimestamp';
import TimeRangeTracker from '../components/TimeRangeTracker';

export default function AddEntryScreen({ navigation }) {
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [eventTime, setEventTime] = useState(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
  const [showTimestamp, setShowTimestamp] = useState(false);
  const [timeRange, setTimeRange] = useState(null);
  const [showTimeRange, setShowTimeRange] = useState(false);

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
        eventTime: eventTime,
        timeRange: timeRange
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
        <Text style={styles.headerTitle}>New Entry</Text>
        <TouchableOpacity 
          onPress={handleSave}
          style={[styles.saveButton, !content.trim() && styles.saveButtonDisabled]}
          disabled={!content.trim()}
        >
          <Text style={[styles.saveButtonText, !content.trim() && styles.saveButtonTextDisabled]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.editorContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="What's on your mind?"
            placeholderTextColor={theme.textLight}
            value={content}
            onChangeText={handleTextChange}
            multiline
            textAlignVertical="top"
            autoFocus
            selectionColor={theme.accent}
          />
          
          <View style={styles.suggestionsContainer}>
            <TouchableOpacity 
              style={styles.timestampSuggestion}
              onPress={() => setShowTimestamp(true)}
            >
              <Ionicons name="time-outline" size={16} color={theme.textLight} />
              <Text style={styles.timestampText}>Time: {eventTime}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.timeRangeSuggestion}
              onPress={() => setShowTimeRange(true)}
            >
              <Ionicons name="timer-outline" size={16} color={theme.textLight} />
              <Text style={styles.timestampText}>
                {timeRange ? `${timeRange.start} - ${timeRange.end}` : 'Add range'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.metaContainer}>
          <TagInput 
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
          
          <View style={styles.footer}>
            <Text style={styles.wordCount}>
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </Text>
            <Text style={styles.timestamp}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        </View>
      </ScrollView>
      
      <FloatingTimestamp
        eventTime={eventTime}
        onTimeChange={setEventTime}
        visible={showTimestamp}
        onDismiss={() => setShowTimestamp(false)}
      />
      
      <TimeRangeTracker
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        visible={showTimeRange}
        onDismiss={() => setShowTimeRange(false)}
      />
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