import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Emploi } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';
import { BackButton } from '../components/BackButton';

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('fr-FR');
}

export function EmploiDetail() {
  const { id } = useParams();
  const { data: emploi, isLoading } = useQuery({
    queryKey: ['emploi', id],
    queryFn: async () => (await api.get<Emploi>(`/emplois/${id}`)).data,
  });

  if (isLoading) return <p className="text-slate-400">Chargement...</p>;
  if (!emploi) return <p className="text-slate-400">Offre d'emploi introuvable.</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <BackButton fallback="/emplois" />
      {emploi.secteur && <p className="text-sm font-medium text-brand-600 dark:text-blue-400 mb-1">{emploi.secteur.nom}</p>}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{emploi.titre}</h1>
        <FavoriteButton type="EMPLOI" entityId={emploi.id} className="shrink-0" />
      </div>
      <p className="text-slate-500 dark:text-slate-400 mb-6">{emploi.entreprise}{emploi.region ? ` — ${emploi.region}` : ''}</p>

      {emploi.description && <p className="text-slate-700 dark:text-slate-300 mb-6">{emploi.description}</p>}

      <div className="grid sm:grid-cols-2 gap-6">
        {emploi.typeContrat && (
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-1">Type de contrat</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{emploi.typeContrat}</p>
          </div>
        )}
        {emploi.niveauEtude && (
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-1">Niveau d'étude</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{emploi.niveauEtude}</p>
          </div>
        )}
        {emploi.salaire && (
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-1">Salaire</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{emploi.salaire}</p>
          </div>
        )}
        {emploi.dateLimiteCandidature && (
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-1">Date limite de candidature</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{formatDate(emploi.dateLimiteCandidature)}</p>
          </div>
        )}
        {emploi.domaine && (
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-1">Domaine</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{emploi.domaine.nom}</p>
          </div>
        )}
      </div>

      {emploi.lien && (
        <a
          href={emploi.lien}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-block mt-8"
        >
          Postuler
        </a>
      )}
    </div>
  );
}
