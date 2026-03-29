import { auth } from '../firebase';
import { savePreferencesToCloud, getPreferencesFromCloud } from './preferencesService';

const DRAFT_STORAGE_KEY = 'current_entry_draft';

/**
 * Save a draft to both local and cloud
 * @param {Object} draftData - { content, title, tags, mood, etc. }
 */
export const saveDraft = async (draftData) => {
  const user = auth.currentUser;
  try {
    const updatedAt = new Date().toISOString();
    const dataWithTime = { ...draftData, updatedAt };

    // 1. Save locally for instant recovery
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(dataWithTime));

    // 2. Save to cloud preferences if logged in
    if (user) {
      await savePreferencesToCloud({
        currentDraft: dataWithTime
      });
    }
  } catch (error) {
    console.error('Error saving draft:', error);
  }
};

/**
 * Load the latest draft (prefers cloud if logged in and newer)
 */
export const loadDraft = async () => {
  const user = auth.currentUser;
  try {
    const localData = localStorage.getItem(DRAFT_STORAGE_KEY);
    const localDraft = localData ? JSON.parse(localData) : null;

    if (!user) return localDraft;

    // Fetch cloud draft
    const prefs = await getPreferencesFromCloud();
    const cloudDraft = prefs?.currentDraft || null;

    if (!cloudDraft) return localDraft;
    if (!localDraft) return cloudDraft;

    // Return the newer one
    const localTime = new Date(localDraft.updatedAt).getTime();
    const cloudTime = new Date(cloudDraft.updatedAt).getTime();

    return cloudTime > localTime ? cloudDraft : localDraft;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
};

/**
 * Clear draft after successful entry save
 */
export const clearDraft = async () => {
  const user = auth.currentUser;
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    if (user) {
      await savePreferencesToCloud({ currentDraft: null });
    }
  } catch (error) {
    console.error('Error clearing draft:', error);
  }
};
