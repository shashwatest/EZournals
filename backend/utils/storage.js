import PlatformStorage from './platformStorage';
import { saveEntryToCloud, deleteEntryFromCloud } from '../firebase/cloudStorage';
import { getCachedMoodTags, getCachedMoodTagColor } from './moodTags';

export const getPredefinedTags = () => getCachedMoodTags();

export const getTagColor = (tagName) => getCachedMoodTagColor(tagName);

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

    // Save to Recycle Bin with cloud sync
    const entryToDelete = entries.find(e => e.id === id);
    if (entryToDelete) {
      const bin = await getRecycleBin();
      const updatedBin = [{ ...entryToDelete, deletedAt: new Date().toISOString() }, ...bin];
      await saveToRecycleBin(updatedBin);
    }
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
    const { auth } = require('../firebase/config');
    const user = auth.currentUser;
    
    // Try local first for speed
    const data = await PlatformStorage.getItem('recycleBin');
    let bin = data ? JSON.parse(data) : [];

    // If logged in, fetch from cloud if local is empty to ensure cross-device sync
    if (user && bin.length === 0) {
      const { getPreferencesFromCloud } = require('../firebase/cloudStorage');
      const prefs = await getPreferencesFromCloud();
      if (prefs?.recycleBin) {
        bin = prefs.recycleBin;
        await PlatformStorage.setItem('recycleBin', JSON.stringify(bin));
      }
    }
    
    return bin;
  } catch (error) {
    console.error('Error getting recycle bin:', error);
    return [];
  }
};

export const saveToRecycleBin = async (entries) => {
  try {
    const { savePreferencesToCloud } = require('../firebase/cloudStorage');
    await PlatformStorage.setItem('recycleBin', JSON.stringify(entries));
    // Sync to cloud
    savePreferencesToCloud({ recycleBin: entries }).catch(err => {
      console.error('Error syncing recycle bin to cloud:', err);
    });
  } catch (error) {
    console.error('Error saving to recycle bin:', error);
  }
};
