import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Paginated, Universite } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';

export function UniversitesList() {
  const { data, isLoading } = useQuery({
    queryKey: ['universites'],
    queryFn: async () => (await api.get<Paginated<Universite>>('/universites?limit=100')).data,
  });

  return (
    <div>
      <section className="relative overflow-hidden px-6 py-10 sm:py-12 rounded-[2rem] border border-slate-100 dark:border-white/10 bg-gradient-to-r from-purple-50/60 via-pink-50/40 to-slate-50/60 dark:from-purple-500/10 dark:via-pink-500/5 dark:to-transparent mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] dark:shadow-none">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-purple-100/50 dark:bg-purple-500/10 blur-[80px] -z-10" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-pink-100/40 dark:bg-pink-500/10 blur-[80px] -z-10" />
        <div className="max-w-2xl">
          <span className="eyebrow mb-3 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-100/30 dark:border-purple-500/25 inline-block text-xs font-semibold">
            🏛️ Établissements Supérieurs
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
            Trouve ton université à Madagascar
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Recherchez des instituts publics ou privés, explorez les mentions proposées et comparez les conditions d'accès.
          </p>
        </div>
      </section>
      {isLoading && <p className="text-slate-400">Chargement...</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {data?.items.map((u) => (
          <Link
            key={u.id}
            to={`/universites/${u.slug}`}
            className="card relative block p-5"
          >
            <FavoriteButton type="UNIVERSITE" entityId={u.id} compact className="absolute top-4 right-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 pr-8">{u.nom}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{u.ville}{u.region ? `, ${u.region}` : ''}</p>
            <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">{u.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
