import { useState } from 'react';
import {
  Mail,
  MailOpen,
  Clock,
  CheckCircle2,
  ChevronRight,
  X,
  Send,
  Plus,
  ChevronDown,
  Download,
  AlertCircle,
  Zap,
  Info,
} from 'lucide-react';
import type { SimulatedEmail, GrupoConfig } from '../types';

interface EmailInboxProps {
  emails: SimulatedEmail[];
  grupos: GrupoConfig[];
  aiProvider: string;
  isProcessing: boolean;
  processEmail: (emailId: string, grupo: string) => Promise<void>;
  processAllEmails: (defaultGrupo: string) => Promise<void>;
  addSimulatedEmail: (email: Omit<SimulatedEmail, 'id' | 'processed'>) => void;
  extensionConnected?: boolean;
}

interface ExtensionExport {
  version: string;
  exportedAt: string;
  source: string;
  emails: Array<{
    from: string;
    fromName: string;
    subject: string;
    body: string;
    date: string;
  }>;
}

export default function EmailInbox({
  emails,
  grupos,
  aiProvider,
  isProcessing,
  processEmail,
  processAllEmails,
  addSimulatedEmail,
  extensionConnected,
}: EmailInboxProps) {
  const [selectedEmail, setSelectedEmail] = useState<SimulatedEmail | null>(null);
  const [assignGrupo, setAssignGrupo] = useState(grupos[0]?.id || '');
  const [showCompose, setShowCompose] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExtensionHelp, setShowExtensionHelp] = useState(false);
  const [importData, setImportData] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState({
    from: '',
    fromName: '',
    subject: '',
    body: '',
    date: new Date().toISOString(),
    type: 'empresa' as const,
  });

  const unprocessed = emails.filter(e => !e.processed);
  const processed = emails.filter(e => e.processed);

  const processBtnLabel = aiProvider === 'none' ? 'Procesar (Regex)' : `Procesar con ${aiProvider.toUpperCase()}`;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleProcess = async () => {
    if (selectedEmail && !selectedEmail.processed) {
      setProcessingId(selectedEmail.id);
      await processEmail(selectedEmail.id, assignGrupo);
      setSelectedEmail(prev => prev ? { ...prev, processed: true } : null);
      setProcessingId(null);
      showToast('✅ Correo procesado correctamente');
    }
  };

  const handleProcessAll = async () => {
    if (unprocessed.length === 0) return;
    await processAllEmails(assignGrupo);
    showToast(`✅ ${unprocessed.length} correo(s) procesados`);
  };

  const handleAddEmail = () => {
    if (!newEmail.from || !newEmail.subject || !newEmail.body) return;
    addSimulatedEmail(newEmail);
    setNewEmail({
      from: '',
      fromName: '',
      subject: '',
      body: '',
      date: new Date().toISOString(),
      type: 'empresa' as const,
    });
    setShowCompose(false);
    showToast('✅ Correo agregado a la bandeja');
  };

  const handleImport = () => {
    try {
      const parsed: ExtensionExport = JSON.parse(importData);

      if (!parsed.emails || !Array.isArray(parsed.emails)) {
        throw new Error('Formato inválido');
      }

      let imported = 0;
      for (const email of parsed.emails) {
        if (email.from && email.subject && email.body) {
          addSimulatedEmail({
            from: email.from,
            fromName: email.fromName || email.from.split('@')[0],
            subject: email.subject,
            body: email.body,
            date: email.date || new Date().toISOString(),
            type: 'empresa',
          });
          imported++;
        }
      }

      setImportStatus('success');
      setImportMessage(`${imported} correo(s) importados correctamente`);
      setTimeout(() => {
        setShowImport(false);
        setImportData('');
        setImportStatus('idle');
        showToast(`✅ ${imported} correo(s) importados`);
      }, 1500);
    } catch {
      setImportStatus('error');
      setImportMessage('Error al procesar los datos. Verifica el formato JSON.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Bandeja de Correos</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-sm text-slate-500">
              Correos recibidos de empresas para prácticas y pasantías
            </p>
            {extensionConnected ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                🔌 Sincronización Activa
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500 border border-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
                🔌 Buscando Extensión...
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowExtensionHelp(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <Info size={15} /> ¿Cómo usar la extensión?
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 shadow-sm transition hover:bg-indigo-100"
          >
            <Download size={16} /> Importar desde Extensión
          </button>
          <button
            onClick={() => setShowCompose(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus size={16} /> Simular Correo
          </button>
        </div>
      </div>

      {/* Process All bar */}
      {unprocessed.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-amber-500" />
            <p className="text-sm font-medium text-amber-800">
              {unprocessed.length} correo{unprocessed.length > 1 ? 's' : ''} sin procesar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={assignGrupo}
                onChange={e => setAssignGrupo(e.target.value)}
                className="appearance-none rounded-lg border border-amber-200 bg-white py-1.5 pl-3 pr-8 text-sm focus:outline-none"
              >
                {grupos.map(g => (
                  <option key={g.id} value={g.id}>{g.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <button
              onClick={handleProcessAll}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Zap size={14} />
              {isProcessing ? 'Procesando...' : `Procesar todos (${unprocessed.length})`}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Email List */}
        <div className="lg:col-span-2 space-y-2">
          {/* Unprocessed */}
          {unprocessed.length > 0 && (
            <div className="mb-3">
              <div className="mb-2 flex items-center gap-2 px-1">
                <Mail size={14} className="text-amber-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Sin Procesar ({unprocessed.length})
                </span>
              </div>
              {unprocessed.map(email => (
                <button
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`mb-1 w-full rounded-xl border p-3 text-left transition-all ${
                    selectedEmail?.id === email.id
                      ? 'border-indigo-200 bg-indigo-50 shadow-sm'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-amber-400" />
                        <p className="truncate text-sm font-semibold text-slate-900">{email.fromName}</p>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{email.from}</p>
                      <p className="mt-1 truncate text-sm text-slate-700">{email.subject}</p>
                    </div>
                    <ChevronRight size={16} className="mt-1 flex-shrink-0 text-slate-300" />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(email.date).toLocaleDateString('es-PA', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Processed */}
          {processed.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 px-1">
                <MailOpen size={14} className="text-emerald-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Procesados ({processed.length})
                </span>
              </div>
              {processed.map(email => (
                <button
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`mb-1 w-full rounded-xl border p-3 text-left transition-all ${
                    selectedEmail?.id === email.id
                      ? 'border-indigo-200 bg-indigo-50 shadow-sm'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="flex-shrink-0 text-emerald-500" />
                        <p className="truncate text-sm font-medium text-slate-600">{email.fromName}</p>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500">{email.subject}</p>
                    </div>
                    <ChevronRight size={16} className="mt-1 flex-shrink-0 text-slate-300" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {emails.length === 0 && (
            <div className="rounded-xl border border-slate-100 bg-white p-12 text-center">
              <Mail className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm text-slate-400">No hay correos en la bandeja</p>
              <p className="mt-1 text-xs text-slate-400">Usa la extensión del navegador o simula un correo</p>
            </div>
          )}
        </div>

        {/* Email Detail */}
        <div className="lg:col-span-3">
          {selectedEmail ? (
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
              {/* Email Header */}
              <div className="border-b border-slate-100 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{selectedEmail.subject}</h3>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                        {selectedEmail.fromName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{selectedEmail.fromName}</p>
                        <p className="text-xs text-slate-400">{selectedEmail.from}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedEmail.processed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                        <CheckCircle2 size={12} /> Procesado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                        <Clock size={12} /> Pendiente
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(selectedEmail.date).toLocaleDateString('es-PA', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Email Body */}
              <div className="p-5">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
                  {selectedEmail.body}
                </pre>
              </div>

              {/* Action Bar */}
              {!selectedEmail.processed && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                  <p className="mb-3 text-xs font-medium text-slate-600">
                    Asignar a un grupo y extraer datos automáticamente:
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <select
                        value={assignGrupo}
                        onChange={e => setAssignGrupo(e.target.value)}
                        className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      >
                        {grupos.map(g => (
                          <option key={g.id} value={g.id}>{g.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <button
                      onClick={handleProcess}
                      disabled={processingId === selectedEmail.id}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Send size={14} />
                      {processingId === selectedEmail.id ? 'Procesando...' : processBtnLabel}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
              <div className="text-center">
                <MailOpen className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-3 text-sm text-slate-400">Selecciona un correo para ver su contenido</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Extension Help Modal */}
      {showExtensionHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">¿Cómo usar la extensión?</h3>
              <button onClick={() => setShowExtensionHelp(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 text-sm text-slate-600">
              <div className="rounded-lg bg-blue-50 p-3 text-blue-700 text-xs">
                La extensión captura correos directamente desde Gmail u Outlook Web. Solo necesitas cargarla una vez.
              </div>
              <ol className="space-y-3">
                {[
                  { n: 1, title: 'Cargar la extensión (una sola vez)', desc: 'Abre chrome://extensions/ → activa "Modo de desarrollador" → "Cargar descomprimida" → selecciona la carpeta extension/ del proyecto.' },
                  { n: 2, title: 'Abrir un correo en Gmail o Outlook', desc: 'Abre cualquier correo de respuesta de una empresa. La extensión inyecta un botón flotante "Capturar" en la página.' },
                  { n: 3, title: 'Clic en "Capturar"', desc: 'El botón extrae el remitente, asunto, cuerpo y fecha del correo y lo guarda internamente.' },
                  { n: 4, title: 'Copiar al portapapeles', desc: 'Haz clic en el ícono de AutoPrácticas en la barra del navegador → "Copiar Todo".' },
                  { n: 5, title: 'Importar a la app', desc: 'Vuelve a esta bandeja → "Importar desde Extensión" → pegar el contenido → "Importar".' },
                ].map(step => (
                  <li key={step.n} className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{step.n}</span>
                    <div>
                      <p className="font-medium text-slate-800">{step.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowExtensionHelp(false)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Simular Correo Entrante</h3>
              <button onClick={() => setShowCompose(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <p className="mb-4 text-xs text-slate-500">
              Simula un correo de respuesta de una empresa para probar el procesamiento automático.
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Nombre del remitente</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="Ej: Juan Pérez"
                    value={newEmail.fromName}
                    onChange={e => setNewEmail(n => ({ ...n, fromName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Correo del remitente <span className="text-red-400">*</span></label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="correo@empresa.com"
                    value={newEmail.from}
                    onChange={e => setNewEmail(n => ({ ...n, from: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Asunto <span className="text-red-400">*</span></label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="RE: Solicitud de pasantía - Empresa XYZ"
                  value={newEmail.subject}
                  onChange={e => setNewEmail(n => ({ ...n, subject: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Cuerpo del correo <span className="text-red-400">*</span></label>
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  rows={8}
                  placeholder="Escriba el contenido del correo de respuesta de la empresa..."
                  value={newEmail.body}
                  onChange={e => setNewEmail(n => ({ ...n, body: e.target.value }))}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowCompose(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddEmail}
                disabled={!newEmail.from || !newEmail.subject || !newEmail.body}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar Correo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Download size={20} className="text-indigo-600" />
                Importar desde Extensión
              </h3>
              <button onClick={() => { setShowImport(false); setImportStatus('idle'); setImportData(''); }} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 rounded-lg bg-indigo-50 p-3">
              <p className="text-xs font-semibold text-indigo-700 mb-1">Instrucciones:</p>
              <ol className="list-inside list-decimal text-xs text-indigo-600 space-y-0.5">
                <li>Abre la extensión AutoPrácticas en tu navegador</li>
                <li>Haz clic en <strong>"Copiar Todo"</strong></li>
                <li>Pega los datos en el campo de abajo</li>
                <li>Haz clic en <strong>"Importar"</strong></li>
              </ol>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Datos de la extensión (JSON)</label>
              <textarea
                className={`w-full rounded-lg border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 ${
                  importStatus === 'error'
                    ? 'border-red-300 focus:border-red-300 focus:ring-red-100'
                    : importStatus === 'success'
                    ? 'border-emerald-300 focus:border-emerald-300 focus:ring-emerald-100'
                    : 'border-slate-200 focus:border-indigo-300 focus:ring-indigo-100'
                }`}
                rows={10}
                placeholder='Pega aquí el contenido copiado de la extensión...'
                value={importData}
                onChange={e => { setImportData(e.target.value); setImportStatus('idle'); }}
              />
            </div>

            {importStatus !== 'idle' && (
              <div className={`mt-3 flex items-center gap-2 rounded-lg p-3 text-sm ${
                importStatus === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {importStatus === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {importMessage}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => { setShowImport(false); setImportStatus('idle'); setImportData(''); }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={!importData.trim() || importStatus === 'success'}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Importar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm (unused here but pattern available) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-900">¿Eliminar correo?</h3>
            <p className="mt-2 text-sm text-slate-500">Esta acción no se puede deshacer.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowDeleteConfirm(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button onClick={() => setShowDeleteConfirm(null)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
