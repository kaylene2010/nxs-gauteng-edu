// @ts-nocheck
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';

// === YOUR RULES ===
const MAX_GROUP_SIZE = 1000;

const SCHOOL_KEYWORDS = ['homework','assignment','test','exam','project','maths','science','english','history','geography','grade','class','school','lesson'];
const BANNED_WORDS = ['sex','betting','gamble','drugs','nudes','crypto']; // non-school messages

function isSchoolRelated(text) {
  const t = text.toLowerCase();
  if (BANNED_WORDS.some(w => t.includes(w))) return false;
  // Must contain at least 1 school keyword OR be parent->teacher question
  if (SCHOOL_KEYWORDS.some(w => t.includes(w))) return true;
  // Allow short parent queries like "How is my child?"
  if (t.includes('my child') || t.includes('progress') || t.includes('meeting')) return true;
  return false;
}

export default function ChatSystem({ currentUser }) {
  // currentUser = { id, role, school, name, district, children: [] } 
  // role: 'student','teacher','parent','principal','deputy'
  const [users] = useState([
    { id: 's1', name: 'Thabo', role: 'student', school: 'Pretoria High' },
    { id: 't1', name: 'Mrs Dlamini', role: 'teacher', school: 'Pretoria High' },
    { id: 'p1', name: 'Principal Khumalo', role: 'principal', school: 'Pretoria High' },
  ]);

  const [groups, setGroups] = useState([
    { id: 'g1', name: 'Grade 10 Maths', school: 'Pretoria High', members: ['s1','t1'], createdBy: 't1', type: 'class' },
  ]);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const user = currentUser || { id: 's1', role: 'student', school: 'Pretoria High', name: 'You' };

  // === PERMISSION CHECKS ===
  const canCreateGroup = () => {
    return ['teacher','parent','principal','deputy'].includes(user.role);
  };

  const canAddUser = (targetUser) => {
    // Rule: Only people from same school can add each other
    if (targetUser.school !== user.school) {
      Alert.alert('Blocked', 'Only same school users can add each other');
      return false;
    }
    return true;
  };

  const canBroadcastToAll = () => {
    // Rule: Only principal + deputy can send to entire school
    return ['principal','deputy'].includes(user.role);
  };

  const createGroup = (groupName) => {
    if (!canCreateGroup()) {
      Alert.alert('Blocked', 'Only teachers and parents can create groups. Not students.');
      return;
    }
    if (groups.length >= 100) { Alert.alert('Limit reached'); return; }
    setGroups([...groups, {
      id: 'g' + Date.now(),
      name: groupName,
      school: user.school,
      members: [user.id],
      createdBy: user.id,
      type: 'custom'
    }]);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    if (!selectedGroup) { Alert.alert('Select a group first'); return; }

    // Rule: Filter non-school messages
    if (!isSchoolRelated(input)) {
      Alert.alert('Message Blocked', 'No messages not school-related can be sent. This will be filtered.');
      return;
    }

    // Rule: Check if group is entire school broadcast
    if (selectedGroup.isAllSchool && !canBroadcastToAll()) {
      Alert.alert('Blocked', 'Only Principal and Deputy Principal can send messages to entire school');
      return;
    }

    // Rule: Check group size
    if (selectedGroup.members.length >= MAX_GROUP_SIZE) {
      Alert.alert('Group full', `Maximum ${MAX_GROUP_SIZE} students in one group`);
      return;
    }

    // Rule: Offline queue — save locally even if no internet
    const newMsg = {
      id: Date.now().toString(),
      text: input,
      from: user.id,
      fromName: user.name,
      groupId: selectedGroup.id,
      time: new Date().toISOString(),
      school: user.school,
      pendingSync: true // will sync when online
    };

    setMessages([...messages, newMsg]);
    setInput('');

    // TODO: save to local SQLite for offline + auto 1-hour reminder before due date
    // FileSystem.writeAsStringAsync(...)
  };

  return (
    <View style={{flex:1, backgroundColor:'#0f172a'}}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NXS Chat • {user.school}</Text>
        <Text style={styles.headerSub}>{user.role.toUpperCase()} • {user.name} • Same-school only</Text>
      </View>

      {/* GROUPS LIST */}
      <View style={{flexDirection:'row', flex:1}}>
        <View style={styles.sidebar}>
          <Text style={styles.sideTitle}>Groups</Text>
          <FlatList 
            data={groups.filter(g=>g.school===user.school)}
            renderItem={({item})=>(
              <TouchableOpacity onPress={()=>setSelectedGroup(item)} style={[styles.groupItem, selectedGroup?.id===item.id&&styles.groupActive]}>
                <Text style={styles.groupName}>{item.name}</Text>
                <Text style={styles.groupMeta}>{item.members.length}/{MAX_GROUP_SIZE}</Text>
              </TouchableOpacity>
            )}
          />
          {canCreateGroup() && (
            <TouchableOpacity style={styles.createBtn} onPress={()=>createGroup('New Grade ' + (groups.length+1))}>
              <Text style={styles.createTxt}>+ Create Group</Text>
            </TouchableOpacity>
          )}
          {canBroadcastToAll() && (
            <TouchableOpacity style={[styles.createBtn,{backgroundColor:'#D4AF37'}]} onPress={()=>setSelectedGroup({id:'all', name:'ENTIRE SCHOOL', isAllSchool:true, members:[]})}>
              <Text style={[styles.createTxt,{color:'black'}]}>📢 Entire School</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* MESSAGES */}
        <View style={styles.chatArea}>
          {!selectedGroup ? <Text style={styles.empty}>Select a group. Parents can invite teachers to private meetings here.</Text> :
          <>
            <Text style={styles.chatTitle}>{selectedGroup.name} • {selectedGroup.isAllSchool ? 'Broadcast by Principal/Deputy only' : 'Filtered: school-related only'}</Text>
            <FlatList data={messages.filter(m=>m.groupId===selectedGroup.id)} style={{flex:1}} renderItem={({item})=><View style={styles.msg}><Text style={styles.msgFrom}>{item.fromName}</Text><Text style={styles.msgText}>{item.text}</Text></View>} />
            <View style={styles.inputBar}>
              <TextInput style={styles.input} placeholder="Type school work only..." value={input} onChangeText={setInput} placeholderTextColor="#64748b" />
              <TouchableOpacity style={styles.send} onPress={sendMessage}><Text style={{color:'black',fontWeight:'900'}}>↑</Text></TouchableOpacity>
            </View>
          </>
          }
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header:{backgroundColor:'#1e293b', padding:12, paddingTop:36, borderBottomWidth:2, borderColor:'#D4AF37'},
  headerTitle:{color:'#D4AF37', fontWeight:'900', fontSize:14},
  headerSub:{color:'#94a3b8', fontSize:9, marginTop:2},
  sidebar:{width:130, backgroundColor:'#1e293b', borderRightWidth:1, borderColor:'#334155', padding:8},
  sideTitle:{color:'#D4AF37', fontWeight:'800', fontSize:10, marginBottom:8},
  groupItem:{padding:8, backgroundColor:'#0f172a', borderRadius:8, marginBottom:6, borderWidth:1, borderColor:'#334155'},
  groupActive:{borderColor:'#D4AF37', backgroundColor:'#334155'},
  groupName:{color:'white', fontSize:11, fontWeight:'700'},
  groupMeta:{color:'#94a3b8', fontSize:8, marginTop:2},
  createBtn:{backgroundColor:'#1e3a8a', padding:8, borderRadius:8, marginTop:10, alignItems:'center'},
  createTxt:{color:'white', fontSize:10, fontWeight:'800'},
  chatArea:{flex:1, backgroundColor:'#0f172a', padding:8},
  chatTitle:{color:'#D4AF37', fontSize:9, fontWeight:'700', marginBottom:8},
  empty:{color:'#64748b', fontSize:11, marginTop:40, textAlign:'center'},
  msg:{backgroundColor:'#1e293b', padding:8, borderRadius:10, marginBottom:6, borderWidth:1, borderColor:'#334155'},
  msgFrom:{color:'#D4AF37', fontSize:9, fontWeight:'800'},
  msgText:{color:'white', fontSize:11, marginTop:2},
  inputBar:{flexDirection:'row', gap:6, marginTop:8},
  input:{flex:1, backgroundColor:'#1e293b', padding:10, borderRadius:20, borderWidth:1, borderColor:'#475569', color:'white', fontSize:11},
  send:{backgroundColor:'#D4AF37', width:40, height:40, borderRadius:20, justifyContent:'center', alignItems:'center'}
});