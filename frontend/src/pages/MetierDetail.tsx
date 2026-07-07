import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Metier } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';

export function MetierDetail() {
  const { slug } = useParams();
  const { data: metier, isLoading } = useQuery({
    queryKey: ['metier', slug],
    queryFn: async () => (await api.get<Metier>(`/metiers/${slug}`)).data,
  });

  if (isLoading) return <p className="text-slate-400">Chargement...</p>;
  if (!metier) return <p className="text-slate-400">Métier introuvable.</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <p className="text-sm font-medium text-brand-600 mb-1">{metier.domaine?.nom}</p>
      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold text-slate-900">{metier.nom}</h1>
        <FavoriteButton type="METIER" entityId={metier.id} className="shrink-0" />
      </div>
      <p className="text-slate-700 mb-6">{metier.description}</p>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {metier.missions && (
          <div>
            <h3 className="font-bold text-slate-800 mb-1">Missions</h3>
            <p className="text-slate-600 text-sm">{metier.missions}</p>
          </div>
        )}
        {metier.competences?.length > 0 && (
          <div>
            <h3 className="font-bold text-slate-800 mb-1">Compétences requises</h3>
            <ul className="text-slate-600 text-sm list-disc list-inside">
              {metier.competences.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
        )}
        {(metier.salaireMin || metier.salaireMax) && (
          <div>
            <h3 className="font-bold text-slate-800 mb-1">Salaire moyen</h3>
            <p className="text-slate-600 text-sm">
              {metier.salaireMin?.toLocaleString('fr-FR')} - {metier.salaireMax?.toLocaleString('fr-FR')} Ar
            </p>
          </div>
        )}
        {metier.niveauRequis && (
          <div>
            <h3 className="font-bold text-slate-800 mb-1">Niveau requis</h3>
            <p className="text-slate-600 text-sm">{metier.niveauRequis}</p>
          </div>
        )}
        {metier.perspectivesEmploi && (
          <div className="sm:col-span-2">
            <h3 className="font-bold text-slate-800 mb-1">Perspectives d'emploi</h3>
            <p className="text-slate-600 text-sm">{metier.perspectivesEmploi}</p>
          </div>
        )}
      </div>

      {metier.similaires && metier.similaires.length > 0 && (
        <div>
          <h3 className="font-bold text-slate-800 mb-3">Métiers similaires</h3>
          <div className="flex flex-wrap gap-2">
            {metier.similaires.map((m) => (
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
    </div>
  );
}
