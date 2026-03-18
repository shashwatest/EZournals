import PlatformStorage from './platformStorage';
import { saveEntryToCloud, deleteEntryFromCloud } from '../firebase/cloudStorage';

export const getPredefinedTags = () => [
  { name: 'Happy', color: '#FFD700' },
  { name: 'Sad', color: '#4682B4' },
  { name: 'Excited', color: '#FF6347' },
  { name: 'Calm', color: '#98FB98' },
  { name: 'Anxious', color: '#DDA0DD' },
  { name: 'Grateful', color: '#F0E68C' },
  { name: 'Frustrated', color: '#CD5C5C' },
  { name: 'Peaceful', color: '#87CEEB' },
  { name: 'Energetic', color: '#FFA500' },
  { name: 'Reflective', color: '#D3D3D3' },
];

export const getTagColor = (tagName) => {
  const tag = getPredefinedTags().find(t => t.name === tagName);
  return tag ? tag.color : '#95A5A6';
};

const STORAGE_KEY = 'journal_entries';

export const saveEntry = async (entry) => {
  try {
    const { auth } = require('../firebase/config');
    const user = auth.currentUser;
    
    const entries = await getEntries();
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      tags: entry.tags || [],
      eventTime: entry.eventTime || null,
      userId: user?.uid || 'local',
      syncedToCloud: false,
      ...entry
    };
    entries.unshift(newEntry);
    
    // Save locally first (fast)
    await PlatformStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    
    // Then sync to cloud (background)
    saveEntryToCloud(newEntry).catch(err => {
      console.error('Cloud sync failed, will retry later:', err);
    });
    
    return newEntry;
  } catch (error) {
    console.error('Error saving entry:', error);
    throw error;
  }
};

export const deleteUserTag = async (tagToDelete) => {
  try {
    const userTags = await getUserTags();
    const filteredTags = userTags.filter(tag => tag !== tagToDelete);
    await PlatformStorage.setItem('user_tags', JSON.stringify(filteredTags));
  } catch (error) {
    console.error('Error deleting tag:', error);
  }
};

export const getUserTags = async () => {
  try {
    const tags = await PlatformStorage.getItem('user_tags');
    return tags ? JSON.parse(tags) : [];
  } catch (error) {
    return [];
  }
};

export const saveUserTag = async (tag) => {
  try {
    const userTags = await getUserTags();
    if (!userTags.includes(tag)) {
      userTags.push(tag);
      await PlatformStorage.setItem('user_tags', JSON.stringify(userTags));
    }
  } catch (error) {
    console.error('Error saving tag:', error);
  }
};

export const getTheme = async () => {
  try {
    const theme = await PlatformStorage.getItem('app_theme');
    return theme || 'glassmorphism'; // Default to glassmorphism
  } catch (error) {
    return 'glassmorphism';
  }
};

export const saveTheme = async (themeName) => {
  try {
    await PlatformStorage.setItem('app_theme', themeName);
  } catch (error) {
    console.error('Error saving theme:', error);
  }
};

export const getEntriesByDate = async () => {
  try {
    const entries = await getEntries();
    const grouped = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(entry);
    });
    
    return grouped;
  } catch (error) {
    console.error('Error grouping entries:', error);
    return {};
  }
};

export const getTodayEntries = async () => {
  try {
    const entries = await getEntries();
    const today = new Date().toDateString();
    return entries.filter(entry => new Date(entry.date).toDateString() === today);
  } catch (error) {
    return [];
  }
};

export const getEntries = async () => {
  try {
    const { auth } = require('../firebase/config');
    const user = auth.currentUser;
    
    const entries = await PlatformStorage.getItem(STORAGE_KEY);
    const allEntries = entries ? JSON.parse(entries) : [];
    
    // Filter by current user if logged in
    if (user) {
      return allEntries.filter(entry => entry.userId === user.uid);
    }
    
    return allEntries;
  } catch (error) {
    console.error('Error getting entries:', error);
    return [];
  }
};

export const deleteEntry = async (id) => {
  try {
    const entries = await getEntries();
    const filteredEntries = entries.filter(entry => entry.id !== id);
    
    // Delete locally first
    await PlatformStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEntries));
    
    // Then delete from cloud (background)
    deleteEntryFromCloud(id).catch(err => {
      console.error('Cloud delete failed:', err);
    });
  } catch (error) {
    console.error('Error deleting entry:', error);
    throw error;
  }
};

export const updateEntry = async (id, updatedEntry) => {
  try {
    const entries = await getEntries();
    const index = entries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      entries[index] = { 
        ...entries[index], 
        ...updatedEntry,
        updatedAt: new Date().toISOString(),
        syncedToCloud: false
      };
      
      // Update locally first
      await PlatformStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      
      // Then sync to cloud (background)
      saveEntryToCloud(entries[index]).catch(err => {
        console.error('Cloud sync failed:', err);
      });
    }
  } catch (error) {
    console.error('Error updating entry:', error);
    throw error;
  }
};

export const getRecycleBin = async () => {
  try {
    const data = await PlatformStorage.getItem('recycleBin');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting recycle bin:', error);
    return [];
  }
};

export const saveToRecycleBin = async (entries) => {
  try {
    await PlatformStorage.setItem('recycleBin', JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving to recycle bin:', error);
  }
};