import type { Source } from '../models/view.types';

const ICONS: Record<Source['type'], string> = {
  LINK: '🔗',
  YOUTUBE: '▶️',
  DOCUMENT: '📄',
};

const LABELS: Record<Source['type'], string> = {
  LINK: 'Enlace',
  YOUTUBE: 'Video',
  DOCUMENT: 'Documento',
};

export default function SourceBadge({ source }: { source: Source }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
    >
      <span>{ICONS[source.type]}</span>
      <span>{source.label || LABELS[source.type]}</span>
    </a>
  );
}