import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';

const MOOD_TAGS_STORAGE_KEY = 'mood_tags';
const PREFERENCES_COLLECTION = 'userPreferences';

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

const savePreferences = async (moodTags) => {
  if (!auth.currentUser) return;
  await setDoc(
    doc(db, PREFERENCES_COLLECTION, auth.currentUser.uid),
    {
      userId: auth.currentUser.uid,
      moodTags,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
};

const persistMoodTags = async (tags) => {
  const normalized = normalizeMoodTags(tags);
  cachedMoodTags = normalized;
  localStorage.setItem(MOOD_TAGS_STORAGE_KEY, JSON.stringify(normalized));
  await savePreferences(normalized);
  return normalized;
};

const updateEntryTags = async (mutator) => {
  const rawEntries = localStorage.getItem('journal_entries');
  const localEntries = rawEntries ? JSON.parse(rawEntries) : [];
  let hasLocalChanges = false;

  const updatedLocalEntries = localEntries.map((entry) => {
    const nextTags = mutator(entry.tags || []);
    const unchanged =
      nextTags.length === (entry.tags || []).length &&
      nextTags.every((tag, index) => tag === (entry.tags || [])[index]);

    if (unchanged) {
      return entry;
    }

    hasLocalChanges = true;
    return { ...entry, tags: nextTags, updatedAt: Date.now() };
  });

  if (hasLocalChanges) {
    localStorage.setItem('journal_entries', JSON.stringify(updatedLocalEntries));
  }

  if (!auth.currentUser) return;

  const snapshot = await getDocs(
    query(collection(db, 'entries'), where('userId', '==', auth.currentUser.uid))
  );

  await Promise.all(
    snapshot.docs.map(async (entryDoc) => {
      const data = entryDoc.data();
      const nextTags = mutator(data.tags || []);
      const unchanged =
        nextTags.length === (data.tags || []).length &&
        nextTags.every((tag, index) => tag === (data.tags || [])[index]);

      if (unchanged) {
        return;
      }

      await setDoc(
        doc(db, 'entries', entryDoc.id),
        { tags: nextTags, updatedAt: Date.now() },
        { merge: true }
      );
    })
  );
};

export const getMoodTags = async () => {
  try {
    const stored = localStorage.getItem(MOOD_TAGS_STORAGE_KEY);
    if (stored) {
      cachedMoodTags = normalizeMoodTags(JSON.parse(stored));
      return [...cachedMoodTags];
    }

    if (auth.currentUser) {
      const prefs = await getDoc(doc(db, PREFERENCES_COLLECTION, auth.currentUser.uid));
      const moodTags = prefs.exists() ? prefs.data()?.moodTags : null;
      if (moodTags?.length) {
        const normalized = normalizeMoodTags(moodTags);
        cachedMoodTags = normalized;
        localStorage.setItem(MOOD_TAGS_STORAGE_KEY, JSON.stringify(normalized));
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

  return persistMoodTags([
    ...existing,
    { name: trimmedName, color: FALLBACK_COLORS[existing.length % FALLBACK_COLORS.length] },
  ]);
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
    await updateEntryTags((tags) => Array.from(new Set(tags.map((tag) => (tag === previousName ? trimmedName : tag)))));
  }

  return updatedTags;
};

export const deleteMoodTag = async (name) => {
  const existing = await getMoodTags();
  const updatedTags = existing.filter((tag) => tag.name !== name);
  await persistMoodTags(updatedTags);
  await updateEntryTags((tags) => tags.filter((tag) => tag !== name));
  return updatedTags;
};
