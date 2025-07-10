import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function LoadingScreen({ message = 'Loading...' }) {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.accent} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: theme.textSecondary
  }
});