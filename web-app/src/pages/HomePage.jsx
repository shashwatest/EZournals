import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Search } from 'lucide-react';

export default function HomePage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, [user]);

  const loadEntries = async () => {
    if (!user) return;
    
    try {
      const q = query(
        collection(db, 'entries'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
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

  const filteredEntries = entries.filter(entry =>
    entry.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
    },
    newButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      backgroundColor: theme.accent,
      color: '#fff',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
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
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '24px',
    },
    card: {
      padding: '24px',
      borderRadius: '16px',
      backgroundColor: theme.surface,
      border: `1px solid ${theme.border}`,
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: `0 0 10px ${theme.border}`,
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
      backgroundColor: `${theme.accent}20`,
      color: theme.accent,
      fontSize: '12px',
      fontWeight: '500',
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.title}>My Journal</h1>
          <button style={styles.newButton} onClick={() => navigate('/add')}>
            <Plus size={20} />
            New Entry
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
        ) : filteredEntries.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyText}>
              {searchQuery ? 'No entries found' : 'Your journal awaits'}
            </div>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                style={styles.card}
                onClick={() => navigate(`/entry/${entry.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 0 20px ${theme.border}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 0 10px ${theme.border}`;
                }}
              >
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
