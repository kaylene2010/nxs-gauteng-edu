const fs=require('fs')
let csv='school_code,name,province,district\n'
for(let i=1;i<=4000;i++){
  const code=`NXS-GAU-${String(i).padStart(4,'0')}`
  csv+=`${code},School ${i},Gauteng,District ${Math.ceil(i/100)}\n`
}
fs.writeFileSync('schools.csv',csv)
console.log('Made schools.csv with 4000 rows')
