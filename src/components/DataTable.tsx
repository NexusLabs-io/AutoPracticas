import { useState } from 'react';
import {
  Download,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  Eye,
  X,
  Save,
  ChevronDown,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import type { EmailRecord, GrupoConfig, ExcelTemplate } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface DataTableProps {
  records: EmailRecord[];
  grupos: GrupoConfig[];
  selectedGrupo: string;
  setSelectedGrupo: (g: string) => void;
  addRecord: (r: EmailRecord) => void;
  updateRecord: (id: string, updates: Partial<EmailRecord>) => void;
  deleteRecord: (id: string) => void;
  activeTemplate: ExcelTemplate | null;
}

const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-800',
  aceptado: 'bg-emerald-100 text-emerald-800',
  rechazado: 'bg-red-100 text-red-800',
  en_espera: 'bg-purple-100 text-purple-800',
};

const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  aceptado: 'Aceptado',
  rechazado: 'Rechazado',
  en_espera: 'En Espera',
};

const emptyRecord = (defaultGrupo: string): EmailRecord => ({
  id: uuidv4(),
  empresa: '',
  contacto: '',
  correoContacto: '',
  telefono: '',
  direccion: '',
  estado: 'pendiente',
  fechaEnvio: new Date().toISOString().split('T')[0],
  fechaRespuesta: '',
  cuposDisponibles: 0,
  cuposAsignados: 0,
  observaciones: '',
  grupo: defaultGrupo,
  anio: '',
  asunto: '',
  cuerpoCorreo: '',
});

export default function DataTable({
  records,
  grupos,
  selectedGrupo,
  setSelectedGrupo,
  addRecord,
  updateRecord,
  deleteRecord,
  activeTemplate,
}: DataTableProps) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<EmailRecord>>({});
  const [showModal, setShowModal] = useState(false);
  const [newRecord, setNewRecord] = useState<EmailRecord>(emptyRecord(grupos[0]?.id || ''));
  const [detailRecord, setDetailRecord] = useState<EmailRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const availableYears = [...new Set(grupos.map(g => g.anio))].sort().reverse();

  const filtered = records
    .filter(r => selectedGrupo === 'all' || r.grupo === selectedGrupo)
    .filter(r => yearFilter === 'all' || r.anio === yearFilter)
    .filter(r => statusFilter === 'all' || r.estado === statusFilter)
    .filter(r => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        r.empresa.toLowerCase().includes(s) ||
        r.contacto.toLowerCase().includes(s) ||
        r.correoContacto.toLowerCase().includes(s)
      );
    });

  const exportToExcel = () => {
    const grouped: Record<string, EmailRecord[]> = {};
    grupos.forEach(g => {
      const grupoRecords = records.filter(r => r.grupo === g.id);
      if (grupoRecords.length > 0) {
        grouped[g.label] = grupoRecords;
      }
    });

    const wb = XLSX.utils.book_new();

    // If there's an active template with mappings, use those columns
    if (activeTemplate && activeTemplate.mappings.length > 0) {
      const enabledMappings = activeTemplate.mappings.filter(m => m.enabled && m.systemField);

      Object.entries(grouped).forEach(([sheetName, data]) => {
        const wsData = data.map(r => {
          const row: Record<string, string | number> = {};
          enabledMappings.forEach(mapping => {
            const field = mapping.systemField as keyof EmailRecord;
            const value = r[field];
            if (field === 'estado') {
              row[mapping.excelColumn] = ESTADO_LABELS[value as string] || String(value ?? '');
            } else if (typeof value === 'object') {
              row[mapping.excelColumn] = '';
            } else {
              row[mapping.excelColumn] = value ?? '';
            }
          });
          return row;
        });
        const ws = XLSX.utils.json_to_sheet(wsData);
        ws['!cols'] = enabledMappings.map(() => ({ wch: 25 }));
        XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
      });
    } else {
      // Default columns
      Object.entries(grouped).forEach(([sheetName, data]) => {
        const wsData = data.map(r => ({
          'Empresa': r.empresa,
          'Encargado/Contacto': r.contacto,
          'Correo del Encargado': r.correoContacto,
          'Teléfono': r.telefono,
          'Dirección': r.direccion,
          'Estado': ESTADO_LABELS[r.estado] || r.estado,
          'Fecha de Envío': r.fechaEnvio,
          'Fecha de Respuesta': r.fechaRespuesta,
          'Cupos Disponibles': r.cuposDisponibles,
          'Observaciones': r.observaciones,
        }));
        const ws = XLSX.utils.json_to_sheet(wsData);
        ws['!cols'] = [
          { wch: 25 }, { wch: 22 }, { wch: 30 }, { wch: 18 },
          { wch: 35 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
          { wch: 10 }, { wch: 40 },
        ];
        XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
      });
    }

    if (Object.keys(grouped).length === 0) {
      const ws = XLSX.utils.json_to_sheet([]);
      XLSX.utils.book_append_sheet(wb, ws, 'Sin Datos');
    }

    XLSX.writeFile(wb, `Practicas_Pasantias_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast(`✅ Excel exportado correctamente (${filtered.length} registros)`);
  };

  const startEdit = (record: EmailRecord) => {
    setEditingId(record.id);
    setEditData({ ...record });
  };

  const saveEdit = () => {
    if (editingId && editData) {
      updateRecord(editingId, editData);
      setEditingId(null);
      setEditData({});
    }
  };

  const handleAddRecord = () => {
    const grupo = grupos.find(g => g.id === newRecord.grupo);
    addRecord({ ...newRecord, anio: grupo?.anio || '' });
    setNewRecord(emptyRecord(grupos[0]?.id || ''));
    setShowModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-2xl">
          {toast}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tabla de Datos</h2>
          <p className="mt-1 text-sm text-slate-500">
            Gestiona los registros de empresas y pasantías
            {activeTemplate && <span className="text-indigo-600"> • Usando plantilla: {activeTemplate.name}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus size={16} /> Agregar
          </button>
          <button
            onClick={exportToExcel}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Download size={16} /> Exportar Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar empresa, contacto o correo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="relative">
          <select
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">Todos los Años</option>
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedGrupo}
            onChange={e => setSelectedGrupo(e.target.value)}
            className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-8 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">Todos los Grupos</option>
            {grupos.map(g => (
              <option key={g.id} value={g.id}>{g.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">Todos los Estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aceptado">Aceptado</option>
            <option value="rechazado">Rechazado</option>
            <option value="en_espera">En Espera</option>
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Empresa</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Encargado</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Correo</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Teléfono</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Cupos</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Grupo</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(record => (
                <tr key={record.id} className="transition-colors hover:bg-slate-50/50">
                  {editingId === record.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          className="w-full rounded border border-slate-200 px-2 py-1 text-sm focus:border-indigo-300 focus:outline-none"
                          value={editData.empresa || ''}
                          onChange={e => setEditData(d => ({ ...d, empresa: e.target.value }))}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          className="w-full rounded border border-slate-200 px-2 py-1 text-sm focus:border-indigo-300 focus:outline-none"
                          value={editData.contacto || ''}
                          onChange={e => setEditData(d => ({ ...d, contacto: e.target.value }))}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          className="w-full rounded border border-slate-200 px-2 py-1 text-sm focus:border-indigo-300 focus:outline-none"
                          value={editData.correoContacto || ''}
                          onChange={e => setEditData(d => ({ ...d, correoContacto: e.target.value }))}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          className="w-full rounded border border-slate-200 px-2 py-1 text-sm focus:border-indigo-300 focus:outline-none"
                          value={editData.telefono || ''}
                          onChange={e => setEditData(d => ({ ...d, telefono: e.target.value }))}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          className="rounded border border-slate-200 px-2 py-1 text-sm focus:border-indigo-300 focus:outline-none"
                          value={editData.estado || 'pendiente'}
                          onChange={e => setEditData(d => ({ ...d, estado: e.target.value as EmailRecord['estado'] }))}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="aceptado">Aceptado</option>
                          <option value="rechazado">Rechazado</option>
                          <option value="en_espera">En Espera</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          className="w-16 rounded border border-slate-200 px-2 py-1 text-sm focus:border-indigo-300 focus:outline-none"
                          value={editData.cuposDisponibles || 0}
                          onChange={e => setEditData(d => ({ ...d, cuposDisponibles: parseInt(e.target.value) || 0 }))}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          className="rounded border border-slate-200 px-2 py-1 text-sm focus:border-indigo-300 focus:outline-none"
                          value={editData.grupo || ''}
                          onChange={e => setEditData(d => ({ ...d, grupo: e.target.value }))}
                        >
                          {grupos.map(g => (
                            <option key={g.id} value={g.id}>{g.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={saveEdit}
                            className="rounded-lg p-1.5 text-emerald-600 transition hover:bg-emerald-50"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={() => { setEditingId(null); setEditData({}); }}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-slate-900">{record.empresa}</td>
                      <td className="px-4 py-3 text-slate-600">{record.contacto}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <span className="text-xs">{record.correoContacto}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{record.telefono}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_COLORS[record.estado]}`}>
                          {ESTADO_LABELS[record.estado]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-slate-700">{record.cuposDisponibles}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500">
                          {grupos.find(g => g.id === record.grupo)?.label || record.grupo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setDetailRecord(record)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                            title="Ver detalle"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => startEdit(record)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                            title="Editar"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(record.id)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    No se encontraron registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3">
          <p className="text-xs text-slate-500">
            Mostrando {filtered.length} de {records.length} registros
          </p>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Agregar Registro</h3>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">Empresa</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={newRecord.empresa}
                  onChange={e => setNewRecord(r => ({ ...r, empresa: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Encargado</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={newRecord.contacto}
                  onChange={e => setNewRecord(r => ({ ...r, contacto: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Correo</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={newRecord.correoContacto}
                  onChange={e => setNewRecord(r => ({ ...r, correoContacto: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Teléfono</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={newRecord.telefono}
                  onChange={e => setNewRecord(r => ({ ...r, telefono: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Cupos</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={newRecord.cuposDisponibles}
                  onChange={e => setNewRecord(r => ({ ...r, cuposDisponibles: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">Dirección</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={newRecord.direccion}
                  onChange={e => setNewRecord(r => ({ ...r, direccion: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Estado</label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={newRecord.estado}
                  onChange={e => setNewRecord(r => ({ ...r, estado: e.target.value as EmailRecord['estado'] }))}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="aceptado">Aceptado</option>
                  <option value="rechazado">Rechazado</option>
                  <option value="en_espera">En Espera</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Grupo</label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={newRecord.grupo}
                  onChange={e => setNewRecord(r => ({ ...r, grupo: e.target.value }))}
                >
                  {grupos.map(g => (
                    <option key={g.id} value={g.id}>{g.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">Observaciones</label>
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  rows={2}
                  value={newRecord.observaciones}
                  onChange={e => setNewRecord(r => ({ ...r, observaciones: e.target.value }))}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddRecord}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Detalle del Registro</h3>
              <button onClick={() => setDetailRecord(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                ['Empresa', detailRecord.empresa],
                ['Encargado', detailRecord.contacto],
                ['Correo', detailRecord.correoContacto],
                ['Teléfono', detailRecord.telefono],
                ['Dirección', detailRecord.direccion],
                ['Estado', ESTADO_LABELS[detailRecord.estado]],
                ['Fecha Envío', detailRecord.fechaEnvio || 'N/A'],
                ['Fecha Respuesta', detailRecord.fechaRespuesta || 'N/A'],
                ['Cupos', String(detailRecord.cuposDisponibles)],
                ['Grupo', grupos.find(g => g.id === detailRecord.grupo)?.label || detailRecord.grupo],
                ['Observaciones', detailRecord.observaciones || 'N/A'],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="w-32 flex-shrink-0 text-xs font-medium text-slate-500">{label}</span>
                  <span className="text-sm text-slate-800">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setDetailRecord(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-900">¿Eliminar este registro?</h3>
            <p className="mt-2 text-sm text-slate-500">
              Se eliminará <strong>{records.find(r => r.id === deleteConfirmId)?.empresa}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteRecord(deleteConfirmId);
                  setDeleteConfirmId(null);
                  showToast('🗑️ Registro eliminado');
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
