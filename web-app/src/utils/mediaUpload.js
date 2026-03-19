import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../firebase';

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

  const storagePath = `entries/${user.uid}/${Date.now()}_${file.name}`;
  const imageRef = ref(storage, storagePath);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
};

export const uploadAudio = async (blob) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

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
