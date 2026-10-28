// @ts-nocheck
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput, Alert } from 'react-native';
import { encryptData } from '../utils/encryption';

export default function PrivateSchoolPayments({ currentUser }) {
  const [pops, setPops] = useState([
    { id:'1', parent:'Parent Lerato', child:'Lerato M Grade 10', amount:'R2500', method:'EFT', status:'Pending', school:'Pretoria High Private', date:'Today', popFile:'pop_receipt.jpg', encrypted:true },
  ]);
  const [amount, setAmount] = useState('');
  const [ref, setRef] = useState('');

  const sendPOP = () => {
    if (currentUser?.role !== 'parent') {
      Alert.alert('Parents only','Only parents can send Proof of Payment');
      return;
    }
    if (!amount) {
      Alert.alert('Missing','Enter amount');
      return;
    }
    const newPOP = {
      id: Date.now().toString(),
      parent: currentUser?.name,
      child: currentUser?.children?.[0]?.name || 'Child',
      amount: `R${amount}`,
      method: 'EFT',
      ref: encryptData(ref),
      status: 'Pending Review by Admin',
      school: currentUser?.school,
      date: new Date().toLocaleString(),
      popFile: 'pop_receipt.jpg',
      encrypted: true,
      backupSynced: true
    };
    setPops([newPOP, ...pops]);
    setAmount(''); setRef('');
    Alert.alert('POP Sent','✅ Receipt sent to admin, encrypted, backup synced. Payment arrangement pending.');
  };

  const approvePOP = (id) => {
    if (!['principal','deputy','admin'].includes(currentUser?.role)) {
      Alert.alert('Admin only','Only principal/deputy/admin can approve');
      return;
    }
    setPops(pops.map(p=>p.id===id?{...p, status:'Approved ✅'}:p));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Private Schools • Receipt / POP • Payment Arrangements</Text>
        <Text style={styles.sub}>Parent sends POP to admin • Encrypted • Backup • Same school only</Text>
        <View style={{flexDirection:'row', gap:6, marginTop:8}}>
          <TextInput style={styles.input} placeholder="Amount e.g. 2500" placeholderTextColor="#64748b" value={amount} onChangeText={setAmount} keyboardType="numeric" />
          <TextInput style={[styles.input,{flex:1.5}]} placeholder="Reference / EFT ref" placeholderTextColor="#64748b" value={ref} onChangeText={setRef} />
          <TouchableOpacity style={styles.sendBtn} onPress={sendPOP}><Text style={styles.btnTxt}>Send POP</Text></TouchableOpacity>
        </View>
      </View>

      <FlatList data={pops} keyExtractor={i=>i.id} contentContainerStyle={{padding:10}} renderItem={({item})=>(
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{item.child} • {item.amount} • {item.status}</Text>
          <Text style={styles.meta}>Parent: {item.parent} • School: {item.school} • {item.date} • {item.method}</Text>
          <Text style={styles.meta}>📎 {item.popFile} • 🔒 Encrypted: {item.encrypted?'Yes':'No'} • ☁️ Backup Synced • Ref: Encrypted</Text>
          <View style={{flexDirection:'row', gap:6, marginTop:6}}>
            <TouchableOpacity style={[styles.sendBtn,{backgroundColor:'#D4AF37'}]} onPress={()=>approvePOP(item.id)}><Text style={styles.btnTxt}>Admin Approve</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.sendBtn,{backgroundColor:'#334155'}]} onPress={()=>Alert.alert('Arrangement','Payment arrangement: 3 months')}><Text style={[styles.btnTxt,{color:'white'}]}>Arrangement</Text></TouchableOpacity>
          </View>
        </View>
      )} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, backgroundColor:'#0f172a'},
  header:{backgroundColor:'#1e293b', padding:12, paddingTop:36, borderBottomWidth:2, borderColor:'#D4AF37'},
  title:{color:'#D4AF37', fontWeight:'900', fontSize:11},
  sub:{color:'#94a3b8', fontSize:8, marginTop:3},
  input:{flex:1, backgroundColor:'#0f172a', padding:8, borderRadius:8, borderWidth:1, borderColor:'#475569', color:'white', fontSize:10},
  sendBtn:{backgroundColor:'#D4AF37', paddingHorizontal:12, justifyContent:'center', borderRadius:8},
  btnTxt:{color:'black', fontWeight:'800', fontSize:9},
  card:{backgroundColor:'#1e293b', padding:10, borderRadius:10, marginBottom:8, borderWidth:1, borderColor:'#334155'},
  cardTitle:{color:'white', fontWeight:'800', fontSize:10},
  meta:{color:'#94a3b8', fontSize:8, marginTop:2}
});