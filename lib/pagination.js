import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import { getSchoolScopedCollection } from './firebase'
export const loadLessonsPaginated = async (schoolId, lastDoc = null) => {
  const lessonsRef = collection(db, `schools/${schoolId}/lessons`)
  let q
  if (lastDoc) {
    q = query(lessonsRef, orderBy('created_at','desc'), startAfter(lastDoc), limit(20))
  } else {
    q = query(lessonsRef, orderBy('created_at','desc'), limit(20))
  }
  const snap = await getDocs(q)
  const lessons = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  const lastVisible = snap.docs[snap.docs.length-1]
  return { lessons, lastVisible, hasMore: lessons.length===20 }
}
