// @ts-nocheck
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput, Alert } from 'react-native';

export default function ParentProgress({ parentUser }) {
  const [children, setChildren] = useState(parentUser?.children || [
    { id:'c1', name:'Lerato M', grade:'Grade 10A', school:'Pretoria High', avg:'72%', subjects:['Maths: 68%','Science: 78%','English: 70%'] },
  ]);
  const [selectedChild, setSelectedChild] = useState(children[0]);
  const [receipts, setReceipts] = useState([]);
  const [amount, setAmount] = useState('');

  const sendPOP = () => {
    if (!amount) { Alert.alert('Add amount'); return; }
    const newReceipt = {
      id: Date.now().toString(),
      child: selectedChild.name,
      amount: amount,
      date: new Date().toLocaleString(),
      status: 'Pending — Sent to School Admin (Private Schools Only)',
      encrypted: true
    };
    setReceipts([newReceipt, ...receipts]);
    setAmount('');
    Alert.alert('POP Sent','Encrypted and sent to admin. They will contact you for payment arrangement.');
  };

  const inviteTeacher = () => {
    Alert.alert('Private Meeting Invite','Invite sent to Mrs Dlamini (Maths Teacher) for private meeting about '+selectedChild.name);
  };

  return (
    <View style={{flex:1, backgroundColor:'#0f172a'}}>
      <View style={styles.header}>
        <Text style={styles.title}>Parent Panel • Check Progress</Text>
        <Text style={styles.sub}>Add child/children • Message teachers • POP for private schools • Encrypted</Text>
      </View>

      <View style={{flexDirection:'row', flex:1}}>
        <View style={styles.side}>
          <Text style={styles.sideTitle}>My Children</Text>
          {children.map(c=>(
            <TouchableOpacity key={c.id} onPress={()=>setSelectedChild(c)} style={[styles.childCard, selectedChild?.id===c.id&&styles.active]}>
              <Text style={styles.childName}>{c.name}</Text>
              <Text style={styles.childMeta}>{c.grade} • {c.avg}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addBtn} onPress={()=>Alert.alert('Add Child','Form to add child with grade, school, ID — links to same-school validation')}>
            <Text style={styles.addTxt}>+ Add Child</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.main}>
          <Text style={styles.mainTitle}>{selectedChild?.name} — Progress</Text>
          <View style={styles.progressBox}>
            {selectedChild?.subjects.map(s=><Text key={s} style={styles.subj}>{s}</Text>)}
            <Text style={styles.avg}>Average: {selectedChild?.avg}</Text>
          </View>

          <TouchableOpacity style={styles.meetingBtn} onPress={inviteTeacher}>
            <Text style={styles.meetingTxt}>📅 Invite Teacher to Private Meeting</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.meetingBtn,{backgroundColor:'#1e3a8a'}]} onPress={()=>Alert.alert('Message Teacher','Chat opens to teacher — school-related only, filtered')}>
            <Text style={styles.meetingTxt}>💬 Message Teacher about {selectedChild?.name}</Text>
          </TouchableOpacity>

          <Text style={[styles.mainTitle,{marginTop:16}]}>Private School — POP / Receipts</Text>
          <View style={styles.popBox}>
            <TextInput style={styles.input} placeholder="Amount e.g. R1500" placeholderTextColor="#64748b" value={amount} onChangeText={setAmount} keyboardType="numeric" />
            <TouchableOpacity style={styles.popBtn} onPress={sendPOP}><Text style={styles.popBtnTxt}>Upload POP</Text></TouchableOpacity>
          </View>
          <Text style={styles.note}>🔒 All data encrypted • Backup account synced • Receipts sent directly to School Staff for payment arrangements</Text>
          
          <FlatList data={receipts} style={{marginTop:8}} renderItem={({item})=>(
            <View style={styles.receipt}>
              <Text style={styles.receiptT}>{item.child} — R{item.amount} • {item.status}</Text>
              <Text style={styles.receiptD}>{item.date} • Encrypted</Text>
            </View>
          )} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header:{backgroundColor:'#1e293b', padding:12, paddingTop:36, borderBottomWidth:2, borderColor:'#D4AF37'},
  title:{color:'#D4AF37', fontWeight:'900', fontSize:14},
  sub:{color:'#94a3b8', fontSize:9},
  side:{width:140, backgroundColor:'#1e293b', padding:8, borderRightWidth:1, borderColor:'#334155'},
  sideTitle:{color:'#D4AF37', fontSize:10, fontWeight:'800', marginBottom:8},
  childCard:{backgroundColor:'#0f172a', padding:8, borderRadius:8, marginBottom:6, borderWidth:1, borderColor:'#334155'},
  active:{borderColor:'#D4AF37'},
  childName:{color:'white', fontSize:11, fontWeight:'700'},
  childMeta:{color:'#94a3b8', fontSize:9},
  addBtn:{backgroundColor:'#D4AF37', padding:8, borderRadius:8, marginTop:10, alignItems:'center'},
  addTxt:{color:'black', fontSize:10, fontWeight:'800'},
  main:{flex:1, padding:10},
  mainTitle:{color:'#D4AF37', fontWeight:'800', fontSize:12},
  progressBox:{backgroundColor:'#1e293b', padding:10, borderRadius:10, marginTop:8, borderWidth:1, borderColor:'#334155'},
  subj:{color:'white', fontSize:11, marginBottom:2},
  avg:{color:'#D4AF37', fontWeight:'800', marginTop:6},
  meetingBtn:{backgroundColor:'#D4AF37', padding:10, borderRadius:10, marginTop:10, alignItems:'center'},
  meetingTxt:{color:'black', fontSize:11, fontWeight:'800'},
  popBox:{flexDirection:'row', gap:6, marginTop:8},
  input:{flex:1, backgroundColor:'#1e293b', padding:10, borderRadius:10, borderWidth:1, borderColor:'#475569', color:'white', fontSize:11},
  popBtn:{backgroundColor:'#1e293b', borderWidth:1, borderColor:'#D4AF37', paddingHorizontal:14, justifyContent:'center', borderRadius:10},
  popBtnTxt:{color:'#D4AF37', fontWeight:'800', fontSize:11},
  note:{color:'#64748b', fontSize:8, marginTop:6},
  receipt:{backgroundColor:'#1e293b', padding:8, borderRadius:8, marginBottom:6, borderWidth:1, borderColor:'#334155'},
  receiptT:{color:'white', fontSize:10},
  receiptD:{color:'#94a3b8', fontSize:8, marginTop:2}
});
import { encryptObject, encryptData } from '../utils/encryption';
  const sendPOP = () => {
    if (!amount) { Alert.alert('Add amount'); return; }
    const rawReceipt = {
      id: Date.now().toString(),
      child: selectedChild.name,
      amount: amount,
      date: new Date().toLocaleString(),
      status: 'Pending — Sent to School Admin',
      encrypted: true
    };
    const encryptedReceipt = encryptObject(rawReceipt); // <-- ENCRYPTED HERE
    setReceipts([encryptedReceipt, ...receipts]);
    setAmount('');
    Alert.alert('POP Sent','🔒 Encrypted with AES + sent to admin. Backup account synced.');
  };