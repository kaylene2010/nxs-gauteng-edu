import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { loadLessonsPaginated } from '../lib/pagination'
export default function Dashboard() {
  const [lessons, setLessons] = useState([])
  const [lastDoc, setLastDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [schoolId, setSchoolId] = useState(null)
  useEffect(()=>{ init() },[])
  const init = async () => {
    const sId = await AsyncStorage.getItem('school_id')
    setSchoolId(sId)
    const { lessons:first, lastVisible } = await loadLessonsPaginated(sId)
    setLessons(first); setLastDoc(lastVisible); setLoading(false)
  }
  const loadMore = async () => {
    if(!lastDoc) return
    const { lessons:more, lastVisible } = await loadLessonsPaginated(schoolId, lastDoc)
    setLessons([...lessons,...more]); setLastDoc(lastVisible)
  }
  if(loading) return <ActivityIndicator size="large" style={{marginTop:100}}/>
  return (
    <View style={{flex:1,padding:16}}>
      <Text style={{fontSize:22,fontWeight:'bold',marginBottom:10}}>Lessons - {lessons.length} loaded</Text>
      <FlatList data={lessons} keyExtractor={i=>i.id} onEndReached={loadMore} onEndReachedThreshold={0.5}
        renderItem={({item})=><TouchableOpacity style={{padding:15,backgroundColor:'#f0f0f0',marginBottom:10,borderRadius:8}}><Text style={{fontWeight:'600'}}>{item.title||'Lesson'}</Text><Text>{item.subject||'General'}</Text></TouchableOpacity>}
      />
    </View>
  )
}
