import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Enseignant, Paginated } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';

export function EnseignantsList() {
  const [q, setQ] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['enseignants', q],
    queryFn: async () =>
      (await api.get<Paginated<Enseignant>>('/enseignants', { params: { limit: 50, ...(q && { q }) } })).data,
  });

  return (
    <div>
      <section className="relative overflow-hidden px-6 py-10 sm:py-12 rounded-[2rem] border border-slate-100 dark:border-white/10 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-slate-50/60 dark:from-blue-500/10 dark:via-indigo-500/5 dark:to-transparent mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] dark:shadow-none">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-blue-100/50 dark:bg-blue-500/10 blur-[80px] -z-10" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-indigo-100/40 dark:bg-indigo-500/10 blur-[80px] -z-10" />
        <div className="max-w-2xl">
          <span className="eyebrow mb-3 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-100/30 dark:border-blue-500/25 inline-block text-xs font-semibold">
            🎓 Orientation Académique
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
            Échange avec des enseignants à Madagascar
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Trouvez et discutez avec des enseignants qualifiés pour obtenir des conseils académiques, de l'aide sur vos choix de matières et votre réussite scolaire.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Rechercher par nom, établissement ou matière..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="field-input flex-1 min-w-[200px]"
        />
      </div>

      {isLoading && <p className="text-slate-400">Chargement...</p>}
      {!isLoading && data?.items.length === 0 && (
        <p className="text-slate-400">Aucun enseignant disponible pour le moment.</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.items.map((e) => (
          <Link
            key={e.id}
            to={`/enseignants/${e.id}`}
            className="card relative block p-5"
          >
            <FavoriteButton type="ENSEIGNANT" entityId={e.id} compact className="absolute top-4 right-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 pr-8">{e.prenom} {e.nom}</h3>

            {e.noteMoyenne !== null && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
                ★ {e.noteMoyenne.toFixed(1)} ({e.avisCount} avis)
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 mb-2">
              {e.matieres.map((m) => (
                <span key={m} className="text-xs bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-full px-2 py-0.5">
                  {m}
                </span>
              ))}
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">{e.bio}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
