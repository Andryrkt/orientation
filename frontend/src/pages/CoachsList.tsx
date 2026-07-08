import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Coach, Paginated } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';

export function CoachsList() {
  const [q, setQ] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['coachs', q],
    queryFn: async () =>
      (await api.get<Paginated<Coach>>('/coachs', { params: { limit: 50, ...(q && { q }) } })).data,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Coachs et mentors</h1>
      <p className="text-slate-500 mb-6">
        Des professionnels référencés pour t'accompagner dans ton orientation.
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Rechercher un coach..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="field-input flex-1 min-w-[200px]"
        />
      </div>

      {isLoading && <p className="text-slate-400">Chargement...</p>}
      {!isLoading && data?.items.length === 0 && (
        <p className="text-slate-400">Aucun coach disponible pour le moment.</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.items.map((c) => (
          <Link
            key={c.id}
            to={`/coachs/${c.id}`}
            className="card relative block p-5"
          >
            <FavoriteButton type="COACH" entityId={c.id} compact className="absolute top-4 right-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-1 pr-8">{c.prenom} {c.nom}</h3>
            {c.noteMoyenne !== null && (
              <p className="text-sm text-amber-600 mb-2">
                ★ {c.noteMoyenne.toFixed(1)} ({c.avisCount} avis)
              </p>
            )}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {c.specialites.map((s) => (
                <span key={s} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
                  {s}
                </span>
              ))}
            </div>
            <p className="text-slate-600 text-sm line-clamp-2">{c.bio}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
