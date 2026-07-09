import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { CentreFormation, Paginated } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';

export function CentresFormationList() {
  const [q, setQ] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['centres-formation', q],
    queryFn: async () =>
      (
        await api.get<Paginated<CentreFormation>>('/centres-formation', {
          params: { limit: 100, ...(q && { q }) },
        })
      ).data,
  });

  return (
    <div>
      <section className="relative overflow-hidden px-6 py-10 sm:py-12 rounded-[2rem] border border-slate-100 bg-gradient-to-r from-rose-50/60 via-red-50/40 to-slate-50/60 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-rose-100/50 blur-[80px] -z-10" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-red-100/40 blur-[80px] -z-10" />
        <div className="max-w-2xl">
          <span className="eyebrow mb-3 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100/30 inline-block text-xs font-semibold">
            🛠️ Formations Professionnelles
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Découvre les centres de formation
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Trouvez des centres d'apprentissage technique et des instituts spécialisés pour acquérir des compétences pratiques à Madagascar.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Rechercher un centre..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="field-input flex-1 min-w-[200px]"
        />
      </div>

      {isLoading && <p className="text-slate-400">Chargement...</p>}
      {!isLoading && data?.items.length === 0 && (
        <p className="text-slate-400">Aucun centre de formation référencé pour le moment.</p>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {data?.items.map((c) => (
          <Link
            key={c.id}
            to={`/centres-formation/${c.slug}`}
            className="card relative block p-5"
          >
            <FavoriteButton type="CENTRE_FORMATION" entityId={c.id} compact className="absolute top-4 right-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-1 pr-8">{c.nom}</h3>
            <p className="text-sm text-slate-500">{c.ville}{c.region ? `, ${c.region}` : ''}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
