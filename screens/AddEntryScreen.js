import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveEntry } from '../utils/storage';
import TagInput from '../components/TagInput';
import FloatingTimestamp from '../components/FloatingTimestamp';
import TimeRangeTracker from '../components/TimeRangeTracker';
import { theme } from '../styles/theme';

export default function AddEntryScreen({ navigation }) {
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [eventTime, setEventTime] = useState(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
  const [showTimestamp, setShowTimestamp] = useState(false);
  const [timeRange, setTimeRange] = useState(null);
  const [showTimeRange, setShowTimeRange] = useState(false);

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

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
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
            placeholderTextColor={theme.colors.textLight}
            value={content}
            onChangeText={handleTextChange}
            multiline
            textAlignVertical="top"
            autoFocus
            selectionColor={theme.colors.accent}
          />
          
          <View style={styles.suggestionsContainer}>
            <TouchableOpacity 
              style={styles.timestampSuggestion}
              onPress={() => setShowTimestamp(true)}
            >
              <Ionicons name="time-outline" size={16} color={theme.colors.textLight} />
              <Text style={styles.timestampText}>Time: {eventTime}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.timeRangeSuggestion}
              onPress={() => setShowTimeRange(true)}
            >
              <Ionicons name="timer-outline" size={16} color={theme.colors.textLight} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.light
  },
  backButton: {
    padding: theme.spacing.sm
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text
  },
  saveButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.sm
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.border
  },
  saveButtonText: {
    color: theme.colors.surface,
    fontWeight: '600',
    fontSize: 16
  },
  saveButtonTextDisabled: {
    color: theme.colors.textLight
  },
  scrollContainer: {
    flex: 1
  },
  editorContainer: {
    margin: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.light,
    minHeight: 200
  },
  textInput: {
    padding: theme.spacing.lg,
    fontSize: 17,
    lineHeight: 26,
    color: theme.colors.text,
    fontWeight: '400',
    minHeight: 200,
    paddingBottom: 60
  },
  suggestionsContainer: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    flexDirection: 'row',
    gap: theme.spacing.xs
  },
  timestampSuggestion: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  timeRangeSuggestion: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  timestampText: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginLeft: theme.spacing.xs
  },
  metaContainer: {
    margin: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    ...theme.shadows.light
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border
  },
  wordCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500'
  },
  timestamp: {
    fontSize: 14,
    color: theme.colors.textLight
  }
});