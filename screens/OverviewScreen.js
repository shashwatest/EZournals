import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Dimensions, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { getEntries, getPredefinedTags } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function OverviewScreen({ navigation }) {
  const { theme } = useTheme();
  const [entries, setEntries] = useState([]);
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year', 'custom'
  const [stats, setStats] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('start'); // 'start' or 'end'
  const [customStartDate, setCustomStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [customEndDate, setCustomEndDate] = useState(new Date());

  if (!theme) return null;

  useEffect(() => {
    loadData();
  }, [timeRange, customStartDate, customEndDate]);

  const loadData = async () => {
    const data = await getEntries();
    setEntries(data);
    calculateStats(data);
  };

  const calculateStats = (data) => {
    const now = new Date();
    let startDate, endDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = now;
        break;
      case 'custom':
        startDate = customStartDate;
        endDate = customEndDate;
        break;
    }

    const filteredEntries = data.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });

    const moodCounts = {};
    const moods = getPredefinedTags();
    
    moods.forEach(mood => {
      moodCounts[mood.name] = {
        count: 0,
        color: mood.color
      };
    });

    filteredEntries.forEach(entry => {
      if (entry.tags) {
        entry.tags.forEach(tag => {
          if (moodCounts[tag]) {
            moodCounts[tag].count++;
          }
        });
      }
    });

    const totalEntries = filteredEntries.length;
    const totalWords = filteredEntries.reduce((sum, entry) => 
      sum + (entry.content ? entry.content.split(' ').length : 0), 0
    );

    setStats({
      totalEntries,
      totalWords,
      moodCounts,
      avgWordsPerEntry: totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0
    });
  };

  const getMoodPercentage = (count) => {
    return stats.totalEntries > 0 ? Math.round((count / stats.totalEntries) * 100) : 0;
  };

  const getBarWidth = (count) => {
    const maxCount = Math.max(...Object.values(stats.moodCounts || {}).map(m => m.count));
    return maxCount > 0 ? (count / maxCount) * 100 : 0;
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (datePickerMode === 'start') {
        setCustomStartDate(selectedDate);
      } else {
        setCustomEndDate(selectedDate);
      }
    }
  };

  const openDatePicker = (mode) => {
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const timeRangeOptions = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
    { key: 'custom', label: 'Custom' }
  ];

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Overview</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Time Range</Text>
          <View style={styles.timeRangeButtons}>
            {timeRangeOptions.map(option => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.timeRangeButton,
                  { borderColor: theme.border },
                  timeRange === option.key && { backgroundColor: theme.accent, borderColor: theme.accent }
                ]}
                onPress={() => setTimeRange(option.key)}
              >
                <Text style={[
                  styles.timeRangeText,
                  { color: theme.text },
                  timeRange === option.key && { color: theme.surface }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {timeRange === 'custom' && (
            <View style={styles.customDateRange}>
              <TouchableOpacity 
                style={[styles.dateButton, { borderColor: theme.border }]}
                onPress={() => openDatePicker('start')}
              >
                <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.dateButtonText, { color: theme.text }]}>
                  From: {formatDate(customStartDate)}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.dateButton, { borderColor: theme.border }]}
                onPress={() => openDatePicker('end')}
              >
                <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.dateButtonText, { color: theme.text }]}>
                  To: {formatDate(customEndDate)}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: theme.accent }]}>{stats.totalEntries || 0}</Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Entries</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: theme.success }]}>{stats.totalWords || 0}</Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Words</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: theme.warning }]}>{stats.avgWordsPerEntry || 0}</Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Avg/Entry</Text>
            </View>
          </View>
        </View>

        <View style={[styles.moodSection, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Mood Distribution</Text>
          <View style={styles.moodChart}>
            {stats.moodCounts && Object.entries(stats.moodCounts)
              .filter(([mood, data]) => data.count > 0)
              .sort((a, b) => b[1].count - a[1].count)
              .map(([mood, data]) => (
              <View key={mood} style={styles.moodItem}>
                <View style={styles.moodHeader}>
                  <View style={styles.moodInfo}>
                    <View style={[styles.moodIndicator, { backgroundColor: data.color }]} />
                    <Text style={[styles.moodName, { color: theme.text }]}>{mood}</Text>
                  </View>
                  <View style={styles.moodStats}>
                    <Text style={[styles.moodCount, { color: data.color }]}>{data.count}</Text>
                    <Text style={[styles.moodPercentage, { color: theme.textSecondary }]}>
                      {getMoodPercentage(data.count)}%
                    </Text>
                  </View>
                </View>
                <View style={[styles.moodBarContainer, { backgroundColor: theme.background }]}>
                  <View 
                    style={[
                      styles.moodBarFill, 
                      { 
                        backgroundColor: data.color + '40',
                        width: `${getBarWidth(data.count)}%`,
                        borderColor: data.color
                      }
                    ]} 
                  >
                    <View style={[styles.moodBarCore, { backgroundColor: data.color, width: '100%' }]} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {stats.totalEntries === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={64} color={theme.textLight} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No data for this period</Text>
            <Text style={[styles.emptySubtext, { color: theme.textLight }]}>
              Start writing to see your insights
            </Text>
          </View>
        )}

      </ScrollView>
      
      {showDatePicker && (
        <DateTimePicker
          value={datePickerMode === 'start' ? customStartDate : customEndDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
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
  placeholder: {
    width: 40
  },
  content: {
    flex: 1
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
    marginBottom: 16
  },
  timeRangeButtons: {
    flexDirection: 'row',
    gap: 8
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ECF0F1',
    borderRadius: 8,
    alignItems: 'center'
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50'
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  summaryItem: {
    alignItems: 'center'
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3498DB'
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4
  },
  customDateRange: {
    marginTop: 16,
    gap: 12
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: '500'
  },
  moodSection: {
    backgroundColor: theme.surface,
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  moodChart: {
    gap: 4
  },
  moodItem: {
    marginBottom: 20
  },
  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  moodInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  moodIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12
  },
  moodName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text
  },
  moodStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  moodCount: {
    fontSize: 18,
    fontWeight: '700'
  },
  moodPercentage: {
    fontSize: 14,
    fontWeight: '500'
  },
  moodBarContainer: {
    height: 12,
    backgroundColor: theme.background,
    borderRadius: 6,
    overflow: 'hidden'
  },
  moodBarFill: {
    height: '100%',
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center'
  },
  moodBarCore: {
    height: 4,
    borderRadius: 2,
    alignSelf: 'center'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#7F8C8D',
    marginTop: 16,
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center'
  }
});