import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntries, deleteEntry, getTheme } from '../utils/storage';
import EntryCard from '../components/EntryCard';
import Sidebar from '../components/Sidebar';
import { theme, themes } from '../styles/theme';

export default function HomeScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({ totalEntries: 0, totalWords: 0 });
  const [currentTheme, setCurrentTheme] = useState('blue');
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    try {
      const data = await getEntries();
      const themeName = await getTheme();
      
      setCurrentTheme(themeName);
      theme.colors = themes[themeName] || themes.blue;
      setEntries(data);
      
      const totalWords = data.reduce((sum, entry) => sum + (entry.content ? entry.content.split(' ').length : 0), 0);
      setStats({ totalEntries: data.length, totalWords });
    } catch (error) {
      console.error('Error loading data:', error);
      setEntries([]);
      setStats({ totalEntries: 0, totalWords: 0 });
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Entry',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => confirmDelete(id) }
      ]
    );
  };

  const confirmDelete = async (id) => {
    await deleteEntry(id);
    loadData();
  };

  const renderEntry = ({ item }) => (
    <EntryCard
      entry={item}
      onPress={() => navigation.navigate('ViewEntry', { entry: item })}
      onDelete={() => handleDelete(item.id)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>Good {getTimeOfDay()}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {stats.totalEntries} entries • {stats.totalWords} words
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setShowSidebar(true)}
        >
          <Ionicons name="menu-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={64} color={theme.colors.textLight} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Your journal awaits</Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.textLight }]}>Capture your thoughts and memories</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderEntry}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      <TouchableOpacity 
        style={[styles.floatingAddButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddEntry')}
      >
        <Ionicons name="create-outline" size={24} color={theme.colors.surface} />
      </TouchableOpacity>
      
      <Sidebar 
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        navigation={navigation}
      />
    </View>
  );
}

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingTop: 52,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D'
  },
  menuButton: {
    padding: 8,
    borderRadius: 8
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#2C3E50',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 32
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#7F8C8D',
    marginTop: 16,
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 16,
    color: '#BDC3C7',
    textAlign: 'center'
  }
});