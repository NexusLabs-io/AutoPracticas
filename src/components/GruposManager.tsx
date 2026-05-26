import { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  Copy,
  Calendar,
  FolderPlus,
} from 'lucide-react';
import type { GrupoConfig } from '../types';
import { CATEGORIAS_DEFAULT, COLORES_CATEGORIA } from '../data/initialData';

interface GruposManagerProps {
  grupos: GrupoConfig[];
  availableYears: string[];
  addGrupo: (nombre: string, anio: string, categoria: string) => void;
  updateGrupo: (id: string, updates: Partial<GrupoConfig>) => void;
  deleteGrupo: (id: string) => void;
  duplicateGruposForYear: (fromYear: string, toYear: string) => void;
  darkMode?: boolean;
}

export default function GruposManager({
  grupos,
  availableYears,
  addGrupo,
  updateGrupo,
  deleteGrupo,
  duplicateGruposForYear,
  darkMode: _darkMode = false,
}: GruposManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<GrupoConfig>>({});
  const [newGrupo, setNewGrupo] = useState({ nombre: '', anio: new Date().getFullYear().toString(), categoria: 'Pendientes' });
  const [duplicateFrom, setDuplicateFrom] = useState(availableYears[0] || '');
  const [duplicateTo, setDuplicateTo] = useState((parseInt(availableYears[0] || '2025') + 1).toString());

  const handleAddGrupo = () => {
    if (newGrupo.nombre && newGrupo.anio && newGrupo.categoria) {
      addGrupo(newGrupo.nombre, newGrupo.anio, newGrupo.categoria);
      setNewGrupo({ nombre: '', anio: new Date().getFullYear().toString(), categoria: 'Pendientes' });
      setShowAddModal(false);
    }
  };

  const handleDuplicate = () => {
    if (duplicateFrom && duplicateTo && duplicateFrom !== duplicateTo) {
      duplicateGruposForYear(duplicateFrom, duplicateTo);
      setShowDuplicateModal(false);
    }
  };

  const startEdit = (grupo: GrupoConfig) => {
    setEditingId(grupo.id);
    setEditData({ ...grupo });
  };

  const saveEdit = () => {
    if (editingId && editData) {
      updateGrupo(editingId, editData);
      setEditingId(null);
      setEditData({});
    }
  };

  const COLOR_CLASSES: Record<string, string> = {
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
            <Calendar size={18} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Grupos y Años</h3>
            <p className="text-xs text-slate-400">Gestiona los grupos por año y categoría</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDuplicateModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <Copy size={14} /> Duplicar Año
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700"
          >
            <Plus size={14} /> Nuevo Grupo
          </button>
        </div>
      </div>

      {/* Groups by Year */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {availableYears.map(year => (
          <div key={year}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{year}</p>
            <div className="space-y-1.5">
              {grupos.filter(g => g.anio === year).map(grupo => (
                <div
                  key={grupo.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
                >
                  {editingId === grupo.id ? (
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        className="w-24 rounded border border-slate-200 px-2 py-1 text-sm"
                        value={editData.nombre || ''}
                        onChange={e => setEditData(d => ({ ...d, nombre: e.target.value }))}
                        placeholder="Nombre"
                      />
                      <select
                        className="rounded border border-slate-200 px-2 py-1 text-sm"
                        value={editData.categoria || ''}
                        onChange={e => setEditData(d => ({ ...d, categoria: e.target.value, color: COLORES_CATEGORIA[e.target.value] || 'slate' }))}
                      >
                        {CATEGORIAS_DEFAULT.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <input
                        className="w-20 rounded border border-slate-200 px-2 py-1 text-sm"
                        value={editData.anio || ''}
                        onChange={e => setEditData(d => ({ ...d, anio: e.target.value }))}
                        placeholder="Año"
                      />
                      <button onClick={saveEdit} className="rounded p-1 text-emerald-600 hover:bg-emerald-50">
                        <Save size={14} />
                      </button>
                      <button onClick={() => { setEditingId(null); setEditData({}); }} className="rounded p-1 text-slate-400 hover:bg-slate-100">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${COLOR_CLASSES[grupo.color] || COLOR_CLASSES.slate}`}>
                          {grupo.categoria}
                        </span>
                        <span className="text-sm font-medium text-slate-700">{grupo.nombre}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(grupo)}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => deleteGrupo(grupo.id)}
                          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {grupos.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">No hay grupos configurados</p>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <FolderPlus size={20} className="text-indigo-600" />
                Nuevo Grupo
              </h3>
              <button onClick={() => setShowAddModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Nombre del Grupo</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="Ej: Grupo 1, Sección A, etc."
                  value={newGrupo.nombre}
                  onChange={e => setNewGrupo(g => ({ ...g, nombre: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Categoría</label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={newGrupo.categoria}
                  onChange={e => setNewGrupo(g => ({ ...g, categoria: e.target.value }))}
                >
                  {CATEGORIAS_DEFAULT.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Año</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="Ej: 2025"
                  value={newGrupo.anio}
                  onChange={e => setNewGrupo(g => ({ ...g, anio: e.target.value }))}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddGrupo}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Crear Grupo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Copy size={20} className="text-indigo-600" />
                Duplicar Grupos para Nuevo Año
              </h3>
              <button onClick={() => setShowDuplicateModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <p className="mb-4 text-xs text-slate-500">
              Crea una copia de todos los grupos de un año para usar en el siguiente.
            </p>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Copiar desde año</label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={duplicateFrom}
                  onChange={e => setDuplicateFrom(e.target.value)}
                >
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Hacia nuevo año</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="Ej: 2026"
                  value={duplicateTo}
                  onChange={e => setDuplicateTo(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDuplicate}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Duplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
