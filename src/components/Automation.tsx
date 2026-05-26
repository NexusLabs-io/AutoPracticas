import { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Info,
  Sparkles,
  Clock,
  Zap,
  FileSpreadsheet,
  ChevronDown,
} from 'lucide-react';
import type { AutomationLog, SimulatedEmail, EmailRecord, GrupoConfig } from '../types';

interface AutomationProps {
  logs: AutomationLog[];
  emails: SimulatedEmail[];
  grupos: GrupoConfig[];
  isProcessing: boolean;
  processAllEmails: (defaultGrupo: string) => Promise<void>;
  extractDataFromEmail: (email: SimulatedEmail) => Partial<EmailRecord>;
}

export default function Automation({
  logs,
  emails,
  grupos,
  isProcessing,
  processAllEmails,
  extractDataFromEmail,
}: AutomationProps) {
  const [defaultGrupo, setDefaultGrupo] = useState(grupos[0]?.id || '');
  const [previewEmail, setPreviewEmail] = useState<SimulatedEmail | null>(null);
  const [previewData, setPreviewData] = useState<Partial<EmailRecord> | null>(null);
  const [animatingSteps, setAnimatingSteps] = useState<string[]>([]);
  const animRef = useRef<NodeJS.Timeout | null>(null);

  const unprocessed = emails.filter(e => !e.processed);

  const handleProcess = async () => {
    // Animation
    const steps = [
      'Conectando con el servidor de correo...',
      'Escaneando bandeja de entrada...',
      `${unprocessed.length} correos nuevos encontrados`,
      'Analizando contenido con IA...',
      'Extrayendo datos de empresas...',
      'Clasificando respuestas...',
      'Actualizando tabla de datos...',
      '¡Proceso completado exitosamente!',
    ];

    setAnimatingSteps([]);
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => {
        animRef.current = setTimeout(resolve, 600);
      });
      setAnimatingSteps(prev => [...prev, steps[i]]);
    }

    await processAllEmails(defaultGrupo);

    setTimeout(() => setAnimatingSteps([]), 3000);
  };

  useEffect(() => {
    return () => {
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, []);

  const handlePreview = (email: SimulatedEmail) => {
    setPreviewEmail(email);
    const data = extractDataFromEmail(email);
    setPreviewData(data);
  };

  const statusIcon = (status: AutomationLog['status']) => {
    switch (status) {
      case 'success': return <CheckCircle2 size={14} className="text-emerald-500" />;
      case 'error': return <XCircle size={14} className="text-red-500" />;
      case 'info': return <Info size={14} className="text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Automatización con IA</h2>
        <p className="mt-1 text-sm text-slate-500">
          Procesamiento inteligente de correos y extracción automática de datos
        </p>
      </div>

      {/* Main Control Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Process Control */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Motor de Procesamiento</h3>
              <p className="text-xs text-slate-400">Extrae y clasifica datos automáticamente</p>
            </div>
          </div>

          {/* Status */}
          <div className="mb-4 rounded-xl bg-gradient-to-r from-slate-50 to-indigo-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${unprocessed.length > 0 ? 'animate-pulse bg-amber-400' : 'bg-emerald-400'}`} />
                <span className="text-sm font-medium text-slate-700">
                  {unprocessed.length > 0
                    ? `${unprocessed.length} correo${unprocessed.length > 1 ? 's' : ''} pendiente${unprocessed.length > 1 ? 's' : ''} de procesar`
                    : 'Todos los correos han sido procesados'}
                </span>
              </div>
              <Clock size={16} className="text-slate-400" />
            </div>
          </div>

          {/* Controls */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="relative">
              <label className="mb-1 block text-xs font-medium text-slate-500">Asignar al grupo</label>
              <select
                value={defaultGrupo}
                onChange={e => setDefaultGrupo(e.target.value)}
                className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {grupos.map(g => (
                  <option key={g.id} value={g.id}>{g.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 bottom-2.5 text-slate-400" />
            </div>
            <div className="flex-1" />
            <button
              onClick={handleProcess}
              disabled={isProcessing || unprocessed.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Procesando...
                </>
              ) : (
                <>
                  <Play size={18} /> Ejecutar Procesamiento
                </>
              )}
            </button>
          </div>

          {/* Animation Steps */}
          {animatingSteps.length > 0 && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
              <div className="space-y-2">
                {animatingSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm animate-[fadeIn_0.3s_ease-in]">
                    {i === animatingSteps.length - 1 && isProcessing ? (
                      <Loader2 size={14} className="animate-spin text-indigo-500" />
                    ) : (
                      <Sparkles size={14} className="text-indigo-500" />
                    )}
                    <span className="text-indigo-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How it works */}
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-700">¿Cómo funciona?</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { icon: <Zap size={20} />, title: 'Escaneo', desc: 'Revisa la bandeja de correos entrantes' },
                { icon: <Bot size={20} />, title: 'Extracción IA', desc: 'Identifica empresa, contacto, teléfono, estado' },
                { icon: <FileSpreadsheet size={20} />, title: 'Actualización', desc: 'Llena las casillas correspondientes automáticamente' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-2 rounded-lg bg-white p-3">
                  <span className="text-indigo-500">{item.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-slate-900">Vista Previa de Extracción</h3>

          {unprocessed.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">Haz clic para previsualizar qué datos se extraerán:</p>
              {unprocessed.map(email => (
                <button
                  key={email.id}
                  onClick={() => handlePreview(email)}
                  className={`w-full rounded-lg border p-2.5 text-left text-sm transition ${
                    previewEmail?.id === email.id
                      ? 'border-indigo-200 bg-indigo-50'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <p className="truncate font-medium text-slate-700">{email.fromName}</p>
                  <p className="truncate text-xs text-slate-500">{email.subject}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">No hay correos por previsualizar</p>
          )}

          {previewData && (
            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
              <p className="mb-2 text-xs font-semibold text-emerald-700">Datos a extraer:</p>
              <div className="space-y-1.5 text-xs">
                {[
                  ['Empresa', previewData.empresa],
                  ['Contacto', previewData.contacto],
                  ['Correo', previewData.correoContacto],
                  ['Teléfono', previewData.telefono],
                  ['Dirección', previewData.direccion],
                  ['Estado', previewData.estado],
                  ['Cupos', String(previewData.cuposDisponibles || 0)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="font-medium text-slate-600">{label}:</span>
                    <span className="truncate text-right text-slate-800">{value || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity Log */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-900">Registro de Actividad</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.map(log => (
            <div
              key={log.id}
              className="flex items-start gap-3 rounded-lg border border-slate-50 p-3 transition hover:bg-slate-50"
            >
              {statusIcon(log.status)}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-700">{log.action}</p>
                  <span className="flex-shrink-0 text-xs text-slate-400">
                    {new Date(log.timestamp).toLocaleString('es-PA')}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{log.details}</p>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">No hay actividad registrada</p>
          )}
        </div>
      </div>
    </div>
  );
}
