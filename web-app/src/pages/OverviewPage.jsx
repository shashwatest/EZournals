import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { BarChart3 } from 'lucide-react';
import { getPredefinedTags, calculateStats } from '../utils/entryUtils';
import { getMoodTags } from '../utils/moodTags';

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [timeRange, setTimeRange] = useState('week');
  const [stats, setStats] = useState({});
  const [customStartDate, setCustomStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [customEndDate, setCustomEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const accentText = theme.onAccentText || '#fff';

  useEffect(() => {
    loadData();
  }, [timeRange, customStartDate, customEndDate, user]);

  const loadData = async () => {
    if (!user) return;
    try {
      await getMoodTags();
      const q = query(collection(db, 'entries'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEntries(data);
      setStats(calculateStats(data, timeRange, customStartDate, customEndDate));
    } catch (error) {
      console.error('Error loading entries:', error);
    }
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
    { key: 'year', label: 'Year' },
    { key: 'custom', label: 'Custom' }
  ];

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
    section: {
      backgroundColor: theme.surface,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: theme.text,
      marginBottom: '20px',
    },
    timeRangeButtons: {
      display: 'flex',
      gap: '12px',
      marginBottom: '16px',
    },
    timeRangeButton: {
      flex: 1,
      padding: '12px 16px',
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      backgroundColor: 'transparent',
      color: theme.text,
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s',
    },
    timeRangeButtonActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
      color: accentText,
    },
    customDateRange: {
      display: 'flex',
      gap: '12px',
      marginTop: '16px',
    },
    dateInput: {
      flex: 1,
      padding: '12px',
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      backgroundColor: theme.background,
      color: theme.text,
      fontSize: '14px',
    },
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px',
    },
    summaryItem: {
      textAlign: 'center',
    },
    summaryNumber: {
      fontSize: '32px',
      fontWeight: '700',
      marginBottom: '8px',
    },
    summaryLabel: {
      fontSize: '14px',
      color: theme.textSecondary,
    },
    moodChart: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    moodItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    moodHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    moodInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    moodIndicator: {
      width: '16px',
      height: '16px',
      borderRadius: '50%',
    },
    moodName: {
      fontSize: '16px',
      fontWeight: '600',
      color: theme.text,
    },
    moodStats: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    moodCount: {
      fontSize: '18px',
      fontWeight: '700',
    },
    moodPercentage: {
      fontSize: '14px',
      fontWeight: '500',
      color: theme.textSecondary,
    },
    moodBarContainer: {
      height: '12px',
      backgroundColor: theme.background,
      borderRadius: '6px',
      overflow: 'hidden',
      position: 'relative',
    },
    moodBarFill: {
      height: '100%',
      borderRadius: '6px',
      position: 'relative',
      transition: 'width 0.3s ease',
    },
    moodBarCore: {
      position: 'absolute',
      top: '50%',
      left: '0',
      right: '0',
      height: '4px',
      transform: 'translateY(-50%)',
      borderRadius: '2px',
    },
    emptyState: {
      textAlign: 'center',
      padding: '64px 32px',
    },
    emptyIcon: {
      marginBottom: '16px',
      opacity: 0.3,
    },
    emptyText: {
      fontSize: '18px',
      fontWeight: '500',
      color: theme.textSecondary,
      marginBottom: '8px',
    },
    emptySubtext: {
      fontSize: '14px',
      color: theme.textLight,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Overview</h1>
        <p style={styles.subtitle}>Track your journaling insights and patterns</p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Time Range</h2>
        <div style={styles.timeRangeButtons}>
          {timeRangeOptions.map(option => (
            <button
              key={option.key}
              style={{
                ...styles.timeRangeButton,
                ...(timeRange === option.key ? styles.timeRangeButtonActive : {})
              }}
              onClick={() => setTimeRange(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {timeRange === 'custom' && (
          <div style={styles.customDateRange}>
            <input
              type="date"
              style={styles.dateInput}
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
            />
            <input
              type="date"
              style={styles.dateInput}
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
            />
          </div>
        )}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Summary</h2>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryItem}>
            <div style={{ ...styles.summaryNumber, color: theme.accent }}>
              {stats.totalEntries || 0}
            </div>
            <div style={styles.summaryLabel}>Entries</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={{ ...styles.summaryNumber, color: '#32CD32' }}>
              {stats.totalWords || 0}
            </div>
            <div style={styles.summaryLabel}>Words</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={{ ...styles.summaryNumber, color: '#FF8C00' }}>
              {stats.avgWordsPerEntry || 0}
            </div>
            <div style={styles.summaryLabel}>Avg/Entry</div>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Mood Distribution</h2>
        {stats.totalEntries > 0 ? (
          <div style={styles.moodChart}>
            {stats.moodCounts && Object.entries(stats.moodCounts)
              .filter(([mood, data]) => data.count > 0)
              .sort((a, b) => b[1].count - a[1].count)
              .map(([mood, data]) => (
                <div key={mood} style={styles.moodItem}>
                  <div style={styles.moodHeader}>
                    <div style={styles.moodInfo}>
                      <div style={{ ...styles.moodIndicator, backgroundColor: data.color }} />
                      <span style={styles.moodName}>{mood}</span>
                    </div>
                    <div style={styles.moodStats}>
                      <span style={{ ...styles.moodCount, color: data.color }}>
                        {data.count}
                      </span>
                      <span style={styles.moodPercentage}>
                        {getMoodPercentage(data.count)}%
                      </span>
                    </div>
                  </div>
                  <div style={styles.moodBarContainer}>
                    <div 
                      style={{
                        ...styles.moodBarFill,
                        backgroundColor: `${data.color}40`,
                        width: `${getBarWidth(data.count)}%`,
                        border: `1px solid ${data.color}`
                      }}
                    >
                      <div style={{ ...styles.moodBarCore, backgroundColor: data.color }} />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <BarChart3 size={64} color={theme.textLight} />
            </div>
            <div style={styles.emptyText}>No data for this period</div>
            <div style={styles.emptySubtext}>Start writing to see your insights</div>
          </div>
        )}
      </div>
    </div>
  );
}
