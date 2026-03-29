import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { storage, auth, db } from '../firebase';

const DAILY_LIMIT_BYTES = 30 * 1024 * 1024; // 30 MB

const checkAndIncrementQuota = async (userId, bytes) => {
  const today = new Date().toISOString().split('T')[0];
  const quotaRef = doc(db, 'userStorageQuotas', userId);
  const quotaDoc = await getDoc(quotaRef);
  let currentUsage = 0;
  if (quotaDoc.exists()) {
    const data = quotaDoc.data();
    if (data.date === today) {
      currentUsage = data.bytesUsed || 0;
    }
  }
  if (currentUsage + bytes > DAILY_LIMIT_BYTES) {
    const remaining = Math.max(0, DAILY_LIMIT_BYTES - currentUsage);
    throw new Error(`Daily 30 MB media limit exceeded. You have ${(remaining / 1048576).toFixed(2)} MB remaining today.`);
  }
  await setDoc(quotaRef, { date: today, bytesUsed: currentUsage + bytes }, { merge: true });
};

export const getQuotaUsage = async () => {
  const user = auth.currentUser;
  if (!user) return { bytesUsed: 0, limit: DAILY_LIMIT_BYTES };
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const quotaRef = doc(db, 'userStorageQuotas', user.uid);
    const quotaDoc = await getDoc(quotaRef);
    
    if (quotaDoc.exists()) {
      const data = quotaDoc.data();
      if (data.date === today) {
        return { bytesUsed: data.bytesUsed || 0, limit: DAILY_LIMIT_BYTES };
      }
    }
  } catch (error) {
    console.error('Error fetching quota:', error);
  }
  
  return { bytesUsed: 0, limit: DAILY_LIMIT_BYTES };
};

export const uploadProfilePicture = async (file) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const imageRef = ref(storage, `profilePictures/${user.uid}/profile.jpg`);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
};

export const uploadImage = async (file) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  await checkAndIncrementQuota(user.uid, file.size);

  const storagePath = `entries/${user.uid}/${Date.now()}_${file.name}`;
  const imageRef = ref(storage, storagePath);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
};

export const uploadAudio = async (blob) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  await checkAndIncrementQuota(user.uid, blob.size);

  const storagePath = `entries/${user.uid}/${Date.now()}_audio.webm`;
  const audioRef = ref(storage, storagePath);
  await uploadBytes(audioRef, blob);
  return getDownloadURL(audioRef);
};

export const isLocalUri = (uri) => {
  if (!uri) return false;
  return uri.startsWith('blob:') || uri.startsWith('data:') ||
    (!uri.startsWith('http://') && !uri.startsWith('https://'));
};
