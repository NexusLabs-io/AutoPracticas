import { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { getStoredUser, changeUsername, changePassword, logout } from '../services/authService';

interface AccountSettingsProps {
  darkMode: boolean;
  onPasswordChange: (newPassword: string) => void;
  onLogout: () => void;
}

export default function AccountSettings({
  darkMode,
  onPasswordChange,
  onLogout,
}: AccountSettingsProps) {
  const user = getStoredUser();
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleUsernameChange = () => {
    const result = changeUsername(newUsername);
    if (result.success) {
      setUsernameStatus({ type: 'success', message: 'Nombre de usuario actualizado' });
      setTimeout(() => setUsernameStatus(null), 3000);
    } else {
      setUsernameStatus({ type: 'error', message: result.error || 'Error al actualizar' });
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Las contraseñas no coinciden' });
      return;
    }

    const result = await changePassword(oldPassword, newPassword);
    if (result.success) {
      setPasswordStatus({ type: 'success', message: 'Contraseña actualizada correctamente' });
      onPasswordChange(newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordStatus(null), 3000);
    } else {
      setPasswordStatus({ type: 'error', message: result.error || 'Error al actualizar' });
    }
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className={`rounded-2xl border p-6 shadow-sm ${
      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
    }`}>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            darkMode ? 'bg-slate-700' : 'bg-slate-100'
          }`}>
            <User size={18} className={darkMode ? 'text-slate-300' : 'text-slate-600'} />
          </div>
          <div>
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Mi Cuenta</h3>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Último acceso: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString('es-PA') : 'N/A'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
        >
          <LogOut size={16} /> Cerrar Sesión
        </button>
      </div>

      <div className="space-y-6">
        {/* Change Username */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Nombre de Usuario
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${
                darkMode
                  ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500 focus:ring-indigo-500/20'
                  : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-400 focus:ring-indigo-100'
              }`}
            />
            <button
              onClick={handleUsernameChange}
              disabled={newUsername === user?.username}
              className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={14} /> Guardar
            </button>
          </div>
          {usernameStatus && (
            <p className={`mt-2 text-xs flex items-center gap-1 ${
              usernameStatus.type === 'success' ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {usernameStatus.type === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
              {usernameStatus.message}
            </p>
          )}
        </div>

        {/* Change Password */}
        <div className={`rounded-xl p-4 ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              <Lock size={14} className="inline mr-1" /> Cambiar Contraseña
            </h4>
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className={`text-xs flex items-center gap-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}
            >
              {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPasswords ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className={`block text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Contraseña actual
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${
                  darkMode
                    ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500 focus:ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-400 focus:ring-indigo-100'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Nueva contraseña
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${
                  darkMode
                    ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500 focus:ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-400 focus:ring-indigo-100'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Confirmar nueva contraseña
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${
                  darkMode
                    ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500 focus:ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-400 focus:ring-indigo-100'
                }`}
              />
              {newPassword && confirmPassword && newPassword === confirmPassword && (
                <p className="mt-1 text-xs text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Las contraseñas coinciden
                </p>
              )}
            </div>

            {passwordStatus && (
              <p className={`text-xs flex items-center gap-1 ${
                passwordStatus.type === 'success' ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {passwordStatus.type === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                {passwordStatus.message}
              </p>
            )}

            <button
              onClick={handlePasswordChange}
              disabled={!oldPassword || !newPassword || !confirmPassword}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock size={14} /> Actualizar Contraseña
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
