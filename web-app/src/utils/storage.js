import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { savePreferencesToCloud, getPreferencesFromCloud } from './preferencesService';

/**
 * Save a new entry or restore a deleted one to both Firestore and LocalStorage
 */
export const saveEntry = async (entryData) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be logged in to save entries to cloud');
  }
  
  const entry = {
    ...entryData,
    userId: user.uid,
    updatedAt: new Date().toISOString(),
    syncedToCloud: true
  };
  
  // 1. Save to Firestore (Entries Collection)
  const docRef = await addDoc(collection(db, 'entries'), entry);
  const finalEntry = { ...entry, id: docRef.id };
  
  // 2. Save to Local Storage for offline/cache access
  try {
    const localEntries = JSON.parse(localStorage.getItem('journal_entries') || '[]');
    localEntries.unshift(finalEntry);
    localStorage.setItem('journal_entries', JSON.stringify(localEntries));
  } catch (e) {
    console.error('Error updating local entries cache:', e);
  }
  
  return finalEntry;
};

/**
 * Get items currently in the Recycle Bin (synced from Cloud)
 */
export const getRecycleBin = async () => {
  const user = auth.currentUser;
  
  // Try local first for performance
  try {
    const localData = localStorage.getItem('recycleBin');
    if (localData) {
      const bin = JSON.parse(localData);
      if (bin.length > 0) return bin;
    }
  } catch (e) {
    console.error('Error reading local recycle bin:', e);
  }
  
  // If hungry or local empty, fetch from cloud
  if (user) {
    const prefs = await getPreferencesFromCloud();
    const cloudBin = prefs?.recycleBin || [];
    if (cloudBin.length > 0) {
      localStorage.setItem('recycleBin', JSON.stringify(cloudBin));
    }
    return cloudBin;
  }
  
  return [];
};

/**
 * Update the Recycle Bin state across devices via Cloud Preferences
 */
export const saveToRecycleBin = async (entries) => {
  const user = auth.currentUser;
  
  // 1. Update local cache
  try {
    localStorage.setItem('recycleBin', JSON.stringify(entries));
  } catch (e) {
    console.error('Error saving local recycle bin:', e);
  }
  
  // 2. Sync to cloud (Background)
  if (user) {
    savePreferencesToCloud({ recycleBin: entries }).catch(err => {
      console.error('Failed to sync recycle bin to cloud:', err);
    });
  }
};
