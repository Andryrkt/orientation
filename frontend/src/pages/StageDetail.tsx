import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Stage } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('fr-FR');
}

export function StageDetail() {
  const { id } = useParams();
  const { data: stage, isLoading } = useQuery({
    queryKey: ['stage', id],
    queryFn: async () => (await api.get<Stage>(`/stages/${id}`)).data,
  });

  if (isLoading) return <p className="text-slate-400">Chargement...</p>;
  if (!stage) return <p className="text-slate-400">Stage introuvable.</p>;

  return (
    <div className="max-w-3xl mx-auto">
      {stage.domaine && <p className="text-sm font-medium text-brand-600 mb-1">{stage.domaine.nom}</p>}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-3xl font-bold text-slate-900">{stage.titre}</h1>
        <FavoriteButton type="STAGE" entityId={stage.id} className="shrink-0" />
      </div>
      <p className="text-slate-500 mb-6">{stage.entreprise}{stage.region ? ` — ${stage.region}` : ''}</p>

      <p className="text-slate-700 mb-6">{stage.description}</p>

      <div className="grid sm:grid-cols-2 gap-6">
        {stage.duree && (
          <div>
            <h3 className="font-bold text-slate-800 mb-1">Durée</h3>
            <p className="text-slate-600 text-sm">{stage.duree}</p>
          </div>
        )}
        {stage.dateDebut && (
          <div>
            <h3 className="font-bold text-slate-800 mb-1">Date de début</h3>
            <p className="text-slate-600 text-sm">{formatDate(stage.dateDebut)}</p>
          </div>
        )}
        {stage.dateLimiteCandidature && (
          <div>
            <h3 className="font-bold text-slate-800 mb-1">Date limite de candidature</h3>
            <p className="text-slate-600 text-sm">{formatDate(stage.dateLimiteCandidature)}</p>
          </div>
        )}
        {stage.niveauEtude && (
          <div>
            <h3 className="font-bold text-slate-800 mb-1">Niveau d'étude</h3>
            <p className="text-slate-600 text-sm">{stage.niveauEtude}</p>
          </div>
        )}
        {stage.remuneration && (
          <div>
            <h3 className="font-bold text-slate-800 mb-1">Rémunération</h3>
            <p className="text-slate-600 text-sm">{stage.remuneration}</p>
          </div>
        )}
      </div>
    </div>
  );
}
