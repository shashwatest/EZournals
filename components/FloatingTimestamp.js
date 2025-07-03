import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export default function FloatingTimestamp({ eventTime, onTimeChange, visible, onDismiss }) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible && !eventTime) {
      const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      onTimeChange(currentTime);
    }
    
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

  const quickTimeOptions = [
    { label: 'Now', getValue: () => new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) },
    { label: '1h ago', getValue: () => {
      const time = new Date();
      time.setHours(time.getHours() - 1);
      return time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }},
    { label: '2h ago', getValue: () => {
      const time = new Date();
      time.setHours(time.getHours() - 2);
      return time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }}
  ];

  const handleQuickTime = (option) => {
    const time = option.getValue();
    onTimeChange(time);
    onDismiss();
  };

  const handleCustomTime = () => {
    if (customTime.trim()) {
      onTimeChange(customTime.trim());
      setCustomTime('');
      setShowCustomInput(false);
      onDismiss();
    }
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>When did this happen?</Text>
          <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.optionsContainer}>
          {quickTimeOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.option}
              onPress={() => handleQuickTime(option)}
            >
              <Text style={styles.optionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={styles.option}
            onPress={() => setShowCustomInput(!showCustomInput)}
          >
            <Text style={styles.optionText}>Custom time</Text>
          </TouchableOpacity>
        </View>

        {showCustomInput && (
          <View style={styles.customInputContainer}>
            <TextInput
              style={styles.customInput}
              placeholder="e.g., 2:30 PM"
              value={customTime}
              onChangeText={setCustomTime}
              onSubmitEditing={handleCustomTime}
              autoFocus
            />
            <TouchableOpacity style={styles.setButton} onPress={handleCustomTime}>
              <Text style={styles.setButtonText}>Set</Text>
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
    marginBottom: theme.spacing.sm
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs
  },
  option: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  optionText: {
    fontSize: 14,
    color: theme.colors.text
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    fontSize: 14
  },
  setButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm
  },
  setButtonText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '600'
  }
});