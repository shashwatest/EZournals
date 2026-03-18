import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';

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
  return onSnapshot(
    doc(db, PREFERENCES_COLLECTION, user.uid),
    (snap) => { if (snap.exists()) callback(snap.data()); },
    (error) => {
      if (error.code !== 'permission-denied') {
        console.error('Preferences listener error:', error);
      }
    }
  );
};
