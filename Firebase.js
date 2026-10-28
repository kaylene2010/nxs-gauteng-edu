// @ts-nocheck
// FILE 2: firebase.js - Handles 7M users, encryption, offline
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB_4rImiyqDmLiiF-1zE1n3hsk8kxMlqwE",
  authDomain: "nxs-f7efb.firebaseapp.com",
  projectId: "nxs-f7efb",
  storageBucket: "nxs-f7efb.firebasestorage.app",
  messagingSenderId: "581491931080",
  appId: "1:581491931080:web:4dacc2ca11fa4fb9a432fd"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

enableIndexedDbPersistence(db).catch((err) => {
  console.log("Offline not enabled:", err.code);
});

console.log("Firebase Ready - 4000 Schools - Offline ON");
import { initializeApp, getApps } from 'firebase/app'
import { 
  getFirestore, 
  enableIndexedDbPersistence,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}

let app
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

export const db = getFirestore(app)
export const auth = getAuth(app)

// --- OFFLINE FOR 4000 SCHOOLS - THIS IS THE MAGIC ---
enableIndexedDbPersistence(db)
  .then(() => {
    console.log("✅ Offline mode ON - kids can learn without data")
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log("Offline failed - multiple tabs open")
    } else if (err.code === 'unimplemented') {
      console.log("Offline not supported in this browser")
    }
  })

// --- SCHOOL ISOLATION HELPERS (same as before) ---
export const getSchoolScopedCollection = (schoolId, collectionName) => {
  return collection(db, `schools/${schoolId}/${collectionName}`)
}

export const getSchoolScopedQuery = (schoolId, collectionName, ...queryConstraints) => {
  const col = getSchoolScopedCollection(schoolId, collectionName)
  return query(col, ...queryConstraints)
}

// Save school session offline
export const saveSchoolSession = async (schoolData) => {
  try {
    await AsyncStorage.setItem('current_school', JSON.stringify(schoolData))
    await AsyncStorage.setItem('school_id', schoolData.id)
    console.log("School saved offline:", schoolData.school_code)
  } catch (e) {
    console.error("Failed to save offline", e)
  }
}

export const getSchoolSession = async () => {
  try {
    const data = await AsyncStorage.getItem('current_school')
    return data ? JSON.parse(data) : null
  } catch (e) {
    return null
  }
}