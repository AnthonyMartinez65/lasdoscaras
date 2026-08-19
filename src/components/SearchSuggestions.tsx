import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SearchService, type SearchViewResult } from '../services/search.service';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

interface SearchSuggestionsProps {
  query: string;
  onSelect: () => void;
}

export default function SearchSuggestions({ query, onSelect }: SearchSuggestionsProps) {
  const debouncedQuery = useDebouncedValue(query, 300);
  const [results, setResults] = useState<SearchViewResult[]>([]);

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
      {results.map(view => {
        const side = view.sides.find(s => s.type === 'SIDE');
        const counterpart = view.sides.find(s => s.type === 'COUNTERPART');
        return (
          <Link
            key={view.id}
            to={`/views/${view.id}`}
            onMouseDown={onSelect}
            className="block px-4 py-2.5 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0"
          >
            <span className="font-bold text-slate-800">{side?.title}</span>
            <span className="text-slate-400"> vs </span>
            <span className="font-bold text-slate-800">{counterpart?.title}</span>
          </Link>
        );
      })}
    </div>
  );
}