import React from 'react';
import {View, Text, Button, Alert, StyleSheet, Linking} from 'react-native';

export default function VideoCall(){
  const startCall = () => {
    // For GDE pilot - using Jitsi link (zero-rated friendly)
    const room = `NXS_${Date.now()}`;
    const url = `https://meet.jit.si/${room}`;
    Alert.alert('Video Class', `Opening: ${room}`, [{text:'Join', onPress:()=> Linking.openURL(url)}]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NXS Video Classes</Text>
      <Text style={styles.sub}>Screen share + recording (GDE compliant)</Text>
      <View style={styles.card}>
        <Text>• Teacher can share screen</Text>
        <Text>• Auto record for offline learners</Text>
        <Text>• Works on low data</Text>
      </View>
      <Button title="Start Class Call" onPress={startCall} color="#0a2a5e"/>
      <Text style={styles.note}>Uses Jitsi (free, no data heavy). Later we add Agora for R600k/mo scale.</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{flex:1, padding:20, paddingTop:50},
  title:{fontSize:22, fontWeight:'bold', color:'#0a2a5e'},
  sub:{color:'#666', marginBottom:20},
  card:{backgroundColor:'#fff3cd', padding:15, borderRadius:10, marginBottom:20},
  note:{marginTop:20, fontSize:12, color:'#888'}
});