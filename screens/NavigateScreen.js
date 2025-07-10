import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, FlatList, Calendar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntries, getPredefinedTags } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import EntryCard from '../components/EntryCard';

export default function NavigateScreen({ navigation }) {
  const { theme } = useTheme();
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [viewMode, setViewMode] = useState('date'); // 'date', 'mood'

  if (!theme) return null;

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const data = await getEntries();
    setEntries(data);
    setFilteredEntries(data);
  };

  const filterByDate = (date) => {
    const filtered = entries.filter(entry => {
      const entryDate = new Date(entry.date).toDateString();
      return entryDate === new Date(date).toDateString();
    });
    setFilteredEntries(filtered);
    setSelectedDate(date);
    setSelectedMood(null);
  };

  const filterByMood = (mood) => {
    const filtered = entries.filter(entry => 
      entry.tags && entry.tags.includes(mood)
    );
    setFilteredEntries(filtered);
    setSelectedMood(mood);
    setSelectedDate(null);
  };

  const clearFilters = () => {
    setFilteredEntries(entries);
    setSelectedDate(null);
    setSelectedMood(null);
  };

  const getQuickDates = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(today.getDate() - 7);

    return [
      { label: 'Today', date: today },
      { label: 'Yesterday', date: yesterday },
      { label: 'This Week', date: thisWeek }
    ];
  };

  const moods = getPredefinedTags();

  const renderEntry = ({ item }) => (
    <EntryCard
      entry={item}
      onPress={() => navigation.navigate('ViewEntry', { entry: item })}
      onDelete={() => {}}
    />
  );

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Navigate</Text>
        <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
          <Text style={[styles.clearText, { color: theme.accent }]}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Navigation</Text>
          <View style={styles.quickDates}>
            {getQuickDates().map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickButton, { borderColor: theme.border }]}
                onPress={() => filterByDate(item.date)}
              >
                <Text style={[styles.quickButtonText, { color: theme.text }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Filter by Mood</Text>
          <View style={styles.moodGrid}>
            {moods.map((mood, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.moodButton,
                  { borderColor: mood.color },
                  selectedMood === mood.name && { backgroundColor: mood.color + '20' }
                ]}
                onPress={() => filterByMood(mood.name)}
              >
                <Text style={[styles.moodText, { color: mood.color }]}>{mood.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <View style={styles.resultsHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Results ({filteredEntries.length})
            </Text>
            {(selectedDate || selectedMood) && (
              <Text style={[styles.filterInfo, { color: theme.textSecondary }]}>
                {selectedDate ? `Date: ${selectedDate.toDateString()}` : `Mood: ${selectedMood}`}
              </Text>
            )}
          </View>
        </View>

      </ScrollView>

      <FlatList
        data={filteredEntries}
        renderItem={renderEntry}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        style={styles.entriesList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={theme.textLight} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No entries found</Text>
          </View>
        }
      />
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
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
  clearButton: {
    padding: 8
  },
  clearText: {
    fontSize: 16,
    color: '#3498DB'
  },
  content: {
    maxHeight: 300
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12
  },
  quickDates: {
    flexDirection: 'row',
    gap: 8
  },
  quickButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ECF0F1',
    borderRadius: 8,
    alignItems: 'center'
  },
  quickButtonText: {
    fontSize: 14,
    color: '#2C3E50'
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  moodButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 4
  },
  moodText: {
    fontSize: 14,
    fontWeight: '500'
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  filterInfo: {
    fontSize: 12,
    color: '#7F8C8D'
  },
  entriesList: {
    flex: 1
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48
  },
  emptyText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 12
  }
});