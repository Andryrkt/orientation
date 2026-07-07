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
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Universités et établissements</h1>
      {isLoading && <p className="text-slate-400">Chargement...</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {data?.items.map((u) => (
          <Link
            key={u.id}
            to={`/universites/${u.slug}`}
            className="relative block bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <FavoriteButton type="UNIVERSITE" entityId={u.id} compact className="absolute top-4 right-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-1 pr-8">{u.nom}</h3>
            <p className="text-sm text-slate-500 mb-2">{u.ville}{u.region ? `, ${u.region}` : ''}</p>
            <p className="text-slate-600 text-sm line-clamp-2">{u.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
