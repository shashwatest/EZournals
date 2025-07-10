import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function TimeStampPicker({ eventTime, onTimeChange }) {
  const { theme } = useTheme();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [customTime, setCustomTime] = useState('');

  if (!theme) return null;

  useEffect(() => {
    if (!eventTime) {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      onTimeChange(timeString);
    }
  }, []);

  const quickTimeOptions = [
    { label: 'Now', getValue: () => new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) },
    { label: '1 hour ago', getValue: () => {
      const time = new Date();
      time.setHours(time.getHours() - 1);
      return time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }},
    { label: '2 hours ago', getValue: () => {
      const time = new Date();
      time.setHours(time.getHours() - 2);
      return time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }},
    { label: 'This morning (9:00 AM)', getValue: () => '9:00 AM' }
  ];

  const handleQuickTime = (option) => {
    const time = option.getValue();
    onTimeChange(time);
    setShowTimePicker(false);
  };

  const handleCustomTime = () => {
    if (customTime.trim()) {
      onTimeChange(customTime.trim());
      setCustomTime('');
      setShowTimePicker(false);
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Time of event</Text>
      
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => setShowTimePicker(!showTimePicker)}
      >
        <Text style={styles.selectorText}>{eventTime || 'Select time'}</Text>
        <Ionicons 
          name={showTimePicker ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={theme.textSecondary} 
        />
      </TouchableOpacity>

      {showTimePicker && (
        <View style={styles.options}>
          {quickTimeOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.option}
              onPress={() => handleQuickTime(option)}
            >
              <Text style={styles.optionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
          
          <View style={styles.customTimeContainer}>
            <TextInput
              style={styles.customTimeInput}
              placeholder="Enter time (e.g., 2:30 PM)"
              value={customTime}
              onChangeText={setCustomTime}
              onSubmitEditing={handleCustomTime}
            />
            <TouchableOpacity style={styles.setTimeButton} onPress={handleCustomTime}>
              <Text style={styles.setTimeButtonText}>Set</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: 16
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 16,
    backgroundColor: theme.surface
  },
  selectorText: {
    fontSize: 16,
    color: theme.text
  },
  options: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.surface
  },
  option: {
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border
  },
  optionText: {
    fontSize: 16,
    color: theme.text
  },
  customTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  customTimeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14
  },
  setTimeButton: {
    marginLeft: 8,
    backgroundColor: theme.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  setTimeButtonText: {
    color: theme.surface,
    fontSize: 14,
    fontWeight: '600'
  }
});