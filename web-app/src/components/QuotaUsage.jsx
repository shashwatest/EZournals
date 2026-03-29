import React, { useState, useEffect } from 'react';
import { Cloud, Info } from 'lucide-react';
import { getQuotaUsage } from '../utils/mediaUpload';
import { useTheme } from '../contexts/ThemeContext';

export default function QuotaUsage() {
  const { theme } = useTheme();
  const [usage, setUsage] = useState({ bytesUsed: 0, limit: 30 * 1024 * 1024 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuota();
  }, []);

  const fetchQuota = async () => {
    const data = await getQuotaUsage();
    setUsage(data);
    setLoading(false);
  };

  const usedMB = (usage.bytesUsed / (1024 * 1024)).toFixed(1);
  const limitMB = (usage.limit / (1024 * 1024)).toFixed(0);
  const percentage = Math.min(100, (usage.bytesUsed / usage.limit) * 100);

  const styles = {
    container: {
      padding: '20px',
      borderRadius: '16px',
      backgroundColor: theme.surface,
      border: `1px solid ${theme.border}`,
      marginBottom: '24px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
    },
    titleRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: theme.text,
      fontSize: '15px',
      fontWeight: '600',
    },
    usageText: {
      fontSize: '14px',
      color: theme.textSecondary,
      fontWeight: '500',
    },
    progressBarContainer: {
      height: '8px',
      width: '100%',
      backgroundColor: theme.background,
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '10px',
    },
    progressBar: {
      height: '100%',
      width: `${percentage}%`,
      backgroundColor: theme.accent,
      transition: 'width 0.5s ease-out',
      borderRadius: '4px',
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      color: theme.textLight,
      fontStyle: 'italic',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <Cloud size={18} color={theme.accent} />
          Daily Media Storage
        </div>
        <div style={styles.usageText}>
          {usedMB} MB / {limitMB} MB used
        </div>
      </div>
      
      <div style={styles.progressBarContainer}>
        <div style={styles.progressBar} />
      </div>
      
      <div style={styles.footer}>
        <Info size={14} />
        Quota resets daily. You have {( (usage.limit - usage.bytesUsed) / (1024 * 1024) ).toFixed(1)} MB remaining.
      </div>
    </div>
  );
}
