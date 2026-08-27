import { useState, KeyboardEvent } from 'react';

interface HashtagInputProps {
  value: string[];
  onChange: (hashtags: string[]) => void;
}

export default function HashtagInput({ value, onChange }: HashtagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim().replace(/^#/, '');
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="w-full border border-slate-300 dark:border-slate-600 rounded-xl p-2 bg-white dark:bg-slate-700 min-h-[48px] flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
      {value.map(tag => (
        <span key={tag} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-full">
          #{tag}
          <button type="button" onClick={() => removeTag(tag)} className="text-blue-500 hover:text-blue-900 font-bold ml-1">&times;</button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? "Escribe y presiona Enter..." : ""}
        className="flex-1 min-w-[140px] bg-transparent outline-none text-slate-700 dark:text-slate-200 text-sm p-1"
      />
    </div>
  );
}