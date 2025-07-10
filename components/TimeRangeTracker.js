import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function TimeRangeTracker({ timeRange, onTimeRangeChange, visible, onDismiss }) {
  const { theme } = useTheme();
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  if (!theme) return null;

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

  const styles = createStyles(theme);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Track Time Range</Text>
          <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {!isTracking ? (
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.startButton} onPress={startTracking}>
              <Ionicons name="play" size={20} color={theme.surface} />
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
              <Ionicons name="stop" size={20} color={theme.surface} />
              <Text style={styles.stopButtonText}>Stop</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    zIndex: 1000
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text
  },
  closeButton: {
    padding: 4
  },
  optionsContainer: {
    alignItems: 'center'
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.success,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16
  },
  startButtonText: {
    color: theme.surface,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  quickOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4
  },
  quickOption: {
    backgroundColor: theme.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border
  },
  quickOptionText: {
    fontSize: 12,
    color: theme.text
  },
  trackingContainer: {
    alignItems: 'center'
  },
  trackingInfo: {
    alignItems: 'center',
    marginBottom: 16
  },
  trackingText: {
    fontSize: 16,
    color: theme.text,
    marginBottom: 4
  },
  ongoingText: {
    fontSize: 14,
    color: theme.success,
    fontWeight: '500'
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.danger,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12
  },
  stopButtonText: {
    color: theme.surface,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  }
});