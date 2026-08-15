import { useState } from 'react';
import { UploadService } from '../services/upload.service';
import type { SourceType } from '../models/view.types';

export interface SourceDraft {
  type: SourceType;
  url: string;
  label: string;
}

interface SourceInputListProps {
  sources: SourceDraft[];
  onChange: (sources: SourceDraft[]) => void;
}

const emptySource = (): SourceDraft => ({ type: 'LINK', url: '', label: '' });

export default function SourceInputList({ sources, onChange }: SourceInputListProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const update = (index: number, patch: Partial<SourceDraft>) => {
    onChange(sources.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const remove = (index: number) => {
    onChange(sources.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...sources, emptySource()]);
  };

  const handleFileChange = async (index: number, file: File | undefined) => {
    if (!file) return;
    setUploadingIndex(index);
    try {
      const { url } = await UploadService.uploadDocument(file);
      update(index, { url, label: sources[index].label || file.name });
    } catch (err) {
      console.error('Error al subir el documento', err);
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <div className="space-y-3">
      {sources.map((source, index) => (
        <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-slate-50 border border-slate-200 rounded-xl p-3">
          <select
            value={source.type}
            onChange={e => update(index, { type: e.target.value as SourceType, url: '' })}
            className="border border-slate-300 rounded-lg p-2 text-sm bg-white outline-none"
          >
            <option value="LINK">Enlace</option>
            <option value="YOUTUBE">Video</option>
            <option value="DOCUMENT">Documento</option>
          </select>

          {source.type === 'DOCUMENT' ? (
            <div className="flex-1 flex items-center gap-2 w-full">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={e => handleFileChange(index, e.target.files?.[0])}
                className="text-sm flex-1"
              />
              {uploadingIndex === index && <span className="text-xs text-slate-500">Subiendo...</span>}
              {source.url && uploadingIndex !== index && <span className="text-xs text-green-600 font-bold">Listo ✓</span>}
            </div>
          ) : (
            <input
              value={source.url}
              onChange={e => update(index, { url: e.target.value })}
              placeholder="https://..."
              className="flex-1 border border-slate-300 rounded-lg p-2 text-sm outline-none w-full"
            />
          )}

          <input
            value={source.label}
            onChange={e => update(index, { label: e.target.value })}
            placeholder="Etiqueta (opcional)"
            className="border border-slate-300 rounded-lg p-2 text-sm outline-none w-full sm:w-40"
          />
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-red-500 hover:text-red-700 text-sm font-bold px-2"
          >
            Quitar
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-sm font-bold text-blue-600 hover:underline"
      >
        + Agregar fuente
      </button>
    </div>
  );
}