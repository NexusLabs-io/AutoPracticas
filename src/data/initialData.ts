import { v4 as uuidv4 } from 'uuid';
import type { EmailRecord, GrupoConfig, SimulatedEmail, AutomationLog, StudentRecord, CalendarEvent } from '../types';

export const DEFAULT_GRUPOS: GrupoConfig[] = [
  { id: 'g1-pend-2025', nombre: 'Grupo 1', anio: '2025', categoria: 'Pendientes', label: 'Grupo 1 - Pendientes 2025', color: 'amber' },
  { id: 'g1-acep-2025', nombre: 'Grupo 1', anio: '2025', categoria: 'Aceptados', label: 'Grupo 1 - Aceptados 2025', color: 'emerald' },
  { id: 'g1-cons-2025', nombre: 'Grupo 1', anio: '2025', categoria: 'Consultas', label: 'Grupo 1 - Consultas 2025', color: 'blue' },
  { id: 'g2-pend-2025', nombre: 'Grupo 2', anio: '2025', categoria: 'Pendientes', label: 'Grupo 2 - Pendientes 2025', color: 'amber' },
  { id: 'g2-acep-2025', nombre: 'Grupo 2', anio: '2025', categoria: 'Aceptados', label: 'Grupo 2 - Aceptados 2025', color: 'emerald' },
  { id: 'g2-cons-2025', nombre: 'Grupo 2', anio: '2025', categoria: 'Consultas', label: 'Grupo 2 - Consultas 2025', color: 'blue' },
];

export const CATEGORIAS_DEFAULT = ['Pendientes', 'Aceptados', 'Consultas', 'Rechazados'];
export const COLORES_CATEGORIA: Record<string, string> = {
  'Pendientes': 'amber',
  'Aceptados': 'emerald',
  'Consultas': 'blue',
  'Rechazados': 'red',
};

export const SAMPLE_RECORDS: EmailRecord[] = [
  {
    id: uuidv4(),
    empresa: 'TechCorp Panamá',
    contacto: 'María González',
    correoContacto: 'mgonzalez@techcorp.com',
    telefono: '+507 6789-1234',
    direccion: 'Calle 50, Torre Global, Piso 12',
    estado: 'aceptado',
    fechaEnvio: '2025-01-15',
    fechaRespuesta: '2025-01-20',
    cuposDisponibles: 3,
    cuposAsignados: 1,
    observaciones: 'Aceptan estudiantes a partir de marzo',
    grupo: 'g1-acep-2025',
    anio: '2025',
    asunto: 'Solicitud de pasantía - Grupo 1',
    cuerpoCorreo: '',
  },
  {
    id: uuidv4(),
    empresa: 'Banco Nacional',
    contacto: 'Carlos Pérez',
    correoContacto: 'cperez@banconacional.com',
    telefono: '+507 6543-9876',
    direccion: 'Vía España, Edificio Central',
    estado: 'pendiente',
    fechaEnvio: '2025-01-18',
    fechaRespuesta: '',
    cuposDisponibles: 0,
    cuposAsignados: 0,
    observaciones: 'Esperando respuesta',
    grupo: 'g1-pend-2025',
    anio: '2025',
    asunto: 'Solicitud de pasantía - Grupo 1',
    cuerpoCorreo: '',
  },
  {
    id: uuidv4(),
    empresa: 'Hospital Santo Tomás',
    contacto: 'Ana Rodríguez',
    correoContacto: 'arodriguez@hst.gob.pa',
    telefono: '+507 6321-5678',
    direccion: 'Av. Balboa, Casco Antiguo',
    estado: 'aceptado',
    fechaEnvio: '2025-01-10',
    fechaRespuesta: '2025-01-14',
    cuposDisponibles: 5,
    cuposAsignados: 2,
    observaciones: 'Disponible turno matutino',
    grupo: 'g2-acep-2025',
    anio: '2025',
    asunto: 'Solicitud de pasantía - Grupo 2',
    cuerpoCorreo: '',
  },
  {
    id: uuidv4(),
    empresa: 'Constructora Meco',
    contacto: 'Roberto Jiménez',
    correoContacto: 'rjimenez@meco.com',
    telefono: '+507 6999-4321',
    direccion: 'Panamá Pacífico, Edificio 3',
    estado: 'rechazado',
    fechaEnvio: '2025-01-12',
    fechaRespuesta: '2025-01-16',
    cuposDisponibles: 0,
    cuposAsignados: 0,
    observaciones: 'No tienen capacidad este semestre',
    grupo: 'g1-pend-2025',
    anio: '2025',
    asunto: 'Solicitud de pasantía - Grupo 1',
    cuerpoCorreo: '',
  },
  {
    id: uuidv4(),
    empresa: 'Copa Airlines',
    contacto: 'Laura Mendoza',
    correoContacto: 'lmendoza@copaair.com',
    telefono: '+507 6222-8765',
    direccion: 'Aeropuerto Tocumen, Oficinas Administrativas',
    estado: 'en_espera',
    fechaEnvio: '2025-01-20',
    fechaRespuesta: '',
    cuposDisponibles: 0,
    cuposAsignados: 0,
    observaciones: 'Solicitan más información del programa',
    grupo: 'g2-cons-2025',
    anio: '2025',
    asunto: 'Solicitud de pasantía - Grupo 2',
    cuerpoCorreo: '',
  },
];

export const SAMPLE_STUDENTS: StudentRecord[] = [
  {
    id: uuidv4(),
    nombre: 'Juan',
    apellido: 'Pérez González',
    cedula: '8-999-1234',
    correo: 'jperez@estudiante.edu.pa',
    telefono: '+507 6111-1111',
    grupo: 'g1-acep-2025',
    anio: '2025',
    empresaAsignada: '',
    estado: 'pendiente',
    fechaRegistro: '2025-01-10',
    fechaAsignacion: '',
    fechaInicio: '',
    fechaFin: '',
    observaciones: '',
    documentos: [],
  },
  {
    id: uuidv4(),
    nombre: 'María',
    apellido: 'García López',
    cedula: '8-888-5678',
    correo: 'mgarcia@estudiante.edu.pa',
    telefono: '+507 6222-2222',
    grupo: 'g1-acep-2025',
    anio: '2025',
    empresaAsignada: '',
    estado: 'asignado',
    fechaRegistro: '2025-01-08',
    fechaAsignacion: '2025-01-22',
    fechaInicio: '2025-03-01',
    fechaFin: '2025-05-30',
    observaciones: 'Asignada a TechCorp',
    documentos: [],
  },
  {
    id: uuidv4(),
    nombre: 'Carlos',
    apellido: 'Rodríguez Sánchez',
    cedula: '8-777-9012',
    correo: 'crodriguez@estudiante.edu.pa',
    telefono: '+507 6333-3333',
    grupo: 'g2-acep-2025',
    anio: '2025',
    empresaAsignada: '',
    estado: 'pendiente',
    fechaRegistro: '2025-01-12',
    fechaAsignacion: '',
    fechaInicio: '',
    fechaFin: '',
    observaciones: '',
    documentos: [],
  },
];

export const SAMPLE_EMAILS: SimulatedEmail[] = [
  {
    id: uuidv4(),
    from: 'rrhh@innovatech.com',
    fromName: 'Patricia Sánchez',
    subject: 'RE: Solicitud de pasantía estudiantil - InnovaTech',
    body: `Estimada coordinadora,

Le informamos que InnovaTech S.A. tiene disponibilidad para recibir 4 estudiantes en modalidad de pasantía para el periodo 2025.

Encargado de supervisión: Ing. Patricia Sánchez
Correo: rrhh@innovatech.com
Teléfono: +507 6444-5555
Dirección: Ciudad del Saber, Edificio 220

Los estudiantes pueden iniciar a partir del 1 de marzo. Requerimos que traigan carta de la institución educativa.

Saludos cordiales,
Patricia Sánchez
Directora de Recursos Humanos
InnovaTech S.A.`,
    date: '2025-01-22T10:30:00',
    processed: false,
    type: 'empresa',
  },
  {
    id: uuidv4(),
    from: 'contacto@supermercadosrey.com',
    fromName: 'Fernando Castillo',
    subject: 'RE: Prácticas profesionales - Supermercados Rey',
    body: `Buenos días,

En respuesta a su solicitud, le comunicamos que Supermercados Rey puede recibir 2 estudiantes para prácticas profesionales.

Persona de contacto: Fernando Castillo
Email: contacto@supermercadosrey.com
Tel: +507 6777-3333
Ubicación: Via Ricardo J. Alfaro, Sede Central

Los horarios disponibles son de lunes a viernes de 8am a 12pm.

Atentamente,
Fernando Castillo
Coordinador de Programas Educativos`,
    date: '2025-01-22T14:15:00',
    processed: false,
    type: 'empresa',
  },
  {
    id: uuidv4(),
    from: 'juridico@bufetealeman.com',
    fromName: 'Dra. Carmen Alemán',
    subject: 'RE: Solicitud de pasantía - Bufete Alemán & Asociados',
    body: `Estimados,

Lamentablemente en este momento no contamos con la capacidad para recibir estudiantes en pasantía. Nuestra firma está en proceso de reestructuración y no podemos garantizar una supervisión adecuada.

Les sugerimos contactarnos nuevamente para el segundo semestre del año.

Cordialmente,
Dra. Carmen Alemán
Bufete Alemán & Asociados
juridico@bufetealeman.com
+507 6111-2222
Calle 53 Este, Obarrio`,
    date: '2025-01-23T09:00:00',
    processed: false,
    type: 'empresa',
  },
  {
    id: uuidv4(),
    from: 'admin@hotelriande.com',
    fromName: 'Miguel Torres',
    subject: 'RE: Programa de prácticas estudiantiles - Hotel Riande',
    body: `Buenas tardes,

Hotel Riande Continental confirma la disponibilidad de recibir 6 estudiantes para el programa de prácticas.

Contacto principal: Miguel Torres
Correo electrónico: admin@hotelriande.com
Teléfono de contacto: +507 6888-9999
Dirección: Vía España, Hotel Riande Continental

Áreas disponibles: Recepción, Alimentos y Bebidas, Housekeeping.
Estamos a la espera de la lista de estudiantes asignados.

Saludos,
Miguel Torres
Gerente de Operaciones`,
    date: '2025-01-23T16:45:00',
    processed: false,
    type: 'empresa',
  },
];

export const SAMPLE_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: uuidv4(),
    title: 'Inicio de prácticas - Grupo 1',
    date: '2025-03-01',
    type: 'inicio_practicas',
    description: 'Los estudiantes del Grupo 1 inician sus prácticas',
    color: 'emerald',
  },
  {
    id: uuidv4(),
    title: 'Entrega de documentos',
    date: '2025-02-15',
    type: 'entrega_documentos',
    description: 'Fecha límite para entrega de cartas de aceptación',
    color: 'amber',
  },
  {
    id: uuidv4(),
    title: 'Reunión con empresas',
    date: '2025-02-20',
    type: 'reunion',
    description: 'Reunión de coordinación con empresas participantes',
    color: 'blue',
  },
];

export const INITIAL_LOGS: AutomationLog[] = [
  {
    id: uuidv4(),
    timestamp: '2025-01-22T08:00:00',
    action: 'Escaneo automático',
    details: 'Se revisaron 12 correos. 4 nuevos correos encontrados.',
    status: 'success',
  },
  {
    id: uuidv4(),
    timestamp: '2025-01-21T16:00:00',
    action: 'Escaneo automático',
    details: 'Se revisaron 8 correos. Sin correos nuevos.',
    status: 'info',
  },
];
