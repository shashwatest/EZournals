import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntries, getPredefinedTags } from '../utils/storage';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function OverviewScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    const data = await getEntries();
    setEntries(data);
    calculateStats(data);
  };

  const calculateStats = (data) => {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const filteredEntries = data.filter(entry => 
      new Date(entry.date) >= startDate
    );

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

  const timeRangeOptions = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Overview</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Time Range</Text>
          <View style={styles.timeRangeButtons}>
            {timeRangeOptions.map(option => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.timeRangeButton,
                  { borderColor: theme.colors.border },
                  timeRange === option.key && { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }
                ]}
                onPress={() => setTimeRange(option.key)}
              >
                <Text style={[
                  styles.timeRangeText,
                  { color: theme.colors.text },
                  timeRange === option.key && { color: theme.colors.surface }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: theme.colors.accent }]}>{stats.totalEntries || 0}</Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Entries</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: theme.colors.success }]}>{stats.totalWords || 0}</Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Words</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: theme.colors.warning }]}>{stats.avgWordsPerEntry || 0}</Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Avg/Entry</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Mood Distribution</Text>
          {stats.moodCounts && Object.entries(stats.moodCounts).map(([mood, data]) => (
            <View key={mood} style={styles.moodItem}>
              <View style={styles.moodHeader}>
                <View style={styles.moodInfo}>
                  <View style={[styles.moodDot, { backgroundColor: data.color }]} />
                  <Text style={[styles.moodName, { color: theme.colors.text }]}>{mood}</Text>
                </View>
                <View style={styles.moodStats}>
                  <Text style={[styles.moodCount, { color: theme.colors.textSecondary }]}>{data.count}</Text>
                  <Text style={[styles.moodPercentage, { color: theme.colors.textLight }]}>
                    {getMoodPercentage(data.count)}%
                  </Text>
                </View>
              </View>
              <View style={[styles.moodBar, { backgroundColor: theme.colors.border }]}>
                <View 
                  style={[
                    styles.moodBarFill, 
                    { backgroundColor: data.color, width: `${getBarWidth(data.count)}%` }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>

        {stats.totalEntries === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={64} color={theme.colors.textLight} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No data for this period</Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textLight }]}>
              Start writing to see your insights
            </Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  moodItem: {
    marginBottom: 16
  },
  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  moodInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  moodDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  },
  moodName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50'
  },
  moodStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  moodCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D'
  },
  moodPercentage: {
    fontSize: 12,
    color: '#BDC3C7'
  },
  moodBar: {
    height: 6,
    backgroundColor: '#ECF0F1',
    borderRadius: 3,
    overflow: 'hidden'
  },
  moodBarFill: {
    height: '100%',
    borderRadius: 3
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