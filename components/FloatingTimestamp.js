import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function FloatingTimestamp({ eventTime, onTimeChange, visible, onDismiss }) {
  const { theme } = useTheme();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  if (!theme) return null;

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

  const styles = createStyles(theme);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>When did this happen?</Text>
          <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={theme.textSecondary} />
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
    marginBottom: 8
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4
  },
  option: {
    backgroundColor: theme.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border
  },
  optionText: {
    fontSize: 14,
    color: theme.text
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14
  },
  setButton: {
    backgroundColor: theme.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  setButtonText: {
    color: theme.surface,
    fontSize: 14,
    fontWeight: '600'
  }
});