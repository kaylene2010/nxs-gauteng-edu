import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore'
import { db, getSchoolScopedCollection } from './firebase'

// Load 20 lessons at a time — not 4000 at once
export const loadLessonsPaginated = async (schoolId, lastDoc = null) => {
  const lessonsRef = getSchoolScopedCollection(schoolId, 'lessons')
  
  let q
  if (lastDoc) {
    q = query(lessonsRef, orderBy('created_at', 'desc'), startAfter(lastDoc), limit(20))
  } else {
    q = query(lessonsRef, orderBy('created_at', 'desc'), limit(20))
  }
  
  const snapshot = await getDocs(q)
  const lessons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  const lastVisible = snapshot.docs[snapshot.docs.length - 1]
  
  return { lessons, lastVisible, hasMore: lessons.length === 20 }
}