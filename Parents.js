import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Button, FlatList, StyleSheet} from 'react-native';
import {saveOffline, getOffline} from '../utils/storage';

export default function ParentChat(){
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(()=>{ getOffline('nxs_parent_chat').then(d=>{ if(d) setMessages(d); }); }, []);

  const send = async () => {
    if(!text) return;
    const newMsg = {id: Date.now().toString(), text, from: 'Parent', time: new Date().toLocaleTimeString()};
    const updated = [newMsg, ...messages];
    setMessages(updated);
    await saveOffline('nxs_parent_chat', updated);
    setText('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parents & Teachers Chat</Text>
      <View style={styles.row}>
        <TextInput value={text} onChangeText={setText} placeholder="Ask teacher..." style={styles.input}/>
        <Button title="Send" onPress={send}/>
      </View>
      <FlatList data={messages} keyExtractor={i=>i.id} renderItem={({item})=>(
        <View style={styles.bubble}><Text style={styles.from}>{item.from} {item.time}</Text><Text>{item.text}</Text></View>
      )}/>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{flex:1, padding:15, paddingTop:40},
  title:{fontSize:20, fontWeight:'bold', color:'#0a2a5e', marginBottom:10},
  row:{flexDirection:'row', gap:10, marginBottom:10},
  input:{flex:1, borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:10},
  bubble:{backgroundColor:'#f0f6ff', padding:12, borderRadius:8, marginBottom:8},
  from:{fontWeight:'bold', fontSize:11}
});