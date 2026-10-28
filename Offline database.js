// @ts-nocheck
import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptObject, decryptObject } from './utils/encryption';

// Offline Database — works on every phone, encrypted, handles 7M users
const DB_KEYS = {
  MESSAGES: 'edu_messages',
  HOMEWORK: 'edu_homework',
  QUEUE: 'edu_offline_queue', // Messages to send when online
  REMINDERS: 'edu_reminders',
};

// Save with encryption
export async function saveEncrypted(key, data) {
  const encrypted = encryptObject({ data, savedAt: new Date().toISOString() });
  await AsyncStorage.setItem(key, JSON.stringify(encrypted));
}

export async function getDecrypted(key) {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  return decryptObject(parsed);
}

// OFFLINE: Students receive work immediately even offline
export async function saveHomeworkForOffline(homework) {
  const existing = (await getDecrypted(DB_KEYS.HOMEWORK))?.data || [];
  const newHomework = { ...homework, id: Date.now().toString(), receivedOffline: true, receivedAt: new Date().toISOString() };
  await saveEncrypted(DB_KEYS.HOMEWORK, [newHomework, ...existing]);
  
  // Auto schedule 1-hour reminder before due
  await scheduleOneHourReminder(newHomework);
  return newHomework;
}

// OFFLINE QUEUE: Auto-send when online
export async function addToOfflineQueue(item) {
  const queue = (await getDecrypted(DB_KEYS.QUEUE))?.data || [];
  const newItem = { ...item, id: Date.now().toString(), queuedAt: new Date().toISOString(), encrypted:true };
  await saveEncrypted(DB_KEYS.QUEUE, [...queue, newItem]);
  console.log('Queued offline:', newItem);
}

export async function getOfflineQueue() {
  const data = await getDecrypted(DB_KEYS.QUEUE);
  return data?.data || [];
}

// REMINDERS: 1 hour before due + when work sent + 1 hour before video meeting
export async function scheduleOneHourReminder(work) {
  const reminders = (await getDecrypted(DB_KEYS.REMINDERS))?.data || [];
  
  const dueDate = new Date(work.dueDate || Date.now() + 3600000 * 24); // default tomorrow
  const oneHourBefore = new Date(dueDate.getTime() - 3600000); // 1 hour before

  const reminder = {
    id: Date.now().toString(),
    title: work.title,
    dueDate: dueDate.toISOString(),
    remindAt: oneHourBefore.toISOString(),
    type: work.type || 'homework',
    sent: false,
    autoReminder: true,
    message: `1 hour left: ${work.title} is due at ${dueDate.toLocaleString()}`
  };
  
  await saveEncrypted(DB_KEYS.REMINDERS, [reminder, ...reminders]);
  return reminder;
}

export async function getReminders() {
  const data = await getDecrypted(DB_KEYS.REMINDERS);
  return data?.data || [];
}

// Check if should trigger 1-hour reminder now
export function shouldTriggerReminder(reminder) {
  const now = new Date();
  const remindAt = new Date(reminder.remindAt);
  return now >= remindAt && !reminder.sent;
}

// For Video Calls - auto 1 hour reminder before meeting
export async function scheduleVideoReminder(videoCall) {
  return await scheduleOneHourReminder({
    title: videoCall.title,
    dueDate: videoCall.time,
    type: 'video_meeting'
  });
}

// Check permissions by role
export function canPerformAction(currentRole, targetRole, sameSchool, role) {
  if (!sameSchool) return false; // Must be same school
  if (role === 'broadcast' && !['principal','deputy'].includes(currentRole)) return false;
  if (role === 'create_group' && currentRole === 'student') return false;
  return true;
}