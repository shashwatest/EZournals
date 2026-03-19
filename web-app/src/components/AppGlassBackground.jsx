import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function AppGlassBackground() {
  const { currentTheme } = useTheme();

  if (currentTheme !== 'glassmorphism') {
    return null;
  }

  const styles = {
    root: {
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden',
      background:
        'radial-gradient(circle at 14% 18%, rgba(255,255,255,0.14), transparent 24%), radial-gradient(circle at 84% 16%, rgba(154,255,235,0.12), transparent 22%), radial-gradient(circle at 52% 78%, rgba(255,182,193,0.1), transparent 28%), linear-gradient(180deg, #020202 0%, #000000 48%, #050505 100%)',
    },
    veil: {
      position: 'absolute',
      inset: 0,
      background:
        'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 34%, transparent 66%, rgba(255,255,255,0.02) 100%)',
    },
  };

  return (
    <div style={styles.root}>
      <div style={styles.veil} />
    </div>
  );
}
