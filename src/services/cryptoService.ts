// Crypto Service - AES-256-GCM encryption
// Uses Web Crypto API for robust encryption

const SALT_KEY = 'autopracticas_salt_v1';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;

// Generate a random salt
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

// Generate a random IV
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

// Derive a key from password using PBKDF2
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive AES-GCM key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt data
export async function encrypt(data: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  // Get or create salt
  let saltBase64 = localStorage.getItem(SALT_KEY);
  let salt: Uint8Array;

  if (!saltBase64) {
    salt = generateSalt();
    saltBase64 = btoa(String.fromCharCode(...salt));
    localStorage.setItem(SALT_KEY, saltBase64);
  } else {
    salt = new Uint8Array(atob(saltBase64).split('').map(c => c.charCodeAt(0)));
  }

  const key = await deriveKey(password, salt);
  const iv = generateIV();

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    dataBuffer
  );

  // Combine IV + encrypted data
  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);

  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

// Decrypt data
export async function decrypt(encryptedData: string, password: string): Promise<string> {
  try {
    // Get salt
    const saltBase64 = localStorage.getItem(SALT_KEY);
    if (!saltBase64) {
      throw new Error('No salt found');
    }

    const salt = new Uint8Array(atob(saltBase64).split('').map(c => c.charCodeAt(0)));
    const key = await deriveKey(password, salt);

    // Decode from base64
    const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));

    // Extract IV and encrypted data
    const iv = combined.slice(0, IV_LENGTH);
    const data = combined.slice(IV_LENGTH);

    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Decryption failed - wrong password or corrupted data');
  }
}

// Hash password for storage (for verification)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT_KEY);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  return btoa(String.fromCharCode(...hashArray));
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === hash;
}

// Secure storage for API keys
const API_KEYS_STORAGE = 'autopracticas_api_keys_encrypted';

export async function saveAPIKeys(
  keys: { groqKey: string; deepseekKey: string },
  password: string
): Promise<void> {
  const encrypted = await encrypt(JSON.stringify(keys), password);
  localStorage.setItem(API_KEYS_STORAGE, encrypted);
}

export async function loadAPIKeys(
  password: string
): Promise<{ groqKey: string; deepseekKey: string } | null> {
  const encrypted = localStorage.getItem(API_KEYS_STORAGE);
  if (!encrypted) return null;

  try {
    const decrypted = await decrypt(encrypted, password);
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

// Clear all encrypted data (for password reset)
export function clearAllEncryptedData(): void {
  localStorage.removeItem(SALT_KEY);
  localStorage.removeItem(API_KEYS_STORAGE);
}
