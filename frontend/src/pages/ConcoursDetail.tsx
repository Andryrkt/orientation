import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Concours, TypeConcours } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';
import { BackButton } from '../components/BackButton';

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('fr-FR');
}

const TYPE_LABELS: Record<TypeConcours, string> = {
  UNIVERSITAIRE: 'Concours universitaire',
  ADMINISTRATIF: 'Concours administratif',
};

export function ConcoursDetail() {
  const { id } = useParams();
  const { data: concours, isLoading } = useQuery({
    queryKey: ['concours-detail', id],
    queryFn: async () => (await api.get<Concours>(`/concours/${id}`)).data,
  });

  if (isLoading) return <p className="text-slate-400">Chargement...</p>;
  if (!concours) return <p className="text-slate-400">Concours introuvable.</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <BackButton fallback="/concours" />
      <p className="text-sm font-medium text-brand-600 dark:text-blue-400 mb-1">{TYPE_LABELS[concours.type]}</p>
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{concours.titre}</h1>
        <FavoriteButton type="CONCOURS" entityId={concours.id} className="shrink-0" />
      </div>
      <p className="text-slate-500 dark:text-slate-400 mb-6">{concours.organisateur}{concours.region ? ` — ${concours.region}` : ''}</p>

      {concours.description && <p className="text-slate-700 dark:text-slate-300 mb-6">{concours.description}</p>}

      <div className="grid sm:grid-cols-2 gap-6">
        {concours.niveauRequis && (
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-1">Niveau requis</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{concours.niveauRequis}</p>
          </div>
        )}
        {concours.nombrePlaces != null && (
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-1">Nombre de places</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{concours.nombrePlaces}</p>
          </div>
        )}
        {concours.fraisInscription && (
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-1">Frais d'inscription</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{concours.fraisInscription}</p>
          </div>
        )}
        {concours.dateConcours && (
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-1">Date du concours</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{formatDate(concours.dateConcours)}</p>
          </div>
        )}
        {concours.dateLimiteInscription && (
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-1">Date limite d'inscription</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{formatDate(concours.dateLimiteInscription)}</p>
          </div>
        )}
        {concours.domaine && (
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-1">Domaine</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{concours.domaine.nom}</p>
          </div>
        )}
      </div>

      {concours.conditions && (
        <div className="mt-6">
          <h3 className="font-bold text-slate-800 dark:text-white mb-1">Conditions de participation</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm whitespace-pre-line">{concours.conditions}</p>
        </div>
      )}

      {concours.lien && (
        <a
          href={concours.lien}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-block mt-8"
        >
          Plus d'informations / S'inscrire
        </a>
      )}
    </div>
  );
}
