import React from 'react';
import { Image } from 'react-native';
import { useUISettings } from '../contexts/UISettingsContext';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import RichTextRenderer from '../components/RichTextRenderer';
import AudioPlayer from '../components/AudioPlayer';
import { getTagColor } from '../utils/storage';

export default function ViewEntryScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { getFontFamily, getFontSizes } = useUISettings();
  const fontFamily = getFontFamily();
  const fontSizes = getFontSizes();
  const { entry } = route.params;

  if (!theme) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const wordCount = entry.content.split(' ').filter(word => word.length > 0).length;
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
        <TouchableOpacity 
          onPress={() => navigation.navigate('EditEntry', { entry })}
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={20} color={theme.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.metaContainer}>
          <Text style={[styles.date, { fontFamily, fontSize: fontSizes.base }]}>{formatDate(entry.date)}</Text>
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
        </View>
        
        <View style={styles.contentContainer}>
          <RichTextRenderer content={entry.content} style={{ ...styles.content, fontFamily, fontSize: fontSizes.base }} />
          {/* Show attached image if present */}
          {entry.imageUri && (
            <View style={{ marginTop: 16, alignItems: 'center' }}>
              <Image source={{ uri: entry.imageUri }} style={{ width: 180, height: 180, borderRadius: 12, marginVertical: 8 }} />
            </View>
          )}
          {/* Show tagged location if present */}
          {entry.location && entry.location.coords && (
            <View style={{ marginTop: 8, alignItems: 'center' }}>
              <Ionicons name="location-outline" size={18} color={theme.primary} />
              <Text style={{ color: theme.textSecondary, fontSize: 13, fontFamily }}>Location: {formatLocation(entry.location)}</Text>
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
          {entry.audioUri && (
            <View style={styles.audioContainer}>
              <Text style={[styles.audioLabel, { fontFamily, fontSize: fontSizes.base }]}>Audio Recording:</Text>
              <AudioPlayer audioUri={entry.audioUri} />
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
  }
});