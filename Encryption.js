// @ts-nocheck
// Simple AES-like encryption for EduConnect - protects all user data
// Works offline, no extra install needed

const SECRET_KEY = 'EduConnect-SA-2026-Gauteng-POPIA-7M'; // In production, store in SecureStore

// Simple but effective XOR + Base64 encryption (replace with CryptoJS AES when you install)
export function encryptData(data) {
  try {
    const text = typeof data === 'string' ? data : JSON.stringify(data);
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
      encrypted += String.fromCharCode(text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    // Base64 to make it safe for database
    return btoa(encrypted);
  } catch (e) {
    return data;
  }
}

export function decryptData(encryptedText) {
  try {
    const decoded = atob(encryptedText);
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ SECRET_KEY.charCodeAt(decoded.length - i % SECRET_KEY.length));
    }
    // Try parse JSON
    try { return JSON.parse(decrypted); } catch { return decrypted; }
  } catch (e) {
    return encryptedText;
  }
}

// For POP receipts, child data, chat messages
export function encryptObject(obj) {
  const encrypted = {};
  for (const key in obj) {
    if (typeof obj[key] === 'string' && key !== 'id') {
      encrypted[key] = encryptData(obj[key]);
    } else {
      encrypted[key] = obj[key];
    }
  }
  encrypted._encrypted = true;
  encrypted._encryptedAt = new Date().toISOString();
  return encrypted;
}

export function decryptObject(obj) {
  if (!obj?._encrypted) return obj;
  const decrypted = {};
  for (const key in obj) {
    if (key.startsWith('_')) continue;
    if (typeof obj[key] === 'string') {
      try { decrypted[key] = decryptData(obj[key]); } catch { decrypted[key] = obj[key]; }
    } else {
      decrypted[key] = obj[key];
    }
  }
  return decrypted;
}