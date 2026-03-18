import React, { useState, useEffect } from 'react';
import { Image, Platform } from 'react-native';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, StatusBar, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntries, deleteEntry, getRecycleBin, saveToRecycleBin } from '../../backend/utils/storage';
import { sortEntries, countWords } from '../utils/entryUtils';
import { useTheme } from '../contexts/ThemeContext';
import { useUISettings } from '../contexts/UISettingsContext';
import { useResponsive } from '../utils/responsive';
import EntryCard from '../components/EntryCard';
import Sidebar from '../components/Sidebar';
import LoadingScreen from '../components/LoadingScreen';

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { settings, getFontSizes, getFontFamily, getSpacing } = useUISettings();
  const { isDesktop, isMobile, containerWidth, cardColumns } = useResponsive();
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
    // Set up real-time sync listener
    const { subscribeToCloudChanges } = require('../../backend/firebase/cloudStorage');
    const unsubscribe = subscribeToCloudChanges((changes) => {
      // Reload data when cloud changes detected
      loadData();
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      const sortedEntries = sortEntries(entries, settings.sortBy);
      setFilteredEntries(sortedEntries);
    }
  }, [settings.sortBy, entries]);

  const loadData = async () => {
    try {
      // Sync from cloud first (downloads latest entries)
      const { syncCloudToLocal } = require('../../backend/firebase/cloudStorage');
      await syncCloudToLocal().catch(err => console.log('Cloud sync skipped:', err.message));
      
      // Then load from local storage (now includes cloud data)
      const data = await getEntries();
      const sortedData = sortEntries(data, settings.sortBy);
      setEntries(sortedData);
      setFilteredEntries(sortedData);
      
      const totalWords = data.reduce((sum, entry) => sum + countWords(entry.content), 0);
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
    if (!entryToDelete) return;

    Alert.alert(
      'Move To Recycle Bin',
      'This entry will be removed from your journal and moved to the recycle bin until you restore or permanently delete it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move Entry',
          style: 'destructive',
          onPress: async () => {
            const deletedEntry = { ...entryToDelete, deletedAt: new Date().toISOString() };
            const recycleBin = await getRecycleBin();
            await saveToRecycleBin([...recycleBin, deletedEntry]);
            await deleteEntry(id);
            loadData();
          }
        }
      ]
    );
  };

  const renderEntry = ({ item }) => (
    <EntryCard
      entry={item}
      onPress={() => navigation.navigate('ViewEntry', { entry: item })}
      onDelete={() => handleDelete(item.id)}
    />
  );

  const styles = createStyles(theme, fontSizes, fontFamily, spacing, settings, isDesktop, isMobile);

  const { auth } = require('../../backend/firebase/config');
  const user = auth.currentUser;
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} translucent={false} />
      
      {/* Desktop: Persistent Sidebar */}
      {isDesktop && (
        <View style={styles.desktopSidebar}>
          <Sidebar 
            visible={true}
            onClose={() => {}}
            navigation={navigation}
            isPersistent={true}
          />
        </View>
      )}
      
      {/* Main Content Area */}
      <View style={styles.mainContent}>
        <View style={[styles.header, { backgroundColor: theme.surface }]}> 
          {!isDesktop && (
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => setShowSidebar(true)}
            >
              <Ionicons name="menu-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          )}
          <View style={styles.headerCenter}>
            <Text style={[styles.greeting, { color: theme.text, fontFamily, fontSize: fontSizes.header }]}>
              {isDesktop ? 'My Journal' : 'EZournals'}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily, fontSize: fontSizes.subtitle }]}> 
              {stats.totalEntries} entries · {stats.totalWords} words
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={() => setShowSearch(!showSearch)}
            >
              <Ionicons name="search-outline" size={24} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('AccountInfo')}
            >
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
              ) : (
                <Ionicons name="person-circle-outline" size={32} color={theme.text} />
              )}
            </TouchableOpacity>
          </View>
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
          <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily, fontSize: fontSizes.title }]}> 
            {searchQuery ? 'No entries found' : 'Your journal awaits'}
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textLight, fontFamily, fontSize: fontSizes.subtitle }]}> 
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
          numColumns={isDesktop ? cardColumns : settings.cardLayout === 'grid' ? 2 : 1}
          key={`${settings.cardLayout}-${isDesktop ? cardColumns : 1}`}
          columnWrapperStyle={isDesktop || settings.cardLayout === 'grid' ? styles.gridRow : null}
        />
      )}
      
      <TouchableOpacity 
        style={styles.floatingAddButton}
        onPress={() => navigation.navigate('AddEntry')}
      >
        <Ionicons name="create-outline" size={24} color={theme.accent} />
      </TouchableOpacity>
      
      {/* Mobile: Overlay Sidebar */}
      {!isDesktop && (
        <Sidebar 
          visible={showSidebar}
          onClose={() => setShowSidebar(false)}
          navigation={navigation}
          isPersistent={false}
        />
      )}
        </View>
    </View>
  );
}

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const createStyles = (theme, fontSizes, fontFamily, spacing, settings, isDesktop, isMobile) => StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: isDesktop ? 'row' : 'column',
    backgroundColor: theme.background,
  },
  desktopSidebar: {
    width: 280,
    backgroundColor: theme.surface,
    borderRightWidth: 1,
    borderRightColor: theme.border,
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isDesktop ? 32 : 16,
    paddingVertical: isDesktop ? 20 : 24,
    paddingTop: isMobile ? 52 : 20,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchButton: {
    padding: 8,
    borderRadius: 8
  },
  profileButton: {
    padding: 4,
    borderRadius: 20,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: theme.glossyButton?.backgroundColor || '#E8E8E8',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 3
  },
  listContent: {
    paddingTop: spacing.card,
    paddingBottom: spacing.card * 2,
    paddingHorizontal: isDesktop ? 32 : (settings.cardLayout === 'grid' ? 8 : 0),
  },
  gridRow: {
    justifyContent: isDesktop ? 'flex-start' : 'space-between',
    paddingHorizontal: isDesktop ? 0 : 8,
    gap: isDesktop ? 24 : 0,
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
    color: theme.textSecondary,
    marginTop: 16,
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 16,
    color: theme.textLight,
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
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16
  }
});
