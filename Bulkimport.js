const { initializeApp } = require('firebase/app')
const { getFirestore, collection, doc, setDoc, writeBatch } = require('firebase/firestore')
const fs = require('fs')
const csv = require('csv-parser')

// --- PASTE YOUR FIREBASE CONFIG HERE - same as lib/firebase.js ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function importSchools() {
  const schools = []
  
  fs.createReadStream('schools.csv')
    .pipe(csv())
    .on('data', (row) => schools.push(row))
    .on('end', async () => {
      console.log(`Found ${schools.length} schools in CSV`)

      let batch = writeBatch(db)
      let count = 0
      let committed = 0

      for (let i = 0; i < schools.length; i++) {
        const s = schools[i]
        const provCode = s.province ? s.province.substring(0,3).toUpperCase() : 'UNK'
        const schoolCode = `NXS-${provCode}-${String(i+1).padStart(4, '0')}`
        
        const schoolRef = doc(collection(db, 'schools'))
        batch.set(schoolRef, {
          school_code: schoolCode,
          name: s.school_name,
          province: s.province,
          contact: s.contact,
          students_count: parseInt(s.students_count) || 0,
          created_at: new Date(),
          status: 'active'
        })
        
        count++
        // Firestore batch limit is 500, we use 400 to be safe
        if (count % 400 === 0) {
          await batch.commit()
          committed += 400
          console.log(`Committed ${committed}/${schools.length} schools`)
          batch = writeBatch(db)
        }
      }
      
      // Commit remaining
      if (count % 400 !== 0) {
        await batch.commit()
        console.log(`Done! Total ${schools.length} schools imported`)
      }
    })
}

importSchools().catch(e => console.error(e))