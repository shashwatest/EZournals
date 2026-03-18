import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function GlassCard({ children, style, onPress }) {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const isInteracting = isHovered || isPressed;
    const targetScale = isInteracting
      ? (theme.is3D ? 1.03 : 1.02)
      : 1;

    Animated.timing(scaleAnim, {
      toValue: targetScale,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [isHovered, isPressed, theme.is3D]);

  const handleMouseEnter = () => {
    if (Platform.OS === 'web') setIsHovered(true);
  };
  
  const handlePressIn = () => setIsPressed(true);
  const handlePressOut = () => setIsPressed(false);
  const isInteracting = isHovered || isPressed;

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
    isInteracting && {
      backgroundColor: theme.surfaceHover,
      borderColor: theme.borderGlow,
      shadowOpacity: theme.glass?.shadowOpacity ? theme.glass.shadowOpacity * 1.5 : 0.45,
      shadowOffset: theme.is3D ? { width: 0, height: 8 } : theme.glass?.shadowOffset,
      shadowRadius: theme.is3D ? 16 : theme.glass?.shadowRadius,
    },
    style,
    { transform: [{ scale: scaleAnim }] }
  ];

  const webProps = Platform.OS === 'web' ? {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  } : {};

  if (onPress) {
    return (
      <AnimatedTouchableOpacity
        style={cardStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        {...webProps}
      >
        {children}
      </AnimatedTouchableOpacity>
    );
  }

  return (
    <Animated.View
      style={cardStyle}
      {...webProps}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    transition: 'all 0.3s ease',
  },
});
