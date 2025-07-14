import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'journal_entries';

export const saveEntry = async (entry) => {
  try {
    const entries = await getEntries();
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      tags: entry.tags || [],
      eventTime: entry.eventTime || null,
      ...entry
    };
    entries.unshift(newEntry);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return newEntry;
  } catch (error) {
    console.error('Error saving entry:', error);
    throw error;
  }
};

export const getPredefinedTags = () => {
  return [
    { name: 'Happy', color: '#FFD700' },
    { name: 'Sad', color: '#4682B4' },
    { name: 'Excited', color: '#FF6347' },
    { name: 'Calm', color: '#98FB98' },
    { name: 'Anxious', color: '#DDA0DD' },
    { name: 'Grateful', color: '#F0E68C' },
    { name: 'Frustrated', color: '#CD5C5C' },
    { name: 'Peaceful', color: '#87CEEB' },
    { name: 'Energetic', color: '#FFA500' },
    { name: 'Reflective', color: '#D3D3D3' }
  ];
};

export const getTagColor = (tagName) => {
  const predefinedTags = getPredefinedTags();
  const tag = predefinedTags.find(t => t.name === tagName);
  return tag ? tag.color : '#95A5A6';
};

export const deleteUserTag = async (tagToDelete) => {
  try {
    const userTags = await getUserTags();
    const filteredTags = userTags.filter(tag => tag !== tagToDelete);
    await AsyncStorage.setItem('user_tags', JSON.stringify(filteredTags));
  } catch (error) {
    console.error('Error deleting tag:', error);
  }
};

export const getUserTags = async () => {
  try {
    const tags = await AsyncStorage.getItem('user_tags');
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
      await AsyncStorage.setItem('user_tags', JSON.stringify(userTags));
    }
  } catch (error) {
    console.error('Error saving tag:', error);
  }
};

export const getTheme = async () => {
  try {
    const theme = await AsyncStorage.getItem('app_theme');
    return theme || 'blue';
  } catch (error) {
    return 'blue';
  }
};

export const saveTheme = async (themeName) => {
  try {
    await AsyncStorage.setItem('app_theme', themeName);
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
    const entries = await AsyncStorage.getItem(STORAGE_KEY);
    return entries ? JSON.parse(entries) : [];
  } catch (error) {
    console.error('Error getting entries:', error);
    return [];
  }
};

export const deleteEntry = async (id) => {
  try {
    const entries = await getEntries();
    const filteredEntries = entries.filter(entry => entry.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEntries));
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
      entries[index] = { ...entries[index], ...updatedEntry };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  } catch (error) {
    console.error('Error updating entry:', error);
    throw error;
  }
};

export const getDarkMode = async () => {
  try {
    const darkMode = await AsyncStorage.getItem('dark_mode');
    return darkMode === 'true';
  } catch (error) {
    return false;
  }
};

export const saveDarkMode = async (isDark) => {
  try {
    await AsyncStorage.setItem('dark_mode', isDark.toString());
  } catch (error) {
    console.error('Error saving dark mode:', error);
  }
};

export const getRecycleBin = async () => {
  try {
    const data = await AsyncStorage.getItem('recycleBin');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting recycle bin:', error);
    return [];
  }
};

export const saveToRecycleBin = async (entries) => {
  try {
    await AsyncStorage.setItem('recycleBin', JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving to recycle bin:', error);
  }
};