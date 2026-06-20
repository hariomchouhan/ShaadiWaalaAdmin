import { collection, doc, getDocs, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION = 'queries';

function serializeTimestamp(val) {
  if (!val) return null;
  if (typeof val.toDate === 'function') return val.toDate().toISOString();
  return val;
}

function mapDoc(d) {
  const data = d.data();
  return {
    id: d.id,
    ...data,
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
  };
}

export async function fetchAllQueries() {
  if (!db) throw new Error('Firebase not configured');
  const snap = await getDocs(query(collection(db, COLLECTION), orderBy('createdAt', 'desc')));
  return snap.docs.map(mapDoc);
}

export async function updateQueryStatus(id, status) {
  if (!db) throw new Error('Firebase not configured');
  await updateDoc(doc(db, COLLECTION, id), {
    status,
    updatedAt: new Date().toISOString(),
  });
}
