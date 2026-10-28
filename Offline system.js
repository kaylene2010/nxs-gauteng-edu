import AsyncStorage from '@react-native-async-storage/async-storage'

// Save lesson progress offline
export const saveProgressOffline = async (studentId, lessonId, progress) => {
  const key = `progress_${studentId}_${lessonId}`
  const data = {
    ...progress,
    last_updated: new Date().toISOString(),
    synced: false // will sync when online
  }
  await AsyncStorage.setItem(key, JSON.stringify(data))
  console.log("Progress saved offline:", key)
}

// Get all unsynced progress to push when online
export const getUnsyncedProgress = async () => {
  const keys = await AsyncStorage.getAllKeys()
  const progressKeys = keys.filter(k => k.startsWith('progress_'))
  const items = await AsyncStorage.multiGet(progressKeys)
  
  const unsynced = []
  items.forEach(([key, value]) => {
    const data = JSON.parse(value)
    if (!data.synced) unsynced.push({ key, data })
  })
  return unsynced
}