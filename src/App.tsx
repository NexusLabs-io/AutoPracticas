import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Table2,
  Mail,
  Bot,
  Settings,
  Zap,
  Menu,
  X,
  FileSpreadsheet,
  Moon,
  Sun,
} from 'lucide-react';
import { useStore } from './store/useStore';
import { userExists, isSessionActive } from './services/authService';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DataTable from './components/DataTable';
import EmailInbox from './components/EmailInbox';
import Automation from './components/Automation';
import Configuration from './components/Configuration';
import TemplateManager from './components/TemplateManager';
import type { ViewMode } from './types';

const THEME_KEY = 'autopracticas_theme';

const menuItems: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'Panel Principal', icon: <LayoutDashboard size={20} /> },
  { key: 'tabla', label: 'Tabla de Datos', icon: <Table2 size={20} /> },
  { key: 'correos', label: 'Bandeja de Correos', icon: <Mail size={20} /> },
  { key: 'automatizacion', label: 'Automatización IA', icon: <Bot size={20} /> },
  { key: 'plantillas', label: 'Plantillas Excel', icon: <FileSpreadsheet size={20} /> },
  { key: 'configuracion', label: 'Configuración', icon: <Settings size={20} /> },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'dark';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return userExists() && isSessionActive();
  });
  const [sessionPassword, setSessionPassword] = useState<string>('');
  const store = useStore(sessionPassword);

  // Integración con extensión del navegador
  const [extensionConnected, setExtensionConnected] = useState(false);
  const [globalToast, setGlobalToast] = useState<string | null>(null);

  const showGlobalToast = (msg: string) => {
    setGlobalToast(msg);
    setTimeout(() => setGlobalToast(null), 4000);
  };

  useEffect(() => {
    const handleReady = () => {
      setExtensionConnected(true);
    };

    const handleSendEmails = (e: Event) => {
      const customEvent = e as CustomEvent<Array<{
        from: string;
        fromName: string;
        subject: string;
        body: string;
        date: string;
      }>>;
      const extEmails = customEvent.detail || [];
      if (extEmails.length === 0) return;

      let addedCount = 0;
      let lastAddedName = '';

      extEmails.forEach(extEmail => {
        const exists = store.emails.some(existing =>
          existing.subject === extEmail.subject &&
          existing.from === extEmail.from &&
          (new Date(existing.date).getTime() === new Date(extEmail.date).getTime() ||
           Math.abs(new Date(existing.date).getTime() - new Date(extEmail.date).getTime()) < 5000)
        );

        if (!exists) {
          store.addSimulatedEmail({
            from: extEmail.from,
            fromName: extEmail.fromName || extEmail.from.split('@')[0],
            subject: extEmail.subject,
            body: extEmail.body,
            date: extEmail.date,
            type: 'empresa'
          });
          addedCount++;
          lastAddedName = extEmail.fromName || extEmail.from.split('@')[0];
        }
      });

      if (addedCount > 0) {
        setExtensionConnected(true);
        if (addedCount === 1) {
          showGlobalToast(`🎉 ¡Sincronizado! Correo recibido de ${lastAddedName}`);
        } else {
          showGlobalToast(`🎉 ¡Sincronizados! ${addedCount} nuevos correos de la extensión`);
        }
      }
    };

    window.addEventListener('AutoPracticasExtensionReady', handleReady);
    window.addEventListener('AutoPracticasSendEmails', handleSendEmails);

    // Intentar solicitar correos al cargar
    window.dispatchEvent(new CustomEvent('AutoPracticasFetchEmails'));

    return () => {
      window.removeEventListener('AutoPracticasExtensionReady', handleReady);
      window.removeEventListener('AutoPracticasSendEmails', handleSendEmails);
    };
  }, [store.emails, store.addSimulatedEmail]);

  const unprocessedCount = store.emails.filter(e => !e.processed).length;

  // Save theme preference
  useEffect(() => {
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const handleLogin = (password: string) => {
    setSessionPassword(password);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setSessionPassword('');
    setIsAuthenticated(false);
  };

  const handlePasswordChange = (newPassword: string) => {
    setSessionPassword(newPassword);
  };

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <Login
        onLogin={handleLogin}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
    );
  }

  const renderView = () => {
    switch (store.view) {
      case 'dashboard':
        return (
          <Dashboard
            records={store.records}
            logs={store.logs}
            unprocessedEmails={unprocessedCount}
            grupos={store.grupos}
          />
        );
      case 'tabla':
        return (
          <DataTable
            records={store.records}
            grupos={store.grupos}
            selectedGrupo={store.selectedGrupo}
            setSelectedGrupo={store.setSelectedGrupo}
            addRecord={store.addRecord}
            updateRecord={store.updateRecord}
            deleteRecord={store.deleteRecord}
            activeTemplate={store.activeTemplate}
          />
        );
      case 'correos':
        return (
          <EmailInbox
            emails={store.emails}
            grupos={store.grupos}
            aiProvider={store.aiConfig.provider}
            isProcessing={store.isProcessing}
            processEmail={store.processEmail}
            processAllEmails={store.processAllEmails}
            addSimulatedEmail={store.addSimulatedEmail}
            extensionConnected={extensionConnected}
          />
        );
      case 'automatizacion':
        return (
          <Automation
            logs={store.logs}
            emails={store.emails}
            grupos={store.grupos}
            isProcessing={store.isProcessing}
            processAllEmails={store.processAllEmails}
            extractDataFromEmail={store.extractDataFromEmail}
          />
        );
      case 'plantillas':
        return (
          <TemplateManager
            templates={store.templates}
            activeTemplate={store.activeTemplate}
            addTemplate={store.addTemplate}
            updateTemplate={store.updateTemplate}
            deleteTemplate={store.deleteTemplate}
            updateTemplateMapping={store.updateTemplateMapping}
            setActiveTemplate={store.setActiveTemplate}
          />
        );
      case 'configuracion':
        return (
          <Configuration
            darkMode={darkMode}
            grupos={store.grupos}
            availableYears={store.availableYears}
            addGrupo={store.addGrupo}
            updateGrupo={store.updateGrupo}
            deleteGrupo={store.deleteGrupo}
            duplicateGruposForYear={store.duplicateGruposForYear}
            aiConfig={store.aiConfig}
            setAIConfig={store.setAIConfig}
            setAIProvider={store.setAIProvider}
            onPasswordChange={handlePasswordChange}
            onLogout={handleLogout}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${
      darkMode
        ? 'bg-slate-900'
        : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50/30'
    }`}>
      {/* Mobile Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b px-4 py-3 backdrop-blur-lg lg:hidden ${
        darkMode
          ? 'bg-slate-800/80 border-slate-700'
          : 'bg-white/80 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`rounded-lg p-1.5 ${
              darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>AutoPrácticas</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className={`rounded-lg p-1.5 ${
              darkMode ? 'text-yellow-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {unprocessedCount > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
              {unprocessedCount}
            </span>
          )}
        </div>
      </header>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r transition-all duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          darkMode
            ? 'bg-slate-800 border-slate-700'
            : 'bg-white border-slate-200'
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 border-b px-6 py-5 ${
          darkMode ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200/50">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>AutoPrácticas</h1>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Gestión Inteligente</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={() => {
                store.setView(item.key);
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                store.view === item.key
                  ? darkMode
                    ? 'bg-indigo-600/20 text-indigo-400 shadow-sm'
                    : 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : darkMode
                    ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={store.view === item.key
                ? 'text-indigo-500'
                : darkMode ? 'text-slate-400' : 'text-slate-400'
              }>
                {item.icon}
              </span>
              {item.label}
              {item.key === 'correos' && unprocessedCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                  {unprocessedCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className={`border-t p-4 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className={`rounded-lg p-3 flex-1 ${
              darkMode
                ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50'
                : 'bg-gradient-to-r from-indigo-50 to-purple-50'
            }`}>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <p className={`text-xs font-medium ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  {store.aiConfig.provider === 'none' ? 'Modo Regex' : `IA: ${store.aiConfig.provider.toUpperCase()}`}
                </p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`ml-2 rounded-lg p-2 ${
                darkMode
                  ? 'text-yellow-400 hover:bg-slate-700'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen pt-14 lg:ml-64 lg:pt-0">
        <div className="mx-auto max-w-7xl p-4 lg:p-8">
          {renderView()}
        </div>
      </main>

      {globalToast && (
        <div className="fixed bottom-6 right-6 z-[9999] rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 border border-slate-800 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          {globalToast}
        </div>
      )}
    </div>
  );
}
