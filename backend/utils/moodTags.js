import PlatformStorage from './platformStorage';
import { auth } from '../firebase/config';
import { saveEntryToCloud, savePreferencesToCloud, getPreferencesFromCloud } from '../firebase/cloudStorage';

const MOOD_TAGS_STORAGE_KEY = 'mood_tags';

const FALLBACK_COLORS = [
  '#FFD700',
  '#4682B4',
  '#FF6347',
  '#98FB98',
  '#DDA0DD',
  '#F0E68C',
  '#CD5C5C',
  '#87CEEB',
  '#FFA500',
  '#D3D3D3',
  '#A78BFA',
  '#34D399',
];

export const DEFAULT_MOOD_TAGS = [
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

let cachedMoodTags = [...DEFAULT_MOOD_TAGS];

const normalizeMoodTags = (tags) => {
  if (!Array.isArray(tags) || tags.length === 0) {
    return [...DEFAULT_MOOD_TAGS];
  }

  const seen = new Set();
  return tags
    .map((tag, index) => ({
      name: typeof tag?.name === 'string' ? tag.name.trim() : '',
      color: tag?.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    }))
    .filter((tag) => {
      if (!tag.name) return false;
      const key = tag.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const persistMoodTags = async (tags) => {
  const normalized = normalizeMoodTags(tags);
  cachedMoodTags = normalized;
  await PlatformStorage.setItem(MOOD_TAGS_STORAGE_KEY, JSON.stringify(normalized));
  if (auth.currentUser) {
    await savePreferencesToCloud({ moodTags: normalized });
  }
  return normalized;
};

const updateStoredEntries = async (mutator) => {
  const rawEntries = await PlatformStorage.getItem('journal_entries');
  const entries = rawEntries ? JSON.parse(rawEntries) : [];
  let hasChanges = false;

  const updatedEntries = entries.map((entry) => {
    const nextTags = mutator(entry.tags || []);
    const sameLength = nextTags.length === (entry.tags || []).length;
    const unchanged = sameLength && nextTags.every((tag, index) => tag === (entry.tags || [])[index]);
    if (unchanged) {
      return entry;
    }

    hasChanges = true;
    return {
      ...entry,
      tags: nextTags,
      updatedAt: new Date().toISOString(),
      syncedToCloud: false,
    };
  });

  if (!hasChanges) {
    return;
  }

  await PlatformStorage.setItem('journal_entries', JSON.stringify(updatedEntries));

  if (auth.currentUser) {
    await Promise.all(
      updatedEntries
        .filter((entry) => !entry.syncedToCloud)
        .map((entry) => saveEntryToCloud(entry).catch((error) => {
          console.error('Error syncing updated mood-tag entry:', error);
        }))
    );
  }
};

export const getMoodTags = async () => {
  try {
    const stored = await PlatformStorage.getItem(MOOD_TAGS_STORAGE_KEY);
    if (stored) {
      cachedMoodTags = normalizeMoodTags(JSON.parse(stored));
      return [...cachedMoodTags];
    }

    if (auth.currentUser) {
      const prefs = await getPreferencesFromCloud();
      if (prefs?.moodTags?.length) {
        const normalized = normalizeMoodTags(prefs.moodTags);
        cachedMoodTags = normalized;
        await PlatformStorage.setItem(MOOD_TAGS_STORAGE_KEY, JSON.stringify(normalized));
        return [...normalized];
      }
    }
  } catch (error) {
    console.error('Error loading mood tags:', error);
  }

  cachedMoodTags = [...DEFAULT_MOOD_TAGS];
  return [...cachedMoodTags];
};

export const getCachedMoodTags = () => [...cachedMoodTags];

export const getCachedMoodTagColor = (tagName) => {
  const tag = cachedMoodTags.find((item) => item.name === tagName);
  return tag ? tag.color : '#95A5A6';
};

export const addMoodTag = async (name) => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('Mood tag name cannot be empty');
  }

  const existing = await getMoodTags();
  if (existing.some((tag) => tag.name.toLowerCase() === trimmedName.toLowerCase())) {
    throw new Error('Mood tag already exists');
  }

  const nextTag = {
    name: trimmedName,
    color: FALLBACK_COLORS[existing.length % FALLBACK_COLORS.length],
  };

  return persistMoodTags([...existing, nextTag]);
};

export const updateMoodTag = async (previousName, nextName) => {
  const trimmedName = nextName.trim();
  if (!trimmedName) {
    throw new Error('Mood tag name cannot be empty');
  }

  const existing = await getMoodTags();
  const current = existing.find((tag) => tag.name === previousName);
  if (!current) {
    throw new Error('Mood tag not found');
  }

  if (
    existing.some(
      (tag) => tag.name !== previousName && tag.name.toLowerCase() === trimmedName.toLowerCase()
    )
  ) {
    throw new Error('Mood tag already exists');
  }

  const updatedTags = existing.map((tag) =>
    tag.name === previousName ? { ...tag, name: trimmedName } : tag
  );

  await persistMoodTags(updatedTags);

  if (previousName !== trimmedName) {
    await updateStoredEntries((tags) => {
      const nextTags = tags.map((tag) => (tag === previousName ? trimmedName : tag));
      return Array.from(new Set(nextTags));
    });
  }

  return updatedTags;
};

export const deleteMoodTag = async (name) => {
  const existing = await getMoodTags();
  const updatedTags = existing.filter((tag) => tag.name !== name);
  await persistMoodTags(updatedTags);
  await updateStoredEntries((tags) => tags.filter((tag) => tag !== name));
  return updatedTags;
};
