import AsyncStorage from '@react-native-async-storage/async-storage';

// NXS OFFLINE FIRST - Zero-rated logic
export const saveOffline = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    // Queue for sync when back online
    const queue = JSON.parse(await AsyncStorage.getItem('nxs_sync_queue') || '[]');
    queue.push({key, data, time: Date.now()});
    await AsyncStorage.setItem('nxs_sync_queue', JSON.stringify(queue));
    return true;
  } catch(e){ console.log(e); return false; }
};

export const getOffline = async (key) => {
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const syncWhenOnline = async () => {
  const queue = JSON.parse(await AsyncStorage.getItem('nxs_sync_queue') || '[]');
  console.log('Syncing', queue.length, 'items');
  // Here you would push to Firebase
  await AsyncStorage.setItem('nxs_sync_queue', JSON.stringify([]));
  return queue.length;
};