import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { storage, auth, db } from '../../backend/firebase/config';
import { updateProfile } from 'firebase/auth';
import { saveProfileToCloud } from '../firebase/cloudStorage';
import PlatformStorage from './platformStorage';


export const DAILY_LIMIT_BYTES = 30 * 1024 * 1024; // 30 MB

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

export const uploadImage = async (uri) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const response = await fetch(uri);
  const blob = await response.blob();
  const storagePath = `entries/${user.uid}/${Date.now()}_image.jpg`;
  const imageRef = ref(storage, storagePath);
  await uploadBytes(imageRef, blob);
  return getDownloadURL(imageRef);
};

export const uploadAudio = async (uri) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const response = await fetch(uri);
  const blob = await response.blob();
  const storagePath = `entries/${user.uid}/${Date.now()}_audio.m4a`;
  const audioRef = ref(storage, storagePath);
  await uploadBytes(audioRef, blob);
  return getDownloadURL(audioRef);
};

export const isLocalUri = (uri) => {
  if (!uri) return false;
  return uri.startsWith('file://') || uri.startsWith('blob:') || uri.startsWith('data:') ||
    (!uri.startsWith('http://') && !uri.startsWith('https://'));
};

export const uploadProfilePicture = async (uri) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const response = await fetch(uri);
  const blob = await response.blob();
  const imageRef = ref(storage, `profile_pictures/${user.uid}/profile.jpg`);
  await uploadBytes(imageRef, blob);
  return getDownloadURL(imageRef);
};

export const handleProfilePictureUpload = async (uri) => {
  const downloadURL = await uploadProfilePicture(uri);
  await updateProfile(auth.currentUser, { photoURL: downloadURL });
  await saveProfileToCloud({ photoURL: downloadURL });
  await PlatformStorage.setItem('profile_picture', downloadURL);
  return downloadURL;
};
