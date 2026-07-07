import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { ResultatOrientation } from '../lib/types';
import { RIASEC_LABELS } from '../lib/riasec';

export function QuestionnaireHistorique() {
  const { data, isLoading } = useQuery({
    queryKey: ['resultats-orientation'],
    queryFn: async () => (await api.get<ResultatOrientation[]>('/resultats-orientation')).data,
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Mes résultats d'orientation</h1>
      <p className="text-slate-500 mb-8">
        Retrouve l'historique de tes tests et observe l'évolution de ton profil dans le temps.
      </p>

      {isLoading && <p className="text-slate-400">Chargement...</p>}
      {!isLoading && data?.length === 0 && (
        <p className="text-slate-400">
          Tu n'as pas encore complété de questionnaire.{' '}
          <Link to="/questionnaire" className="text-brand-600 hover:underline">
            Commencer maintenant
          </Link>
        </p>
      )}

      <div className="space-y-3">
        {data?.map((r) => {
          const profilLabel = r.profilDominant
            ?.split('')
            .map((code) => RIASEC_LABELS[code])
            .filter(Boolean)
            .join(' / ');
          return (
            <Link
              key={r.id}
              to={`/questionnaire/resultats/${r.id}`}
              className="block bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">{profilLabel ?? 'Résultat'}</p>
                  <p className="text-sm text-slate-500">{r.questionnaire?.titre}</p>
                </div>
                <span className="text-sm text-slate-400">
                  {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
