import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Paginated, RendezVous, RendezVousStatut } from '../lib/types';

const STATUT_LABELS: Record<RendezVousStatut, string> = {
  EN_ATTENTE: 'En attente',
  CONFIRME: 'Confirmé',
  ANNULE: 'Annulé',
  TERMINE: 'Terminé',
};

const STATUT_CLASSES: Record<RendezVousStatut, string> = {
  EN_ATTENTE: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  CONFIRME: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  ANNULE: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
  TERMINE: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
};

export function MesRendezVous() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['mes-rendez-vous'],
    queryFn: async () => (await api.get<Paginated<RendezVous>>('/rendez-vous?limit=100')).data,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/rendez-vous/${id}`, { statut: 'ANNULE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mes-rendez-vous'] }),
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Mes rendez-vous</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        Retrouve tes demandes de rendez-vous auprès des coachs et enseignants.
      </p>

      {isLoading && <p className="text-slate-400">Chargement...</p>}
      {!isLoading && data?.items.length === 0 && (
        <p className="text-slate-400">
          Tu n'as pas encore de demande de rendez-vous. Rends-toi sur la fiche d'un{' '}
          <Link to="/coachs" className="text-brand-600 dark:text-blue-400 hover:underline">coach</Link>{' '}
          ou d'un{' '}
          <Link to="/enseignants" className="text-brand-600 dark:text-blue-400 hover:underline">enseignant</Link>{' '}
          pour en faire la demande.
        </p>
      )}

      <div className="space-y-3">
        {data?.items.map((r) => {
          const cible = r.cible === 'COACH' ? r.coach : r.enseignant;
          return (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">
                    {cible ? `${cible.prenom} ${cible.nom}` : r.cible === 'COACH' ? 'Coach' : 'Enseignant'}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(r.dateSouhaitee).toLocaleString('fr-FR', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${STATUT_CLASSES[r.statut]}`}>
                  {STATUT_LABELS[r.statut]}
                </span>
              </div>
              {r.message && <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{r.message}</p>}
              {r.reponse && (
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <span className="font-semibold">Réponse : </span>{r.reponse}
                </p>
              )}
              {r.statut === 'EN_ATTENTE' && (
                <button
                  onClick={() => cancelMutation.mutate(r.id)}
                  disabled={cancelMutation.isPending}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline mt-3 disabled:opacity-50"
                >
                  Annuler la demande
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
