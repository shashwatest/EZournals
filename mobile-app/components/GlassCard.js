import React, { useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function GlassCard({ children, style, onPress }) {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    if (Platform.OS === 'web') setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    if (Platform.OS === 'web') setIsHovered(false);
  };

  const cardStyle = [
    styles.card,
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
      backgroundColor: theme.surfaceHover,
      borderColor: theme.borderGlow,
      shadowOpacity: theme.glass?.shadowOpacity ? theme.glass.shadowOpacity * 1.5 : 0.45,
      transform: [{ scale: 1.02 }],
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
    borderRadius: 16,
    padding: 16,
    transition: 'all 0.3s ease',
  },
});
