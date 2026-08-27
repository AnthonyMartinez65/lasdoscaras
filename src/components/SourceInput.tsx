import type { SourceType } from '../models/view.types';

export interface SourceData {
  type: SourceType;
  url: string;
  label: string;
}

interface SourceInputProps {
  value: SourceData[];
  onChange: (sources: SourceData[]) => void;
}

export default function SourceInput({ value, onChange }: SourceInputProps) {
  const addSource = () => {
    onChange([...value, { type: 'LINK', url: '', label: '' }]);
  };

  const updateSource = (index: number, field: keyof SourceData, val: string) => {
    const newSources = [...value];
    newSources[index] = { ...newSources[index], [field]: val };
    onChange(newSources);
  };

  const removeSource = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="space-y-4">
      {value.map((src, index) => {
        const ytId = src.type === 'YOUTUBE' ? getYoutubeId(src.url) : null;
        
        return (
          <div key={index} className="flex flex-col gap-3 p-4 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800">
            <div className="flex gap-2">
              <select
                value={src.type}
                onChange={e => updateSource(index, 'type', e.target.value)}
                className="shrink-0 max-w-[120px] border border-slate-300 dark:border-slate-500 rounded-lg px-2 py-2 bg-white dark:bg-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LINK">Enlace</option>
                <option value="YOUTUBE">YouTube</option>
                <option value="DOCUMENT">Documento</option>
              </select>
              
              <input
                type="text"
                placeholder="Etiqueta..."
                value={src.label}
                onChange={e => updateSource(index, 'label', e.target.value)}
                className="flex-1 min-w-0 border border-slate-300 dark:border-slate-500 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <button 
                type="button" 
                onClick={() => removeSource(index)} 
                className="shrink-0 flex items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 p-2 rounded-lg transition-colors border border-red-200 dark:border-red-800" 
                title="Eliminar fuente"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            
            <div className="relative">
              <input
                type="url"
                placeholder="https://..."
                required
                value={src.url}
                onChange={e => updateSource(index, 'url', e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-500 rounded-lg px-3 py-2 pr-10 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              {src.url.startsWith('http') && (
                <div className="absolute right-3 top-2.5 text-green-500" title="URL válida">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            
            {ytId && (
              <div className="mt-2 rounded-lg overflow-hidden shadow-sm aspect-video bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title="YouTube preview"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>
        );
      })}
      
      <button
        type="button"
        onClick={addSource}
        className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl py-3 text-sm font-bold transition-colors"
      >
        + Añadir Fuente
      </button>
    </div>
  );
}
