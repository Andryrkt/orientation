import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Concours, Domaine, Paginated, TypeConcours } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('fr-FR');
}

const TYPE_LABELS: Record<TypeConcours, string> = {
  UNIVERSITAIRE: 'Concours universitaire',
  ADMINISTRATIF: 'Concours administratif',
};

export function ConcoursList() {
  const [type, setType] = useState<'' | TypeConcours>('');
  const [domaine, setDomaine] = useState('');
  const [region, setRegion] = useState('');

  const { data: domaines } = useQuery({
    queryKey: ['domaines-filter'],
    queryFn: async () => (await api.get<Paginated<Domaine>>('/domaines?limit=100')).data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['concours', type, domaine, region],
    queryFn: async () =>
      (
        await api.get<Paginated<Concours>>('/concours', {
          params: { limit: 50, actifs: 'true', ...(type && { type }), ...(domaine && { domaine }), ...(region && { region }) },
        })
      ).data,
  });

  return (
    <div>
      <section className="relative overflow-hidden px-6 py-10 sm:py-12 rounded-[2rem] border border-slate-100 dark:border-white/10 bg-gradient-to-r from-violet-50/60 via-indigo-50/40 to-slate-50/60 dark:from-violet-500/10 dark:via-indigo-500/5 dark:to-transparent mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] dark:shadow-none">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-violet-100/50 dark:bg-violet-500/10 blur-[80px] -z-10" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-indigo-100/40 dark:bg-indigo-500/10 blur-[80px] -z-10" />
        <div className="max-w-2xl">
          <span className="eyebrow mb-3 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-100/30 dark:border-violet-500/25 inline-block text-xs font-semibold">
            🎓 Concours
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
            Concours universitaires et administratifs à Madagascar
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Retrouvez les concours d'entrée aux universités et grandes écoles ainsi que les concours de la fonction publique et des administrations.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 mb-4">
        {(['', 'UNIVERSITAIRE', 'ADMINISTRATIF'] as const).map((value) => (
          <button
            key={value || 'tous'}
            type="button"
            onClick={() => setType(value)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border ${
              type === value
                ? 'bg-brand-600 text-white border-brand-600'
                : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/15 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            {value === '' ? 'Tous' : TYPE_LABELS[value]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Filtrer par région..."
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="field-input flex-1 min-w-[200px]"
        />
        <select
          value={domaine}
          onChange={(e) => setDomaine(e.target.value)}
          className="field-input"
        >
          <option value="">Tous les domaines</option>
          {domaines?.items.map((d) => (
            <option key={d.id} value={d.slug}>{d.nom}</option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-slate-400">Chargement...</p>}
      {!isLoading && data?.items.length === 0 && (
        <p className="text-slate-400">Aucun concours disponible pour le moment.</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.items.map((c) => (
          <Link
            key={c.id}
            to={`/concours/${c.id}`}
            className="card relative block p-5"
          >
            <FavoriteButton type="CONCOURS" entityId={c.id} compact className="absolute top-4 right-4" />
            <p className="text-xs font-medium text-brand-600 dark:text-blue-400 mb-1 pr-8">{TYPE_LABELS[c.type]}</p>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{c.titre}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{c.organisateur}{c.region ? ` — ${c.region}` : ''}</p>
            <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">{c.description}</p>
            {c.dateLimiteInscription && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                Date limite d'inscription : {formatDate(c.dateLimiteInscription)}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
