import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export default function TimeStampPicker({ eventTime, onTimeChange }) {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [customTime, setCustomTime] = useState('');

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
          color={theme.colors.textSecondary} 
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

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface
  },
  selectorText: {
    fontSize: 16,
    color: theme.colors.text
  },
  options: {
    marginTop: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface
  },
  option: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  optionText: {
    fontSize: 16,
    color: theme.colors.text
  },
  customTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm
  },
  customTimeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    fontSize: 14
  },
  setTimeButton: {
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm
  },
  setTimeButtonText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '600'
  }
});