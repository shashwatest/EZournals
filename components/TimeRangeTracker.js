import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export default function TimeRangeTracker({ timeRange, onTimeRangeChange, visible, onDismiss }) {
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const startTracking = () => {
    const now = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    setStartTime(now);
    setEndTime('ongoing');
    setIsTracking(true);
    onTimeRangeChange({ start: now, end: 'ongoing' });
  };

  const stopTracking = () => {
    const now = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    setEndTime(now);
    setIsTracking(false);
    onTimeRangeChange({ start: startTime, end: now });
    onDismiss();
  };

  const setCustomRange = (start, end) => {
    setStartTime(start);
    setEndTime(end);
    onTimeRangeChange({ start, end });
    onDismiss();
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Track Time Range</Text>
          <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {!isTracking ? (
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.startButton} onPress={startTracking}>
              <Ionicons name="play" size={20} color={theme.colors.surface} />
              <Text style={styles.startButtonText}>Start Now</Text>
            </TouchableOpacity>
            
            <View style={styles.quickOptions}>
              <TouchableOpacity 
                style={styles.quickOption} 
                onPress={() => setCustomRange('9:00 AM', '12:00 PM')}
              >
                <Text style={styles.quickOptionText}>Morning (9-12)</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickOption} 
                onPress={() => setCustomRange('1:00 PM', '5:00 PM')}
              >
                <Text style={styles.quickOptionText}>Afternoon (1-5)</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickOption} 
                onPress={() => setCustomRange('6:00 PM', '9:00 PM')}
              >
                <Text style={styles.quickOptionText}>Evening (6-9)</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.trackingContainer}>
            <View style={styles.trackingInfo}>
              <Text style={styles.trackingText}>Started: {startTime}</Text>
              <Text style={styles.ongoingText}>Status: Ongoing</Text>
            </View>
            <TouchableOpacity style={styles.stopButton} onPress={stopTracking}>
              <Ionicons name="stop" size={20} color={theme.colors.surface} />
              <Text style={styles.stopButtonText}>Stop</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 1000
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.medium
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text
  },
  closeButton: {
    padding: theme.spacing.xs
  },
  optionsContainer: {
    alignItems: 'center'
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md
  },
  startButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.sm
  },
  quickOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs
  },
  quickOption: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  quickOptionText: {
    fontSize: 12,
    color: theme.colors.text
  },
  trackingContainer: {
    alignItems: 'center'
  },
  trackingInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  trackingText: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs
  },
  ongoingText: {
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: '500'
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.danger,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md
  },
  stopButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.sm
  }
});