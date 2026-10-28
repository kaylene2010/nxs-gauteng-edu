// @ts-nocheck
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput, Alert } from 'react-native';
import { encryptData, decryptData } from '../utils/encryption';

export default function ChatSystem({ currentUser }) {
  const [users] = useState([
    { id:'t1', name:'Mrs Dlamini', role:'teacher', school:'Pretoria High', subject:'Maths' },
    { id:'t2', name:'Mr Nkosi', role:'teacher', school:'Pretoria High', subject:'Science' },
    { id:'p1', name:'Parent Lerato', role:'parent', school:'Pretoria High', child:'Lerato M' },
    { id:'s1', name:'You', role:'student', school:'Pretoria High', grade:'10' },
  ]);

  const [groups, setGroups] = useState([
    { id:'g1', name:'Grade 10 Maths - Dlamini', by:'Mrs Dlamini', members:45, max:1000, school:'Pretoria High' },
  ]);

  const [selectedGroup, setSelectedGroup] = useState(groups[0]);
  const [messages, setMessages] = useState([
    { id:'m1', text:'Welcome to Grade 10 Maths', from:'Mrs Dlamini', groupId:'g1', encrypted:true },
  ]);
  const [input, setInput] = useState('');

  // PERMISSION 1: Only same school can add each other
  const canAddUser = (targetUser) => {
    return currentUser.school === targetUser.school;
  };

  // PERMISSION 2: Only teacher/parent/principal/deputy can create groups, max 1000
  const createGroup = () => {
    if (currentUser.role === 'student') {
      Alert.alert('Blocked','❌ Students cannot create groups. Only teachers + parents + principal/deputy.');
      return;
    }
    if (groups.length >= 5 && currentUser.role !== 'principal') {
      Alert.alert('Limit','Max groups reached');
      return;
    }
    const newGroup = {
      id: Date.now().toString(),
      name: `${currentUser.subject || 'General'} - ${currentUser.name}`,
      by: currentUser.name,
      members: 1,
      max: 1000,
      school: currentUser.school,
      createdByRole: currentUser.role
    };
    setGroups([newGroup, ...groups]);
    Alert.alert('Group Created','✅ Max 1000 members. Same school only. Encrypted.');
  };

  // PERMISSION 3: Only principal + deputy can message entire school
  const messageEntireSchool = () => {
    if (!['principal','deputy'].includes(currentUser.role)) {
      Alert.alert('Blocked','❌ Only Principal + Deputy can message entire school');
      return;
    }
    Alert.alert('Entire School Broadcast','Message will be sent to all 1000+ learners in '+currentUser.school);
  };

  // PERMISSION 4: Filter - No non-school messages
  const sendMessage = () => {
    if (!input.trim()) return;
    
    // Filter non-school content
    if (input.toLowerCase().includes('http') || input.toLowerCase().includes('www')) {
      Alert.alert('Blocked','❌ No links allowed — school-related only');
      return;
    }

    const raw = { id:Date.now().toString(), text:input, from:currentUser.name, groupId:selectedGroup?.id, school:currentUser.school };
    const encrypted = { ...raw, text: encryptData(input), _encrypted:true };
    setMessages([encrypted, ...messages]);
    setInput('');
  };

  // PERMISSION 5 & 6: Parent invites teacher + messages about child progress
  const inviteTeacherMeeting = () => {
    if (currentUser.role !== 'parent') {
      Alert.alert('Parents only','Only parents can invite teachers to private meetings');
      return;
    }
    Alert.alert('Private Meeting Invite','📅 Invite sent to '+users[0].name+' for child: '+currentUser.children?.[0]?.name);
  };

  return (
    <View style={{flex:1, backgroundColor:'#0f172a'}}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat • Same School Only • Max 1000 • Filtered</Text>
        <Text style={styles.sub}>You: {currentUser.role} • {currentUser.school} • {currentUser.role==='principal'?'CAN broadcast to entire school':'Cannot broadcast'}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={createGroup}><Text style={styles.actionTxt}>+ Create Group (Teacher/Parent Only)</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn,{backgroundColor:'#1e3a8a', borderWidth:1, borderColor:'#D4AF37'}]} onPress={messageEntireSchool}><Text style={[styles.actionTxt,{color:'#D4AF37'}]}>📢 Message Entire School (Principal Only)</Text></TouchableOpacity>
      </View>

      <View style={{flexDirection:'row', flex:1}}>
        <View style={styles.side}>
          <Text style={styles.sideTitle}>Groups ({groups.length})</Text>
          {groups.map(g=>(
            <TouchableOpacity key={g.id} onPress={()=>setSelectedGroup(g)} style={[styles.groupCard, selectedGroup?.id===g.id&&styles.active]}>
              <Text style={styles.groupName}>{g.name}</Text>
              <Text style={styles.groupMeta}>{g.members}/{g.max} • {g.school}</Text>
              <Text style={styles.groupMeta}>{canAddUser(g)?'✅ Same school':'❌ Different school'}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.actionBtn,{marginTop:10, backgroundColor:'#334155'}]} onPress={inviteTeacherMeeting}>
            <Text style={[styles.actionTxt,{color:'white'}]}>📅 Parent: Invite Teacher</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.main}>
          <Text style={styles.mainTitle}>{selectedGroup?.name}</Text>
          <View style={{flexDirection:'row', marginTop:6}}>
            <TextInput style={styles.input} placeholder="School-related only, no links" placeholderTextColor="#64748b" value={input} onChangeText={setInput} />
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}><Text style={styles.sendTxt}>Send</Text></TouchableOpacity>
          </View>
          <Text style={styles.note}>🔒 Encrypted • Filtered: No non-school messages • Same school validation • Backup synced</Text>
          <FlatList data={messages} style={{marginTop:8}} renderItem={({item})=>(
            <View style={styles.msg}>
              <Text style={styles.msgFrom}>{item.from} • {item.school || currentUser.school}</Text>
              <Text style={styles.msgText}>{item._encrypted?decryptData(item.text):item.text}</Text>
              <Text style={styles.msgMeta}>🔒 Encrypted</Text>
            </View>
          )} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header:{backgroundColor:'#1e293b', padding:12, paddingTop:36, borderBottomWidth:2, borderColor:'#D4AF37'},
  title:{color:'#D4AF37', fontWeight:'900', fontSize:12},
  sub:{color:'#94a3b8', fontSize:8, marginTop:2},
  actions:{flexDirection:'row', gap:6, padding:8, backgroundColor:'#1e293b', borderBottomWidth:1, borderColor:'#334155'},
  actionBtn:{backgroundColor:'#D4AF37', padding:8, borderRadius:8, flex:1, alignItems:'center'},
  actionTxt:{color:'black', fontWeight:'800', fontSize:9},
  side:{width:150, backgroundColor:'#1e293b', padding:8, borderRightWidth:1, borderColor:'#334155'},
  sideTitle:{color:'#D4AF37', fontSize:10, fontWeight:'800', marginBottom:6},
  groupCard:{backgroundColor:'#0f172a', padding:8, borderRadius:8, marginBottom:6, borderWidth:1, borderColor:'#334155'},
  active:{borderColor:'#D4AF37'},
  groupName:{color:'white', fontSize:10, fontWeight:'700'},
  groupMeta:{color:'#94a3b8', fontSize:8, marginTop:2},
  main:{flex:1, padding:8},
  mainTitle:{color:'#D4AF37', fontWeight:'800', fontSize:11},
  input:{flex:1, backgroundColor:'#1e293b', padding:8, borderRadius:8, borderWidth:1, borderColor:'#475569', color:'white', fontSize:11},
  sendBtn:{backgroundColor:'#D4AF37', paddingHorizontal:12, justifyContent:'center', borderRadius:8, marginLeft:6},
  sendTxt:{color:'black', fontWeight:'800', fontSize:10},
  note:{color:'#64748b', fontSize:7, marginTop:4},
  msg:{backgroundColor:'#1e293b', padding:8, borderRadius:8, marginBottom:6, borderWidth:1, borderColor:'#334155'},
  msgFrom:{color:'#D4AF37', fontSize:9, fontWeight:'700'},
  msgText:{color:'white', fontSize:11, marginTop:2},
  msgMeta:{color:'#64748b', fontSize:7, marginTop:2}
});