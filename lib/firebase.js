import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

export const firebaseConfig = {
  apiKey: "AIzaSyB_4rImiyqDmLiiF-1zE1n3hsk8kxMlqwE",
  authDomain: "nxs-f7efb.firebaseapp.com",
  projectId: "nxs-f7efb",
  storageBucket: "nxs-f7efb.firebasestorage.app",
  messagingSenderId: "581491931080",
  appId: "1:581491931080:web:4dacc2ca11fa4fb9a432fd"
}

let app = getApps().length===0 ? initializeApp(firebaseConfig) : getApps()[0]
export const db = getFirestore(app)
export const auth = getAuth(app)

enableIndexedDbPersistence(db).then(()=>console.log("Offline ON")).catch(e=>console.log("Offline skip:", e.code))
