import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Save } from 'lucide-react';

export default function AddEntryPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    
    setSaving(true);
    try {
      const entry = {
        content,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        date: new Date().toISOString(),
        userId: user.uid,
        updatedAt: new Date().toISOString(),
      };
      
      await addDoc(collection(db, 'entries'), entry);
      navigate('/');
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry');
    } finally {
      setSaving(false);
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
      justifyContent: 'space-between',
      alignItems: 'center',
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
    saveButton: {
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
    content: {
      flex: 1,
      overflow: 'auto',
      padding: '32px',
    },
    form: {
      maxWidth: '800px',
      margin: '0 auto',
    },
    textarea: {
      width: '100%',
      minHeight: '400px',
      padding: '20px',
      borderRadius: '12px',
      border: `1px solid ${theme.border}`,
      backgroundColor: theme.surface,
      color: theme.text,
      fontSize: '16px',
      lineHeight: '1.6',
      resize: 'vertical',
      outline: 'none',
      fontFamily: 'inherit',
    },
    inputGroup: {
      marginTop: '20px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: theme.textSecondary,
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '12px',
      border: `1px solid ${theme.border}`,
      backgroundColor: theme.surface,
      color: theme.text,
      fontSize: '16px',
      outline: 'none',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back
        </button>
        <button style={styles.saveButton} onClick={handleSave} disabled={saving}>
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Entry'}
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.form}>
          <textarea
            style={styles.textarea}
            placeholder="Write your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Tags (comma separated)</label>
            <input
              type="text"
              style={styles.input}
              placeholder="work, personal, ideas"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
