import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function GlassButton({ 
  onPress, 
  children, 
  style, 
  textStyle,
  disabled = false,
  icon = null 
}) {
  const { theme } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handlePressIn = () => setIsPressed(true);
  const handlePressOut = () => setIsPressed(false);
  
  const handleMouseEnter = () => {
    if (Platform.OS === 'web') setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    if (Platform.OS === 'web') setIsHovered(false);
  };

  const buttonStyle = [
    styles.button,
    theme.glossyButton && {
      backgroundColor: theme.glossyButton.backgroundColor,
      borderWidth: theme.glossyButton.borderWidth,
      borderColor: theme.glossyButton.borderColor,
      shadowColor: theme.glossyButton.shadowColor,
      shadowOffset: theme.glossyButton.shadowOffset,
      shadowOpacity: theme.glossyButton.shadowOpacity,
      shadowRadius: theme.glossyButton.shadowRadius,
      elevation: theme.glossyButton.elevation,
    },
    (isHovered || isPressed) && theme.buttonHover && {
      backgroundColor: theme.buttonHover.backgroundColor,
      borderColor: theme.buttonHover.borderColor,
      shadowOpacity: theme.buttonHover.shadowOpacity,
      transform: theme.buttonHover.transform,
    },
    disabled && styles.disabled,
    style,
  ];

  const webProps = Platform.OS === 'web' ? {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  } : {};

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
      {...webProps}
    >
      {icon}
      <Text style={[styles.text, { color: theme.text }, textStyle]}>
        {children}
      </Text>
    </TouchableOpacity>
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
