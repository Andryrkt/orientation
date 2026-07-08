import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Bourse, Domaine, Paginated } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('fr-FR');
}

export function BoursesList() {
  const [domaine, setDomaine] = useState('');
  const [pays, setPays] = useState('');

  const { data: domaines } = useQuery({
    queryKey: ['domaines-filter'],
    queryFn: async () => (await api.get<Paginated<Domaine>>('/domaines?limit=100')).data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['bourses', domaine, pays],
    queryFn: async () =>
      (
        await api.get<Paginated<Bourse>>('/bourses', {
          params: { limit: 50, ...(domaine && { domaine }), ...(pays && { pays }) },
        })
      ).data,
  });

  return (
    <div>
      <h1 className="page-title">Bourses</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Filtrer par pays..."
          value={pays}
          onChange={(e) => setPays(e.target.value)}
          className="field-input flex-1 min-w-[200px]"
        />
        <select
          value={domaine}
          onChange={(e) => setDomaine(e.target.value)}
          className="field-input"
        >
          <option value="">Tous les domaines</option>
          {domaines?.items.map((d) => (
            <option key={d.id} value={d.slug}>{d.nom}</option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-slate-400">Chargement...</p>}
      {!isLoading && data?.items.length === 0 && (
        <p className="text-slate-400">Aucune bourse disponible pour le moment.</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.items.map((b) => (
          <Link
            key={b.id}
            to={`/bourses/${b.id}`}
            className="card relative block p-5"
          >
            <FavoriteButton type="BOURSE" entityId={b.id} compact className="absolute top-4 right-4" />
            <p className="text-xs font-medium text-brand-600 mb-1 pr-8">{b.organisme}</p>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{b.nom}</h3>
            <p className="text-sm text-slate-500 mb-2">{b.pays}</p>
            {b.montant && <p className="text-slate-600 text-sm">{b.montant}</p>}
            {b.dateLimite && (
              <p className="text-xs text-slate-500 mt-3">
                Date limite : {formatDate(b.dateLimite)}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
