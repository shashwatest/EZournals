import React from 'react';
import { Image } from 'react-native';
import { View, Text, TouchableOpacity, StyleSheet, Modal, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function Sidebar({ visible, onClose, navigation }) {
  const { theme } = useTheme();
  const { getFontFamily, getFontSizes } = require('../contexts/UISettingsContext').useUISettings();
  const fontFamily = getFontFamily();
  const fontSizes = getFontSizes();
  
  if (!theme) return null;
  const menuItems = [
    { icon: 'home-outline', label: 'Home', screen: 'Home' },
    { icon: 'calendar-outline', label: 'Navigate', screen: 'Navigate' },
    { icon: 'analytics-outline', label: 'Overview', screen: 'Overview' },
    { icon: 'trash-outline', label: 'Recycle Bin', screen: 'RecycleBin' },
    { icon: 'settings-outline', label: 'Settings', screen: 'Settings' }
  ];

  const handleNavigation = (screen) => {
    onClose();
    if (screen !== 'Home') {
      navigation.navigate(screen);
    }
  };

  const user = require('../utils/firebase').auth.currentUser;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <StatusBar backgroundColor="rgba(0,0,0,0.5)" />
        <View style={[styles.sidebar, { backgroundColor: theme.surface }]}> 
          <View style={styles.header}>
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
          </View>

          <TouchableOpacity style={styles.profileSection} onPress={() => { onClose(); navigation.navigate('AccountInfo'); }}>
            {user && user.photoURL ? (
              <View style={styles.profilePicWrapper}>
                <Image source={{ uri: user.photoURL }} style={styles.profilePic} />
              </View>
            ) : (
              <Ionicons name="person-circle-outline" size={32} color={theme.text} />
            )}
            <Text style={[styles.profileText, { color: theme.text, fontFamily, fontSize: fontSizes.base }]}>Profile</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.version, { color: theme.textLight, fontFamily, fontSize: fontSizes.subtitle }]}>Version 1.0</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    flexDirection: 'row',
    alignItems: 'left',
    padding: 16,
    borderTopWidth: 2,
    borderTopColor: '#ECF0F1',
    marginTop: 8,
    marginBottom: 8,
    justifyContent: 'left',
    gap: 8
  },
  profilePicWrapper: {
    width: 43,
    height: 43,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    justifyContent: 'left',
    alignItems: 'left',
    marginRight: 8
  },
  profilePic: {
    width: 42,
    height: 42,
    borderRadius: 16
  },
  profileText: {
    fontSize: 0,
    fontWeight: '600',
    marginLeft: 0
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
    backgroundColor: '#FFFFFF',
    paddingTop: 50
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'left',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1'
  },
  title: {
    fontSize: 40,
    fontWeight: '600',
    color: '#2C3E50'
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
    borderBottomColor: '#F8F9FA'
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
    color: '#2C3E50'
  },
  footer: {
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: '#ECF0F1',
    alignItems: 'left'
  },
  version: {
    fontSize: 12,
    color: '#BDC3C7'
  }
});