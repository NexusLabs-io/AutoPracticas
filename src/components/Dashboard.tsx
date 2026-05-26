import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Mail,
  BarChart3,
  Activity,
} from 'lucide-react';
import type { EmailRecord, AutomationLog, GrupoConfig } from '../types';

interface DashboardProps {
  records: EmailRecord[];
  logs: AutomationLog[];
  unprocessedEmails: number;
  grupos: GrupoConfig[];
}

export default function Dashboard({ records, logs, unprocessedEmails, grupos }: DashboardProps) {
  const total = records.length;
  const aceptados = records.filter(r => r.estado === 'aceptado').length;
  const pendientes = records.filter(r => r.estado === 'pendiente').length;
  const rechazados = records.filter(r => r.estado === 'rechazado').length;
  const enEspera = records.filter(r => r.estado === 'en_espera').length;
  const totalCupos = records.reduce((sum, r) => sum + r.cuposDisponibles, 0);

  const stats = [
    {
      label: 'Total Empresas',
      value: total,
      icon: <Building2 size={22} />,
      color: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      label: 'Aceptadas',
      value: aceptados,
      icon: <CheckCircle2 size={22} />,
      color: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
    {
      label: 'Pendientes',
      value: pendientes,
      icon: <Clock size={22} />,
      color: 'from-amber-500 to-amber-600',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
    {
      label: 'Rechazadas',
      value: rechazados,
      icon: <XCircle size={22} />,
      color: 'from-red-500 to-red-600',
      bgLight: 'bg-red-50',
      textColor: 'text-red-700',
    },
    {
      label: 'En Espera',
      value: enEspera,
      icon: <Clock size={22} />,
      color: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
    {
      label: 'Cupos Totales',
      value: totalCupos,
      icon: <TrendingUp size={22} />,
      color: 'from-cyan-500 to-cyan-600',
      bgLight: 'bg-cyan-50',
      textColor: 'text-cyan-700',
    },
  ];

  const grupoStats = grupos.map(g => {
    const grupoRecords = records.filter(r => r.grupo === g.id);
    return {
      ...g,
      total: grupoRecords.length,
      aceptados: grupoRecords.filter(r => r.estado === 'aceptado').length,
      pendientes: grupoRecords.filter(r => r.estado === 'pendiente').length,
      cupos: grupoRecords.reduce((sum, r) => sum + r.cuposDisponibles, 0),
    };
  });

  // Group by year
  const years = [...new Set(grupos.map(g => g.anio))].sort().reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Panel Principal</h2>
          <p className="mt-1 text-sm text-slate-500">
            Resumen general de las prácticas y pasantías
          </p>
        </div>
        {unprocessedEmails > 0 && (
          <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 ring-1 ring-amber-200">
            <Mail size={16} />
            {unprocessedEmails} correo{unprocessedEmails > 1 ? 's' : ''} sin procesar
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`rounded-xl ${stat.bgLight} p-2.5`}>
                <span className={stat.textColor}>{stat.icon}</span>
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${stat.color}`} />
          </div>
        ))}
      </div>

      {/* Grupo Breakdown + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* By Group */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-600" />
            <h3 className="text-lg font-semibold text-slate-900">Por Grupo y Año</h3>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {years.map(year => (
              <div key={year}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{year}</p>
                <div className="space-y-2">
                  {grupoStats.filter(g => g.anio === year).map(g => (
                    <div key={g.id} className="rounded-xl bg-slate-50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">{g.label}</span>
                        <span className={`rounded-full bg-${g.color}-100 px-2.5 py-0.5 text-xs font-medium text-${g.color}-700`}>
                          {g.total} empresas
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs">
                        <span className="flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 size={12} /> {g.aceptados} aceptadas
                        </span>
                        <span className="flex items-center gap-1 text-amber-600">
                          <Clock size={12} /> {g.pendientes} pendientes
                        </span>
                        <span className="flex items-center gap-1 text-cyan-600">
                          <TrendingUp size={12} /> {g.cupos} cupos
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all"
                          style={{ width: g.total > 0 ? `${(g.aceptados / Math.max(g.total, 1)) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {grupos.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">No hay grupos configurados</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Activity size={20} className="text-indigo-600" />
            <h3 className="text-lg font-semibold text-slate-900">Actividad Reciente</h3>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {logs.slice(0, 10).map(log => (
              <div key={log.id} className="flex items-start gap-3 rounded-lg p-2 hover:bg-slate-50">
                <div className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${
                  log.status === 'success' ? 'bg-emerald-500' :
                  log.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-700">{log.action}</p>
                  <p className="truncate text-xs text-slate-500">{log.details}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {new Date(log.timestamp).toLocaleString('es-PA')}
                  </p>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">No hay actividad reciente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
