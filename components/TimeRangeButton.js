import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function TimeRangeButton({ onInsertTimeRange, value, onChangeText }) {
  const { theme } = useTheme();
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [startPosition, setStartPosition] = useState(0);

  if (!theme) return null;

  const toggleTimeRange = () => {
    if (!isTracking) {
      // Start tracking
      setStartTime(new Date());
      setStartPosition(value.length);
      setIsTracking(true);
      onInsertTimeRange('<rs>');
    } else {
      // Stop tracking and wrap content with range markers
      const endTime = new Date();
      const startTimeString = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const endTimeString = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const beforeStart = value.substring(0, startPosition);
      const rangeContent = value.substring(startPosition + 4); // +4 for '<rs>'
      const wrappedContent = beforeStart + `<rs:${startTimeString}-${endTimeString}>` + rangeContent + '<re>';
      
      onChangeText(wrappedContent);
      setIsTracking(false);
      setStartTime(null);
    }
  };

  const styles = createStyles(theme);

  return (
    <TouchableOpacity 
      style={[styles.button, isTracking && styles.activeButton]} 
      onPress={toggleTimeRange}
    >
      <Ionicons 
        name={isTracking ? "stop-outline" : "timer-outline"} 
        size={16} 
        color={isTracking ? theme.surface : theme.text} 
      />
      <Text style={[styles.buttonText, isTracking && styles.activeButtonText]}>
        {isTracking ? 'Stop' : 'Range'}
      </Text>
    </TouchableOpacity>
  );
}

const createStyles = (theme) => StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 4,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border
  },
  activeButton: {
    backgroundColor: theme.accent
  },
  buttonText: {
    fontSize: 12,
    color: theme.text,
    marginLeft: 4
  },
  activeButtonText: {
    color: theme.surface
  }
});