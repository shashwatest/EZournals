import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../../backend/firebase/config';
import { updateProfile } from 'firebase/auth';
import { saveProfileToCloud } from '../firebase/cloudStorage';
import PlatformStorage from './platformStorage';

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
