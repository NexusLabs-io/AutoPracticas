import { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Trash2,
  Check,
  X,
  Link2,
  ChevronDown,
  Info,
  Star,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import type { ExcelTemplate, ColumnMapping } from '../types';
import { SYSTEM_FIELDS } from '../types';

interface TemplateManagerProps {
  templates: ExcelTemplate[];
  activeTemplate: ExcelTemplate | null;
  addTemplate: (template: ExcelTemplate) => void;
  updateTemplate: (id: string, updates: Partial<ExcelTemplate>) => void;
  deleteTemplate: (id: string) => void;
  updateTemplateMapping: (templateId: string, mappings: ColumnMapping[]) => void;
  setActiveTemplate: (template: ExcelTemplate | null) => void;
}

export default function TemplateManager({
  templates,
  activeTemplate,
  addTemplate,
  deleteTemplate,
  updateTemplateMapping,
  setActiveTemplate,
}: TemplateManagerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ExcelTemplate | null>(null);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];

      if (jsonData.length > 0) {
        const headers = jsonData[0].filter(h => h && typeof h === 'string');

        // Create initial mappings
        const initialMappings: ColumnMapping[] = headers.map(col => ({
          excelColumn: col,
          systemField: '', // Empty by default
          enabled: true,
        }));

        const newTemplate: ExcelTemplate = {
          id: uuidv4(),
          name: file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          columns: headers,
          mappings: initialMappings,
          uploadedAt: new Date().toISOString(),
          type: 'empresas',
        };

        addTemplate(newTemplate);
        setSelectedTemplate(newTemplate);
        setMappings(initialMappings);
      }
    };
    reader.readAsArrayBuffer(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectTemplate = (template: ExcelTemplate) => {
    setSelectedTemplate(template);
    setMappings([...template.mappings]);
  };

  const updateMapping = (index: number, field: 'systemField' | 'enabled', value: string | boolean) => {
    const newMappings = [...mappings];
    if (field === 'enabled') {
      newMappings[index].enabled = value as boolean;
    } else {
      newMappings[index].systemField = value as string;
    }
    setMappings(newMappings);
  };

  const saveMappings = () => {
    if (selectedTemplate) {
      updateTemplateMapping(selectedTemplate.id, mappings);
      setSelectedTemplate({ ...selectedTemplate, mappings });
    }
  };

  const activateTemplate = () => {
    if (selectedTemplate) {
      saveMappings();
      setActiveTemplate({ ...selectedTemplate, mappings });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Plantillas de Excel</h2>
        <p className="mt-1 text-sm text-slate-500">
          Sube tu formato de Excel y define cómo mapear cada columna
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upload & List */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-slate-900">Tus Plantillas</h3>

          {/* Upload Area */}
          <label className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 transition hover:border-indigo-300 hover:bg-indigo-50/50">
            <Upload size={24} className="mb-2 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Subir Plantilla Excel</span>
            <span className="mt-1 text-xs text-slate-400">.xlsx, .xls</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {/* Template List */}
          <div className="space-y-2">
            {templates.map(template => (
              <div
                key={template.id}
                className={`flex items-center justify-between rounded-lg border p-3 transition cursor-pointer ${
                  selectedTemplate?.id === template.id
                    ? 'border-indigo-200 bg-indigo-50'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
                onClick={() => selectTemplate(template)}
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet size={18} className="text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{template.name}</p>
                    <p className="text-xs text-slate-400">{template.columns.length} columnas</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeTemplate?.id === template.id && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Activa
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteTemplate(template.id); }}
                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {templates.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-400">
                No hay plantillas subidas
              </p>
            )}
          </div>
        </div>

        {/* Mapping Editor */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          {selectedTemplate ? (
            <>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Mapeo de Columnas</h3>
                  <p className="text-xs text-slate-400">
                    Plantilla: <span className="font-medium">{selectedTemplate.name}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveMappings}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Check size={14} /> Guardar
                  </button>
                  <button
                    onClick={activateTemplate}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                  >
                    <Star size={14} /> Usar esta Plantilla
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="mb-4 rounded-lg bg-blue-50 p-3">
                <div className="flex gap-2">
                  <Info size={16} className="flex-shrink-0 text-blue-500" />
                  <p className="text-xs text-blue-700">
                    Selecciona qué dato del sistema corresponde a cada columna de tu Excel.
                    Las columnas marcadas como "Habilitado" se incluirán en la exportación.
                  </p>
                </div>
              </div>

              {/* Mapping Table */}
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Columna Excel</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-slate-600">
                        <div className="flex items-center gap-1">
                          <Link2 size={14} /> Dato del Sistema
                        </div>
                      </th>
                      <th className="px-4 py-2.5 text-center font-semibold text-slate-600">Habilitado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {mappings.map((mapping, index) => (
                      <tr key={mapping.excelColumn} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2.5">
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                            {mapping.excelColumn}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="relative">
                            <select
                              value={mapping.systemField}
                              onChange={e => updateMapping(index, 'systemField', e.target.value)}
                              className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-sm focus:border-indigo-300 focus:outline-none"
                            >
                              <option value="">— Sin asignar —</option>
                              {SYSTEM_FIELDS.map(field => (
                                <option key={field.key} value={field.key}>
                                  {field.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={() => updateMapping(index, 'enabled', !mapping.enabled)}
                            className={`rounded-lg p-1.5 transition ${
                              mapping.enabled
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {mapping.enabled ? <Check size={14} /> : <X size={14} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Preview */}
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-slate-600">Vista previa de exportación:</p>
                <div className="overflow-x-auto rounded-lg bg-slate-50 p-3">
                  <div className="flex gap-2">
                    {mappings.filter(m => m.enabled && m.systemField).map(m => (
                      <span key={m.excelColumn} className="whitespace-nowrap rounded bg-white px-2 py-1 text-xs text-slate-600 shadow-sm">
                        {m.excelColumn} ← {SYSTEM_FIELDS.find(f => f.key === m.systemField)?.label}
                      </span>
                    ))}
                    {mappings.filter(m => m.enabled && m.systemField).length === 0 && (
                      <span className="text-xs text-slate-400">No hay columnas mapeadas</span>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-3 text-sm text-slate-400">
                  Selecciona o sube una plantilla para configurar el mapeo
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Template Info */}
      {activeTemplate && (
        <div className="rounded-xl bg-emerald-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star size={18} className="text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-emerald-800">
                  Plantilla activa: {activeTemplate.name}
                </p>
                <p className="text-xs text-emerald-600">
                  {activeTemplate.mappings.filter(m => m.enabled && m.systemField).length} columnas mapeadas
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTemplate(null)}
              className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
            >
              Desactivar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
