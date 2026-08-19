import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SearchResultCard from '../components/SearchResultCard';
import { SearchService, type SearchResultsResponse } from '../services/search.service';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const [results, setResults] = useState<SearchResultsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const totalResults = results
    ? results.views.length + results.categories.length + results.hashtags.length + results.authors.length
    : 0;

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-8">
          Resultados para "<span className="text-blue-600">{query}</span>"
        </h1>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-red-200">
            <p className="text-red-600 font-bold">{error}</p>
          </div>
        ) : !results || totalResults === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-700">Sin resultados</h3>
            <p className="text-slate-500 mt-2">
              Prueba con otros términos, o vuelve al{' '}
              <Link to="/" className="text-blue-600 font-bold hover:underline">tablero</Link>.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {results.views.length > 0 && (
              <section>
                <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider mb-3">
                  Publicaciones
                </h2>
                {results.views.map(view => <SearchResultCard key={view.id} view={view} />)}
              </section>
            )}

            {results.categories.length > 0 && (
              <section>
                <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider mb-3">
                  Categorías
                </h2>
                <div className="flex flex-wrap gap-2">
                  {results.categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/categories/${cat.id}`}
                      className="bg-white border border-slate-200 text-slate-700 font-bold text-sm px-4 py-2 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.hashtags.length > 0 && (
              <section>
                <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider mb-3">
                  Hashtags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {results.hashtags.map(tag => (
                    <Link
                      key={tag.id}
                      to={`/?hashtag=${encodeURIComponent(tag.name)}`}
                      className="bg-blue-100 text-blue-700 font-bold text-sm px-4 py-2 rounded-xl hover:bg-blue-200 transition-colors"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.authors.length > 0 && (
              <section>
                <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider mb-3">
                  Autores
                </h2>
                <div className="flex flex-wrap gap-2">
                  {results.authors.map(author => (
                    <Link
                      key={author.id}
                      to={`/authors/${author.id}`}
                      className="bg-white border border-slate-200 text-slate-700 font-bold text-sm px-4 py-2 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                      {author.name}
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