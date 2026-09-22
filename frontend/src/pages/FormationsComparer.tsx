import { useQueries } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Formation } from '../lib/types';
import { BackButton } from '../components/BackButton';

const ROWS: { label: string; render: (f: Formation) => React.ReactNode }[] = [
  { label: 'Centre de formation', render: (f) => f.centre?.nom ?? '—' },
  { label: 'Ville', render: (f) => f.centre?.ville ?? '—' },
  { label: 'Durée', render: (f) => f.duree ?? '—' },
  { label: 'Niveau requis', render: (f) => f.niveauRequis ?? '—' },
  { label: 'Description', render: (f) => f.description ?? '—' },
];

export function FormationsComparer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const ids = (searchParams.get('ids') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['formation-detail', id],
      queryFn: async () => (await api.get<Formation>(`/formations/${id}`)).data,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const formations = results.map((r) => r.data).filter((f): f is Formation => !!f);

  function removeId(id: string) {
    const next = ids.filter((s) => s !== id);
    if (next.length === 0) {
      setSearchParams({});
    } else {
      setSearchParams({ ids: next.join(',') });
    }
  }

  return (
    <div>
      <BackButton fallback="/etablissements" />
      <h1 className="page-title mb-6">Comparer des formations</h1>

      {ids.length < 2 && (
        <div className="text-center py-16 px-6 rounded-2xl border border-dashed border-slate-300 dark:border-white/15">
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Sélectionnez au moins deux formations depuis la page d'un centre de formation pour les comparer.
          </p>
          <Link to="/etablissements" className="btn-secondary px-6 py-2.5 text-sm">
            Aller aux établissements
          </Link>
        </div>
      )}

      {ids.length >= 2 && isLoading && (
        <div className="flex items-center gap-3 text-slate-400 py-8">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          Chargement de la comparaison...
        </div>
      )}

      {ids.length >= 2 && !isLoading && formations.length > 0 && (
        <div className="overflow-x-auto pb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="text-left p-3 w-48 shrink-0" />
                {formations.map((f) => (
                  <th key={f.id} className="p-3 align-top min-w-[220px]">
                    <div className="glass-card p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h2 className="font-black text-slate-900 dark:text-white text-base leading-snug text-left">
                          {f.nom}
                        </h2>
                        <button
                          type="button"
                          onClick={() => removeId(f.id)}
                          aria-label="Retirer de la comparaison"
                          className="shrink-0 text-slate-400 hover:text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                      {f.centre?.slug && (
                        <Link
                          to={`/centres-formation/${f.centre.slug}`}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-300 hover:underline"
                        >
                          Voir le centre →
                        </Link>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {ROWS.map((row) => (
                <tr key={row.label}>
                  <td className="p-3 font-bold text-slate-700 dark:text-slate-200 align-top whitespace-nowrap">
                    {row.label}
                  </td>
                  {formations.map((f) => (
                    <td key={f.id} className="p-3 align-top text-slate-600 dark:text-slate-400 leading-relaxed">
                      {row.render(f)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
