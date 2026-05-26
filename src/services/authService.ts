// Authentication Service
// Handles user registration, login, and password changes

import { hashPassword, verifyPassword, clearAllEncryptedData } from './cryptoService';

const AUTH_STORAGE_KEY = 'autopracticas_auth';
const SESSION_KEY = 'autopracticas_session';

export interface User {
  username: string;
  passwordHash: string;
  createdAt: string;
  lastLogin: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  sessionPassword: string | null; // Kept in memory only for decryption
}

// Check if user exists
export function userExists(): boolean {
  return localStorage.getItem(AUTH_STORAGE_KEY) !== null;
}

// Get stored user
export function getStoredUser(): User | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// Register new user
export async function registerUser(
  username: string,
  password: string,
  recoveryWord: string
): Promise<{ success: boolean; error?: string }> {
  if (userExists()) {
    return { success: false, error: 'Ya existe un usuario registrado' };
  }

  if (username.length < 3) {
    return { success: false, error: 'El nombre de usuario debe tener al menos 3 caracteres' };
  }

  if (password.length < 4) {
    return { success: false, error: 'La contraseña debe tener al menos 4 caracteres' };
  }

  if (!recoveryWord || recoveryWord.trim().length < 3) {
    return { success: false, error: 'La palabra de recuperación debe tener al menos 3 caracteres' };
  }

  const passwordHash = await hashPassword(password);
  const recoveryHash = await hashPassword(recoveryWord.trim().toLowerCase());

  const user: User = {
    username,
    passwordHash,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem('autopracticas_recovery', recoveryHash);

  return { success: true };
}

// Login user
export async function loginUser(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  const user = getStoredUser();

  if (!user) {
    return { success: false, error: 'No hay usuario registrado' };
  }

  if (user.username !== username) {
    return { success: false, error: 'Usuario incorrecto' };
  }

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    return { success: false, error: 'Contraseña incorrecta' };
  }

  // Update last login
  user.lastLogin = new Date().toISOString();
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

  // Create session (expires on tab close)
  sessionStorage.setItem(SESSION_KEY, 'active');

  return { success: true };
}

// Reset password using recovery word without deleting main app data
export async function resetPasswordWithRecovery(
  recoveryWord: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const user = getStoredUser();
  if (!user) {
    return { success: false, error: 'No hay usuario registrado' };
  }

  const storedRecoveryHash = localStorage.getItem('autopracticas_recovery');
  if (!storedRecoveryHash) {
    return {
      success: false,
      error: 'No tienes configurada una palabra clave de recuperación. Debes hacer un restablecimiento completo abajo.'
    };
  }

  const inputHash = await hashPassword(recoveryWord.trim().toLowerCase());
  if (inputHash !== storedRecoveryHash) {
    return { success: false, error: 'Palabra clave de recuperación incorrecta' };
  }

  if (newPassword.length < 4) {
    return { success: false, error: 'La nueva contraseña debe tener al menos 4 caracteres' };
  }

  // Hash new password
  const newHash = await hashPassword(newPassword);
  user.passwordHash = newHash;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

  // Clear encrypted API keys (since we cannot decrypt them)
  clearAllEncryptedData();

  return { success: true };
}

// Check if session is active
export function isSessionActive(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === 'active';
}

// Logout
export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

// Change password
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const user = getStoredUser();

  if (!user) {
    return { success: false, error: 'No hay usuario registrado' };
  }

  // Verify current password
  const isValid = await verifyPassword(currentPassword, user.passwordHash);

  if (!isValid) {
    return { success: false, error: 'Contraseña actual incorrecta' };
  }

  if (newPassword.length < 4) {
    return { success: false, error: 'La nueva contraseña debe tener al menos 4 caracteres' };
  }

  // Hash new password
  const newHash = await hashPassword(newPassword);

  // Update user
  user.passwordHash = newHash;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

  // Note: API keys will need to be re-encrypted with new password
  // This is handled by the caller

  return { success: true };
}

// Change username
export function changeUsername(newUsername: string): { success: boolean; error?: string } {
  const user = getStoredUser();

  if (!user) {
    return { success: false, error: 'No hay usuario registrado' };
  }

  if (newUsername.length < 3) {
    return { success: false, error: 'El nombre de usuario debe tener al menos 3 caracteres' };
  }

  user.username = newUsername;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

  return { success: true };
}

// Reset everything (forgot password)
export function resetAllData(): void {
  // Clear auth
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(SESSION_KEY);

  // Clear encrypted data
  clearAllEncryptedData();

  // Clear app data
  localStorage.removeItem('autopracticas_records');
  localStorage.removeItem('autopracticas_grupos');
  localStorage.removeItem('autopracticas_templates');
  localStorage.removeItem('autopracticas_logs');
  localStorage.removeItem('autopracticas_ai_config');
  localStorage.removeItem('autopracticas_theme');
}
