import { Link } from 'react-router-dom';
import type { SearchViewResult } from '../services/search.service';

export default function SearchResultCard({ view }: { view: SearchViewResult }) {
  const side = view.sides.find(s => s.type === 'SIDE');
  const counterpart = view.sides.find(s => s.type === 'COUNTERPART');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4 hover:shadow-md transition-shadow">
      <Link
        to={`/categories/${view.categoryId}`}
        className="text-xs font-extrabold text-blue-600 tracking-wider uppercase hover:underline"
      >
        {view.category.name}
      </Link>
      <Link to={`/views/${view.id}`} className="block hover:opacity-80 transition-opacity">
        <h3 className="text-xl font-black text-slate-900 mt-1">
          {side?.title} <span className="text-slate-400 font-normal">vs</span> {counterpart?.title}
        </h3>
      </Link>
      <Link
        to={`/authors/${view.author.id}`}
        className="text-xs text-slate-500 font-medium hover:text-blue-600 hover:underline"
      >
        Por {view.author.name}
      </Link>
    </div>
  );
}