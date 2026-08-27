import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SearchResultCard from '../components/SearchResultCard';
import { SearchService, type SearchResultsResponse } from '../services/search.service';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  
  // Estado local para el input editable requerido por el PR
  const [localQuery, setLocalQuery] = useState(query);

  const [results, setResults] = useState<SearchResultsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar el input si la URL cambia por fuera
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    SearchService.search(query)
      .then(setResults)
      .catch(() => setError('No fue posible conectar con el servidor. Verifique su conexión e intente de nuevo.'))
      .finally(() => setLoading(false));
  }, [query]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchParams({ q: localQuery.trim() });
    }
  };

  const totalResults = results
    ? results.views.length + results.categories.length + results.hashtags.length + results.authors.length
    : 0;

  // Función helper para resaltar el texto buscado requerido por el PR
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="bg-yellow-200 dark:bg-yellow-900/50 text-slate-900 dark:text-yellow-200 px-0.5 rounded">{part}</span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans pb-20">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Input Editable y botón de búsqueda */}
        <form onSubmit={handleSearch} className="mb-8">
          <label htmlFor="searchInput" className="block text-sm font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Buscar nuevamente
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="searchInput"
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow font-medium"
              placeholder="Escribe para buscar..."
            />
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shrink-0"
            >
              Buscar
            </button>
          </div>
        </form>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-red-200 dark:border-red-900/50">
            <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
          </div>
        ) : !results || totalResults === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Sin resultados para "{query}"</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Prueba con otros términos, o vuelve al{' '}
              <Link to="/" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">tablero</Link>.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {results.views.length > 0 && (
              <section>
                <h2 className="text-sm font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  Publicaciones <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-0.5 px-2 rounded-full text-xs">{results.views.length}</span>
                </h2>
                <div className="grid gap-4">
                  {results.views.map(view => <SearchResultCard key={view.id} view={view} />)}
                </div>
              </section>
            )}

            {results.categories.length > 0 && (
              <section>
                <h2 className="text-sm font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Categorías
                </h2>
                <div className="flex flex-wrap gap-2">
                  {results.categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/categories/${cat.id}`}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm px-4 py-2 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm"
                    >
                      {highlightText(cat.name, query)}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.hashtags.length > 0 && (
              <section>
                <h2 className="text-sm font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Hashtags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {results.hashtags.map(tag => (
                    <Link
                      key={tag.id}
                      to={`/?hashtag=${encodeURIComponent(tag.name)}`}
                      className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-bold text-sm px-4 py-2 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                    >
                      #{highlightText(tag.name, query)}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.authors.length > 0 && (
              <section>
                <h2 className="text-sm font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Autores
                </h2>
                <div className="flex flex-wrap gap-2">
                  {results.authors.map(author => (
                    <Link
                      key={author.id}
                      to={`/authors/${author.id}`}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm px-4 py-2 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm"
                    >
                      {highlightText(author.name, query)}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}