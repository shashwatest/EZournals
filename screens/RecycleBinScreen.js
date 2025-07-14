import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRecycleBin, saveToRecycleBin } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import RichTextRenderer from '../components/RichTextRenderer';

export default function RecycleBinScreen({ navigation }) {
  const { theme } = useTheme();
  const [deletedEntries, setDeletedEntries] = useState([]);

  useEffect(() => {
    loadDeletedEntries();
  }, []);

  const loadDeletedEntries = async () => {
    const entries = await getRecycleBin();
    setDeletedEntries(entries);
  };

  const restoreEntry = async (entry) => {
    const { deletedAt, ...entryData } = entry;
    
    // Get current entries and add restored entry back
    const { getEntries } = require('../utils/storage');
    const currentEntries = await getEntries();
    const updatedEntries = [entryData, ...currentEntries];
    await AsyncStorage.setItem('journal_entries', JSON.stringify(updatedEntries));
    
    // Remove from recycle bin
    const remainingDeleted = deletedEntries.filter(e => e.id !== entry.id);
    await saveToRecycleBin(remainingDeleted);
    setDeletedEntries(remainingDeleted);
    
    Alert.alert('Restored', 'Entry has been restored to your journal');
  };

  const permanentDelete = async (entryId) => {
    Alert.alert(
      'Permanent Delete',
      'This will permanently delete the entry. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Forever', style: 'destructive', onPress: () => {
          const updatedEntries = deletedEntries.filter(e => e.id !== entryId);
          saveToRecycleBin(updatedEntries);
          setDeletedEntries(updatedEntries);
        }}
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderEntry = ({ item }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{formatDate(item.date)}</Text>
        <View style={styles.entryActions}>
          <TouchableOpacity onPress={() => restoreEntry(item)} style={styles.actionButton}>
            <Ionicons name="refresh" size={18} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => permanentDelete(item.id)} style={styles.actionButton}>
            <Ionicons name="trash" size={18} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>
      <RichTextRenderer 
        content={item.content.substring(0, 100) + (item.content.length > 100 ? '...' : '')} 
        style={styles.entryPreview} 
      />
    </View>
  );

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recycle Bin</Text>
        <View style={styles.placeholder} />
      </View>

      {deletedEntries.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="trash-outline" size={64} color={theme.textLight} />
          <Text style={styles.emptyText}>Recycle bin is empty</Text>
          <Text style={styles.emptySubtext}>Deleted entries will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={deletedEntries}
          renderItem={renderEntry}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 52,
    backgroundColor: theme.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text
  },
  placeholder: {
    width: 40
  },
  entryCard: {
    backgroundColor: theme.surface,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  entryDate: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500'
  },
  entryActions: {
    flexDirection: 'row'
  },
  actionButton: {
    padding: 4,
    marginLeft: 8
  },
  entryPreview: {
    fontSize: 14,
    color: theme.text,
    lineHeight: 20
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.textSecondary,
    marginTop: 16,
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textLight,
    textAlign: 'center'
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 32
  }
});