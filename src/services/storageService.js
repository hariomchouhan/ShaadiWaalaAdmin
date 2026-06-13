import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

export async function uploadProfilePhoto(blob, fileName) {
  if (!storage) throw new Error('Firebase Storage not configured');
  const storageRef = ref(storage, `profile-photos/${fileName}`);
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}

export async function uploadProfilePhotoFromBase64(b64, fileName) {
  const res = await fetch(b64);
  const blob = await res.blob();
  return uploadProfilePhoto(blob, fileName);
}
