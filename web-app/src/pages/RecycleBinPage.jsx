import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/entryUtils';
import ConfirmDialog from '../components/ConfirmDialog';
import { getRecycleBin, saveToRecycleBin, saveEntry } from '../utils/storage';

export default function RecycleBinPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deletedEntries, setDeletedEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogState, setDialogState] = useState({ type: null, entry: null });

  useEffect(() => {
    loadDeletedEntries();
  }, [user]);

  const loadDeletedEntries = async () => {
    setLoading(true);
    try {
      const entries = await getRecycleBin();
      setDeletedEntries(entries);
    } catch (error) {
      console.error('Error loading deleted entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const restoreEntry = async (entry) => {
    try {
      const { deletedAt, ...entryData } = entry;
      // Restore using storage.js utilities
      await saveEntry(entryData);
      
      const updatedBin = deletedEntries.filter(e => e.id !== entry.id);
      await saveToRecycleBin(updatedBin);
      setDeletedEntries(updatedBin);
    } catch (error) {
      console.error('Error restoring entry:', error);
    } finally {
      setDialogState({ type: null, entry: null });
    }
  };

  const permanentDelete = async (entryId) => {
    try {
      const updatedBin = deletedEntries.filter(e => e.id !== entryId);
      await saveToRecycleBin(updatedBin);
      setDeletedEntries(updatedBin);
    } catch (error) {
      console.error('Error deleting entry:', error);
    } finally {
      setDialogState({ type: null, entry: null });
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
      flex: 1,
    },
    content: {
      flex: 1,
      overflow: 'auto',
      padding: '32px',
    },
    entryCard: {
      backgroundColor: theme.surface,
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      border: `1px solid ${theme.border}`,
    },
    entryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
    },
    entryDate: {
      fontSize: '12px',
      color: theme.textSecondary,
      fontWeight: '500',
    },
    entryActions: {
      display: 'flex',
      gap: '8px',
    },
    actionButton: {
      padding: '8px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    restoreButton: {
      color: theme.accent,
    },
    deleteButton: {
      color: theme.danger || '#DC143C',
    },
    entryPreview: {
      fontSize: '14px',
      color: theme.text,
      lineHeight: '1.6',
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
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
        <button style={styles.backButton} onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back
        </button>
        <span style={styles.headerTitle}>Recycle Bin</span>
      </div>

      <div style={styles.content}>
        {loading ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyText}>Loading...</div>
          </div>
        ) : deletedEntries.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <Trash2 size={64} color={theme.textLight} />
            </div>
            <div style={styles.emptyText}>Recycle bin is empty</div>
            <div style={styles.emptySubtext}>Deleted entries will appear here</div>
          </div>
        ) : (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {deletedEntries.map(entry => (
              <div key={entry.id} style={styles.entryCard}>
                <div style={styles.entryHeader}>
                  <div style={styles.entryDate}>{formatDate(entry.date)}</div>
                  <div style={styles.entryActions}>
                    <button
                      style={{ ...styles.actionButton, ...styles.restoreButton }}
                      onClick={() => setDialogState({ type: 'restore', entry })}
                      title="Restore"
                    >
                      <RefreshCw size={18} />
                    </button>
                    <button
                      style={{ ...styles.actionButton, ...styles.deleteButton }}
                      onClick={() => setDialogState({ type: 'delete', entry })}
                      title="Delete Forever"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div style={styles.entryPreview}>
                  {entry.content?.substring(0, 150)}
                  {entry.content?.length > 150 ? '...' : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={Boolean(dialogState.entry)}
        title={dialogState.type === 'restore' ? 'Restore Entry?' : 'Delete Entry Forever?'}
        message={
          dialogState.type === 'restore'
            ? 'The entry will be restored to your journal and removed from the recycle bin.'
            : 'This will permanently delete the entry. This action cannot be undone.'
        }
        confirmLabel={dialogState.type === 'restore' ? 'Restore Entry' : 'Delete Forever'}
        cancelLabel="Cancel"
        confirmTone={dialogState.type === 'restore' ? 'accent' : 'danger'}
        onCancel={() => setDialogState({ type: null, entry: null })}
        onConfirm={() => {
          if (!dialogState.entry) return;
          if (dialogState.type === 'restore') {
            restoreEntry(dialogState.entry);
          } else {
            permanentDelete(dialogState.entry.id);
          }
        }}
        theme={theme}
      />
    </div>
  );
}
