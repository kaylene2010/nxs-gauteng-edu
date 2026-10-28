import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { db } from '../lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function SchoolLogin({ navigation }) {
  const [schoolCode, setSchoolCode] = useState('')
  const [studentId, setStudentId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!schoolCode || !studentId) {
      Alert.alert('Missing', 'Enter school code and student ID')
      return
    }
    setLoading(true)
    try {
      // 1. Find school by code: NXS-JHB-001
      const schoolsRef = collection(db, 'schools')
      const qSchool = query(schoolsRef, where('school_code', '==', schoolCode.trim().toUpperCase()))
      const schoolSnap = await getDocs(qSchool)
      
      if (schoolSnap.empty) throw new Error('School code not found')
      const schoolDoc = schoolSnap.docs[0]
      const schoolId = schoolDoc.id

      // 2. Find student inside that school
      const studentsRef = collection(db, 'schools', schoolId, 'students')
      const qStudent = query(studentsRef, where('student_id', '==', studentId.trim()))
      const studentSnap = await getDocs(qStudent)

      if (studentSnap.empty) throw new Error('Student not found in this school')

      // 3. Save for all future queries
      await AsyncStorage.setItem('school_id', schoolId)
      await AsyncStorage.setItem('school_code', schoolCode.toUpperCase())
      await AsyncStorage.setItem('student_id', studentSnap.docs[0].id)
      await AsyncStorage.setItem('school_name', schoolDoc.data().name)

      navigation.replace('Dashboard')
    } catch (e) {
      Alert.alert('Login failed', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#0a2a5e' }}>
      <Text style={{ fontSize: 28, fontWeight: '900', color: '#f5b400', marginBottom: 8 }}>NXS Learning</Text>
      <Text style={{ color: 'white', marginBottom: 24 }}>4000 Schools — Firebase</Text>
      <TextInput placeholder="School Code (NXS-JHB-001)" value={schoolCode} onChangeText={setSchoolCode} autoCapitalize="characters" style={{ backgroundColor: 'white', padding: 14, borderRadius: 12, marginBottom: 12 }} />
      <TextInput placeholder="Student ID" value={studentId} onChangeText={setStudentId} style={{ backgroundColor: 'white', padding: 14, borderRadius: 12, marginBottom: 12 }} />
      <TouchableOpacity onPress={handleLogin} style={{ backgroundColor: '#f5b400', padding: 16, borderRadius: 12, alignItems: 'center' }}>
        <Text style={{ fontWeight: '800' }}>{loading ? 'Checking...' : 'Enter Learning'}</Text>
      </TouchableOpacity>
    </View>
  )
}