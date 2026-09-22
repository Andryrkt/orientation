import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Emploi, Paginated, Secteur } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('fr-FR');
}

export function EmploisList() {
  const [secteur, setSecteur] = useState('');
  const [region, setRegion] = useState('');

  const { data: secteurs } = useQuery({
    queryKey: ['secteurs-filter'],
    queryFn: async () => (await api.get<Paginated<Secteur>>('/secteurs?limit=100')).data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['emplois', secteur, region],
    queryFn: async () =>
      (
        await api.get<Paginated<Emploi>>('/emplois', {
          params: { limit: 50, actifs: 'true', ...(secteur && { secteur }), ...(region && { region }) },
        })
      ).data,
  });

  return (
    <div>
      <section className="relative overflow-hidden px-6 py-10 sm:py-12 rounded-[2rem] border border-slate-100 dark:border-white/10 bg-gradient-to-r from-amber-50/60 via-orange-50/40 to-slate-50/60 dark:from-amber-500/10 dark:via-orange-500/5 dark:to-transparent mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] dark:shadow-none">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-amber-100/50 dark:bg-amber-500/10 blur-[80px] -z-10" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-orange-100/40 dark:bg-orange-500/10 blur-[80px] -z-10" />
        <div className="max-w-2xl">
          <span className="eyebrow mb-3 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-100/30 dark:border-amber-500/25 inline-block text-xs font-semibold">
            📣 Offres d'emploi
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
            Trouve ton premier emploi à Madagascar
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Explorez les offres d'emploi publiées par nos entreprises partenaires selon votre secteur et votre région.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Filtrer par région..."
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="field-input flex-1 min-w-[200px]"
        />
        <select
          value={secteur}
          onChange={(e) => setSecteur(e.target.value)}
          className="field-input"
        >
          <option value="">Tous les secteurs</option>
          {secteurs?.items.map((s) => (
            <option key={s.id} value={s.slug}>{s.nom}</option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-slate-400">Chargement...</p>}
      {!isLoading && data?.items.length === 0 && (
        <p className="text-slate-400">Aucune offre d'emploi disponible pour le moment.</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.items.map((e) => (
          <Link
            key={e.id}
            to={`/emplois/${e.id}`}
            className="card relative block p-5"
          >
            <FavoriteButton type="EMPLOI" entityId={e.id} compact className="absolute top-4 right-4" />
            <p className="text-xs font-medium text-brand-600 dark:text-blue-400 mb-1 pr-8">{e.secteur?.nom ?? e.entreprise}</p>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{e.titre}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{e.entreprise}{e.region ? ` — ${e.region}` : ''}</p>
            <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">{e.description}</p>
            {e.dateLimiteCandidature && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                Date limite de candidature : {formatDate(e.dateLimiteCandidature)}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
