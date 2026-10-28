// @ts-nocheck
// Handles offline receiving + auto-send + 1hr reminders

export function useOfflineManager() {
  
  // Student receives work immediately even offline
  const receiveWorkOffline = (work) => {
    // Shows instantly, no internet needed
    console.log('Work received offline:', work.title);
    // In real app: save to SQLite + show notification
    return {
      ...work,
      status: 'Received Offline',
      offline: true,
      queuedForSync: true
    };
  };

  // Auto-send when teacher sets reminder
  const autoSendWhenReminder = (homework, students) => {
    // Teacher sets reminder → auto sends to all students
    const filteredStudents = students.filter(s => s.school === homework.school);
    console.log(`Auto-sending ${homework.title} to ${filteredStudents.length} students`);
    return filteredStudents.map(s => ({
      to: s.id,
      homework: homework,
      sentAt: new Date().toISOString(),
      reminderSet: true,
      oneHourReminder: true
    }));
  };

  // 1-hour reminder logic
  const triggerOneHourReminder = (dueItem) => {
    const now = new Date();
    const due = new Date(dueItem.dueDate);
    const diffHours = (due - now) / 3600000;
    
    if (diffHours <= 1 && diffHours > 0) {
      return {
        shouldNotify: true,
        message: `⏰ 1 HOUR LEFT: ${dueItem.title} due at ${due.toLocaleString()}. Sent even if offline.`,
        vibrate: true,
        sound: true
      };
    }
    return { shouldNotify: false };
  };

  return { receiveWorkOffline, autoSendWhenReminder, triggerOneHourReminder };
}