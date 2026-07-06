import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Domaine, Metier, Paginated } from '../lib/types';

export function MetiersList() {
  const [searchParams] = useSearchParams();
  const [domaine, setDomaine] = useState(searchParams.get('domaine') ?? '');
  const [q, setQ] = useState('');

  const { data: domaines } = useQuery({
    queryKey: ['domaines-filter'],
    queryFn: async () => (await api.get<Paginated<Domaine>>('/domaines?limit=100')).data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['metiers', domaine, q],
    queryFn: async () =>
      (
        await api.get<Paginated<Metier>>('/metiers', {
          params: { limit: 50, ...(domaine && { domaine }), ...(q && { q }) },
        })
      ).data,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Métiers</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Rechercher un métier..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm flex-1 min-w-[200px]"
        />
        <select
          value={domaine}
          onChange={(e) => setDomaine(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">Tous les domaines</option>
          {domaines?.items.map((d) => (
            <option key={d.id} value={d.slug}>{d.nom}</option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-slate-400">Chargement...</p>}
      {!isLoading && data?.items.length === 0 && (
        <p className="text-slate-400">Aucun métier ne correspond à ta recherche.</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.items.map((m) => (
          <Link
            key={m.id}
            to={`/metiers/${m.slug}`}
            className="block bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <p className="text-xs font-medium text-brand-600 mb-1">{m.domaine?.nom}</p>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{m.nom}</h3>
            <p className="text-slate-600 text-sm line-clamp-2">{m.description}</p>
            {(m.salaireMin || m.salaireMax) && (
              <p className="text-xs text-slate-500 mt-3">
                Salaire : {m.salaireMin?.toLocaleString('fr-FR')} - {m.salaireMax?.toLocaleString('fr-FR')} Ar
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
