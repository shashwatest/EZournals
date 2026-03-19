import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { getPredefinedTags } from '../utils/entryUtils';
import { getMoodTags } from '../utils/moodTags';

export default function NavigatePage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [predefinedTags, setPredefinedTags] = useState([]);
  const accentText = theme.onAccentText || '#fff';

  useEffect(() => {
    loadEntries();
    getMoodTags().then(setPredefinedTags);
  }, [user]);

  const loadEntries = async () => {
    if (!user) return;
    
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
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const hasEntriesOnDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return entries.some(entry => {
      const entryDate = new Date(entry.date).toISOString().split('T')[0];
      return entryDate === dateStr;
    });
  };

  const handleDateClick = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    
    const filtered = entries.filter(entry => {
      const entryDate = new Date(entry.date).toISOString().split('T')[0];
      return entryDate === dateStr;
    });
    
    setSelectedDate(date);
    setSelectedMood(null);
    setFilteredEntries(filtered);
  };

  const handleMoodClick = (moodName) => {
    const filtered = entries.filter(entry => 
      entry.tags && entry.tags.includes(moodName)
    );
    
    setSelectedMood(moodName);
    setSelectedDate(null);
    setFilteredEntries(filtered);
  };

  const clearFilters = () => {
    setSelectedDate(null);
    setSelectedMood(null);
    setFilteredEntries([]);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const styles = {
    container: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.background,
      overflow: 'hidden',
    },
    header: {
      padding: '24px 32px',
      borderBottom: `1px solid ${theme.border}`,
      backgroundColor: theme.surface,
    },
    title: {
      fontSize: '28px',
      fontWeight: '600',
      color: theme.text,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    content: {
      flex: 1,
      overflow: 'auto',
      padding: '32px',
      display: 'flex',
      gap: '24px',
    },
    calendarSection: {
      flex: selectedDate ? '0 0 500px' : 1,
      maxWidth: selectedDate ? '500px' : '900px',
      margin: selectedDate ? '0' : '0 auto',
    },
    calendarCard: {
      backgroundColor: theme.surface,
      borderRadius: '16px',
      border: `1px solid ${theme.border}`,
      padding: '24px',
      boxShadow: `0 0 10px ${theme.border}`,
    },
    calendarHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
    },
    monthTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: theme.text,
    },
    navButtons: {
      display: 'flex',
      gap: '8px',
    },
    navButton: {
      padding: '8px 16px',
      borderRadius: '8px',
      border: `1px solid ${theme.border}`,
      backgroundColor: theme.background,
      color: theme.text,
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
    },
    weekDays: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '8px',
      marginBottom: '8px',
    },
    weekDay: {
      textAlign: 'center',
      fontSize: '12px',
      fontWeight: '600',
      color: theme.textSecondary,
      padding: '8px',
    },
    daysGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '8px',
    },
    day: {
      aspectRatio: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      color: theme.text,
      position: 'relative',
      transition: 'all 0.2s',
    },
    dayWithEntry: {
      backgroundColor: `${theme.accent}10`,
      border: `2px solid ${theme.accent}40`,
    },
    daySelected: {
      backgroundColor: theme.accent,
      color: accentText,
    },
    emptyDay: {
      visibility: 'hidden',
    },
    entriesSection: {
      flex: 1,
      display: selectedDate ? 'block' : 'none',
    },
    entriesCard: {
      backgroundColor: theme.surface,
      borderRadius: '16px',
      border: `1px solid ${theme.border}`,
      padding: '24px',
      boxShadow: `0 0 10px ${theme.border}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    entriesHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      paddingBottom: '16px',
      borderBottom: `1px solid ${theme.border}`,
    },
    entriesTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: theme.text,
    },
    closeButton: {
      padding: '8px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: 'transparent',
      color: theme.textSecondary,
      cursor: 'pointer',
    },
    entriesList: {
      flex: 1,
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    entryCard: {
      padding: '16px',
      borderRadius: '12px',
      backgroundColor: theme.background,
      border: `1px solid ${theme.border}`,
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    entryContent: {
      fontSize: '15px',
      color: theme.text,
      lineHeight: '1.5',
      marginBottom: '12px',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    entryTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
    },
    tag: {
      padding: '4px 10px',
      borderRadius: '6px',
      backgroundColor: `${theme.accent}20`,
      color: theme.accent,
      fontSize: '12px',
      fontWeight: '500',
    },
    emptyState: {
      textAlign: 'center',
      padding: '48px 20px',
      color: theme.textSecondary,
    },
    moodSection: {
      backgroundColor: theme.surface,
      borderRadius: '16px',
      border: `1px solid ${theme.border}`,
      padding: '24px',
      marginTop: '24px',
      boxShadow: `0 0 10px ${theme.border}`,
    },
    moodTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: theme.text,
      marginBottom: '16px',
    },
    moodGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
    },
    moodButton: {
      padding: '10px 18px',
      borderRadius: '20px',
      border: '2px solid',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s',
    },
    moodButtonActive: {
      fontWeight: '600',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <CalendarIcon size={32} />
          Navigate
        </h1>
      </div>

      <div style={styles.content}>
        <div style={styles.calendarSection}>
          <div style={styles.calendarCard}>
            <div style={styles.calendarHeader}>
              <h2 style={styles.monthTitle}>{monthName}</h2>
              <div style={styles.navButtons}>
                <button style={styles.navButton} onClick={previousMonth}>Previous</button>
                <button style={styles.navButton} onClick={nextMonth}>Next</button>
              </div>
            </div>

            <div style={styles.weekDays}>
              {weekDays.map(day => (
                <div key={day} style={styles.weekDay}>{day}</div>
              ))}
            </div>

            <div style={styles.daysGrid}>
              {[...Array(startingDayOfWeek)].map((_, i) => (
                <div key={`empty-${i}`} style={styles.emptyDay}></div>
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const date = new Date(year, month, day);
                const hasEntries = hasEntriesOnDate(date);
                const isSelected = selectedDate && 
                  selectedDate.toISOString().split('T')[0] === date.toISOString().split('T')[0];
                
                return (
                  <div
                    key={day}
                    style={{
                      ...styles.day,
                      ...(hasEntries && styles.dayWithEntry),
                      ...(isSelected && styles.daySelected),
                    }}
                    onClick={() => handleDateClick(day)}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = theme.background;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = hasEntries ? `${theme.accent}10` : 'transparent';
                      }
                    }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={styles.moodSection}>
            <h3 style={styles.moodTitle}>Or Filter by Mood</h3>
            <div style={styles.moodGrid}>
              {predefinedTags.map(mood => (
                <button
                  key={mood.name}
                  style={{
                    ...styles.moodButton,
                    borderColor: mood.color,
                    color: selectedMood === mood.name ? accentText : mood.color,
                    backgroundColor: selectedMood === mood.name ? mood.color : 'transparent',
                    ...(selectedMood === mood.name && styles.moodButtonActive),
                  }}
                  onClick={() => handleMoodClick(mood.name)}
                >
                  {mood.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {(selectedDate || selectedMood) && (
          <div style={styles.entriesSection}>
            <div style={styles.entriesCard}>
              <div style={styles.entriesHeader}>
                <div>
                  <h3 style={styles.entriesTitle}>
                    {selectedDate 
                      ? selectedDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : `Mood: ${selectedMood}`
                    }
                  </h3>
                  <p style={{ fontSize: '14px', color: theme.textSecondary, marginTop: '4px' }}>
                    {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
                  </p>
                </div>
                <button 
                  style={styles.closeButton} 
                  onClick={clearFilters}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={styles.entriesList}>
                {filteredEntries.length === 0 ? (
                  <div style={styles.emptyState}>
                    <p>No entries for this date</p>
                  </div>
                ) : (
                  filteredEntries.map(entry => (
                    <div
                      key={entry.id}
                      style={styles.entryCard}
                      onClick={() => navigate(`/entry/${entry.id}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = `0 4px 12px ${theme.border}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={styles.entryContent}>{entry.content}</div>
                      {entry.tags && entry.tags.length > 0 && (
                        <div style={styles.entryTags}>
                          {entry.tags.map((tag, index) => (
                            <span key={index} style={styles.tag}>{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
