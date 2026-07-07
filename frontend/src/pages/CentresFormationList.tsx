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
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Centres de formation</h1>
      <p className="text-slate-500 mb-6">
        Centres et instituts de formation professionnelle référencés à Madagascar.
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Rechercher un centre..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm flex-1 min-w-[200px]"
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
            className="relative block bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow"
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
