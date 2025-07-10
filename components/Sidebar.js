import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function Sidebar({ visible, onClose, navigation }) {
  const { theme } = useTheme();
  
  if (!theme) return null;
  const menuItems = [
    { icon: 'home-outline', label: 'Home', screen: 'Home' },
    { icon: 'calendar-outline', label: 'Navigate', screen: 'Navigate' },
    { icon: 'analytics-outline', label: 'Overview', screen: 'Overview' },
    { icon: 'settings-outline', label: 'Settings', screen: 'Settings' }
  ];

  const handleNavigation = (screen) => {
    onClose();
    if (screen !== 'Home') {
      navigation.navigate(screen);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <StatusBar backgroundColor="rgba(0,0,0,0.5)" />
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        
        <View style={[styles.sidebar, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Journal</Text>
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
                <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.textLight} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={[styles.version, { color: theme.textLight }]}>Version 1.0</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1'
  },
  title: {
    fontSize: 24,
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
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
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    alignItems: 'center'
  },
  version: {
    fontSize: 12,
    color: '#BDC3C7'
  }
});