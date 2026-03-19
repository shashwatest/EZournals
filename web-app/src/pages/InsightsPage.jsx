import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Sparkles, TrendingUp, Calendar, Clock, Sun, Loader, BarChart3 } from 'lucide-react';
import { getComprehensiveInsights } from '../utils/insightsCalculator';
import { isAIEnabled, getAISettings } from '../utils/aiSettings';
import { detectThemes, generateInsightsSummary } from '../utils/geminiService';
import { getTagColor } from '../utils/entryUtils';
import { showAlert } from '../utils/appAlert';

export default function InsightsPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [entries, setEntries] = useState([]);
  const [insights, setInsights] = useState(null);
  const [themes, setThemes] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [timeRange, setTimeRange] = useState(30);
  const [aiEnabled, setAiEnabled] = useState(false);
  const accentText = theme.onAccentText || '#fff';

  useEffect(() => {
    loadData();
    checkAIStatus();
  }, [user, timeRange]);

  const checkAIStatus = () => {
    try {
      const enabled = isAIEnabled();
      const settings = getAISettings();
      setAiEnabled(enabled && settings.features.insights);
    } catch (error) {
      console.error('Error checking AI status:', error);
    }
  };

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'entries'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(q);
      const entriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setEntries(entriesData);
      
      const insightsData = getComprehensiveInsights(entriesData, timeRange);
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
      const detectedThemes = await detectThemes(entries, 5);
      setThemes(detectedThemes);
      
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
      await showAlert({ title: 'AI Insights Failed', message: 'Failed to generate AI insights: ' + error.message, confirmTone: 'danger' });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading || !insights) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader size={40} color={theme.accent} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const styles = {
    container: {
      padding: '32px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    header: {
      marginBottom: '32px',
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: theme.text,
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '16px',
      color: theme.textSecondary,
    },
    timeRangeContainer: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
    },
    timeRangeButton: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: `1px solid ${theme.border}`,
      backgroundColor: theme.surface,
      color: theme.text,
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    timeRangeButtonActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
      color: accentText,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      marginBottom: '24px',
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: '12px',
      padding: '24px',
      border: `1px solid ${theme.border}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '16px',
    },
    cardTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: theme.text,
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
    },
    statItem: {
      textAlign: 'center',
      padding: '16px',
      backgroundColor: theme.background,
      borderRadius: '8px',
    },
    statValue: {
      fontSize: '28px',
      fontWeight: '700',
      color: theme.accent,
    },
    statLabel: {
      fontSize: '12px',
      color: theme.textSecondary,
      marginTop: '4px',
    },
    aiSummaryText: {
      fontSize: '15px',
      lineHeight: '1.6',
      color: theme.text,
    },
    generateButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px 20px',
      borderRadius: '8px',
      backgroundColor: theme.accent,
      color: accentText,
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: aiLoading ? 'not-allowed' : 'pointer',
      opacity: aiLoading ? 0.7 : 1,
      width: '100%',
    },
    themesContainer: {
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: `1px solid ${theme.border}`,
    },
    themesLabel: {
      fontSize: '13px',
      fontWeight: '500',
      color: theme.textSecondary,
      marginBottom: '8px',
    },
    themesWrapper: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
    },
    themeChip: {
      padding: '6px 12px',
      borderRadius: '16px',
      backgroundColor: `${theme.accent}20`,
      border: `1px solid ${theme.accent}`,
      fontSize: '12px',
      fontWeight: '500',
      color: theme.accent,
    },
    moodItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: `1px solid ${theme.border}`,
    },
    moodInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    moodDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
    },
    moodName: {
      fontSize: '15px',
      fontWeight: '500',
      color: theme.text,
    },
    moodStats: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    moodCount: {
      fontSize: '14px',
      color: theme.textSecondary,
    },
    moodPercentage: {
      fontSize: '14px',
      fontWeight: '600',
      color: theme.accent,
    },
    patternItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 0',
    },
    patternLabel: {
      flex: 1,
      fontSize: '14px',
      color: theme.textSecondary,
    },
    patternValue: {
      fontSize: '14px',
      fontWeight: '600',
      color: theme.text,
    },
    timeSlotItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 0',
    },
    timeSlotLabel: {
      flex: 1,
      fontSize: '13px',
      color: theme.text,
    },
    timeSlotBar: {
      flex: 2,
      height: '8px',
      backgroundColor: theme.border,
      borderRadius: '4px',
      overflow: 'hidden',
    },
    timeSlotFill: {
      height: '100%',
      borderRadius: '4px',
    },
    timeSlotCount: {
      fontSize: '13px',
      fontWeight: '600',
      color: theme.textSecondary,
      width: '30px',
      textAlign: 'right',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Insights</h1>
        <p style={styles.subtitle}>Discover patterns in your journaling journey</p>
      </div>

      {/* Time Range Selector */}
      <div style={styles.timeRangeContainer}>
        {[7, 30, 90].map(days => (
          <button
            key={days}
            style={{
              ...styles.timeRangeButton,
              ...(timeRange === days ? styles.timeRangeButtonActive : {})
            }}
            onClick={() => setTimeRange(days)}
          >
            {days === 7 ? 'Last Week' : days === 30 ? 'Last Month' : 'Last 3 Months'}
          </button>
        ))}
      </div>

      {/* AI Summary Card */}
      {aiEnabled && (
        <div style={{ ...styles.card, marginBottom: '24px' }}>
          <div style={styles.cardHeader}>
            <Sparkles size={20} color={theme.accent} />
            <div style={styles.cardTitle}>AI Insights</div>
          </div>
          
          {aiSummary ? (
            <div style={styles.aiSummaryText}>{aiSummary}</div>
          ) : (
            <button
              style={styles.generateButton}
              onClick={generateAIInsights}
              disabled={aiLoading}
            >
              {aiLoading ? (
                <>
                  <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate AI Insights
                </>
              )}
            </button>
          )}
          
          {themes.length > 0 && (
            <div style={styles.themesContainer}>
              <div style={styles.themesLabel}>Common Themes:</div>
              <div style={styles.themesWrapper}>
                {themes.map((theme, index) => (
                  <div key={index} style={styles.themeChip}>
                    {theme}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overview Stats */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <BarChart3 size={20} color={theme.accent} />
          <div style={styles.cardTitle}>Overview</div>
        </div>
        
        <div style={styles.statsGrid}>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{insights.totalEntries}</div>
            <div style={styles.statLabel}>Entries</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{insights.writingPatterns.currentStreak}</div>
            <div style={styles.statLabel}>Day Streak</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{insights.wordStats.avgWordsPerEntry}</div>
            <div style={styles.statLabel}>Avg Words</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{insights.writingPatterns.entriesPerWeek}</div>
            <div style={styles.statLabel}>Per Week</div>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Mood Trends */}
        {insights.moodTrends.topMoods.length > 0 && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <TrendingUp size={20} color={theme.accent} />
              <div style={styles.cardTitle}>Top Moods</div>
            </div>
            
            {insights.moodTrends.topMoods.map((moodData, index) => (
              <div key={index} style={styles.moodItem}>
                <div style={styles.moodInfo}>
                  <div style={{ ...styles.moodDot, backgroundColor: getTagColor(moodData.mood) }} />
                  <div style={styles.moodName}>{moodData.mood}</div>
                </div>
                <div style={styles.moodStats}>
                  <div style={styles.moodCount}>{moodData.count}x</div>
                  <div style={styles.moodPercentage}>{moodData.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Writing Patterns */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Calendar size={20} color={theme.accent} />
            <div style={styles.cardTitle}>Writing Patterns</div>
          </div>
          
          <div style={styles.patternItem}>
            <div style={styles.patternLabel}>🔥 Longest Streak:</div>
            <div style={styles.patternValue}>{insights.writingPatterns.longestStreak} days</div>
          </div>
          
          {insights.writingPatterns.bestDay && (
            <div style={styles.patternItem}>
              <div style={styles.patternLabel}>⭐ Best Day:</div>
              <div style={styles.patternValue}>{insights.writingPatterns.bestDay}</div>
            </div>
          )}
          
          {insights.writingPatterns.bestTime && (
            <div style={styles.patternItem}>
              <div style={styles.patternLabel}>⏰ Preferred Time:</div>
              <div style={styles.patternValue}>{insights.writingPatterns.bestTime}</div>
            </div>
          )}
        </div>

        {/* Time of Day */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Sun size={20} color={theme.accent} />
            <div style={styles.cardTitle}>Time of Day</div>
          </div>
          
          {Object.entries(insights.timePatterns.timeSlots).map(([slot, count]) => (
            count > 0 && (
              <div key={slot} style={styles.timeSlotItem}>
                <div style={styles.timeSlotLabel}>{slot}</div>
                <div style={styles.timeSlotBar}>
                  <div 
                    style={{
                      ...styles.timeSlotFill,
                      width: `${(count / insights.totalEntries) * 100}%`,
                      backgroundColor: theme.accent
                    }} 
                  />
                </div>
                <div style={styles.timeSlotCount}>{count}</div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
