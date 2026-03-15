import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Palette, Tag, Info, Plus, X, Cloud, RefreshCw, Edit2, Trash2, Check, ChevronRight } from 'lucide-react';
import { collection, getDocs, setDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { formatSyncTime } from '../utils/entryUtils';

export default function SettingsPage() {
  const { theme, currentTheme, changeTheme, customThemes, allThemes, defaultThemes, deleteCustomTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userTags, setUserTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    loadSettings();
    loadLastSync();
  }, []);

  const loadLastSync = () => {
    const lastSyncTime = localStorage.getItem('lastSyncTime');
    if (lastSyncTime) {
      setLastSync(parseInt(lastSyncTime));
    }
  };

  const handleSync = async () => {
    if (!user) {
      setSyncMessage('Please log in to sync');
      return;
    }

    setSyncing(true);
    setSyncMessage('');
    
    try {
      // Get all entries from Firestore
      const entriesRef = collection(db, 'entries');
      const q = query(entriesRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      const syncTime = Date.now();
      localStorage.setItem('lastSyncTime', syncTime.toString());
      setLastSync(syncTime);
      
      setSyncMessage(`Synced ${snapshot.size} entries successfully`);
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncMessage('Sync failed: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const loadSettings = () => {
    const savedTags = localStorage.getItem('userTags');
    if (savedTags) {
      setUserTags(JSON.parse(savedTags));
    }
  };

  const addNewTag = () => {
    if (newTag.trim() && !userTags.includes(newTag.trim())) {
      const updatedTags = [...userTags, newTag.trim()];
      setUserTags(updatedTags);
      localStorage.setItem('userTags', JSON.stringify(updatedTags));
      setNewTag('');
    }
  };

  const deleteTag = (tagToDelete) => {
    const updatedTags = userTags.filter(tag => tag !== tagToDelete);
    setUserTags(updatedTags);
    localStorage.setItem('userTags', JSON.stringify(updatedTags));
  };

  const styles = {
    container: {
      padding: '32px',
      maxWidth: '1000px',
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
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    tagInputContainer: {
      display: 'flex',
      gap: '12px',
      marginBottom: '16px',
    },
    tagInput: {
      flex: 1,
      padding: '12px',
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      backgroundColor: theme.background,
      color: theme.text,
      fontSize: '14px',
    },
    addButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      backgroundColor: theme.accent,
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
    },
    tagsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '16px',
    },
    tag: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      backgroundColor: `${theme.accent}20`,
      color: theme.accent,
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
    },
    deleteButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: theme.danger,
      padding: '0',
    },
    aboutContainer: {
      textAlign: 'center',
      padding: '16px',
    },
    aboutText: {
      fontSize: '16px',
      fontWeight: '500',
      color: theme.text,
      marginBottom: '8px',
    },
    aboutSubtext: {
      fontSize: '14px',
      color: theme.textSecondary,
    },
    themeGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '12px',
    },
    themeOption: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    themeColor: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
    },
    themeLabel: {
      flex: 1,
      fontSize: '14px',
      color: theme.text,
    },
    syncButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      padding: '14px 24px',
      border: 'none',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      width: '100%',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <p style={styles.subtitle}>Customize your journaling experience</p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <Cloud size={20} />
          Cloud Sync
        </h2>
        <button
          style={{
            ...styles.syncButton,
            backgroundColor: syncing ? theme.border : theme.accent,
            cursor: syncing ? 'not-allowed' : 'pointer',
          }}
          onClick={handleSync}
          disabled={syncing}
        >
          <RefreshCw size={20} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
        {lastSync && (
          <p style={{ fontSize: '14px', color: theme.textSecondary, textAlign: 'center', marginTop: '12px' }}>
            Last synced: {formatSyncTime(lastSync)}
          </p>
        )}
        {syncMessage && (
          <p style={{ fontSize: '14px', color: theme.accent, textAlign: 'center', marginTop: '8px' }}>
            {syncMessage}
          </p>
        )}
        
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            marginTop: '16px',
            backgroundColor: theme.background,
            borderRadius: '8px',
            cursor: 'pointer',
            border: `1px solid ${theme.border}`,
          }}
          onClick={() => navigate('/cloud-settings')}
        >
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: theme.text, marginBottom: '4px' }}>
              Cloud Sync Settings
            </div>
            <div style={{ fontSize: '12px', color: theme.textSecondary }}>
              Choose which fields sync to cloud
            </div>
          </div>
          <ChevronRight size={20} color={theme.textSecondary} />
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <Palette size={20} />
          Appearance
        </h2>
        
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            marginBottom: '16px',
            backgroundColor: theme.background,
            borderRadius: '8px',
            cursor: 'pointer',
            border: `1px solid ${theme.border}`,
          }}
          onClick={() => navigate('/ui-settings')}
        >
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: theme.text, marginBottom: '4px' }}>
              Display Settings
            </div>
            <div style={{ fontSize: '12px', color: theme.textSecondary }}>
              Customize font size, layout, and spacing
            </div>
          </div>
          <ChevronRight size={20} color={theme.textSecondary} />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: theme.text, marginBottom: '12px' }}>
            Default Themes
          </h3>
          <div style={styles.themeGrid}>
            {Object.values(defaultThemes).map((t) => (
              <div
                key={t.id}
                style={{
                  ...styles.themeOption,
                  borderColor: currentTheme === t.id ? theme.accent : theme.border,
                  backgroundColor: currentTheme === t.id ? `${theme.accent}10` : 'transparent',
                }}
                onClick={() => changeTheme(t.id)}
              >
                <div style={{ ...styles.themeColor, backgroundColor: t.accent }} />
                <span style={styles.themeLabel}>{t.name}</span>
                {currentTheme === t.id && <Check size={16} color={theme.accent} />}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: theme.text }}>
              Custom Themes
            </h3>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: theme.accent,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/custom-theme')}
            >
              <Plus size={16} />
              Create Theme
            </button>
          </div>

          {customThemes.length > 0 ? (
            <div style={styles.themeGrid}>
              {customThemes.map((t) => (
                <div
                  key={t.id}
                  style={{
                    ...styles.themeOption,
                    borderColor: currentTheme === t.id ? theme.accent : theme.border,
                    backgroundColor: currentTheme === t.id ? `${theme.accent}10` : 'transparent',
                  }}
                >
                  <div
                    style={{ ...styles.themeColor, backgroundColor: t.accent }}
                    onClick={() => changeTheme(t.id)}
                  />
                  <span
                    style={{ ...styles.themeLabel, cursor: 'pointer' }}
                    onClick={() => changeTheme(t.id)}
                  >
                    {t.name}
                  </span>
                  {currentTheme === t.id && <Check size={16} color={theme.accent} />}
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: theme.textSecondary,
                      padding: '4px',
                    }}
                    onClick={() => navigate('/custom-theme', { state: { editTheme: t } })}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: theme.danger,
                      padding: '4px',
                    }}
                    onClick={() => {
                      if (window.confirm(`Delete theme "${t.name}"?`)) {
                        deleteCustomTheme(t.id);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: theme.textSecondary, fontSize: '14px', fontStyle: 'italic' }}>
              No custom themes yet. Create one to get started!
            </p>
          )}
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <Tag size={20} />
          Custom Tags
        </h2>
        <div style={styles.tagInputContainer}>
          <input
            type="text"
            style={styles.tagInput}
            placeholder="Create new tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addNewTag()}
          />
          <button style={styles.addButton} onClick={addNewTag}>
            <Plus size={20} />
          </button>
        </div>

        {userTags.length > 0 && (
          <div>
            <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '8px' }}>
              Your Tags:
            </p>
            <div style={styles.tagsContainer}>
              {userTags.map(tag => (
                <div key={tag} style={styles.tag}>
                  <span>{tag}</span>
                  <button style={styles.deleteButton} onClick={() => deleteTag(tag)}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <Info size={20} />
          About
        </h2>
        <div style={styles.aboutContainer}>
          <div style={styles.aboutText}>EZournals v1.0</div>
          <div style={styles.aboutSubtext}>Capture your thoughts and memories</div>
        </div>
      </div>
    </div>
  );
}
