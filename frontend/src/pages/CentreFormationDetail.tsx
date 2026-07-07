import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { CentreFormation } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';

export function CentreFormationDetail() {
  const { slug } = useParams();
  const { data: centre, isLoading } = useQuery({
    queryKey: ['centre-formation', slug],
    queryFn: async () => (await api.get<CentreFormation>(`/centres-formation/${slug}`)).data,
  });

  if (isLoading) return <p className="text-slate-400">Chargement...</p>;
  if (!centre) return <p className="text-slate-400">Centre de formation introuvable.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-3xl font-bold text-slate-900">{centre.nom}</h1>
        <FavoriteButton type="CENTRE_FORMATION" entityId={centre.id} className="shrink-0" />
      </div>
      <p className="text-slate-500 mb-6">
        {centre.adresse ? `${centre.adresse}, ` : ''}
        {centre.ville}
        {centre.region ? `, ${centre.region}` : ''}
      </p>

      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
        {centre.contact && <span>Contact : {centre.contact}</span>}
        {centre.siteWeb && (
          <a href={centre.siteWeb} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
            Site web
          </a>
        )}
      </div>
    </div>
  );
}
