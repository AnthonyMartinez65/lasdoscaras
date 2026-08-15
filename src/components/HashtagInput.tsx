import { useState, useEffect, type KeyboardEvent } from 'react';
import { HashtagService } from '../services/hashtag.service';
import type { Hashtag } from '../models/category.types';

interface HashtagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export default function HashtagInput({ value, onChange }: HashtagInputProps) {
  const [draft, setDraft] = useState('');
  const [suggestions, setSuggestions] = useState<Hashtag[]>([]);

  useEffect(() => {
    if (!draft.trim()) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(() => {
      HashtagService.search(draft)
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, 300); // debounce para no disparar un request en cada tecla

    return () => clearTimeout(timeout);
  }, [draft]);

  const addTag = (raw?: string) => {
    const tag = (raw ?? draft).trim().replace(/^#/, '');
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setDraft('');
    setSuggestions([]);
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
    <div className="relative">
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
          onBlur={() => addTag()}
          placeholder={value.length === 0 ? 'Escribe y presiona Enter...' : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
        />
      </div>

      {suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map(s => (
            <button
              key={s.id}
              type="button"
              // onMouseDown en vez de onClick: se dispara antes que el onBlur
              // del input, así el tag se agrega antes de que la lista se cierre.
              onMouseDown={() => addTag(s.name)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
            >
              #{s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}