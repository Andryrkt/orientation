import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { ResultatOrientation } from '../lib/types';
import { RIASEC_LABELS } from '../lib/riasec';
import { RiasecChart } from '../components/RiasecChart';

export function QuestionnaireResultat() {
  const { id } = useParams();
  const { data: resultat, isLoading } = useQuery({
    queryKey: ['resultat-orientation', id],
    queryFn: async () => (await api.get<ResultatOrientation>(`/resultats-orientation/${id}`)).data,
  });

  if (isLoading) return <p className="text-slate-400">Chargement...</p>;
  if (!resultat) return <p className="text-slate-400">Résultat introuvable.</p>;

  const profilLabel = resultat.profilDominant
    ?.split('')
    .map((code) => RIASEC_LABELS[code])
    .filter(Boolean)
    .join(' / ');

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Ton profil d'orientation</h1>
      <p className="text-slate-500 mb-8">
        {new Date(resultat.createdAt).toLocaleDateString('fr-FR')}
        {resultat.questionnaire && ` — ${resultat.questionnaire.titre}`}
      </p>

      {profilLabel && (
        <div className="bg-brand-50 border border-brand-200 rounded-lg p-6 mb-8">
          <p className="text-sm text-brand-600 font-medium mb-1">Profil dominant</p>
          <p className="text-2xl font-bold text-brand-800">{profilLabel}</p>
        </div>
      )}

      <h2 className="text-lg font-bold text-slate-800 mb-4">Répartition de tes scores</h2>
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8">
        <RiasecChart scores={resultat.scores} />
      </div>

      {resultat.domainesRecommandes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-3">Domaines recommandés</h2>
          <div className="flex flex-wrap gap-2">
            {resultat.domainesRecommandes.map((d) => (
              <Link
                key={d.id}
                to={`/metiers?domaine=${d.slug}`}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm text-slate-700 hover:bg-slate-50"
              >
                {d.nom}
              </Link>
            ))}
          </div>
        </div>
      )}

      {resultat.metiersRecommandes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-3">Métiers recommandés</h2>
          <div className="flex flex-wrap gap-2">
            {resultat.metiersRecommandes.map((m) => (
              <Link
                key={m.id}
                to={`/metiers/${m.slug}`}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm text-slate-700 hover:bg-slate-50"
              >
                {m.nom}
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-slate-500">
        <Link to="/mes-resultats" className="text-brand-600 hover:underline">
          Voir l'historique de mes résultats
        </Link>
      </p>
    </div>
  );
}
