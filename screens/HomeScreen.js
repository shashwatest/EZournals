import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntries, deleteEntry } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import EntryCard from '../components/EntryCard';
import Sidebar from '../components/Sidebar';

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({ totalEntries: 0, totalWords: 0 });
  const [showSidebar, setShowSidebar] = useState(false);

  if (!theme) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    try {
      const data = await getEntries();
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

  const styles = createStyles(theme);

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
            {stats.totalEntries} entries • {stats.totalWords} words
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={64} color={theme.textLight} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Your journal awaits</Text>
          <Text style={[styles.emptySubtext, { color: theme.textLight }]}>Capture your thoughts and memories</Text>
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

const createStyles = (theme) => StyleSheet.create({
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
  headerCenter: {
    flex: 1,
    alignItems: 'center'
  },
  placeholder: {
    width: 40
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