// ============================================
// TYPES FOR AUTOPRACTICAS
// ============================================

// --- EMPRESAS ---
export interface EmailRecord {
  id: string;
  empresa: string;
  contacto: string;
  correoContacto: string;
  telefono: string;
  direccion: string;
  estado: 'pendiente' | 'aceptado' | 'rechazado' | 'en_espera';
  fechaEnvio: string;
  fechaRespuesta: string;
  cuposDisponibles: number;
  cuposAsignados: number;
  observaciones: string;
  grupo: string;
  anio: string;
  asunto: string;
  cuerpoCorreo: string;
  customFields?: Record<string, string | number>;
}

// --- ESTUDIANTES ---
export interface StudentRecord {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  correo: string;
  telefono: string;
  grupo: string;
  anio: string;
  empresaAsignada: string; // ID de la empresa
  estado: 'pendiente' | 'asignado' | 'en_proceso' | 'completado' | 'cancelado';
  fechaRegistro: string;
  fechaAsignacion: string;
  fechaInicio: string;
  fechaFin: string;
  observaciones: string;
  documentos: string[];
}

// --- GRUPOS ---
export interface GrupoConfig {
  id: string;
  nombre: string;
  anio: string;
  categoria: string;
  label: string;
  color: string;
}

// --- MAPEO DE COLUMNAS ---
export interface ColumnMapping {
  excelColumn: string;
  systemField: string;
  enabled: boolean;
  aiSuggested?: boolean;
}

// --- PLANTILLAS ---
export interface ExcelTemplate {
  id: string;
  name: string;
  fileName: string;
  columns: string[];
  mappings: ColumnMapping[];
  uploadedAt: string;
  type: 'empresas' | 'estudiantes';
}

// --- CORREOS ---
export interface SimulatedEmail {
  id: string;
  from: string;
  fromName: string;
  subject: string;
  body: string;
  date: string;
  processed: boolean;
  empresa?: string;
  type: 'empresa' | 'estudiante';
}

// --- LOGS ---
export interface AutomationLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  status: 'success' | 'error' | 'info';
}

// --- EVENTOS CALENDARIO ---
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'inicio_practicas' | 'fin_practicas' | 'entrega_documentos' | 'reunion' | 'otro';
  description: string;
  empresaId?: string;
  estudianteId?: string;
  color: string;
}

// --- VISTAS ---
export type ViewMode =
  | 'dashboard'
  | 'tabla'
  | 'estudiantes'
  | 'asignaciones'
  | 'correos'
  | 'automatizacion'
  | 'plantillas'
  | 'reportes'
  | 'calendario'
  | 'configuracion';

// --- CAMPOS DEL SISTEMA ---
export const SYSTEM_FIELDS_EMPRESAS = [
  { key: 'empresa', label: 'Empresa', description: 'Nombre de la empresa' },
  { key: 'contacto', label: 'Encargado/Contacto', description: 'Persona de contacto' },
  { key: 'correoContacto', label: 'Correo del Encargado', description: 'Email del contacto' },
  { key: 'telefono', label: 'Teléfono', description: 'Número de teléfono' },
  { key: 'direccion', label: 'Dirección', description: 'Dirección de la empresa' },
  { key: 'estado', label: 'Estado', description: 'Estado de la solicitud' },
  { key: 'fechaEnvio', label: 'Fecha de Envío', description: 'Cuándo se envió la solicitud' },
  { key: 'fechaRespuesta', label: 'Fecha de Respuesta', description: 'Cuándo respondieron' },
  { key: 'cuposDisponibles', label: 'Cupos Disponibles', description: 'Número de cupos' },
  { key: 'observaciones', label: 'Observaciones', description: 'Notas adicionales' },
  { key: 'grupo', label: 'Grupo', description: 'Grupo asignado' },
  { key: 'anio', label: 'Año', description: 'Año del grupo' },
] as const;

export const SYSTEM_FIELDS_ESTUDIANTES = [
  { key: 'nombre', label: 'Nombre', description: 'Nombre del estudiante' },
  { key: 'apellido', label: 'Apellido', description: 'Apellido del estudiante' },
  { key: 'cedula', label: 'Cédula/ID', description: 'Documento de identidad' },
  { key: 'correo', label: 'Correo', description: 'Email del estudiante' },
  { key: 'telefono', label: 'Teléfono', description: 'Número de teléfono' },
  { key: 'grupo', label: 'Grupo', description: 'Grupo del estudiante' },
  { key: 'anio', label: 'Año', description: 'Año escolar' },
  { key: 'estado', label: 'Estado', description: 'Estado de asignación' },
  { key: 'empresaAsignada', label: 'Empresa Asignada', description: 'Empresa donde realizará prácticas' },
  { key: 'fechaInicio', label: 'Fecha Inicio', description: 'Inicio de prácticas' },
  { key: 'fechaFin', label: 'Fecha Fin', description: 'Fin de prácticas' },
  { key: 'observaciones', label: 'Observaciones', description: 'Notas adicionales' },
] as const;

// Alias for backward compatibility
export const SYSTEM_FIELDS = SYSTEM_FIELDS_EMPRESAS;

// --- PROVEEDORES DE IA ---
export interface AIProviderConfig {
  id: string;
  name: string;
  description: string;
  apiKeyPlaceholder: string;
  docsUrl: string;
  modelsUrl: string;
  baseUrl: string;
  defaultModel: string;
  models: string[];
  requiresApiKey: boolean;
  isDefault?: boolean;
}

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'none',
    name: 'Sin IA (Regex)',
    description: 'Extracción básica con patrones de texto',
    apiKeyPlaceholder: '',
    docsUrl: '',
    modelsUrl: '',
    baseUrl: '',
    defaultModel: '',
    models: [],
    requiresApiKey: false,
    isDefault: true,
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Llama 3.1 - Muy rápido',
    apiKeyPlaceholder: 'gsk_...',
    docsUrl: 'https://console.groq.com/docs/quickstart',
    modelsUrl: 'https://console.groq.com/docs/models',
    baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
    defaultModel: 'llama-3.1-70b-versatile',
    models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    requiresApiKey: true,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'DeepSeek V3 - Muy económico',
    apiKeyPlaceholder: 'sk-...',
    docsUrl: 'https://platform.deepseek.com/docs',
    modelsUrl: 'https://platform.deepseek.com/api-docs/pricing',
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-coder'],
    requiresApiKey: true,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4o-mini',
    apiKeyPlaceholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/docs/quickstart',
    modelsUrl: 'https://platform.openai.com/docs/models',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    requiresApiKey: true,
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    description: 'Claude 3.5 Sonnet, Haiku',
    apiKeyPlaceholder: 'sk-ant-...',
    docsUrl: 'https://docs.anthropic.com/en/docs/quickstart',
    modelsUrl: 'https://docs.anthropic.com/en/docs/models-overview',
    baseUrl: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-3-5-haiku-latest',
    models: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-latest'],
    requiresApiKey: true,
  },
  {
    id: 'google',
    name: 'Google (Gemini)',
    description: 'Gemini Pro, Flash',
    apiKeyPlaceholder: 'AI...',
    docsUrl: 'https://ai.google.dev/docs',
    modelsUrl: 'https://ai.google.dev/pricing',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    defaultModel: 'gemini-1.5-flash',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
    requiresApiKey: true,
  },
  {
    id: 'mistral',
    name: 'Mistral',
    description: 'Mistral Large, Small',
    apiKeyPlaceholder: '...',
    docsUrl: 'https://docs.mistral.ai/getting-started/quickstart/',
    modelsUrl: 'https://docs.mistral.ai/getting-started/models/',
    baseUrl: 'https://api.mistral.ai/v1/chat/completions',
    defaultModel: 'mistral-small-latest',
    models: ['mistral-large-latest', 'mistral-small-latest', 'open-mixtral-8x22b'],
    requiresApiKey: true,
  },
  {
    id: 'custom',
    name: 'API Personalizada',
    description: 'Cualquier API compatible con OpenAI',
    apiKeyPlaceholder: 'tu-api-key',
    docsUrl: '',
    modelsUrl: '',
    baseUrl: '',
    defaultModel: '',
    models: [],
    requiresApiKey: true,
  },
];
