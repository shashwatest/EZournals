import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from './config';
import PlatformStorage from '../utils/platformStorage';

const ENTRIES_COLLECTION = 'entries';
const USER_PROFILE_COLLECTION = 'userProfiles';
const LAST_SYNC_KEY = 'last_sync_timestamp';
const SYNC_SETTINGS_KEY = 'cloud_sync_settings';

/**
 * Get user's sync settings
 */
const getSyncSettings = async () => {
  try {
    const settings = await PlatformStorage.getItem(SYNC_SETTINGS_KEY);
    if (settings) {
      return JSON.parse(settings);
    }
    // Default: sync everything except location and media
    return {
      content: true,
      date: true,
      tags: true,
      location: false,
      eventTime: true,
      media: false,
      timeRange: true,
    };
  } catch (error) {
    console.error('Error getting sync settings:', error);
    return {};
  }
};

/**
 * Filter entry fields based on sync settings
 */
const filterEntryForSync = async (entry) => {
  const syncSettings = await getSyncSettings();
  const filteredEntry = {
    id: entry.id,
    userId: entry.userId,
    updatedAt: entry.updatedAt,
    syncedToCloud: true,
  };

  // Only include fields that user wants to sync AND that have defined values
  if (syncSettings.content && entry.content !== undefined) {
    filteredEntry.content = entry.content;
  }
  if (syncSettings.date && entry.date !== undefined) {
    filteredEntry.date = entry.date;
  }
  if (syncSettings.tags && entry.tags !== undefined) {
    filteredEntry.tags = entry.tags;
  }
  if (syncSettings.location && entry.location !== undefined) {
    filteredEntry.location = entry.location;
  }
  if (syncSettings.eventTime && entry.eventTime !== undefined) {
    filteredEntry.eventTime = entry.eventTime;
  }
  if (syncSettings.media) {
    if (entry.imageUrl !== undefined) filteredEntry.imageUrl = entry.imageUrl;
    if (entry.audioUrl !== undefined) filteredEntry.audioUrl = entry.audioUrl;
  }
  if (syncSettings.timeRange && entry.timeRange !== undefined) {
    filteredEntry.timeRange = entry.timeRange;
  }

  return filteredEntry;
};

/**
 * Cloud Storage Service
 * Hybrid approach: Local storage + Firestore sync
 */

// ============================================
// ENTRIES SYNC
// ============================================

/**
 * Save entry to both local and cloud
 */
export const saveEntryToCloud = async (entry) => {
  const user = auth.currentUser;
  if (!user) {
    console.warn('No user logged in, saving locally only');
    return entry;
  }

  try {
    const entryWithUser = {
      ...entry,
      userId: user.uid,
      updatedAt: new Date().toISOString(),
      syncedToCloud: true
    };

    // Filter entry based on user's sync settings
    const filteredEntry = await filterEntryForSync(entryWithUser);

    // Save to Firestore
    const entryRef = doc(db, ENTRIES_COLLECTION, entry.id);
    await setDoc(entryRef, filteredEntry, { merge: true });


    return entryWithUser;
  } catch (error) {
    console.error('❌ Error saving to cloud:', error);
    // Mark as not synced so we can retry later
    return { ...entry, syncedToCloud: false };
  }
};

/**
 * Get all entries from cloud for current user
 */
export const getEntriesFromCloud = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.warn('No user logged in');
    return [];
  }

  try {
    const q = query(
      collection(db, ENTRIES_COLLECTION),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const entries = [];
    querySnapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() });
    });


    return entries;
  } catch (error) {
    console.error('❌ Error fetching from cloud:', error);
    return [];
  }
};

/**
 * Delete entry from cloud
 */
export const deleteEntryFromCloud = async (entryId) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await deleteDoc(doc(db, ENTRIES_COLLECTION, entryId));

  } catch (error) {
    console.error('❌ Error deleting from cloud:', error);
  }
};

/**
 * Sync local entries to cloud
 * Uploads any entries that haven't been synced yet
 */
export const syncLocalToCloud = async () => {
  const user = auth.currentUser;
  if (!user) return { success: false, message: 'No user logged in' };

  try {
    // Get local entries
    const localEntriesJson = await PlatformStorage.getItem('journal_entries');
    if (!localEntriesJson) {
      return { success: true, synced: 0 };
    }

    const localEntries = JSON.parse(localEntriesJson);
    let syncedCount = 0;

    // Upload entries that aren't synced
    for (const entry of localEntries) {
      if (!entry.syncedToCloud) {
        await saveEntryToCloud(entry);
        syncedCount++;
      }
    }

    // Update last sync time
    await PlatformStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());


    return { success: true, synced: syncedCount };
  } catch (error) {
    console.error('❌ Error syncing to cloud:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sync cloud entries to local
 * Downloads entries from cloud and merges with local
 */
export const syncCloudToLocal = async () => {
  const user = auth.currentUser;
  if (!user) return { success: false, message: 'No user logged in' };

  try {
    // Get cloud entries
    const cloudEntries = await getEntriesFromCloud();
    
    // Get local entries
    const localEntriesJson = await PlatformStorage.getItem('journal_entries');
    const localEntries = localEntriesJson ? JSON.parse(localEntriesJson) : [];

    // Merge: Cloud entries take precedence
    const mergedEntries = mergeEntries(localEntries, cloudEntries);

    // Save merged entries locally
    await PlatformStorage.setItem('journal_entries', JSON.stringify(mergedEntries));

    // Update last sync time
    await PlatformStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());


    return { success: true, downloaded: cloudEntries.length };
  } catch (error) {
    console.error('❌ Error syncing from cloud:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Merge local and cloud entries
 * Cloud wins if there's a conflict (newer updatedAt)
 */
const mergeEntries = (localEntries, cloudEntries) => {
  const entriesMap = new Map();

  // Add local entries first
  localEntries.forEach(entry => {
    entriesMap.set(entry.id, entry);
  });

  // Override with cloud entries (cloud wins)
  cloudEntries.forEach(entry => {
    const localEntry = entriesMap.get(entry.id);
    
    if (!localEntry) {
      // New entry from cloud
      entriesMap.set(entry.id, entry);
    } else {
      // Compare timestamps - newer wins
      const localTime = new Date(localEntry.updatedAt || localEntry.date).getTime();
      const cloudTime = new Date(entry.updatedAt || entry.date).getTime();
      
      if (cloudTime >= localTime) {
        entriesMap.set(entry.id, entry);
      }
    }
  });

  return Array.from(entriesMap.values());
};

/**
 * Full bidirectional sync
 * 1. Upload local changes to cloud
 * 2. Download cloud changes to local
 */
export const fullSync = async () => {

  
  // Upload local changes first
  const uploadResult = await syncLocalToCloud();
  
  // Then download cloud changes
  const downloadResult = await syncCloudToLocal();


  return {
    success: uploadResult.success && downloadResult.success,
    uploaded: uploadResult.synced || 0,
    downloaded: downloadResult.downloaded || 0
  };
};

/**
 * Get last sync timestamp
 */
export const getLastSyncTime = async () => {
  try {
    const timestamp = await PlatformStorage.getItem(LAST_SYNC_KEY);
    return timestamp ? new Date(timestamp) : null;
  } catch (error) {
    return null;
  }
};

// ============================================
// USER PROFILE SYNC
// ============================================

/**
 * Save user profile to cloud
 */
export const saveProfileToCloud = async (profileData) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const profileRef = doc(db, USER_PROFILE_COLLECTION, user.uid);
    await setDoc(profileRef, {
      ...profileData,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    }, { merge: true });


  } catch (error) {
    console.error('❌ Error saving profile to cloud:', error);
  }
};

/**
 * Get user profile from cloud
 */
export const getProfileFromCloud = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const profileRef = doc(db, USER_PROFILE_COLLECTION, user.uid);
    const profileSnap = await getDoc(profileRef);
    if (profileSnap.exists()) {
      return profileSnap.data();
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching profile from cloud:', error);
    return null;
  }
};

export const isUsernameAvailable = async (username, currentUserId) => {
  try {
    const q = query(
      collection(db, USER_PROFILE_COLLECTION),
      where('username', '==', username.toLowerCase().trim())
    );
    const snap = await getDocs(q);
    return snap.empty || (snap.docs.length === 1 && snap.docs[0].id === currentUserId);
  } catch (error) {
    console.error('❌ Error checking username:', error);
    throw error;
  }
};

// ============================================
// REAL-TIME SYNC (Optional)
// ============================================

/**
 * Listen to real-time changes from cloud
 * Useful for multi-device sync
 */
export const subscribeToCloudChanges = (callback) => {
  const user = auth.currentUser;
  if (!user) return () => {};

  const q = query(
    collection(db, ENTRIES_COLLECTION),
    where('userId', '==', user.uid)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const changes = [];
    snapshot.docChanges().forEach((change) => {
      changes.push({
        type: change.type,
        entry: { id: change.doc.id, ...change.doc.data() }
      });
    });

    if (changes.length > 0) {
      callback(changes);
    }
  }, (error) => {
    if (error.code !== 'permission-denied') {
      console.error('Cloud changes listener error:', error);
    }
  });

  return unsubscribe;
};

// ============================================
// USER PREFERENCES SYNC
// ============================================

const PREFERENCES_COLLECTION = 'userPreferences';

export const savePreferencesToCloud = async (preferences) => {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await setDoc(doc(db, PREFERENCES_COLLECTION, user.uid), {
      ...preferences,
      userId: user.uid,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving preferences to cloud:', error);
  }
};

export const getPreferencesFromCloud = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    const snap = await getDoc(doc(db, PREFERENCES_COLLECTION, user.uid));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error('Error fetching preferences from cloud:', error);
    return null;
  }
};

export const subscribeToPreferences = (callback) => {
  const user = auth.currentUser;
  if (!user) return () => {};
  const unsubscribe = onSnapshot(
    doc(db, PREFERENCES_COLLECTION, user.uid),
    (snap) => { if (snap.exists()) callback(snap.data()); },
    (error) => {
      if (error.code !== 'permission-denied') {
        console.error('Preferences listener error:', error);
      }
    }
  );
  return unsubscribe;
};

export default {
  saveEntryToCloud,
  getEntriesFromCloud,
  deleteEntryFromCloud,
  syncLocalToCloud,
  syncCloudToLocal,
  fullSync,
  getLastSyncTime,
  saveProfileToCloud,
  getProfileFromCloud,
  subscribeToCloudChanges,
  savePreferencesToCloud,
  getPreferencesFromCloud,
  subscribeToPreferences,
};
