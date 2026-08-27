import type { Category } from '../models/category.types';
import type { ViewsSort } from '../services/view.service';

interface FilterPanelProps {
  categories: Category[];
  selectedCategory: string;
  sort: ViewsSort;
  onCategoryChange: (categoryId: string) => void;
  onSortChange: (sort: ViewsSort) => void;
  activeHashtag?: string;
  onClearHashtag?: () => void;
  onSearchHashtag?: (hashtag: string) => void;
}

const SORT_OPTIONS: { value: ViewsSort; label: string }[] = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'likes', label: 'Más likes' },
  { value: 'dislikes', label: 'Más dislikes' },
];

export default function FilterPanel({
  categories,
  selectedCategory,
  sort,
  onCategoryChange,
  onSortChange,
  activeHashtag,
  onClearHashtag,
  onSearchHashtag,
}: FilterPanelProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Categoría</label>
          <select
            value={selectedCategory}
            onChange={e => onCategoryChange(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Hashtag</label>
          <input
            type="text"
            placeholder="Buscar hashtag (Enter)"
            className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const val = e.currentTarget.value.trim();
                if (val && onSearchHashtag) {
                  onSearchHashtag(val);
                  e.currentTarget.value = '';
                }
              }
            }}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Ordenar por</label>
          <select
            value={sort}
            onChange={e => onSortChange(e.target.value as ViewsSort)}
            className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {activeHashtag && (
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs font-bold text-slate-500">Filtrando por:</span>
          <span className="flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
            #{activeHashtag}
            <button type="button" onClick={onClearHashtag} className="hover:text-blue-900">×</button>
          </span>
        </div>
      )}
    </div>
  );
}