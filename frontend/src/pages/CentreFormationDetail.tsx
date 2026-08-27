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
  if (!centre) return <p className="text-slate-400">Formation professionnelle introuvable.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{centre.nom}</h1>
        <FavoriteButton type="CENTRE_FORMATION" entityId={centre.id} className="shrink-0" />
      </div>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        {centre.adresse ? `${centre.adresse}, ` : ''}
        {centre.ville}
        {centre.region ? `, ${centre.region}` : ''}
      </p>

      <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 mb-8">
        {centre.contact && <span>Contact : {centre.contact}</span>}
        {centre.siteWeb && (
          <a href={centre.siteWeb} target="_blank" rel="noreferrer" className="text-brand-600 dark:text-blue-400 hover:underline">
            Site web
          </a>
        )}
      </div>

      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Formations proposées</h2>
      {(!centre.formations || centre.formations.length === 0) && (
        <p className="text-slate-400">Aucune formation renseignée pour le moment.</p>
      )}
      <div className="space-y-4">
        {centre.formations?.map((f) => (
          <div key={f.id} className="card p-5">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{f.nom}</h3>
              {f.duree && <span className="shrink-0 text-xs font-semibold text-brand-600 dark:text-blue-400">{f.duree}</span>}
            </div>
            {f.niveauRequis && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Niveau requis : {f.niveauRequis}</p>
            )}
            {f.description && <p className="text-sm text-slate-600 dark:text-slate-400">{f.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
