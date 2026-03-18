import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useUISettings } from '../contexts/UISettingsContext';
import { collection, query, where, getDocs, doc, deleteDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { sortEntries, countWords } from '../utils/entryUtils';
import ConfirmDialog from '../components/ConfirmDialog';

// SVG noise texture for matte feel on cards
const noiseTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`;

export default function HomePage() {
  const { theme, currentTheme } = useTheme();
  const { user } = useAuth();
  const { settings } = useUISettings();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalEntries: 0, totalWords: 0 });
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const isMatteCardTheme = currentTheme === 'matteBlack' || currentTheme === 'matteWhite';

  useEffect(() => {
    loadEntries();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'entries'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setEntries(entriesData);
      
      const totalWords = entriesData.reduce((sum, entry) => sum + countWords(entry.content), 0);
      setStats({ totalEntries: entriesData.length, totalWords });
    }, (error) => {
      if (error.code !== 'permission-denied') {
        console.error('Entries listener error:', error);
      }
    });

    return () => unsubscribe();
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
      
      const totalWords = entriesData.reduce((sum, entry) => sum + countWords(entry.content), 0);
      setStats({ totalEntries: entriesData.length, totalWords });
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedEntries = sortEntries(
    entries.filter(entry =>
      entry.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
    settings.sortBy
  );

  const handleDelete = async (entryId, entry) => {
    try {
      const deletedEntry = {
        ...entry,
        deletedAt: Date.now()
      };
      
      await setDoc(doc(db, 'deletedEntries', entryId), deletedEntry);
      await deleteDoc(doc(db, 'entries', entryId));
      
      setEntries(entries.filter(e => e.id !== entryId));
    } catch (error) {
      console.error('Error deleting entry:', error);
    } finally {
      setDeleteCandidate(null);
    }
  };

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
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '600',
      color: theme.text,
      marginBottom: '4px',
    },
    subtitle: {
      fontSize: '14px',
      color: theme.textSecondary,
    },
    newButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0',
      justifyContent: 'center',
      padding: '12px',
      borderRadius: '10px',
      border: `1px solid ${theme.border}`,
      backgroundColor: theme.buttonBg || theme.surface,
      color: theme.accent,
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: 'none',
      width: '44px',
      height: '44px',
    },
    searchBar: {
      position: 'relative',
      maxWidth: '500px',
    },
    searchIcon: {
      position: 'absolute',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: theme.textLight,
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px 12px 48px',
      borderRadius: '12px',
      border: `1px solid ${theme.border}`,
      backgroundColor: theme.background,
      color: theme.text,
      fontSize: '15px',
      outline: 'none',
    },
    content: {
      flex: 1,
      overflow: 'auto',
      padding: '32px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: settings.cardLayout === 'grid' 
        ? 'repeat(auto-fill, minmax(350px, 1fr))' 
        : '1fr',
      gap: settings.cardSpacing === 'tight' ? '16px' : settings.cardSpacing === 'loose' ? '32px' : '24px',
    },
    card: {
      padding: '24px',
      borderRadius: isMatteCardTheme ? '14px' : '16px',
      backgroundColor: theme.surface,
      ...(isMatteCardTheme ? { backgroundImage: noiseTexture, backgroundSize: '128px 128px' } : {}),
      border: `1px solid ${theme.border}`,
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isMatteCardTheme ? '0 3px 6px rgba(0, 0, 0, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.05)',
    },
    cardDate: {
      fontSize: '14px',
      color: theme.textLight,
      marginBottom: '12px',
    },
    cardContent: {
      fontSize: '16px',
      color: theme.text,
      lineHeight: '1.6',
      marginBottom: '16px',
      display: '-webkit-box',
      WebkitLineClamp: 4,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    tags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
    },
    tag: {
      padding: '4px 12px',
      borderRadius: '6px',
      backgroundColor: `${theme.accent}${isMatteCardTheme ? '15' : '20'}`,
      color: theme.accent,
      fontSize: '12px',
      fontWeight: '500',
    },
    cardActions: {
      display: 'flex',
      gap: '8px',
      marginTop: '12px',
      paddingTop: '12px',
      borderTop: `1px solid ${theme.border}`,
    },
    actionButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0',
      justifyContent: 'center',
      padding: '8px',
      borderRadius: '8px',
      border: `1px solid ${theme.border}`,
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: theme.buttonBg || theme.surface,
      width: '36px',
      height: '36px',
    },
    editButton: {
      color: theme.edit || theme.accent,
      boxShadow: 'none',
    },
    deleteButton: {
      color: theme.danger,
      boxShadow: 'none',
    },
    empty: {
      textAlign: 'center',
      padding: '80px 20px',
    },
    emptyText: {
      fontSize: '20px',
      color: theme.textSecondary,
      marginTop: '16px',
    },
  };

  // Hover behavior adapts to theme
  const cardHoverIn = isMatteCardTheme
    ? (e) => { e.currentTarget.style.transform = 'translateY(-1.5px) scale(1.008)'; e.currentTarget.style.boxShadow = '0 5px 10px rgba(0, 0, 0, 0.5)'; }
    : (e) => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)'; e.currentTarget.style.backgroundColor = theme.surfaceHover || theme.surface; };
  const cardHoverOut = isMatteCardTheme
    ? (e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.4)'; }
    : (e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'; e.currentTarget.style.backgroundColor = theme.surface; };
  const btnHoverIn = (e) => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.backgroundColor = theme.buttonHoverBg || theme.buttonBg || theme.surfaceHover || theme.surface; };
  const btnHoverOut = (e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.backgroundColor = theme.buttonBg || theme.surface; };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.title}>My Journal</h1>
            <p style={styles.subtitle}>
              {stats.totalEntries} {stats.totalEntries === 1 ? 'entry' : 'entries'} · {stats.totalWords} words
            </p>
          </div>
          <button
            style={styles.newButton}
            onClick={() => navigate('/add')}
            title="New Entry"
            onMouseEnter={btnHoverIn}
            onMouseLeave={btnHoverOut}
          >
            <Plus size={20} />
          </button>
        </div>
        
        <div style={styles.searchBar}>
          <Search size={20} style={styles.searchIcon} />
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={styles.content}>
        {loading ? (
          <div style={styles.empty}>
            <div style={styles.emptyText}>Loading...</div>
          </div>
        ) : filteredAndSortedEntries.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyText}>
              {searchQuery ? 'No entries found' : 'Your journal awaits'}
            </div>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredAndSortedEntries.map((entry) => (
              <div
                key={entry.id}
                style={styles.card}
                onMouseEnter={cardHoverIn}
                onMouseLeave={cardHoverOut}
              >
                <div onClick={() => navigate(`/entry/${entry.id}`)} style={{ cursor: 'pointer' }}>
                  <div style={styles.cardDate}>
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div style={styles.cardContent}>{entry.content}</div>
                  {entry.tags && entry.tags.length > 0 && (
                    <div style={styles.tags}>
                      {entry.tags.map((tag, index) => (
                        <span key={index} style={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={styles.cardActions}>
                  <button
                    style={{ ...styles.actionButton, ...styles.editButton }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edit/${entry.id}`);
                    }}
                    title="Edit"
                    onMouseEnter={btnHoverIn}
                    onMouseLeave={btnHoverOut}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    style={{ ...styles.actionButton, ...styles.deleteButton }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteCandidate(entry);
                    }}
                    title="Delete"
                    onMouseEnter={btnHoverIn}
                    onMouseLeave={btnHoverOut}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
      <ConfirmDialog
        open={Boolean(deleteCandidate)}
        title="Move Entry To Recycle Bin?"
        message="The entry will be removed from your journal and moved to the recycle bin until you restore it or permanently delete it."
        confirmLabel="Move Entry"
        cancelLabel="Cancel"
        confirmTone="danger"
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => handleDelete(deleteCandidate.id, deleteCandidate)}
        theme={theme}
      />
    </div>
  );
}
