import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function LoadingScreen({ message = 'Loading...' }) {
  const { theme } = useTheme();
  const { getFontFamily, getFontSizes } = require('../contexts/UISettingsContext').useUISettings();
  const fontFamily = getFontFamily();
  const fontSizes = getFontSizes();

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.accent} />
      <Text style={[styles.message, { fontFamily, fontSize: fontSizes.base }]}>{message}</Text>
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