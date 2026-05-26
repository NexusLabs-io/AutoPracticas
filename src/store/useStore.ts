import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { EmailRecord, SimulatedEmail, AutomationLog, ViewMode, GrupoConfig, ExcelTemplate, ColumnMapping } from '../types';
import { DEFAULT_GRUPOS, SAMPLE_RECORDS, SAMPLE_EMAILS, INITIAL_LOGS, COLORES_CATEGORIA } from '../data/initialData';
import { extractWithAI, type AIConfig, type AIProvider } from '../services/aiService';
import { loadAPIKeys, saveAPIKeys } from '../services/cryptoService';

// LocalStorage keys
const STORAGE_KEYS = {
  records: 'autopracticas_records',
  grupos: 'autopracticas_grupos',
  templates: 'autopracticas_templates',
  logs: 'autopracticas_logs',
  aiConfig: 'autopracticas_ai_config',
  emails: 'autopracticas_emails',
};

// Load from localStorage
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading from localStorage:', e);
  }
  return fallback;
}

// Save to localStorage
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'groq',
  groqApiKey: '',
  deepseekApiKey: '',
};

function loadAIConfig(): AIConfig {
  const stored = loadFromStorage<Partial<AIConfig>>(STORAGE_KEYS.aiConfig, {});
  return {
    ...DEFAULT_AI_CONFIG,
    provider: stored.provider || DEFAULT_AI_CONFIG.provider,
  };
}

export function useStore(sessionPassword: string) {
  const [records, setRecords] = useState<EmailRecord[]>(() =>
    loadFromStorage(STORAGE_KEYS.records, SAMPLE_RECORDS)
  );
  const [grupos, setGrupos] = useState<GrupoConfig[]>(() =>
    loadFromStorage(STORAGE_KEYS.grupos, DEFAULT_GRUPOS)
  );
  const [templates, setTemplates] = useState<ExcelTemplate[]>(() =>
    loadFromStorage(STORAGE_KEYS.templates, [])
  );
  const [emails, setEmails] = useState<SimulatedEmail[]>(() =>
    loadFromStorage(STORAGE_KEYS.emails, SAMPLE_EMAILS)
  );
  const [logs, setLogs] = useState<AutomationLog[]>(() =>
    loadFromStorage(STORAGE_KEYS.logs, INITIAL_LOGS)
  );
  const [aiConfig, setAIConfigState] = useState<AIConfig>(loadAIConfig);
  const [apiKeysReady, setApiKeysReady] = useState(false);
  const [view, setView] = useState<ViewMode>('dashboard');
  const [selectedGrupo, setSelectedGrupo] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoEnabled, setAutoEnabled] = useState(true);
  const [scanInterval, setScanInterval] = useState(12);
  const [activeTemplate, setActiveTemplate] = useState<ExcelTemplate | null>(null);

  // Persist to localStorage when data changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.records, records);
  }, [records]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.grupos, grupos);
  }, [grupos]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.templates, templates);
  }, [templates]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.logs, logs);
  }, [logs]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.emails, emails);
  }, [emails]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.aiConfig, { provider: aiConfig.provider });

    if (!sessionPassword || !apiKeysReady) return;

    saveAPIKeys(
      {
        groqKey: aiConfig.groqApiKey,
        deepseekKey: aiConfig.deepseekApiKey,
      },
      sessionPassword
    ).catch(e => console.error('Error saving encrypted API keys:', e));
  }, [aiConfig, sessionPassword, apiKeysReady]);

  useEffect(() => {
    if (!sessionPassword) {
      setApiKeysReady(false);
      return;
    }

    loadAPIKeys(sessionPassword)
      .then(keys => {
        if (!keys) return;
        setAIConfigState(prev => ({
          ...prev,
          groqApiKey: keys.groqKey || '',
          deepseekApiKey: keys.deepseekKey || '',
        }));
      })
      .catch(e => console.error('Error loading encrypted API keys:', e))
      .finally(() => setApiKeysReady(true));
  }, [sessionPassword]);

  // AI Config management
  const setAIConfig = useCallback((config: Partial<AIConfig>) => {
    setAIConfigState(prev => ({ ...prev, ...config }));
  }, []);

  const setAIProvider = useCallback((provider: AIProvider) => {
    setAIConfigState(prev => ({ ...prev, provider }));
  }, []);

  // GRUPOS management
  const addGrupo = useCallback((nombre: string, anio: string, categoria: string) => {
    const id = `${nombre.toLowerCase().replace(/\s+/g, '-')}-${categoria.toLowerCase().substring(0, 4)}-${anio}`;
    const newGrupo: GrupoConfig = {
      id,
      nombre,
      anio,
      categoria,
      label: `${nombre} - ${categoria} ${anio}`,
      color: COLORES_CATEGORIA[categoria] || 'slate',
    };
    setGrupos(prev => [...prev, newGrupo]);
    return newGrupo;
  }, []);

  const updateGrupo = useCallback((id: string, updates: Partial<GrupoConfig>) => {
    setGrupos(prev => prev.map(g => {
      if (g.id === id) {
        const updated = { ...g, ...updates };
        updated.label = `${updated.nombre} - ${updated.categoria} ${updated.anio}`;
        return updated;
      }
      return g;
    }));
  }, []);

  const deleteGrupo = useCallback((id: string) => {
    setGrupos(prev => prev.filter(g => g.id !== id));
    setRecords(prev => prev.map(r => r.grupo === id ? { ...r, grupo: '' } : r));
  }, []);

  const duplicateGruposForYear = useCallback((fromYear: string, toYear: string) => {
    const gruposFromYear = grupos.filter(g => g.anio === fromYear);
    const newGrupos = gruposFromYear.map(g => ({
      ...g,
      id: g.id.replace(fromYear, toYear),
      anio: toYear,
      label: g.label.replace(fromYear, toYear),
    }));
    setGrupos(prev => [...prev, ...newGrupos]);
  }, [grupos]);

  // RECORDS management
  const addRecord = useCallback((record: EmailRecord) => {
    setRecords(prev => [...prev, record]);
  }, []);

  const updateRecord = useCallback((id: string, updates: Partial<EmailRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  }, []);

  // TEMPLATES management
  const addTemplate = useCallback((template: ExcelTemplate) => {
    setTemplates(prev => [...prev, template]);
  }, []);

  const updateTemplate = useCallback((id: string, updates: Partial<ExcelTemplate>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    if (activeTemplate?.id === id) {
      setActiveTemplate(null);
    }
  }, [activeTemplate]);

  const updateTemplateMapping = useCallback((templateId: string, mappings: ColumnMapping[]) => {
    setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, mappings } : t));
  }, []);

  // LOGS management
  const addLog = useCallback((action: string, details: string, status: AutomationLog['status']) => {
    const log: AutomationLog = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      action,
      details,
      status,
    };
    setLogs(prev => [log, ...prev].slice(0, 100));
  }, []);

  // Fallback extraction with regex
  const extractDataWithRegex = useCallback((email: SimulatedEmail): Partial<EmailRecord> => {
    const body = email.body;

    let empresa = '';
    const subjectMatch = email.subject.match(/(?:RE:\s*)?(?:Solicitud de pasantía|Prácticas profesionales|Programa de prácticas)[^-]*-\s*(.+)/i);
    if (subjectMatch) {
      empresa = subjectMatch[1].trim();
    }

    let contacto = email.fromName || '';
    const namePatterns = [
      /(?:Encargado|Contacto|Persona de contacto|Supervisión)[^:]*:\s*(?:Ing\.|Dr\.|Dra\.|Lic\.|Lcda\.)?\s*(.+)/i,
      /(?:Atentamente|Saludos|Cordialmente)[,\s]*\n\s*(?:Ing\.|Dr\.|Dra\.|Lic\.|Lcda\.)?\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+)/m,
    ];
    for (const pattern of namePatterns) {
      const match = body.match(pattern);
      if (match) {
        contacto = match[1].trim();
        break;
      }
    }

    let correo = email.from;
    const emailPattern = /(?:Correo|Email|E-mail|correo electrónico)[^:]*:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const emailMatch = body.match(emailPattern);
    if (emailMatch) {
      correo = emailMatch[1];
    }

    let telefono = '';
    const phonePatterns = [
      /(?:Teléfono|Tel|Celular|Teléfono de contacto)[^:]*:\s*([+\d\s()-]+)/i,
      /(\+507\s*\d{4}[-\s]?\d{4})/,
    ];
    for (const pattern of phonePatterns) {
      const match = body.match(pattern);
      if (match) {
        telefono = match[1].trim();
        break;
      }
    }

    let direccion = '';
    const addrPatterns = [
      /(?:Dirección|Ubicación|Sede)[^:]*:\s*(.+)/i,
    ];
    for (const pattern of addrPatterns) {
      const match = body.match(pattern);
      if (match) {
        direccion = match[1].trim();
        break;
      }
    }

    let cuposDisponibles = 0;
    const cuposMatch = body.match(/(\d+)\s*estudiantes/i);
    if (cuposMatch) {
      cuposDisponibles = parseInt(cuposMatch[1]);
    }

    let estado: EmailRecord['estado'] = 'pendiente';
    const bodyLower = body.toLowerCase();
    if (bodyLower.includes('lamentablemente') || bodyLower.includes('no contamos') || bodyLower.includes('no podemos') || bodyLower.includes('rechaz')) {
      estado = 'rechazado';
    } else if (bodyLower.includes('disponibilidad') || bodyLower.includes('confirma') || bodyLower.includes('puede recibir') || bodyLower.includes('tiene disponibilidad')) {
      estado = 'aceptado';
    } else if (bodyLower.includes('más información') || bodyLower.includes('evaluar') || bodyLower.includes('segundo semestre')) {
      estado = 'en_espera';
    }

    let observaciones = '';
    if (estado === 'rechazado') {
      const obsMatch = body.match(/(?:lamentablemente|no contamos|no podemos)[^.]*\./i);
      if (obsMatch) observaciones = obsMatch[0].trim();
    } else if (estado === 'aceptado') {
      const obsPatterns = [
        /(?:horarios|áreas|pueden iniciar|requerimos)[^.]*\./i,
        /(?:Los estudiantes|Estamos)[^.]*\./i,
      ];
      const obsParts: string[] = [];
      for (const pattern of obsPatterns) {
        const match = body.match(pattern);
        if (match) obsParts.push(match[0].trim());
      }
      observaciones = obsParts.join(' ') || 'Aceptado - revisar detalles en correo';
    }

    return {
      empresa,
      contacto,
      correoContacto: correo,
      telefono,
      direccion,
      estado,
      fechaRespuesta: new Date(email.date).toISOString().split('T')[0],
      cuposDisponibles,
      observaciones,
      asunto: email.subject,
      cuerpoCorreo: email.body,
    };
  }, []);

  // Main extraction function - uses AI if configured, falls back to regex
  const extractDataFromEmail = useCallback(async (email: SimulatedEmail): Promise<Partial<EmailRecord>> => {
    if (aiConfig.provider !== 'none') {
      try {
        const aiResult = await extractWithAI(aiConfig, email);
        if (aiResult) {
          return {
            ...aiResult,
            fechaRespuesta: new Date(email.date).toISOString().split('T')[0],
            asunto: email.subject,
            cuerpoCorreo: email.body,
          };
        }
      } catch (error) {
        console.error('AI extraction failed, falling back to regex:', error);
        addLog('Error IA', `Fallback a regex: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
      }
    }

    // Fallback to regex
    return extractDataWithRegex(email);
  }, [aiConfig, extractDataWithRegex, addLog]);

  // Synchronous version for preview
  const extractDataFromEmailSync = useCallback((email: SimulatedEmail): Partial<EmailRecord> => {
    return extractDataWithRegex(email);
  }, [extractDataWithRegex]);

  const processEmail = useCallback(async (emailId: string, grupoId: string) => {
    const email = emails.find(e => e.id === emailId);
    if (!email) return;

    const extracted = await extractDataFromEmail(email);
    const grupo = grupos.find(g => g.id === grupoId);

    const newRecord: EmailRecord = {
      id: uuidv4(),
      empresa: extracted.empresa || 'Sin identificar',
      contacto: extracted.contacto || '',
      correoContacto: extracted.correoContacto || email.from,
      telefono: extracted.telefono || '',
      direccion: extracted.direccion || '',
      estado: extracted.estado || 'pendiente',
      fechaEnvio: '',
      fechaRespuesta: extracted.fechaRespuesta || '',
      cuposDisponibles: extracted.cuposDisponibles || 0,
      cuposAsignados: 0,
      observaciones: extracted.observaciones || '',
      grupo: grupoId,
      anio: grupo?.anio || '',
      asunto: extracted.asunto || email.subject,
      cuerpoCorreo: extracted.cuerpoCorreo || email.body,
    };

    addRecord(newRecord);
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, processed: true } : e));
    addLog(
      'Correo procesado',
      `Se extrajo información de "${email.subject}" usando ${aiConfig.provider === 'none' ? 'regex' : aiConfig.provider.toUpperCase()} y se asignó a ${grupo?.label || grupoId}`,
      'success'
    );
  }, [emails, grupos, extractDataFromEmail, addRecord, addLog, aiConfig.provider]);

  const processAllEmails = useCallback(async (defaultGrupo: string) => {
    setIsProcessing(true);
    const unprocessed = emails.filter(e => !e.processed);

    if (unprocessed.length === 0) {
      addLog('Escaneo automático', 'No se encontraron correos nuevos para procesar.', 'info');
      setIsProcessing(false);
      return;
    }

    for (let i = 0; i < unprocessed.length; i++) {
      await processEmail(unprocessed[i].id, defaultGrupo);
      // Small delay between processing
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    addLog(
      'Escaneo automático completado',
      `Se procesaron ${unprocessed.length} correos nuevos usando ${aiConfig.provider === 'none' ? 'regex' : aiConfig.provider.toUpperCase()}.`,
      'success'
    );
    setIsProcessing(false);
  }, [emails, processEmail, addLog, aiConfig.provider]);

  const addSimulatedEmail = useCallback((email: Omit<SimulatedEmail, 'id' | 'processed'>) => {
    setEmails(prev => [...prev, { ...email, id: uuidv4(), processed: false }]);
  }, []);

  // Get unique years from grupos
  const availableYears = [...new Set(grupos.map(g => g.anio))].sort();

  return {
    // State
    records,
    grupos,
    templates,
    emails,
    logs,
    view,
    selectedGrupo,
    isProcessing,
    autoEnabled,
    scanInterval,
    activeTemplate,
    availableYears,
    aiConfig,

    // Setters
    setView,
    setSelectedGrupo,
    setAutoEnabled,
    setScanInterval,
    setActiveTemplate,
    setIsProcessing,
    setAIConfig,
    setAIProvider,

    // Records
    addRecord,
    updateRecord,
    deleteRecord,

    // Grupos
    addGrupo,
    updateGrupo,
    deleteGrupo,
    duplicateGruposForYear,

    // Templates
    addTemplate,
    updateTemplate,
    deleteTemplate,
    updateTemplateMapping,

    // Email processing
    processEmail,
    processAllEmails,
    addSimulatedEmail,
    extractDataFromEmail: extractDataFromEmailSync,

    // Logs
    addLog,
  };
}
