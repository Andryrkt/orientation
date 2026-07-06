import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Domaine, Paginated } from '../lib/types';

export function DomainesList() {
  const { data, isLoading } = useQuery({
    queryKey: ['domaines'],
    queryFn: async () => (await api.get<Paginated<Domaine>>('/domaines?limit=100')).data,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Domaines de formation</h1>
      {isLoading && <p className="text-slate-400">Chargement...</p>}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.items.map((d) => (
          <Link
            key={d.id}
            to={`/metiers?domaine=${d.slug}`}
            className="block bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-2">{d.nom}</h3>
            <p className="text-slate-600 text-sm">{d.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
