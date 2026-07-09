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
      <section className="relative overflow-hidden px-6 py-10 sm:py-12 rounded-[2rem] border border-slate-100 bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-slate-50/60 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-emerald-100/50 blur-[80px] -z-10" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-teal-100/40 blur-[80px] -z-10" />
        <div className="max-w-2xl">
          <span className="eyebrow mb-3 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/30 inline-block text-xs font-semibold">
            🤝 Accompagnement Personnalisé
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Échange avec nos coachs d'orientation
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Bénéficiez de conseils individuels d'experts locaux pour affiner vos choix scolaires et professionnels en toute confiance.
          </p>
        </div>
      </section>

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
