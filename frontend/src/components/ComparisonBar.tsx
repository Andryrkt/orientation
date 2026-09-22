import { Link } from 'react-router-dom';

export function ComparisonBar({
  count,
  max,
  compareTo,
  onClear,
  label,
}: {
  count: number;
  max: number;
  compareTo: string;
  onClear: () => void;
  label: string;
}) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-white/10">
      <span className="text-sm font-semibold whitespace-nowrap">
        {count}/{max} {label} sélectionné{count > 1 ? 's' : ''}
      </span>
      <button
        type="button"
        onClick={onClear}
        className="text-xs font-medium underline opacity-80 hover:opacity-100"
      >
        Vider
      </button>
      {count >= 2 ? (
        <Link
          to={compareTo}
          className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors whitespace-nowrap"
        >
          Comparer
        </Link>
      ) : (
        <span
          title="Sélectionnez au moins 2 éléments"
          className="px-4 py-1.5 rounded-full bg-slate-700 dark:bg-slate-200 text-slate-400 dark:text-slate-500 text-xs font-bold cursor-not-allowed whitespace-nowrap"
        >
          Comparer
        </span>
      )}
    </div>
  );
}
