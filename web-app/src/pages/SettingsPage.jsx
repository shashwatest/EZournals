import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsPage() {
  const { theme } = useTheme();

  const styles = {
    container: {
      padding: '32px',
      color: theme.text,
    },
    title: {
      fontSize: '28px',
      fontWeight: '600',
      marginBottom: '24px',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Settings</h1>
      <p>Settings page - Coming Soon</p>
    </div>
  );
}
