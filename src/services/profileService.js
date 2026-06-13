import {
  collection, doc, getDocs, query, orderBy, limit, startAfter,
  addDoc, updateDoc, deleteDoc, writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ITEMS_PER_PAGE } from '../constants/profileSchema';
import { profileMatchesSearch } from '../utils/searchUtils';

const COLLECTION = 'profiles';
const BATCH_SIZE = 500;

function mapDoc(d) {
  return { id: d.id, ...d.data() };
}

export async function fetchProfiles({ lastDocSnapshot = null, searchTerm = '', pageSize = ITEMS_PER_PAGE } = {}) {
  if (!db) throw new Error('Firebase not configured');

  if (searchTerm?.trim()) {
    const snap = await getDocs(query(collection(db, COLLECTION), orderBy('createdAt', 'desc')));
    const filtered = snap.docs.map(mapDoc).filter((p) => profileMatchesSearch(p, searchTerm.trim()));
    return { profiles: filtered, lastDoc: null, hasMore: false };
  }

  let q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(pageSize));
  if (lastDocSnapshot) {
    q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), startAfter(lastDocSnapshot), limit(pageSize));
  }

  const snap = await getDocs(q);
  return {
    profiles: snap.docs.map(mapDoc),
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
    hasMore: snap.docs.length === pageSize,
  };
}

export async function createProfile(data) {
  if (!db) throw new Error('Firebase not configured');
  const now = new Date().toISOString();
  const { id, ...rest } = data;
  const ref = await addDoc(collection(db, COLLECTION), { ...rest, createdAt: now, updatedAt: now });
  return ref.id;
}

export async function updateProfile(id, data) {
  if (!db) throw new Error('Firebase not configured');
  const { id: _id, ...rest } = data;
  await updateDoc(doc(db, COLLECTION, id), { ...rest, updatedAt: new Date().toISOString() });
}

export async function deleteProfile(id) {
  if (!db) throw new Error('Firebase not configured');
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function batchImportProfiles(profilesData, onProgress) {
  if (!db) throw new Error('Firebase not configured');
  const now = new Date().toISOString();
  const total = profilesData.length;
  let count = 0;

  for (let i = 0; i < profilesData.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = profilesData.slice(i, i + BATCH_SIZE);
    chunk.forEach((data) => {
      const ref = doc(collection(db, COLLECTION));
      batch.set(ref, { ...data, createdAt: now, updatedAt: now });
      count++;
    });
    await batch.commit();
    onProgress?.({ current: count, total });
  }

  return count;
}

export async function getAllProfiles() {
  if (!db) throw new Error('Firebase not configured');
  const snap = await getDocs(query(collection(db, COLLECTION), orderBy('createdAt', 'desc')));
  return snap.docs.map(mapDoc);
}
