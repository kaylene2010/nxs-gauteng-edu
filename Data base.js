// Database.js — Gauteng Schools + Permissions + Roles

export const schools = [
  { id: '1', name: 'Parktown Boys High', district: 'Johannesburg Central', type: 'public' },
  // Add all 4000+ here from schools_gauteng.json later
];

export const users = [
  { id: 'u1', name: 'Thabo M.', school: 'Parktown Boys High', role: 'Student', grade: 'Grade 10A' },
];

export const features = [
  'Assignments', 'Groups', 'AI Tutor', 
  'Set reminders', 'Auto work', 'Check progress', 
  'Teachers', 'Messages', 'Notifications', 
  'Send to entire school', 'Teachers & parents', 'Add parent'
];

export const permissions = [
  { role: 'Everyone', desc: 'Can message school-related only — filtered' },
  { role: 'Parents + Teachers only', desc: 'Can create groups' },
  { role: 'Everyone', desc: 'Can message same school only' },
  { role: 'Everyone', desc: 'Can receive work offline' },
  { role: 'Teachers only', desc: 'Can create groups up to 1000, set auto reminders' },
  { role: 'Principal + Deputy only', desc: 'Can send to entire school' },
];

// === YOUR RULE: Same school + role checks ===
export const canAddUser = (currentRole, targetRole, sameSchool) => {
  if (!sameSchool) return false; // Only same school can add each other
  if (currentRole === 'Student') return false; // Students cannot create groups
  if (currentRole === 'Teacher' && targetRole !== 'Teacher' && targetRole !== 'Student') return true;
  if (currentRole === 'Parent' && (targetRole === 'Learner' || targetRole === 'Teacher')) return true;
  return false;
};

export const canBroadcastAllSchool = (role) => {
  return role === 'Principal' || role === 'Deputy Principal';
};import schoolsData from './schools_gauteng.json';
export const schools = schoolsData;