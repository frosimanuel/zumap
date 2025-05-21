// Firebase data layer for drops
import { db, storage } from './firebase';
import { ref, push, set, onValue, remove, get, child } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Get all drops (one-time fetch)
export async function getAllDrops() {
  const snapshot = await get(child(ref(db), 'drops'));
  const val = snapshot.val() || {};
  return Object.entries(val).map(([id, drop]) => ({ id, ...drop }));
}

// Listen to all drops (real-time)
export function listenToDrops(callback) {
  return onValue(ref(db, 'drops'), (snapshot) => {
    const val = snapshot.val() || {};
    const drops = Object.entries(val).map(([id, drop]) => ({ id, ...drop }));
    callback(drops);
  });
}

// Add a drop, uploading file if needed
export async function addDrop(drop, file) {
  let url = drop.url;
  if (file) {
    const ext = drop.type === 'image' ? 'jpg' : 'pdf';
    const filename = `${Date.now()}.${ext}`;
    const sRef = storageRef(storage, `drops/${filename}`);
    await uploadBytes(sRef, file);
    url = await getDownloadURL(sRef);
  }
  const dropData = { ...drop, url };
  const newRef = push(ref(db, 'drops'));
  await set(newRef, dropData);
  return { id: newRef.key, ...dropData };
}

// Remove all drops (for testing)
export async function resetDrops() {
  await set(ref(db, 'drops'), null);
}
