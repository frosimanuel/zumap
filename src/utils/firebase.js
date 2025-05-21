// Firebase initialization
// Replace the below config with your actual Firebase project config!
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAhPG_fHlD31E0ZcbUjkdxcIXKZaiW1fhM",
  authDomain: "zumap-bc1e3.firebaseapp.com",
  projectId: "zumap-bc1e3",
  storageBucket: "zumap-bc1e3.firebasestorage.app",
  messagingSenderId: "403748843545",
  appId: "1:403748843545:web:d0e2106ccc4d678f057a88",
  databaseURL: "https://zumap-bc1e3-default-rtdb.firebaseio.com/"
};


const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app);
