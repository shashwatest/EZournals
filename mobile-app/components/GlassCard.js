import React, { useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function GlassCard({ children, style, onPress, themeOverride }) {
  const { theme: contextTheme } = useTheme();
  const theme = themeOverride || contextTheme;
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    if (Platform.OS === 'web') setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    if (Platform.OS === 'web') setIsHovered(false);
  };

  const cardStyle = [
    styles.card,
    { borderRadius: theme.cardRadius || 16 },
    theme.glass && {
      backgroundColor: theme.glass.backgroundColor,
      borderWidth: theme.glass.borderWidth,
      borderColor: theme.glass.borderColor,
      shadowColor: theme.glass.shadowColor,
      shadowOffset: theme.glass.shadowOffset,
      shadowOpacity: theme.glass.shadowOpacity,
      shadowRadius: theme.glass.shadowRadius,
      elevation: theme.glass.elevation,
    },
    isHovered && {
      // Keep same background on hover (no color flash)
      shadowOpacity: theme.glass?.shadowOpacity ? theme.glass.shadowOpacity * 1.2 : 0.2,
      transform: [{ scale: 1.008 }],
    },
    style,
  ];

  const webProps = Platform.OS === 'web' ? {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  } : {};

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={cardStyle}
      onPress={onPress}
      activeOpacity={0.9}
      {...webProps}
    >
      {children}
    </Component>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    transition: 'all 0.3s ease',
  },
});
