import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function AppGlassBackground() {
  const { currentTheme } = useTheme();

  if (currentTheme !== 'glassmorphism') {
    return null;
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.base} />
      <View style={[styles.orb, styles.orbTopLeft]} />
      <View style={[styles.orb, styles.orbTopRight]} />
      <View style={[styles.orb, styles.orbBottom]} />
      <View style={styles.veil} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbTopLeft: {
    width: 280,
    height: 280,
    top: -40,
    left: -60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  orbTopRight: {
    width: 220,
    height: 220,
    top: 90,
    right: -40,
    backgroundColor: 'rgba(160, 255, 240, 0.08)',
  },
  orbBottom: {
    width: 320,
    height: 320,
    bottom: -100,
    left: 40,
    backgroundColor: 'rgba(255, 190, 210, 0.06)',
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
});
