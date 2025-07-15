import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, FlatList, Animated } from 'react-native';
import { Calendar } from 'react-native-calendars';
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
  const [showEntries, setShowEntries] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const slideAnim = new Animated.Value(0);

  if (!theme) return null;

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    if (showEntries) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [showEntries]);

  const loadEntries = async () => {
    const data = await getEntries();
    setEntries(data);
    
    // Create marked dates for calendar
    const marked = {};
    data.forEach(entry => {
      const dateKey = new Date(entry.date).toISOString().split('T')[0];
      marked[dateKey] = {
        marked: true,
        dotColor: theme.accent,
        selectedColor: theme.accent
      };
    });
    setMarkedDates(marked);
  };

  const onDayPress = (day) => {
    const filtered = entries.filter(entry => {
      const entryDate = new Date(entry.date).toISOString().split('T')[0];
      return entryDate === day.dateString;
    });
    setFilteredEntries(filtered);
    setSelectedDate(day.dateString);
    setSelectedMood(null);
    setShowEntries(true);
  };

  const filterByMood = (mood) => {
    const filtered = entries.filter(entry => 
      entry.tags && entry.tags.includes(mood)
    );
    setFilteredEntries(filtered);
    setSelectedMood(mood);
    setSelectedDate(null);
    setShowEntries(true);
  };

  const clearFilters = () => {
    setFilteredEntries([]);
    setSelectedDate(null);
    setSelectedMood(null);
    setShowEntries(false);
  };

  const moods = getPredefinedTags();

  const renderEntry = ({ item }) => (
    <EntryCard
      entry={item}
      onPress={() => navigation.navigate('ViewEntry', { entry: item })}
      onDelete={() => {}}
    />
  );

  const formatSelectedDate = () => {
    if (!selectedDate) return '';
    return new Date(selectedDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Navigate</Text>
        {showEntries && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Text style={[styles.clearText, { color: theme.accent }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {!showEntries ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.calendarSection, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Select a Date</Text>
            <Calendar
              onDayPress={onDayPress}
              markedDates={{
                ...markedDates,
                [selectedDate]: {
                  ...markedDates[selectedDate],
                  selected: true,
                  selectedColor: theme.accent
                }
              }}
              theme={{
                backgroundColor: theme.surface,
                calendarBackground: theme.surface,
                textSectionTitleColor: theme.text,
                selectedDayBackgroundColor: theme.accent,
                selectedDayTextColor: theme.surface,
                todayTextColor: theme.accent,
                dayTextColor: theme.text,
                textDisabledColor: theme.textLight,
                dotColor: theme.accent,
                selectedDotColor: theme.surface,
                arrowColor: theme.accent,
                monthTextColor: theme.text,
                indicatorColor: theme.accent,
                textDayFontWeight: '400',
                textMonthFontWeight: '600',
                textDayHeaderFontWeight: '500'
              }}
            />
          </View>

          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Or Filter by Mood</Text>
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
        </ScrollView>
      ) : (
        <Animated.View 
          style={[
            styles.resultsContainer,
            {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })
              }],
              opacity: slideAnim
            }
          ]}
        >
          <View style={[styles.resultsHeader, { backgroundColor: theme.surface }]}>
            <Text style={[styles.resultsTitle, { color: theme.text }]}>
              {selectedDate ? formatSelectedDate() : `Mood: ${selectedMood}`}
            </Text>
            <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>
              {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
            </Text>
          </View>
          
          <FlatList
            data={filteredEntries}
            renderItem={renderEntry}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            style={styles.entriesList}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={48} color={theme.textLight} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No entries found</Text>
                <Text style={[styles.emptySubtext, { color: theme.textLight }]}>Try selecting a different date or mood</Text>
              </View>
            }
          />
        </Animated.View>
      )}
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
    paddingTop: 52,
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
  clearButton: {
    padding: 8
  },
  clearText: {
    fontSize: 16,
    color: theme.accent
  },
  content: {
    flex: 1
  },
  calendarSection: {
    backgroundColor: theme.surface,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  section: {
    backgroundColor: theme.surface,
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
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  moodButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 8
  },
  moodText: {
    fontSize: 14,
    fontWeight: '500'
  },
  resultsContainer: {
    flex: 1
  },
  resultsHeader: {
    backgroundColor: theme.surface,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4
  },
  resultsCount: {
    fontSize: 14,
    color: theme.textSecondary
  },
  entriesList: {
    flex: 1
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.textSecondary,
    marginTop: 16,
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textLight,
    textAlign: 'center'
  }
});