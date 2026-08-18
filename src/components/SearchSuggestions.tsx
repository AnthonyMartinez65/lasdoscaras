import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SearchService } from '../services/search.service';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { PoliticalView } from '../models/view.types';

interface SearchSuggestionsProps {
  query: string;
  onSelect: () => void;
}

export default function SearchSuggestions({ query, onSelect }: SearchSuggestionsProps) {
  const debouncedQuery = useDebouncedValue(query, 300);
  const [results, setResults] = useState<PoliticalView[]>([]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    SearchService.suggest(debouncedQuery)
      .then(setResults)
      .catch(() => setResults([]));
  }, [debouncedQuery]);

  if (!query.trim() || results.length === 0) return null;

  return (
    <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
      {results.map(view => (
        <Link
          key={view.id}
          to={`/views/${view.id}`}
          // onMouseDown en vez de onClick: se dispara antes que el onBlur
          // del input, así el clic navega antes de que el dropdown se cierre.
          onMouseDown={onSelect}
          className="block px-4 py-2.5 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0"
        >
          <span className="font-bold text-slate-800">{view.side.title}</span>
          <span className="text-slate-400"> vs </span>
          <span className="font-bold text-slate-800">{view.counterpart.title}</span>
        </Link>
      ))}
    </div>
  );
}