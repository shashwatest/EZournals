import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, StatusBar, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntries, deleteEntry, getRecycleBin, saveToRecycleBin } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import { useUISettings } from '../contexts/UISettingsContext';
import EntryCard from '../components/EntryCard';
import Sidebar from '../components/Sidebar';
import LoadingScreen from '../components/LoadingScreen';

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { settings, getFontSizes, getFontFamily, getSpacing } = useUISettings();
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [stats, setStats] = useState({ totalEntries: 0, totalWords: 0 });
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fontSizes = getFontSizes();
  const fontFamily = getFontFamily();
  const spacing = getSpacing();

  if (!theme) {
    return <LoadingScreen />;
  }

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (entries.length > 0) {
      const sortedEntries = sortEntries(entries, settings.sortBy);
      setFilteredEntries(sortedEntries);
    }
  }, [settings.sortBy, entries]);

  const sortEntries = (entries, sortBy) => {
    switch (sortBy) {
      case 'oldest':
        return [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'alphabetical':
        return [...entries].sort((a, b) => a.content.localeCompare(b.content));
      case 'newest':
      default:
        return [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  };

  const loadData = async () => {
    try {
      const data = await getEntries();
      const sortedData = sortEntries(data, settings.sortBy);
      setEntries(sortedData);
      setFilteredEntries(sortedData);
      
      const totalWords = data.reduce((sum, entry) => sum + (entry.content ? entry.content.split(' ').length : 0), 0);
      setStats({ totalEntries: data.length, totalWords });
    } catch (error) {
      console.error('Error loading data:', error);
      setEntries([]);
      setFilteredEntries([]);
      setStats({ totalEntries: 0, totalWords: 0 });
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredEntries(entries);
      return;
    }
    
    const filtered = entries.filter(entry => 
      entry.content.toLowerCase().includes(query.toLowerCase()) ||
      (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
    );
    setFilteredEntries(sortEntries(filtered, settings.sortBy));
  };

  const handleDelete = async (id) => {
    const entryToDelete = entries.find(e => e.id === id);
    if (entryToDelete) {
      // Move to recycle bin
      const deletedEntry = { ...entryToDelete, deletedAt: new Date().toISOString() };
      const recycleBin = await getRecycleBin();
      await saveToRecycleBin([...recycleBin, deletedEntry]);
      
      // Delete from main entries
      await deleteEntry(id);
      loadData();
    }
  };

  const renderEntry = ({ item }) => (
    <EntryCard
      entry={item}
      onPress={() => navigation.navigate('ViewEntry', { entry: item })}
      onDelete={() => handleDelete(item.id)}
    />
  );

  const styles = createStyles(theme, fontSizes, fontFamily, spacing, settings);

  const user = require('../utils/firebase').auth.currentUser;
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <View style={[styles.header, { backgroundColor: theme.surface }]}> 
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setShowSidebar(true)}
        >
          <Ionicons name="menu-outline" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.greeting, { color: theme.text }]}>EZournals</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {stats.totalEntries} entries
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.accountButton}
          onPress={() => navigation.navigate('AccountInfo')}
        >
          {user && user.photoURL ? (
            <View style={{ width: 32, height: 32, borderRadius: 16, overflow: 'hidden', backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' }}>
              <Image source={{ uri: user.photoURL }} style={{ width: 32, height: 32, borderRadius: 16 }} />
            </View>
          ) : (
            <Ionicons name="person-circle-outline" size={24} color={theme.text} />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => setShowSearch(!showSearch)}
        >
          <Ionicons name="search-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
          <Ionicons name="search-outline" size={20} color={theme.textLight} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search entries..."
            placeholderTextColor={theme.textLight}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={theme.textLight} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {filteredEntries.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={64} color={theme.textLight} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {searchQuery ? 'No entries found' : 'Your journal awaits'}
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textLight }]}>
            {searchQuery ? 'Try a different search term' : 'Capture your thoughts and memories'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEntries}
          renderItem={renderEntry}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          numColumns={settings.cardLayout === 'grid' ? 2 : 1}
          key={settings.cardLayout}
          columnWrapperStyle={settings.cardLayout === 'grid' ? styles.gridRow : null}
        />
      )}
      
      <TouchableOpacity 
        style={[styles.floatingAddButton, { backgroundColor: theme.accent }]}
        onPress={() => navigation.navigate('AddEntry')}
      >
        <Ionicons name="create-outline" size={24} color="white" />
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

const createStyles = (theme, fontSizes, fontFamily, spacing, settings) => StyleSheet.create({
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
    fontSize: fontSizes.header,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
    fontFamily: fontFamily
  },
  subtitle: {
    fontSize: fontSizes.subtitle,
    color: theme.textSecondary,
    fontFamily: fontFamily
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center'
  },
  searchButton: {
    padding: 8,
    borderRadius: 8
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
    paddingTop: spacing.card,
    paddingBottom: spacing.card * 2,
    paddingHorizontal: settings.cardLayout === 'grid' ? 8 : 0
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 8
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
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16
  }
});