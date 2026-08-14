import type { Category } from '../models/category.types';
import type { ViewsSort } from '../services/view.service';

interface FilterPanelProps {
  categories: Category[];
  selectedCategory: string;
  sort: ViewsSort;
  onCategoryChange: (categoryId: string) => void;
  onSortChange: (sort: ViewsSort) => void;
}

// TODO: el API real solo expone sort=recent|likes|dislikes (confirmado en
// la colección de Postman), no distingue explícitamente "likes del lado A"
// vs "likes del lado B" como pide el enunciado. Falta confirmar con el
// profesor a qué lado corresponde cada valor, o si suma ambos lados. Las
// etiquetas de abajo son la mejor interpretación por ahora.
const SORT_OPTIONS: { value: ViewsSort; label: string }[] = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'likes', label: 'Más likes' },
  { value: 'dislikes', label: 'Más dislikes' },
];

export default function FilterPanel({ categories, selectedCategory, sort, onCategoryChange, onSortChange }: FilterPanelProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
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
  );
}