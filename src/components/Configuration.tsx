import { useState } from 'react';
import {
  Bell,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Info,
  Bot,
  Zap,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { GrupoConfig } from '../types';
import type { AIConfig, AIProvider } from '../services/aiService';
import { testAIConnection } from '../services/aiService';
import GruposManager from './GruposManager';
import AccountSettings from './AccountSettings';

interface ConfigurationProps {
  darkMode: boolean;
  grupos: GrupoConfig[];
  availableYears: string[];
  addGrupo: (nombre: string, anio: string, categoria: string) => void;
  updateGrupo: (id: string, updates: Partial<GrupoConfig>) => void;
  deleteGrupo: (id: string) => void;
  duplicateGruposForYear: (fromYear: string, toYear: string) => void;
  aiConfig: AIConfig;
  setAIConfig: (config: Partial<AIConfig>) => void;
  setAIProvider: (provider: AIProvider) => void;
  onPasswordChange: (newPassword: string) => void;
  onLogout: () => void;
}

export default function Configuration({
  darkMode,
  grupos,
  availableYears,
  addGrupo,
  updateGrupo,
  deleteGrupo,
  duplicateGruposForYear,
  aiConfig,
  setAIConfig,
  setAIProvider,
  onPasswordChange,
  onLogout,
}: ConfigurationProps) {
  const [saved, setSaved] = useState(false);
  const [emailKeywords, setEmailKeywords] = useState([
    'pasantía', 'práctica', 'estudiante', 'disponibilidad', 'cupos'
  ]);
  const [newKeyword, setNewKeyword] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [showDeepseekKey, setShowDeepseekKey] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !emailKeywords.includes(newKeyword.trim().toLowerCase())) {
      setEmailKeywords(prev => [...prev, newKeyword.trim().toLowerCase()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (kw: string) => {
    setEmailKeywords(prev => prev.filter(k => k !== kw));
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);

    const result = await testAIConnection(aiConfig);
    setConnectionStatus(result);
    setTestingConnection(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Configuración</h2>
          <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Ajusta el comportamiento del sistema
          </p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        >
          {saved ? (
            <>
              <CheckCircle2 size={16} /> ¡Guardado!
            </>
          ) : (
            <>
              <Save size={16} /> Guardar Cambios
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* AI Configuration */}
        <div className={`rounded-2xl border p-6 shadow-sm lg:col-span-2 ${
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
        }`}>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-purple-100">
              <Bot size={18} className="text-purple-600" />
            </div>
            <div>
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Inteligencia Artificial</h3>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Configura el proveedor de IA para extracción de datos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Provider Selection */}
            <div>
              <label className={`mb-2 block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Proveedor de IA</label>
              <div className="space-y-2">
                {/* Groq */}
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition ${
                  aiConfig.provider === 'groq'
                    ? 'border-purple-500 bg-purple-50'
                    : darkMode
                      ? 'border-slate-600 hover:border-slate-500'
                      : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="provider"
                    checked={aiConfig.provider === 'groq'}
                    onChange={() => setAIProvider('groq')}
                    className="accent-purple-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${aiConfig.provider === 'groq' ? 'text-slate-800' : darkMode ? 'text-white' : 'text-slate-800'}`}>Groq</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Recomendado
                      </span>
                    </div>
                    <p className={`text-xs ${aiConfig.provider === 'groq' ? 'text-slate-500' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Llama 3.1 70B - Muy rápido y gratuito</p>
                  </div>
                </label>

                {/* DeepSeek */}
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition ${
                  aiConfig.provider === 'deepseek'
                    ? 'border-purple-500 bg-purple-50'
                    : darkMode
                      ? 'border-slate-600 hover:border-slate-500'
                      : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="provider"
                    checked={aiConfig.provider === 'deepseek'}
                    onChange={() => setAIProvider('deepseek')}
                    className="accent-purple-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${aiConfig.provider === 'deepseek' ? 'text-slate-800' : darkMode ? 'text-white' : 'text-slate-800'}`}>DeepSeek</span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        $0.10/1000 correos
                      </span>
                    </div>
                    <p className={`text-xs ${aiConfig.provider === 'deepseek' ? 'text-slate-500' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>DeepSeek V3 - Muy preciso y económico</p>
                  </div>
                </label>

                {/* None */}
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition ${
                  aiConfig.provider === 'none'
                    ? 'border-purple-500 bg-purple-50'
                    : darkMode
                      ? 'border-slate-600 hover:border-slate-500'
                      : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="provider"
                    checked={aiConfig.provider === 'none'}
                    onChange={() => setAIProvider('none')}
                    className="accent-purple-600"
                  />
                  <div className="flex-1">
                    <span className={`font-semibold ${aiConfig.provider === 'none' ? 'text-slate-800' : darkMode ? 'text-white' : 'text-slate-800'}`}>Sin IA (Regex)</span>
                    <p className={`text-xs ${aiConfig.provider === 'none' ? 'text-slate-500' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Extracción básica con patrones de texto</p>
                  </div>
                </label>
              </div>
            </div>

            {/* API Keys */}
            <div className="space-y-4">
              {/* Groq Key Info */}
              {aiConfig.provider === 'groq' && (
                <div className="rounded-xl bg-emerald-50 p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-emerald-800">API key requerida</p>
                      <p className="text-xs text-emerald-600">
                        Guarda tu key de Groq cifrada con tu contraseña de acceso.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-medium text-emerald-700">
                      API Key de Groq
                    </label>
                    <input
                      type="password"
                      className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      placeholder="gsk_..."
                      value={aiConfig.groqApiKey}
                      onChange={e => setAIConfig({ groqApiKey: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* DeepSeek Key */}
              {aiConfig.provider === 'deepseek' && (
                <div className="rounded-xl bg-blue-50 p-4">
                  <div className="flex items-start gap-2">
                    <Info size={16} className="mt-0.5 flex-shrink-0 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Requiere API Key</p>
                      <p className="text-xs text-blue-600">
                        Obtén tu key en{' '}
                        <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="underline">
                          platform.deepseek.com
                        </a>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-medium text-blue-700">API Key de DeepSeek</label>
                    <div className="relative">
                      <input
                        type={showDeepseekKey ? 'text' : 'password'}
                        className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 pr-10 text-sm placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="sk-..."
                        value={aiConfig.deepseekApiKey}
                        onChange={e => setAIConfig({ deepseekApiKey: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowDeepseekKey(!showDeepseekKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                      >
                        {showDeepseekKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* None info */}
              {aiConfig.provider === 'none' && (
                <div className="rounded-xl bg-amber-50 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Modo básico</p>
                      <p className="text-xs text-amber-600">
                        La extracción será menos precisa. Recomendamos usar Groq (gratis) para mejores resultados.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Test Connection */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTestConnection}
                  disabled={testingConnection || aiConfig.provider === 'none'}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    darkMode
                      ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {testingConnection ? (
                    <>
                      <Zap size={14} className="animate-pulse" /> Probando...
                    </>
                  ) : (
                    <>
                      <Zap size={14} /> Probar Conexión
                    </>
                  )}
                </button>

                {connectionStatus && (
                  <span className={`flex items-center gap-1 text-sm ${
                    connectionStatus.success ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {connectionStatus.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {connectionStatus.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <AccountSettings
          darkMode={darkMode}
          onPasswordChange={onPasswordChange}
          onLogout={onLogout}
        />

        {/* Grupos Manager */}
        <GruposManager
          grupos={grupos}
          availableYears={availableYears}
          addGrupo={addGrupo}
          updateGrupo={updateGrupo}
          deleteGrupo={deleteGrupo}
          duplicateGruposForYear={duplicateGruposForYear}
          darkMode={darkMode}
        />

        {/* Keywords */}
        <div className={`rounded-2xl border p-6 shadow-sm lg:col-span-2 ${
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
        }`}>
          <div className="mb-5 flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              darkMode ? 'bg-amber-900/50' : 'bg-amber-100'
            }`}>
              <Bell size={18} className="text-amber-600" />
            </div>
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Palabras Clave para Detección</h3>
          </div>
          <p className={`mb-4 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Palabras clave para identificar correos relevantes de empresas.
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            {emailKeywords.map(kw => (
              <span
                key={kw}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ring-1 ${
                  darkMode
                    ? 'bg-amber-900/30 text-amber-300 ring-amber-700'
                    : 'bg-amber-50 text-amber-700 ring-amber-200'
                }`}
              >
                {kw}
                <button onClick={() => removeKeyword(kw)} className="rounded-full hover:bg-amber-200/50">
                  <Trash2 size={10} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className={`flex-1 rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${
                darkMode
                  ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500 focus:ring-indigo-500/20'
                  : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-400 focus:ring-indigo-100'
              }`}
              placeholder="Nueva palabra clave..."
              value={newKeyword}
              onChange={e => setNewKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addKeyword()}
            />
            <button
              onClick={addKeyword}
              className={`rounded-lg px-3 py-2 transition ${
                darkMode
                  ? 'bg-amber-900/50 text-amber-300 hover:bg-amber-900/70'
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
