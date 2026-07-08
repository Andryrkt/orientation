import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Bourse } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('fr-FR');
}

export function BourseDetail() {
  const { id } = useParams();
  const { data: bourse, isLoading } = useQuery({
    queryKey: ['bourse', id],
    queryFn: async () => (await api.get<Bourse>(`/bourses/${id}`)).data,
  });

  if (isLoading) return <p className="text-slate-400">Chargement...</p>;
  if (!bourse) return <p className="text-slate-400">Bourse introuvable.</p>;

  return (
    <div className="max-w-3xl mx-auto">
      {bourse.domaine && <p className="text-sm font-medium text-brand-600 mb-1">{bourse.domaine.nom}</p>}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-3xl font-bold text-slate-900">{bourse.nom}</h1>
        <FavoriteButton type="BOURSE" entityId={bourse.id} className="shrink-0" />
      </div>
      <p className="text-slate-500 mb-6">{bourse.organisme}{bourse.pays ? ` — ${bourse.pays}` : ''}</p>

      {bourse.conditions && <p className="text-slate-700 mb-6">{bourse.conditions}</p>}

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {bourse.niveauEtude && (
          <div>
            <h3 className="font-bold text-slate-800 mb-1">Niveau d'étude</h3>
            <p className="text-slate-600 text-sm">{bourse.niveauEtude}</p>
          </div>
        )}
        {bourse.montant && (
          <div>
            <h3 className="font-bold text-slate-800 mb-1">Montant</h3>
            <p className="text-slate-600 text-sm">{bourse.montant}</p>
          </div>
        )}
        {bourse.dateLimite && (
          <div>
            <h3 className="font-bold text-slate-800 mb-1">Date limite</h3>
            <p className="text-slate-600 text-sm">{formatDate(bourse.dateLimite)}</p>
          </div>
        )}
      </div>

      {bourse.lien && (
        <a
          href={bourse.lien}
          target="_blank"
          rel="noreferrer"
          className="btn-primary"
        >
          Voir l'offre complète
        </a>
      )}
    </div>
  );
}
