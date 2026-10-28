// @ts-nocheck
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';

export default function App() {
  // Change this to test: Learner, Teacher, Parent, Principal, Admin
  const [role, setRole] = useState('Learner'); 
  const [menuOpen, setMenuOpen] = useState(true);
  const [selected, setSelected] = useState('Due assignments');
  const [msgTo, setMsgTo] = useState('');

  const USER = { name: 'Thabo M.', school: 'Parktown Boys High', grade: 'Grade 10', pic: 'TM', district: 'Johannesburg East' };

  const MENUS = {
    Learner: ['Due assignments', 'Groups', 'AI tutors'],
    Teacher: ['Groups', 'Set reminders', 'Auto work send'],
    Parent: ["Child's progress", 'Teachers', 'Messages'],
    Principal: ['Notifications', 'Send to entire school'],
    Admin: ['Message teachers & parents', 'Add parents only', 'Messages']
  };

  const RULES = {
    Principal: { canMsg: 'Everyone', desc: 'Can message EVERYONE in school' },
    Admin: { canMsg: 'Parents + Teachers only', desc: 'Can ONLY message Parents & Teachers (NOT students)' },
    Teacher: { canMsg: 'Everyone', desc: 'Can message EVERYONE' },
    Parent: { canMsg: 'Everyone', desc: 'Can message EVERYONE (Teachers, Principal, Admin)' },
    Learner: { canMsg: 'Teachers only', desc: 'Can ONLY message Teachers' },
  };

  const canSendTo = (targetRole) => {
    if (role === 'Learner' && targetRole !== 'Teacher') return false;
    if (role === 'Admin' && (targetRole === 'Learner' || targetRole === 'Student')) return false;
    return true;
  };

  const menu = MENUS[role] || MENUS.Learner;

  return (
    <View style={{flex:1, backgroundColor:'#e5e7eb'}}>
      {/* TOP PROFILE BAR */}
      <View style={styles.topBar}>
        <View style={styles.avatar}><Text style={styles.avatarT}>{USER.pic}</Text></View>
        <View style={{flex:1, marginLeft:10}}>
          <Text style={styles.name}>{USER.name} • {role}</Text>
          <Text style={styles.sub}>{USER.school} • {USER.grade}</Text>
          <Text style={styles.rule}>{RULES[role].desc} 🔒</Text>
        </View>
        <TouchableOpacity onPress={()=>setMenuOpen(!menuOpen)} style={styles.menuBtn}><Text style={{fontSize:18}}>☰</Text></TouchableOpacity>
      </View>

      {/* ROLE SWITCHER FOR TESTING */}
      <View style={styles.roleSwitcher}>
        <Text style={{fontSize:9, fontWeight:'800'}}>Test Role:</Text>
        {['Learner','Teacher','Parent','Principal','Admin'].map(r=><TouchableOpacity key={r} style={[styles.roleChip, role===r&&styles.roleOn]} onPress={()=>{setRole(r); setSelected(MENUS[r][0])}}><Text style={[styles.roleT, role===r&&{color:'white'}]}>{r}</Text></TouchableOpacity>)}
      </View>

      <View style={{flex:1, flexDirection:'row'}}>
        {/* SIDE MENU */}
        {menuOpen && (
          <View style={styles.side}>
            <Text style={styles.sideTitle}>{role} Menu</Text>
            {menu.map(item=>(
              <TouchableOpacity key={item} style={[styles.sideItem, selected===item&&styles.sideActive]} onPress={()=>setSelected(item)}>
                <Text style={[styles.sideText, selected===item&&{color:'white', fontWeight:'900'}]}>{item}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.ruleBox}>
              <Text style={styles.ruleTitle}>Messaging Rule</Text>
              <Text style={styles.ruleText}>You are {role}{"\n"}{RULES[role].desc}</Text>
              <Text style={styles.ruleCan}>Can message: {RULES[role].canMsg}</Text>
            </View>
          </View>
        )}

        {/* MAIN CONTENT */}
        <ScrollView style={styles.main} contentContainerStyle={{padding:12}}>
          <Text style={styles.mainTitle}>{selected}</Text>

          {/* STUDENT */}
          {role==='Learner' && selected==='Due assignments' && <View style={styles.card}><Text style={styles.cardTitle}>📚 Due This Week</Text><Text style={styles.item}>• Maths - Algebra WS - Due Mon</Text><Text style={styles.item}>• Physical Sciences - Test Fri</Text></View>}
          {role==='Learner' && selected==='Groups' && <View style={styles.card}><Text style={styles.cardTitle}>👥 My Groups</Text><Text style={styles.item}>• Grade 10 Maths Group</Text><Text style={styles.item}>• Science Club</Text></View>}
          {role==='Learner' && selected==='AI tutors' && <View style={styles.card}><Text style={styles.cardTitle}>🤖 AI Tutors - {USER.grade}</Text><Text style={styles.item}>Chat in your 11 languages - only Teachers can be messaged</Text><TouchableOpacity style={styles.blue} onPress={()=>Alert.alert('Blocked','Learners can only message Teachers')}><Text style={styles.blueT}>Try Message Student (Blocked)</Text></TouchableOpacity><TouchableOpacity style={[styles.blue, {backgroundColor:'#16a34a', marginTop:6}]} onPress={()=>Alert.alert('Allowed','You can message Teacher')}><Text style={styles.blueT}>Message Teacher (Allowed) ✓</Text></TouchableOpacity></View>}

          {/* TEACHER */}
          {role==='Teacher' && selected==='Groups' && <View style={styles.card}><Text style={styles.cardTitle}>👥 Class Groups</Text><Text style={styles.item}>• Grade 10A - 32 learners</Text><Text style={styles.item}>• Grade 11B - 28 learners</Text></View>}
          {role==='Teacher' && selected==='Set reminders' && <View style={styles.card}><Text style={styles.cardTitle}>⏰ Set Reminder</Text><TextInput style={styles.input} placeholder="Reminder for class..." /><TouchableOpacity style={styles.gold}><Text style={styles.goldT}>Send to Everyone</Text></TouchableOpacity></View>}
          {role==='Teacher' && selected==='Auto work send' && <View style={styles.card}><Text style={styles.cardTitle}>📤 Auto Work Send</Text><Text style={styles.item}>Auto-send homework to groups at set time</Text><TouchableOpacity style={styles.blue}><Text style={styles.blueT}>Schedule Work</Text></TouchableOpacity></View>}

          {/* PARENT */}
          {role==='Parent' && selected==="Child's progress" && <View style={styles.card}><Text style={styles.cardTitle}>📈 Thabo's Progress</Text><Text style={styles.item}>Maths: 78% • Science: 82%</Text><Text style={styles.item}>Attendance: 95%</Text></View>}
          {role==='Parent' && selected==='Teachers' && <View style={styles.card}><Text style={styles.cardTitle}>👨‍🏫 Teachers</Text><Text style={styles.item}>• Mr Dlamini - Maths</Text><Text style={styles.item}>• Ms Nkosi - Science</Text></View>}
          {role==='Parent' && selected==='Messages' && <View style={styles.card}><Text style={styles.cardTitle}>💬 Messages - Can message Everyone</Text><Text style={styles.item}>Parents can message Teachers, Principal, Admins, etc.</Text></View>}

          {/* PRINCIPAL */}
          {role==='Principal' && selected==='Notifications' && <View style={styles.card}><Text style={styles.cardTitle}>🔔 School Notifications</Text><Text style={styles.item}>• 12 new admissions pending</Text><Text style={styles.item}>• Staff meeting tomorrow 8am</Text></View>}
          {role==='Principal' && selected==='Send to entire school' && <View style={styles.card}><Text style={styles.cardTitle}>📢 Broadcast to Entire School</Text><TextInput style={[styles.input, {height:80}]} multiline placeholder="Message to ALL learners, parents, teachers..." /><TouchableOpacity style={styles.gold} onPress={()=>Alert.alert('Sent','Broadcast to entire school sent')}><Text style={styles.goldT}>📢 Send to EVERYONE</Text></TouchableOpacity></View>}

          {/* ADMIN */}
          {role==='Admin' && selected==='Message teachers & parents' && <View style={styles.card}><Text style={styles.cardTitle}>✉️ Message Center</Text><Text style={styles.ruleText}>Admins: Only Parents + Teachers (NOT Students)</Text><TouchableOpacity style={[styles.blue, {backgroundColor:'#dc2626', marginTop:8}]} onPress={()=>Alert.alert('Blocked','Admins cannot message Students')}><Text style={styles.blueT}>Try Message Student - BLOCKED ❌</Text></TouchableOpacity><TouchableOpacity style={[styles.blue, {backgroundColor:'#16a34a', marginTop:6}]} onPress={()=>Alert.alert('Allowed','Admin -> Parent allowed')}><Text style={styles.blueT}>Message Parent - ALLOWED ✓</Text></TouchableOpacity></View>}
          {role==='Admin' && selected==='Add parents only' && <View style={styles.card}><Text style={styles.cardTitle}>➕ Add Parents Only</Text><Text style={styles.item}>Admins can add ONLY Parents - NOT Students</Text><TextInput style={styles.input} placeholder="Parent Phone / Gmail" /><TouchableOpacity style={styles.blue}><Text style={styles.blueT}>Add Parent</Text></TouchableOpacity></View>}
          {role==='Admin' && selected==='Messages' && <View style={styles.card}><Text style={styles.cardTitle}>💬 Messages Log</Text><Text style={styles.item}>• To Parents: Fee reminder sent</Text><Text style={styles.item}>• To Teachers: Meeting invite</Text></View>}

          <View style={{height:100}} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar:{flexDirection:'row', alignItems:'center', backgroundColor:'white', padding:12, paddingTop:36, borderBottomWidth:1, borderColor:'#e5e7eb'},
  avatar:{width:44, height:44, backgroundColor:'#1e3a8a', borderRadius:22, justifyContent:'center', alignItems:'center'},
  avatarT:{color:'white', fontWeight:'900'},
  name:{fontWeight:'900', fontSize:13, color:'#1e3a8a'},
  sub:{fontSize:10, color:'#6b7280'},
  rule:{fontSize:8, fontWeight:'800', color:'#d97706', marginTop:2},
  menuBtn:{padding:8, backgroundColor:'#f3f4f6', borderRadius:8},
  roleSwitcher:{flexDirection:'row', alignItems:'center', gap:5, padding:8, backgroundColor:'#f9fafb', flexWrap:'wrap'},
  roleChip:{paddingHorizontal:8, paddingVertical:4, backgroundColor:'white', borderRadius:16, borderWidth:1, borderColor:'#d1d5db'},
  roleOn:{backgroundColor:'#1e3a8a', borderColor:'#1e3a8a'},
  roleT:{fontSize:9, fontWeight:'700'},
  side:{width:170, backgroundColor:'white', borderRightWidth:1, borderColor:'#e5e7eb', padding:10},
  sideTitle:{fontSize:11, fontWeight:'900', color:'#1e3a8a', marginBottom:8},
  sideItem:{padding:10, borderRadius:8, backgroundColor:'#f9fafb', marginBottom:5, borderWidth:1, borderColor:'#f3f4f6'},
  sideActive:{backgroundColor:'#1e3a8a', borderColor:'#1e3a8a'},
  sideText:{fontSize:11, fontWeight:'600'},
  ruleBox:{marginTop:12, backgroundColor:'#fffbeb', padding:8, borderRadius:8, borderWidth:1, borderColor:'#fcd34d'},
  ruleTitle:{fontSize:9, fontWeight:'900', color:'#92400e'},
  ruleText:{fontSize:8, color:'#6b7280', marginTop:2},
  ruleCan:{fontSize:8, fontWeight:'800', color:'#1e3a8a', marginTop:4},
  main:{flex:1, backgroundColor:'#e5e7eb'},
  mainTitle:{fontSize:16, fontWeight:'900', color:'#1e3a8a', marginBottom:10},
  card:{backgroundColor:'white', padding:12, borderRadius:12, marginBottom:10, borderWidth:1, borderColor:'#e5e7eb'},
  cardTitle:{fontWeight:'800', fontSize:12, marginBottom:6},
  item:{fontSize:11, color:'#374151', marginBottom:3},
  input:{backgroundColor:'#f9fafb', padding:10, borderRadius:8, borderWidth:1, borderColor:'#d1d5db', marginTop:6, fontSize:11},
  blue:{backgroundColor:'#1e3a8a', padding:10, borderRadius:8, alignItems:'center'},
  blueT:{color:'white', fontWeight:'800', fontSize:11},
  gold:{backgroundColor:'#f59e0b', padding:10, borderRadius:8, alignItems:'center', borderWidth:1, borderColor:'#d97706'},
  goldT:{fontWeight:'900', fontSize:11}
});