import { useState, type KeyboardEvent } from 'react';

interface HashtagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

// TODO: el API expone GET /api/hashtags?q= para autocompletar sugerencias
// existentes — todavía no está conectado acá, se agrega en el siguiente
// commit. Por ahora es un input de texto libre que arma tags al presionar
// Enter o coma.
export default function HashtagInput({ value, onChange }: HashtagInputProps) {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const tag = draft.trim().replace(/^#/, '');
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setDraft('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  return (
    <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-blue-500">
      {value.map(tag => (
        <span key={tag} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
          #{tag}
          <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-900">×</button>
        </span>
      ))}
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={value.length === 0 ? 'Escribe y presiona Enter...' : ''}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
      />
    </div>
  );
}