interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="bg-white border border-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl disabled:opacity-40 hover:bg-slate-50"
      >
        ← Anterior
      </button>
      <span className="text-sm font-bold text-slate-600">
        Página {page} de {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="bg-white border border-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl disabled:opacity-40 hover:bg-slate-50"
      >
        Siguiente →
      </button>
    </div>
  );
}