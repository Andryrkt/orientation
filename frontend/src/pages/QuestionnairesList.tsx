import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Questionnaire } from '../lib/types';
import { useAuth } from '../lib/auth-context';

export function QuestionnairesList() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['questionnaires'],
    queryFn: async () => (await api.get<Questionnaire[]>('/questionnaires')).data,
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Questionnaire d'orientation</h1>
      <p className="text-slate-600 mb-8">
        Réponds à quelques questions pour découvrir les domaines et métiers qui correspondent le
        mieux à ta personnalité, selon le modèle RIASEC (Holland), l'un des référentiels les plus
        reconnus en psychologie de l'orientation.
      </p>

      {isLoading && <p className="text-slate-400">Chargement...</p>}
      {!isLoading && data?.length === 0 && (
        <p className="text-slate-400">Aucun questionnaire disponible pour le moment.</p>
      )}

      <div className="space-y-4">
        {data?.map((q) => (
          <div key={q.id} className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-2">{q.titre}</h2>
            <p className="text-slate-600 text-sm mb-4">{q.description}</p>
            <Link
              to={user ? `/questionnaire/${q.id}` : '/login'}
              className="btn-primary"
            >
              {user ? 'Commencer le test' : 'Se connecter pour commencer'}
            </Link>
          </div>
        ))}
      </div>

      {user && (
        <p className="text-sm text-slate-500 mt-6">
          <Link to="/mes-resultats" className="text-brand-600 hover:underline">
            Voir mes résultats précédents
          </Link>
        </p>
      )}
    </div>
  );
}
