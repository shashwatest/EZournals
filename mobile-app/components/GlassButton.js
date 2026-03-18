import React, { useState, useRef, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function GlassButton({ 
  onPress, 
  children, 
  style, 
  textStyle,
  disabled = false,
  icon = null,
  isIconButton = false
}) {
  const { theme } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Animation value for scale
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const isInteracting = isHovered || isPressed;
    const targetScale = isInteracting
      ? (isIconButton ? (theme.is3D ? 1.1 : 1.05) : (theme.is3D ? 1.05 : (theme.buttonHover?.transform?.[0]?.scale || 1.03)))
      : 1;

    Animated.timing(scaleAnim, {
      toValue: targetScale,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [isHovered, isPressed, theme.is3D, isIconButton]);

  const handlePressIn = () => setIsPressed(true);
  const handlePressOut = () => setIsPressed(false);
  
  const handleMouseEnter = () => {
    if (Platform.OS === 'web') setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    if (Platform.OS === 'web') setIsHovered(false);
  };

  const isInteracting = isHovered || isPressed;

  const iconButtonBaseStyle = isIconButton ? {
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 24, // Round for icons
  } : {};

  const iconButtonHoverStyle = (isIconButton && isInteracting) ? {
    backgroundColor: theme.is3D ? theme.surfaceHover : 'rgba(0,0,0,0.05)',
  } : {};

  const regularHoverStyle = (!isIconButton && isInteracting && theme.buttonHover) ? {
    backgroundColor: theme.buttonHover.backgroundColor,
    borderColor: theme.buttonHover.borderColor,
    shadowOpacity: theme.is3D ? 0.2 : theme.buttonHover.shadowOpacity,
    shadowOffset: theme.is3D ? { width: 0, height: 6 } : theme.glossyButton?.shadowOffset,
    shadowRadius: theme.is3D ? 12 : theme.glossyButton?.shadowRadius,
  } : {};

  const buttonStyle = [
    styles.button,
    !isIconButton && theme.glossyButton && {
      backgroundColor: theme.glossyButton.backgroundColor,
      borderWidth: theme.glossyButton.borderWidth,
      borderColor: theme.glossyButton.borderColor,
      shadowColor: theme.glossyButton.shadowColor,
      shadowOffset: theme.glossyButton.shadowOffset,
      shadowOpacity: theme.glossyButton.shadowOpacity,
      shadowRadius: theme.glossyButton.shadowRadius,
      elevation: theme.glossyButton.elevation,
    },
    iconButtonBaseStyle,
    regularHoverStyle,
    iconButtonHoverStyle,
    disabled && styles.disabled,
    style,
    { transform: [{ scale: scaleAnim }] } // Apply animated scale
  ];

  const webProps = Platform.OS === 'web' ? {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  } : {};

  return (
    <AnimatedTouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
      {...webProps}
    >
      {icon}
      {children && (
        <Text style={[styles.text, { color: theme.text }, textStyle]}>
          {children}
        </Text>
      )}
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    transition: 'all 0.3s ease',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
