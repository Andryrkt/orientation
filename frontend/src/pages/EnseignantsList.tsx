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
      <section className="relative overflow-hidden px-6 py-10 sm:py-12 rounded-[2rem] border border-slate-100 bg-gradient-to-r from-purple-50/60 via-indigo-50/40 to-slate-50/60 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-purple-100/50 blur-[80px] -z-10" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-indigo-100/40 blur-[80px] -z-10" />
        <div className="max-w-2xl">
          <span className="eyebrow mb-3 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100/30 inline-block text-xs font-semibold">
            🎓 Orientation Académique
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Échange avec des enseignants à Madagascar
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
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
            <h3 className="text-lg font-bold text-slate-800 mb-1 pr-8">{e.prenom} {e.nom}</h3>
            
            {e.etablissement && (
              <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1">
                🏫 {e.etablissement}
              </p>
            )}

            {e.noteMoyenne !== null && (
              <p className="text-sm text-amber-600 mb-2">
                ★ {e.noteMoyenne.toFixed(1)} ({e.avisCount} avis)
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 mb-2">
              {e.matieres.map((m) => (
                <span key={m} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
                  {m}
                </span>
              ))}
            </div>
            <p className="text-slate-600 text-sm line-clamp-2">{e.bio}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
