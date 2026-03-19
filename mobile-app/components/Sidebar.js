import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, StatusBar } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { getGlassBackdropStyle, getGlassPanelStyle, getGlassSheenStyle, isGlassTheme as isGlassThemeEnabled } from '../utils/glassStyles';

export default function Sidebar({ visible, onClose, navigation, isPersistent = false, themeOverride }) {
  const { theme: contextTheme, currentTheme } = useTheme();
  const theme = themeOverride || contextTheme;
  const isGlassTheme = isGlassThemeEnabled(currentTheme);
  const { getFontFamily, getFontSizes } = require('../contexts/UISettingsContext').useUISettings();
  const fontFamily = getFontFamily();
  const fontSizes = getFontSizes();
  
  if (!theme) return null;
  
  const menuItems = [
    { icon: 'home-outline', label: 'Home', screen: 'Home' },
    { icon: 'calendar-outline', label: 'Navigate', screen: 'Navigate' },
    { icon: 'analytics-outline', label: 'Overview', screen: 'Overview' },
    { icon: 'trash-outline', label: 'Recycle Bin', screen: 'RecycleBin' },
  ];

  const aiItems = [
    { icon: 'sparkles-outline', label: 'AI Settings', screen: 'AISettings' },
    { icon: 'analytics-outline', label: 'Insights', screen: 'Insights' },
  ];

  const settingsItems = [
    { icon: 'settings-outline', label: 'Settings', screen: 'Settings' },
  ];

  const handleNavigation = (screen) => {
    if (!isPersistent) {
      onClose();
    }
    if (screen !== 'Home') {
      navigation.navigate(screen);
    }
  };
  
  // Desktop persistent sidebar (no modal)
  if (isPersistent) {
    return (
      <View
        style={[
          styles.sidebar,
          styles.persistentSidebar,
          isGlassTheme
            ? [getGlassPanelStyle(theme, currentTheme), styles.glassSidebar]
            : { backgroundColor: theme.surface, borderRightWidth: 1, borderRightColor: theme.border },
        ]}
      >
        {isGlassTheme && <BlurView intensity={25} tint="dark" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />}
        {isGlassTheme && <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.glassSheen, getGlassSheenStyle(currentTheme)]} />}
        <View style={[styles.header, styles.persistentHeader, { borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text, fontFamily, fontSize: fontSizes.header }]}>EZournals</Text>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleNavigation(item.screen)}
            >
              <Ionicons name={item.icon} size={22} color={theme.text} />
              <Text style={[styles.menuLabel, { color: theme.text, fontFamily, fontSize: fontSizes.base }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          
          <View style={[styles.sectionDivider, { borderTopColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily, fontSize: fontSizes.subtitle }]}>
              AI INTEGRATION
            </Text>
          </View>
          
          {aiItems.map((item, index) => (
            <TouchableOpacity
              key={`ai-${index}`}
              style={styles.menuItem}
              onPress={() => handleNavigation(item.screen)}
            >
              <Ionicons name={item.icon} size={22} color={theme.accent} />
              <Text style={[styles.menuLabel, { color: theme.text, fontFamily, fontSize: fontSizes.base }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          
          <View style={[styles.sectionDivider, { borderTopColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily, fontSize: fontSizes.subtitle }]}>
              SYSTEM
            </Text>
          </View>
          
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={`settings-${index}`}
              style={styles.menuItem}
              onPress={() => handleNavigation(item.screen)}
            >
              <Ionicons name={item.icon} size={22} color={theme.text} />
              <Text style={[styles.menuLabel, { color: theme.text, fontFamily, fontSize: fontSizes.base }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <Text style={[styles.version, { color: theme.textLight, fontFamily, fontSize: fontSizes.subtitle }]}>Version 1.0</Text>
        </View>
      </View>
    );
  }
  
  // Mobile overlay sidebar (with modal)
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <StatusBar backgroundColor={isGlassTheme ? 'rgba(0,0,0,0.16)' : 'rgba(0,0,0,0.5)'} />
        {isGlassTheme && (
          <BlurView
            intensity={15}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
        )}
        <View
          style={[
            styles.sidebar,
            isGlassTheme
              ? [getGlassPanelStyle(theme, currentTheme), styles.glassSidebar]
              : { backgroundColor: theme.surface },
          ]}
        >
          {isGlassTheme && <BlurView intensity={60} tint="dark" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />}
          {isGlassTheme && <View pointerEvents="none" style={styles.panelTint} />}
          {isGlassTheme && <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.glassSheen, getGlassSheenStyle(currentTheme)]} />}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text, fontFamily, fontSize: fontSizes.header }]}>EZournals</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.menu}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleNavigation(item.screen)}
              >
                <Ionicons name={item.icon} size={22} color={theme.text} />
                <Text style={[styles.menuLabel, { color: theme.text, fontFamily, fontSize: fontSizes.base }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.textLight} />
              </TouchableOpacity>
            ))}
            
            <View style={[styles.sectionDivider, { borderTopColor: theme.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily, fontSize: fontSizes.subtitle }]}>
                AI INTEGRATION
              </Text>
            </View>
            
            {aiItems.map((item, index) => (
              <TouchableOpacity
                key={`ai-${index}`}
                style={styles.menuItem}
                onPress={() => handleNavigation(item.screen)}
              >
                <Ionicons name={item.icon} size={22} color={theme.accent} />
                <Text style={[styles.menuLabel, { color: theme.text, fontFamily, fontSize: fontSizes.base }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.textLight} />
              </TouchableOpacity>
            ))}
            
            <View style={[styles.sectionDivider, { borderTopColor: theme.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily, fontSize: fontSizes.subtitle }]}>
                SYSTEM
              </Text>
            </View>
            
            {settingsItems.map((item, index) => (
              <TouchableOpacity
                key={`settings-${index}`}
                style={styles.menuItem}
                onPress={() => handleNavigation(item.screen)}
              >
                <Ionicons name={item.icon} size={22} color={theme.text} />
                <Text style={[styles.menuLabel, { color: theme.text, fontFamily, fontSize: fontSizes.base }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.textLight} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Text style={[styles.version, { color: theme.textLight, fontFamily, fontSize: fontSizes.subtitle }]}>Version 1.0</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.backdrop, getGlassBackdropStyle(currentTheme)]} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  persistentSidebar: {
    paddingTop: 20,
    height: '100%',
  },
  persistentHeader: {
    paddingTop: 20,
  },
  overlay: {
    flex: 1,
    flexDirection: 'row'
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  sidebar: {
    width: 280,
    paddingTop: 50,
  },
  glassSidebar: {
    borderRightWidth: 1,
  },
  glassSheen: {
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
  },
  panelTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'left',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 40,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4
  },
  menu: {
    flex: 1,
    paddingTop: 20
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'left',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 2,
    alignItems: 'left'
  },
  version: {
    fontSize: 12,
  },
  sectionDivider: {
    marginTop: 20,
    marginBottom: 12,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 8,
  }
});
