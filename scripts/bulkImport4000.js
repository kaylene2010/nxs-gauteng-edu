const fs = require('fs')
const { parse } = require('csv-parse/sync')
const { initializeApp } = require('firebase/app')
const { getFirestore, doc, writeBatch } = require('firebase/firestore')
const firebaseConfig = {
  apiKey: "AIzaSyB_4rImiyqDmLiiF-1zE1n3hsk8kxMlqwE",
  authDomain: "nxs-f7efb.firebaseapp.com",
  projectId: "nxs-f7efb",
  storageBucket: "nxs-f7efb.firebasestorage.app",
  messagingSenderId: "581491931080",
  appId: "1:581491931080:web:4dacc2ca11fa4fb9a432fd"
}
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
async function run() {
  const csv = fs.readFileSync('schools.csv','utf8')
  const records = parse(csv, {columns:true, skip_empty_lines:true})
  console.log(`Found ${records.length} schools`)
  let batch = writeBatch(db)
  let count=0
  for(const row of records){
    const code=row.school_code||row.code
    if(!code) continue
    const ref=doc(db,'schools',code)
    batch.set(ref,{ school_code:code, name:row.name||'School', province:row.province||'Gauteng', district:row.district||'', created_at:new Date().toISOString() })
    count++
    if(count%400===0){ await batch.commit(); console.log(`Imported ${count}`); batch=writeBatch(db) }
  }
  if(count%400!==0) await batch.commit()
  console.log(`✅ DONE - ${count} schools imported`)
}
run()
