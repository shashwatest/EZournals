import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { fullSync, getLastSyncTime } from '../../backend/firebase/cloudStorage';
import { auth } from '../../backend/firebase/config';

export default function SyncIndicator({ onSyncComplete }) {
  const { theme } = useTheme();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'success', 'error'

  useEffect(() => {
    loadLastSyncTime();
    
    // Auto-sync on mount if user is logged in
    if (auth.currentUser) {
      handleSync(true); // Silent sync
    }
  }, []);

  const loadLastSyncTime = async () => {
    const time = await getLastSyncTime();
    setLastSync(time);
  };

  const handleSync = async (silent = false) => {
    if (!auth.currentUser) {
      if (!silent) {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 2000);
      }
      return;
    }

    setSyncing(true);
    setSyncStatus('syncing');

    try {
      const result = await fullSync();
      
      if (result.success) {
        setSyncStatus('success');
        await loadLastSyncTime();
        
        if (onSyncComplete) {
          onSyncComplete(result);
        }
        
        setTimeout(() => setSyncStatus('idle'), 2000);
      } else {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <ActivityIndicator size="small" color={theme.accent} />;
      case 'success':
        return <Ionicons name="checkmark-circle" size={20} color={theme.success} />;
      case 'error':
        return <Ionicons name="alert-circle" size={20} color={theme.danger} />;
      default:
        return <Ionicons name="cloud-outline" size={20} color={theme.textSecondary} />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return 'Synced';
      case 'error':
        return 'Sync failed';
      default:
        return lastSync ? `Last sync: ${formatTime(lastSync)}` : 'Not synced';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!auth.currentUser) {
    return null; // Don't show if not logged in
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.surface }]}
      onPress={() => handleSync(false)}
      disabled={syncing}
    >
      {getStatusIcon()}
      <Text style={[styles.text, { color: theme.textSecondary }]}>
        {getStatusText()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  text: {
    fontSize: 13,
  },
});
