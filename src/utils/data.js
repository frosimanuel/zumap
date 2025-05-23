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

// Upload any content (text or file) to Codex and return CID
export async function uploadToCodex(content) {
  const response = await fetch('http://localhost:8080/api/codex/v1/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    body: content
  });
  if (!response.ok) {
    throw new Error('Failed to upload to Codex');
  }
  // Codex returns the CID as plain text (possibly quoted)
  let cid = (await response.text()).trim();
  if (cid.startsWith('"') && cid.endsWith('"')) {
    cid = cid.substring(1, cid.length - 1);
  }
  return cid;
}

// Add a drop, uploading file or text to Codex for all types
export async function addDrop(drop, file) {
  let url = drop.url;
  let codexCid = undefined;
  try {
    if (file) {
      // Upload file to Firebase Storage as before
      const ext = drop.type === 'image' ? 'jpg' : 'pdf';
      const filename = `${Date.now()}.${ext}`;
      const sRef = storageRef(storage, `drops/${filename}`);
      await uploadBytes(sRef, file);
      url = await getDownloadURL(sRef);
      // Upload file to Codex
      codexCid = await uploadToCodex(file);
    } else if (drop.type === 'text' && typeof drop.url === 'string') {
      // Upload text to Codex
      codexCid = await uploadToCodex(drop.url);
    }
  } catch (e) {
    console.error('Codex upload failed:', e);
  }
  const dropData = { ...drop, url };
  if (codexCid) dropData.codexCid = codexCid;
  const newRef = push(ref(db, 'drops'));
  await set(newRef, dropData);
  if (codexCid) {
    // Print curl command to retrieve from Codex (output to terminal)
    console.log(`To retrieve the content from Codex, run:\ncurl http://localhost:8080/api/codex/v1/data/${codexCid}/network/stream`);
  }
  return { id: newRef.key, ...dropData };
}

// Remove all drops (for testing)
export async function resetDrops() {
  await set(ref(db, 'drops'), null);
}
