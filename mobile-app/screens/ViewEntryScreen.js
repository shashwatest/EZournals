import React, { useState } from 'react';
import { Image, ActivityIndicator, Alert } from 'react-native';
import { useUISettings } from '../contexts/UISettingsContext';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import RichTextRenderer from '../components/RichTextRenderer';
import GlassButton from '../components/GlassButton';
import AudioPlayer from '../components/AudioPlayer';
import { getTagColor, formatDate, countWords } from '../utils/entryUtils';
import { isAIEnabled, getAISettings } from '../../backend/utils/aiSettings';
import { summarizeEntry } from '../../backend/utils/geminiService';

export default function ViewEntryScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { getFontFamily, getFontSizes } = useUISettings();
  const fontFamily = getFontFamily();
  const fontSizes = getFontSizes();
  const { entry } = route.params;
  
  const [summary, setSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);

  React.useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    const enabled = await isAIEnabled();
    const settings = await getAISettings();
    setAiEnabled(enabled && settings.features.summarization);
  };

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      const summaryText = await summarizeEntry(entry.content);
      setSummary(summaryText);
    } catch (error) {
      console.error('Summarization error:', error);
      Alert.alert('Summarization Failed', error.message || 'Failed to generate summary');
    } finally {
      setSummarizing(false);
    }
  };

  if (!theme) return null;

  const wordCount = countWords(entry.content);
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
        <Text style={[styles.headerTitle, { fontFamily, fontSize: fontSizes.header }]}>Entry Details</Text>
        </View>
        <View style={styles.editButton}>
          <GlassButton
            isIconButton={true}
            icon={<Ionicons name="create-outline" size={20} color={theme.accent} />}
            onPress={() => navigation.navigate('EditEntry', { entry })}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.metaContainer}>
          <Text style={[styles.date, { fontFamily, fontSize: fontSizes.base }]}>
            {formatDate(entry.date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' at '}
            {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Ionicons name="document-text-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.statText, { fontFamily, fontSize: fontSizes.base }]}>{wordCount} words</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.statText, { fontFamily, fontSize: fontSizes.base }]}>{readingTime} min read</Text>
            </View>
          </View>
          
          {/* AI Summarize Button */}
          {aiEnabled && (
            <TouchableOpacity
              style={[styles.summarizeButton, { backgroundColor: theme.accent, marginTop: 16 }]}
              onPress={handleSummarize}
              disabled={summarizing}
            >
              {summarizing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="sparkles" size={18} color="#fff" />
              )}
              <Text style={[styles.summarizeButtonText, { fontFamily, fontSize: fontSizes.base }]}>
                {summarizing ? 'Summarizing...' : 'AI Summarize'}
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Summary Display */}
          {summary && (
            <View style={[styles.summaryContainer, { backgroundColor: theme.accent + '15', borderColor: theme.accent + '30', marginTop: 12 }]}>
              <View style={styles.summaryHeader}>
                <Ionicons name="sparkles" size={16} color={theme.accent} />
                <Text style={[styles.summaryTitle, { color: theme.accent, fontFamily, fontSize: fontSizes.base }]}>
                  AI Summary
                </Text>
              </View>
              <Text style={[styles.summaryText, { color: theme.text, fontFamily, fontSize: fontSizes.base }]}>
                {summary}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.contentContainer}>
          <RichTextRenderer content={entry.content} style={{ ...styles.content, fontFamily, fontSize: fontSizes.base }} />
          {/* Show attached image if present */}
          {entry.imageUrl && (
            <View style={{ marginTop: 16, alignItems: 'center' }}>
              <Image source={{ uri: entry.imageUrl }} style={{ width: 180, height: 180, borderRadius: 12, marginVertical: 8 }} />
            </View>
          )}
          {/* Show tagged location if present */}
          {entry.location && (
            <View style={{ marginTop: 8, alignItems: 'center' }}>
              <Ionicons name="location-outline" size={18} color={theme.primary} />
              <Text style={{ color: theme.textSecondary, fontSize: 13, fontFamily }}>
                Location: {typeof entry.location === 'string' ? entry.location : `${entry.location.latitude.toFixed(4)}, ${entry.location.longitude.toFixed(4)}`}
              </Text>
            </View>
          )}
          {/* Show event time if present */}
          {entry.eventTime && (
            <View style={{ marginTop: 8, alignItems: 'center' }}>
              <Ionicons name="time-outline" size={18} color={theme.primary} />
              <Text style={{ color: theme.textSecondary, fontSize: 13, fontFamily }}>
                Event Time: {new Date(entry.eventTime).toLocaleString()}
              </Text>
            </View>
          )}
          {/* Show tags if present */}
          {entry.tags && entry.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={[styles.tagsLabel, { fontFamily, fontSize: fontSizes.base }]}>Tags:</Text>
              <View style={styles.tagsWrapper}>
                {entry.tags.map(tag => (
                  <View key={tag} style={[styles.tag, { backgroundColor: getTagColor(tag) + '20', borderColor: getTagColor(tag) }]}> 
                    <Text style={[styles.tagText, { color: getTagColor(tag), fontFamily, fontSize: fontSizes.base }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {/* Show audio if present */}
          {entry.audioUrl && (
            <View style={styles.audioContainer}>
              <Text style={[styles.audioLabel, { fontFamily, fontSize: fontSizes.base }]}>Audio Recording:</Text>
              <AudioPlayer audioUrl={entry.audioUrl} />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
  editButton: {
    padding: 8
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text
  },
  placeholder: {
    width: 40
  },
  scrollContainer: {
    flex: 1
  },
  metaContainer: {
    backgroundColor: theme.surface,
    margin: 16,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  date: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  statText: {
    fontSize: 14,
    color: theme.textSecondary
  },
  contentContainer: {
    backgroundColor: theme.surface,
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  content: {
    fontSize: 17,
    lineHeight: 28,
    color: theme.text,
    fontWeight: '400'
  },
  audioContainer: {
    marginTop: 16
  },
  audioLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 8
  },
  tagsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border
  },
  tagsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 8
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500'
  },
  summarizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  summarizeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 22,
  }
});