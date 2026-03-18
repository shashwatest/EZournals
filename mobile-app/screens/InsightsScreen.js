import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useUISettings } from '../contexts/UISettingsContext';
import { getEntries } from '../../backend/utils/storage';
import { getComprehensiveInsights } from '../../backend/utils/insightsCalculator';
import { isAIEnabled, getAISettings } from '../../backend/utils/aiSettings';
import { detectThemes, generateInsightsSummary } from '../../backend/utils/geminiService';
import { getTagColor } from '../utils/entryUtils';

export default function InsightsScreen({ navigation }) {
  const { theme } = useTheme();
  const { getFontFamily, getFontSizes } = useUISettings();
  const fontFamily = getFontFamily();
  const fontSizes = getFontSizes();
  
  const [entries, setEntries] = useState([]);
  const [insights, setInsights] = useState(null);
  const [themes, setThemes] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [timeRange, setTimeRange] = useState(30);
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    loadData();
    checkAIStatus();
  }, [timeRange]);

  const checkAIStatus = async () => {
    const enabled = await isAIEnabled();
    const settings = await getAISettings();
    setAiEnabled(enabled && settings.features.insights);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const allEntries = await getEntries();
      setEntries(allEntries);
      
      const insightsData = getComprehensiveInsights(allEntries, timeRange);
      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async () => {
    if (!aiEnabled || !insights) return;
    
    setAiLoading(true);
    try {
      // Detect themes
      const detectedThemes = await detectThemes(entries, 5);
      setThemes(detectedThemes);
      
      // Generate summary
      const statsForAI = {
        totalEntries: insights.totalEntries,
        timeRange: insights.timeRange,
        topMoods: insights.moodTrends.topMoods.map(m => m.mood),
        writingFrequency: `${insights.writingPatterns.entriesPerWeek} entries/week`,
        themes: detectedThemes,
        avgWordsPerEntry: insights.wordStats.avgWordsPerEntry
      };
      
      const summary = await generateInsightsSummary(statsForAI);
      setAiSummary(summary);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      alert('Failed to generate AI insights: ' + error.message);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading || !insights) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 16, paddingVertical: 16,
          paddingTop: Platform.OS === 'ios' ? 50 : 16,
          backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border,
        }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.text, fontFamily }}>Insights</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </View>
    );
  }

  const styles = createStyles(theme, fontFamily, fontSizes);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Insights</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {[7, 30, 90].map(days => (
            <TouchableOpacity
              key={days}
              style={[
                styles.timeRangeButton,
                timeRange === days && styles.timeRangeButtonActive
              ]}
              onPress={() => setTimeRange(days)}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === days && styles.timeRangeTextActive
              ]}>
                {days === 7 ? 'Week' : days === 30 ? 'Month' : '3 Months'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Summary Card */}
        {aiEnabled && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="sparkles" size={20} color={theme.accent} />
              <Text style={styles.cardTitle}>AI Insights</Text>
            </View>
            
            {aiSummary ? (
              <Text style={styles.aiSummaryText}>{aiSummary}</Text>
            ) : (
              <TouchableOpacity
                style={styles.generateButton}
                onPress={generateAIInsights}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="sparkles" size={18} color="#fff" />
                )}
                <Text style={styles.generateButtonText}>
                  {aiLoading ? 'Generating...' : 'Generate AI Insights'}
                </Text>
              </TouchableOpacity>
            )}
            
            {themes.length > 0 && (
              <View style={styles.themesContainer}>
                <Text style={styles.themesLabel}>Common Themes:</Text>
                <View style={styles.themesWrapper}>
                  {themes.map((theme, index) => (
                    <View key={index} style={styles.themeChip}>
                      <Text style={styles.themeText}>{theme}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Overview Stats */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="stats-chart" size={20} color={theme.accent} />
            <Text style={styles.cardTitle}>Overview</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{insights.totalEntries}</Text>
              <Text style={styles.statLabel}>Entries</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{insights.writingPatterns.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{insights.wordStats.avgWordsPerEntry}</Text>
              <Text style={styles.statLabel}>Avg Words</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{insights.writingPatterns.entriesPerWeek}</Text>
              <Text style={styles.statLabel}>Per Week</Text>
            </View>
          </View>
        </View>

        {/* Mood Trends */}
        {insights.moodTrends.topMoods.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="happy-outline" size={20} color={theme.accent} />
              <Text style={styles.cardTitle}>Top Moods</Text>
            </View>
            
            {insights.moodTrends.topMoods.map((moodData, index) => (
              <View key={index} style={styles.moodItem}>
                <View style={styles.moodInfo}>
                  <View style={[styles.moodDot, { backgroundColor: getTagColor(moodData.mood) }]} />
                  <Text style={styles.moodName}>{moodData.mood}</Text>
                </View>
                <View style={styles.moodStats}>
                  <Text style={styles.moodCount}>{moodData.count}x</Text>
                  <Text style={styles.moodPercentage}>{moodData.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Writing Patterns */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={20} color={theme.accent} />
            <Text style={styles.cardTitle}>Writing Patterns</Text>
          </View>
          
          <View style={styles.patternItem}>
            <Ionicons name="flame-outline" size={18} color={theme.textSecondary} />
            <Text style={styles.patternLabel}>Longest Streak:</Text>
            <Text style={styles.patternValue}>{insights.writingPatterns.longestStreak} days</Text>
          </View>
          
          {insights.writingPatterns.bestDay && (
            <View style={styles.patternItem}>
              <Ionicons name="star-outline" size={18} color={theme.textSecondary} />
              <Text style={styles.patternLabel}>Best Day:</Text>
              <Text style={styles.patternValue}>{insights.writingPatterns.bestDay}</Text>
            </View>
          )}
          
          {insights.writingPatterns.bestTime && (
            <View style={styles.patternItem}>
              <Ionicons name="time-outline" size={18} color={theme.textSecondary} />
              <Text style={styles.patternLabel}>Preferred Time:</Text>
              <Text style={styles.patternValue}>{insights.writingPatterns.bestTime}</Text>
            </View>
          )}
        </View>

        {/* Time of Day */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sunny-outline" size={20} color={theme.accent} />
            <Text style={styles.cardTitle}>Time of Day</Text>
          </View>
          
          {Object.entries(insights.timePatterns.timeSlots).map(([slot, count]) => (
            count > 0 && (
              <View key={slot} style={styles.timeSlotItem}>
                <Text style={styles.timeSlotLabel}>{slot}</Text>
                <View style={styles.timeSlotBar}>
                  <View 
                    style={[
                      styles.timeSlotFill,
                      { 
                        width: `${(count / insights.totalEntries) * 100}%`,
                        backgroundColor: theme.accent
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.timeSlotCount}>{count}</Text>
              </View>
            )
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme, fontFamily, fontSizes) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    fontFamily,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
    fontFamily,
  },
  timeRangeTextActive: {
    color: '#fff',
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    fontFamily,
  },
  aiSummaryText: {
    fontSize: 15,
    lineHeight: 24,
    color: theme.text,
    fontFamily,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: theme.accent,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily,
  },
  themesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  themesLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.textSecondary,
    marginBottom: 8,
    fontFamily,
  },
  themesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.accent + '20',
    borderWidth: 1,
    borderColor: theme.accent,
  },
  themeText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.accent,
    fontFamily,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.background,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.accent,
    fontFamily,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
    fontFamily,
  },
  moodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  moodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moodDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  moodName: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
    fontFamily,
  },
  moodStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moodCount: {
    fontSize: 14,
    color: theme.textSecondary,
    fontFamily,
  },
  moodPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.accent,
    fontFamily,
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  patternLabel: {
    flex: 1,
    fontSize: 14,
    color: theme.textSecondary,
    fontFamily,
  },
  patternValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    fontFamily,
  },
  timeSlotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  timeSlotLabel: {
    flex: 1,
    fontSize: 13,
    color: theme.text,
    fontFamily,
  },
  timeSlotBar: {
    flex: 2,
    height: 8,
    backgroundColor: theme.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  timeSlotFill: {
    height: '100%',
    borderRadius: 4,
  },
  timeSlotCount: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
    width: 30,
    textAlign: 'right',
    fontFamily,
  },
});
