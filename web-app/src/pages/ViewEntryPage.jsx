import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft } from 'lucide-react';

export default function ViewEntryPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();

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
    content: {
      flex: 1,
      overflow: 'auto',
      padding: '32px',
    },
    text: {
      maxWidth: '800px',
      margin: '0 auto',
      color: theme.text,
      fontSize: '18px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back
        </button>
      </div>
      <div style={styles.content}>
        <div style={styles.text}>View Entry Page - Coming Soon</div>
      </div>
    </div>
  );
}
