import { useState } from 'react';
import {
  Zap,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Moon,
  Sun,
} from 'lucide-react';
import {
  userExists,
  registerUser,
  loginUser,
  resetAllData,
  getStoredUser,
  resetPasswordWithRecovery,
} from '../services/authService';

interface LoginProps {
  onLogin: (password: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Login({ onLogin, darkMode, toggleDarkMode }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'reset' | 'recover'>(userExists() ? 'login' : 'register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetConfirm, setResetConfirm] = useState('');

  // Palabra clave de recuperación
  const [recoveryWord, setRecoveryWord] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const storedUser = getStoredUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }

        const result = await registerUser(username, password, recoveryWord);
        if (!result.success) {
          setError(result.error || 'Error al registrar');
          setLoading(false);
          return;
        }

        // Auto login after registration
        const loginResult = await loginUser(username, password);
        if (loginResult.success) {
          onLogin(password);
        }
      } else if (mode === 'login') {
        const result = await loginUser(username, password);
        if (!result.success) {
          setError(result.error || 'Error al iniciar sesión');
          setLoading(false);
          return;
        }
        onLogin(password);
      } else if (mode === 'recover') {
        if (newPassword !== confirmNewPassword) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }

        const result = await resetPasswordWithRecovery(recoveryWord, newPassword);
        if (!result.success) {
          setError(result.error || 'Error al restablecer la contraseña');
          setLoading(false);
          return;
        }

        setSuccessMsg('¡Contraseña restablecida! Redirigiendo al inicio de sesión...');
        setRecoveryWord('');
        setNewPassword('');
        setConfirmNewPassword('');
        setTimeout(() => {
          setMode('login');
          setSuccessMsg('');
        }, 3000);
      } else if (mode === 'reset') {
        if (resetConfirm !== 'BORRAR TODO') {
          setError('Escribe "BORRAR TODO" para confirmar');
          setLoading(false);
          return;
        }
        resetAllData();
        window.location.reload();
      }
    } catch (err) {
      setError('Error inesperado');
    }

    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
      darkMode
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'
    }`}>
      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        className={`fixed top-4 right-4 p-2 rounded-lg transition ${
          darkMode
            ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600'
            : 'bg-white text-slate-600 hover:bg-slate-100 shadow'
        }`}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className={`w-full max-w-md rounded-2xl p-8 shadow-2xl transition-colors ${
        darkMode ? 'bg-slate-800' : 'bg-white'
      }`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200 mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            AutoPrácticas
          </h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {mode === 'register'
              ? 'Crea tu cuenta para comenzar'
              : mode === 'recover'
              ? 'Recuperar Contraseña Segura'
              : mode === 'reset'
              ? 'Restablecer de fábrica'
              : `Bienvenido${storedUser ? `, ${storedUser.username}` : ''}`}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          {mode !== 'reset' && mode !== 'recover' && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Usuario
              </label>
              <div className="relative">
                <User size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={mode === 'login' && storedUser ? storedUser.username : 'Tu nombre de usuario'}
                  className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm transition focus:outline-none focus:ring-2 ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20'
                      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-100'
                  }`}
                  required
                />
              </div>
            </div>
          )}

          {/* Password */}
          {mode !== 'reset' && mode !== 'recover' && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Contraseña
              </label>
              <div className="relative">
                <Lock size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  className={`w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm transition focus:outline-none focus:ring-2 ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20'
                      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-100'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password (register only) */}
          {mode === 'register' && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm transition focus:outline-none focus:ring-2 ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20'
                      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-100'
                  }`}
                  required
                />
              </div>
              {password && confirmPassword && password === confirmPassword && (
                <p className="mt-1 text-xs text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Las contraseñas coinciden
                </p>
              )}
            </div>
          )}

          {/* Palabra Secreta de Recuperación (register only) */}
          {mode === 'register' && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Palabra Secreta de Recuperación
              </label>
              <input
                type="text"
                value={recoveryWord}
                onChange={e => setRecoveryWord(e.target.value)}
                placeholder="Ej: MascotaFavorita, FraseSecreta, etc."
                className={`w-full rounded-lg border py-2.5 px-4 text-sm transition focus:outline-none focus:ring-2 ${
                  darkMode
                    ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-100'
                }`}
                required
              />
              <p className={`mt-1 text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                ⚠️ **Importante**: Guarda esta palabra secreta. Te servirá para cambiar tu contraseña si la olvidas, **sin perder tus datos y correos**.
              </p>
            </div>
          )}

          {/* Modo de recuperación segura (recover only) */}
          {mode === 'recover' && (
            <div className="space-y-4">
              <div className={`rounded-lg p-4 ${darkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                <p className={`text-xs leading-relaxed ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  🔑 Ingresa tu palabra secreta de recuperación para asignar una nueva contraseña. **Tus correos, registros y grupos se mantendrán a salvo**.
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Palabra Secreta de Recuperación
                </label>
                <input
                  type="text"
                  value={recoveryWord}
                  onChange={e => setRecoveryWord(e.target.value)}
                  placeholder="Tu palabra secreta de recuperación"
                  className={`w-full rounded-lg border py-2.5 px-4 text-sm transition focus:outline-none focus:ring-2 ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20'
                      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-100'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Nueva Contraseña
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Tu nueva contraseña"
                  className={`w-full rounded-lg border py-2.5 px-4 text-sm transition focus:outline-none focus:ring-2 ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20'
                      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-100'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  placeholder="Repite tu nueva contraseña"
                  className={`w-full rounded-lg border py-2.5 px-4 text-sm transition focus:outline-none focus:ring-2 ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20'
                      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-100'
                  }`}
                  required
                />
              </div>
            </div>
          )}

          {/* Reset confirmation */}
          {mode === 'reset' && (
            <div>
              <div className={`rounded-lg p-4 mb-4 ${darkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                  <strong>⚠️ Advertencia:</strong> Esta acción eliminará absolutamente todos los datos, incluyendo registros de alumnos, grupos y plantillas. No se puede deshacer.
                </p>
              </div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Escribe "BORRAR TODO" para confirmar
              </label>
              <input
                type="text"
                value={resetConfirm}
                onChange={e => setResetConfirm(e.target.value)}
                placeholder="BORRAR TODO"
                className={`w-full rounded-lg border py-2.5 px-4 text-sm transition focus:outline-none focus:ring-2 ${
                  darkMode
                    ? 'bg-slate-700 border-red-600 text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500/20'
                    : 'bg-white border-red-200 text-slate-900 placeholder:text-slate-400 focus:border-red-400 focus:ring-red-100'
                }`}
              />
            </div>
          )}

          {/* Success message */}
          {successMsg && (
            <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
              darkMode ? 'bg-emerald-950/40 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <CheckCircle2 size={16} />
              {successMsg}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
              darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-600'
            }`}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 ${
              mode === 'reset'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-200'
            }`}
          >
            {loading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : mode === 'register' ? (
              <>
                <UserPlus size={18} /> Crear Cuenta
              </>
            ) : mode === 'recover' ? (
              <>
                <RefreshCw size={18} /> Restablecer Contraseña
              </>
            ) : mode === 'reset' ? (
              <>
                <RefreshCw size={18} /> Restablecer de Fábrica
              </>
            ) : (
              <>
                <LogIn size={18} /> Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-6 text-center space-y-2 flex flex-col items-center">
          {mode === 'login' && (
            <>
              <button
                onClick={() => { setMode('recover'); setError(''); setSuccessMsg(''); }}
                className={`text-sm hover:underline ${darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </>
          )}
          {mode === 'recover' && (
            <div className="flex flex-col gap-2.5 w-full items-center">
              <button
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                className={`text-sm hover:underline ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
              >
                ← Volver al inicio de sesión
              </button>
              <button
                onClick={() => { setMode('reset'); setError(''); setSuccessMsg(''); }}
                className="text-xs text-red-500 hover:text-red-400 hover:underline mt-2"
              >
                ¿No recuerdas tu palabra secreta? Restablecer aplicación de fábrica
              </button>
            </div>
          )}
          {mode === 'reset' && (
            <button
              onClick={() => { setMode('recover'); setError(''); setResetConfirm(''); }}
              className={`text-sm hover:underline ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
            >
              ← Volver a la recuperación segura
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
