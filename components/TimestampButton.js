import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function TimestampButton({ onInsertTimestamp }) {
  const { theme } = useTheme();

  if (!theme) return null;

  const insertTimestamp = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const timestamp = `<t:${timeString}>`;
    onInsertTimestamp(timestamp);
  };

  const styles = createStyles(theme);

  return (
    <TouchableOpacity style={styles.button} onPress={insertTimestamp}>
      <Ionicons name="time-outline" size={16} color={theme.text} />
      <Text style={styles.buttonText}>Time</Text>
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
  buttonText: {
    fontSize: 12,
    color: theme.text,
    marginLeft: 4
  }
});