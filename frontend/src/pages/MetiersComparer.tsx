import { useQueries } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Metier } from '../lib/types';
import { BackButton } from '../components/BackButton';

function formatSalary(val: number | null) {
  if (!val) return null;
  return val.toLocaleString('fr-FR');
}

const ROWS: { label: string; render: (m: Metier) => React.ReactNode }[] = [
  { label: 'Secteur', render: (m) => m.secteur?.nom ?? '—' },
  { label: 'Domaine', render: (m) => m.domaine?.nom ?? '—' },
  { label: "Niveau d'études requis", render: (m) => m.niveauRequis ?? '—' },
  {
    label: 'Séries de Bac recommandées',
    render: (m) => (m.seriesBacMadagascar.length > 0 ? m.seriesBacMadagascar.join(', ') : '—'),
  },
  {
    label: 'Salaire estimé (Ar/mois)',
    render: (m) =>
      m.salaireMin || m.salaireMax
        ? `${formatSalary(m.salaireMin) ?? '?'} – ${formatSalary(m.salaireMax) ?? '?'}`
        : '—',
  },
  {
    label: 'Code RIASEC',
    render: (m) => (m.riasecCodes && m.riasecCodes.length > 0 ? m.riasecCodes.join(' · ') : '—'),
  },
  {
    label: 'Missions principales',
    render: (m) =>
      m.missions.length > 0 ? (
        <ul className="list-disc list-inside space-y-1">
          {m.missions.map((x) => <li key={x}>{x}</li>)}
        </ul>
      ) : (
        '—'
      ),
  },
  {
    label: 'Compétences techniques',
    render: (m) => (m.competences.length > 0 ? m.competences.join(', ') : '—'),
  },
  {
    label: 'Compétences comportementales',
    render: (m) => (m.competencesComportementales?.length > 0 ? m.competencesComportementales.join(', ') : '—'),
  },
  { label: 'Demande sur le marché', render: (m) => m.niveauDemande ?? '—' },
  { label: 'Avantages', render: (m) => m.avantages ?? '—' },
];

export function MetiersComparer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const slugs = (searchParams.get('slugs') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const results = useQueries({
    queries: slugs.map((slug) => ({
      queryKey: ['metier', slug],
      queryFn: async () => (await api.get<Metier>(`/metiers/${slug}`)).data,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const metiers = results.map((r) => r.data).filter((m): m is Metier => !!m);

  function removeSlug(slug: string) {
    const next = slugs.filter((s) => s !== slug);
    if (next.length === 0) {
      setSearchParams({});
    } else {
      setSearchParams({ slugs: next.join(',') });
    }
  }

  return (
    <div>
      <BackButton fallback="/metiers" />
      <h1 className="page-title mb-6">Comparer des métiers</h1>

      {slugs.length < 2 && (
        <div className="text-center py-16 px-6 rounded-2xl border border-dashed border-slate-300 dark:border-white/15">
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Sélectionnez au moins deux métiers depuis la liste des métiers pour les comparer.
          </p>
          <Link to="/metiers" className="btn-secondary px-6 py-2.5 text-sm">
            Aller à la liste des métiers
          </Link>
        </div>
      )}

      {slugs.length >= 2 && isLoading && (
        <div className="flex items-center gap-3 text-slate-400 py-8">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          Chargement de la comparaison...
        </div>
      )}

      {slugs.length >= 2 && !isLoading && metiers.length > 0 && (
        <div className="overflow-x-auto pb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="text-left p-3 w-48 shrink-0" />
                {metiers.map((m) => (
                  <th key={m.id} className="p-3 align-top min-w-[220px]">
                    <div className="glass-card p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h2 className="font-black text-slate-900 dark:text-white text-base leading-snug text-left">
                          {m.nom}
                        </h2>
                        <button
                          type="button"
                          onClick={() => removeSlug(m.slug)}
                          aria-label="Retirer de la comparaison"
                          className="shrink-0 text-slate-400 hover:text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                      <Link
                        to={`/metiers/${m.slug}`}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-300 hover:underline"
                      >
                        Voir la fiche complète →
                      </Link>
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
                  {metiers.map((m) => (
                    <td key={m.id} className="p-3 align-top text-slate-600 dark:text-slate-400 leading-relaxed">
                      {row.render(m)}
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
