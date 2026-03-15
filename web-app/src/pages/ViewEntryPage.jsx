import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Edit, FileText, Clock, Mic, MapPin } from 'lucide-react';
import { getTagColor, formatDate, countWords } from '../utils/entryUtils';

export default function ViewEntryPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntry();
  }, [id, user]);

  const loadEntry = async () => {
    if (!user || !id) return;

    try {
      const entryDoc = await getDoc(doc(db, 'entries', id));
      if (entryDoc.exists()) {
        setEntry({ id: entryDoc.id, ...entryDoc.data() });
      }
    } catch (error) {
      console.error('Error loading entry:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  if (!entry) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <p>Entry not found</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '16px', padding: '8px 16px' }}>
          Go Back
        </button>
      </div>
    );
  }

  const wordCount = countWords(entry.content);
  const readingTime = Math.ceil(wordCount / 200);

  const styles = {
    container: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.background,
    },
    header: {
      padding: '24px 32px',
      borderBottom: `1px solid ${theme.border}`,
      backgroundColor: theme.surface,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: 'transparent',
      color: theme.text,
      cursor: 'pointer',
      fontSize: '16px',
    },
    headerTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: theme.text,
    },
    editButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: '8px',
      border: `1px solid ${theme.accent}`,
      backgroundColor: 'transparent',
      color: theme.accent,
      cursor: 'pointer',
      fontSize: '14px',
    },
    content: {
      flex: 1,
      overflow: 'auto',
      padding: '32px',
    },
    innerContent: {
      maxWidth: '800px',
      margin: '0 auto',
    },
    metaCard: {
      backgroundColor: theme.surface,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    date: {
      fontSize: '16px',
      color: theme.text,
      fontWeight: '500',
      textAlign: 'center',
      marginBottom: '16px',
    },
    statsContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '24px',
    },
    stat: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: theme.textSecondary,
      fontSize: '14px',
    },
    contentCard: {
      backgroundColor: theme.surface,
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    entryContent: {
      fontSize: '17px',
      lineHeight: '1.8',
      color: theme.text,
      whiteSpace: 'pre-wrap',
      marginBottom: '24px',
    },
    tagsSection: {
      marginTop: '24px',
      paddingTop: '24px',
      borderTop: `1px solid ${theme.border}`,
    },
    tagsLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: theme.text,
      marginBottom: '12px',
    },
    tagsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
    },
    tag: {
      padding: '6px 12px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '500',
      border: '1px solid',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backButton} onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            Back
          </button>
          <span style={styles.headerTitle}>Entry Details</span>
        </div>
        <button style={styles.editButton} onClick={() => navigate(`/edit/${entry.id}`)}>
          <Edit size={16} />
          Edit
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.innerContent}>
          <div style={styles.metaCard}>
            <div style={styles.date}>{formatDate(entry.date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            <div style={styles.statsContainer}>
              <div style={styles.stat}>
                <FileText size={16} />
                <span>{wordCount} words</span>
              </div>
              <div style={styles.stat}>
                <Clock size={16} />
                <span>{readingTime} min read</span>
              </div>
            </div>
          </div>

          <div style={styles.contentCard}>
            <div style={styles.entryContent}>{entry.content}</div>

            {(entry.imageUrl || entry.imageUri) && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <img 
                  src={entry.imageUrl || entry.imageUri} 
                  alt="Entry attachment" 
                  style={{ maxWidth: '100%', borderRadius: '12px', maxHeight: '400px' }} 
                />
              </div>
            )}

            {entry.audioUrl && (
              <div style={{ marginTop: '16px', padding: '16px', backgroundColor: theme.background, borderRadius: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: theme.text, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mic size={16} />
                  Audio Recording
                </div>
                <audio controls style={{ width: '100%' }}>
                  <source src={entry.audioUrl} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {entry.location && (
              <div style={{ marginTop: '16px', padding: '16px', backgroundColor: theme.background, borderRadius: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: theme.text, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} />
                  Location
                </div>
                <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                  {entry.location.latitude.toFixed(6)}, {entry.location.longitude.toFixed(6)}
                </div>
                <a 
                  href={`https://www.google.com/maps?q=${entry.location.latitude},${entry.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '14px', color: theme.accent, marginTop: '8px', display: 'inline-block' }}
                >
                  View on Google Maps
                </a>
              </div>
            )}

            {entry.eventTime && (
              <div style={{ marginTop: '16px', padding: '16px', backgroundColor: theme.background, borderRadius: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: theme.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} />
                  Event Time: {new Date(entry.eventTime).toLocaleString()}
                </div>
              </div>
            )}

            {entry.tags && entry.tags.length > 0 && (
              <div style={styles.tagsSection}>
                <div style={styles.tagsLabel}>Tags:</div>
                <div style={styles.tagsContainer}>
                  {entry.tags.map(tag => (
                    <span 
                      key={tag} 
                      style={{
                        ...styles.tag,
                        backgroundColor: `${getTagColor(tag)}20`,
                        borderColor: getTagColor(tag),
                        color: getTagColor(tag),
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
