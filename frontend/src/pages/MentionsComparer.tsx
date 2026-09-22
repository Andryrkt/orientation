import { useQueries } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Mention } from '../lib/types';
import { BackButton } from '../components/BackButton';
import { CONDITION_ADMISSION_LABELS, formatArgent } from '../lib/mention';

const ROWS: { label: string; render: (m: Mention) => React.ReactNode }[] = [
  { label: 'Université', render: (m) => m.universite?.nom ?? '—' },
  { label: 'Domaine', render: (m) => m.domaine?.nom ?? '—' },
  { label: 'Niveau', render: (m) => m.niveau ?? '—' },
  {
    label: "Condition d'admission",
    render: (m) => (m.conditionAdmission ? CONDITION_ADMISSION_LABELS[m.conditionAdmission] ?? m.conditionAdmission : '—'),
  },
  { label: "Droit d'inscription", render: (m) => (m.droitInscription != null ? formatArgent(m.droitInscription) : '—') },
  { label: 'Frais annuel', render: (m) => (m.fraisAnnuel != null ? formatArgent(m.fraisAnnuel) : '—') },
  { label: 'Frais annexe', render: (m) => (m.fraisAnnexe != null ? formatArgent(m.fraisAnnexe) : '—') },
  {
    label: 'Parcours proposés',
    render: (m) =>
      m.parcours && m.parcours.length > 0 ? (
        <ul className="list-disc list-inside space-y-1">
          {m.parcours.map((p) => <li key={p.id}>{p.nom}</li>)}
        </ul>
      ) : (
        '—'
      ),
  },
  { label: 'Description', render: (m) => m.description ?? '—' },
];

export function MentionsComparer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const slugs = (searchParams.get('slugs') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const results = useQueries({
    queries: slugs.map((slug) => ({
      queryKey: ['mention-detail', slug],
      queryFn: async () => (await api.get<Mention>(`/mentions/${slug}`)).data,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const mentions = results.map((r) => r.data).filter((m): m is Mention => !!m);

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
      <BackButton fallback="/etablissements" />
      <h1 className="page-title mb-6">Comparer des mentions</h1>

      {slugs.length < 2 && (
        <div className="text-center py-16 px-6 rounded-2xl border border-dashed border-slate-300 dark:border-white/15">
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Sélectionnez au moins deux mentions depuis la page d'une université pour les comparer.
          </p>
          <Link to="/etablissements" className="btn-secondary px-6 py-2.5 text-sm">
            Aller aux établissements
          </Link>
        </div>
      )}

      {slugs.length >= 2 && isLoading && (
        <div className="flex items-center gap-3 text-slate-400 py-8">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          Chargement de la comparaison...
        </div>
      )}

      {slugs.length >= 2 && !isLoading && mentions.length > 0 && (
        <div className="overflow-x-auto pb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="text-left p-3 w-48 shrink-0" />
                {mentions.map((m) => (
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
                        to={`/mentions/${m.slug}`}
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
                  {mentions.map((m) => (
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
