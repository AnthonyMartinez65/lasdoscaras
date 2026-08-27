import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchService, type SearchViewResult } from '../services/search.service';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

interface SearchSuggestionsProps {
  query: string;
  onSelect: () => void;
}

export default function SearchSuggestions({ query, onSelect }: SearchSuggestionsProps) {
  const navigate = useNavigate();
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

  const handlePick = (viewId: string) => {
    onSelect();
    navigate(`/views/${viewId}`);
  };

  return (
    <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
      {results.map(view => {
        const side = view.sides.find(s => s.type === 'SIDE');
        const counterpart = view.sides.find(s => s.type === 'COUNTERPART');
        return (
          <button
            key={view.id}
            type="button"
            onMouseDown={e => {
              e.preventDefault();
              handlePick(view.id);
            }}
            className="w-full text-left block px-4 py-2.5 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0"
          >
            <span className="font-bold text-slate-800">{side?.title}</span>
            <span className="text-slate-400"> vs </span>
            <span className="font-bold text-slate-800">{counterpart?.title}</span>
          </button>
        );
      })}
    </div>
  );
}