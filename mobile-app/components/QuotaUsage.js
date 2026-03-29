import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getQuotaUsage } from '../../backend/utils/mediaUpload';
import { useTheme } from '../contexts/ThemeContext';

export default function QuotaUsage({ fontFamily }) {
  const { theme } = useTheme();
  const [usage, setUsage] = useState({ bytesUsed: 0, limit: 30 * 1024 * 1024 });
  const [loading, setLoading] = useState(true);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchQuota();
  }, []);

  const fetchQuota = async () => {
    const data = await getQuotaUsage();
    setUsage(data);
    setLoading(false);
    
    const percentage = Math.min(100, (data.bytesUsed / data.limit) * 100);
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const usedMB = (usage.bytesUsed / (1024 * 1024)).toFixed(1);
  const limitMB = (usage.limit / (1024 * 1024)).toFixed(0);
  const percentage = Math.min(100, (usage.bytesUsed / usage.limit) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="cloud-upload-outline" size={18} color={theme.accent} />
          <Text style={[styles.title, { color: theme.text, fontFamily }]}>Daily Media Quota</Text>
        </View>
        <Text style={[styles.usageText, { color: theme.textSecondary, fontFamily }]}>
          {usedMB}MB / {limitMB}MB
        </Text>
      </View>
      
      <View style={[styles.progressBarContainer, { backgroundColor: theme.border }]}>
        <Animated.View 
          style={[
            styles.progressBar, 
            { 
              backgroundColor: theme.accent,
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              })
            }
          ]} 
        />
      </View>
      
      <Text style={[styles.hint, { color: theme.textLight, fontFamily }]}>
        Reset in {24 - new Date().getHours()} hours
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  usageText: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  hint: {
    fontSize: 11,
    fontStyle: 'italic',
  },
});
