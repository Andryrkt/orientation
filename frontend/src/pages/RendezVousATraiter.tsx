import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

function ReponseForm({ rdv, onSubmit, submitting }: { rdv: RendezVous; onSubmit: (statut: RendezVousStatut, reponse: string) => void; submitting: boolean }) {
  const [reponse, setReponse] = useState('');

  function handle(e: FormEvent, statut: RendezVousStatut) {
    e.preventDefault();
    onSubmit(statut, reponse);
  }

  return (
    <form className="mt-3 space-y-2">
      <textarea
        className="field-input"
        rows={2}
        placeholder="Message pour le demandeur (optionnel)..."
        value={reponse}
        onChange={(e) => setReponse(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={submitting}
          onClick={(e) => handle(e, 'CONFIRME')}
          className="btn-primary text-sm px-4 py-1.5 disabled:opacity-50"
        >
          Confirmer
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={(e) => handle(e, 'ANNULE')}
          className="px-4 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
        >
          Décliner
        </button>
        {rdv.statut === 'CONFIRME' && (
          <button
            type="button"
            disabled={submitting}
            onClick={(e) => handle(e, 'TERMINE')}
            className="px-4 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            Marquer comme terminé
          </button>
        )}
      </div>
    </form>
  );
}

export function RendezVousATraiter() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['rendez-vous-a-traiter'],
    queryFn: async () => (await api.get<Paginated<RendezVous>>('/rendez-vous?vue=a-traiter&limit=100')).data,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, statut, reponse }: { id: string; statut: RendezVousStatut; reponse: string }) =>
      api.patch(`/rendez-vous/${id}`, { statut, reponse: reponse || undefined }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rendez-vous-a-traiter'] }),
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Rendez-vous à traiter</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        Confirme, décline ou clôture les demandes de rendez-vous qui te sont adressées.
      </p>

      {isLoading && <p className="text-slate-400">Chargement...</p>}
      {!isLoading && data?.items.length === 0 && (
        <p className="text-slate-400">Aucune demande de rendez-vous pour le moment.</p>
      )}

      <div className="space-y-3">
        {data?.items.map((r) => (
          <div key={r.id} className="card p-5">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <p className="font-bold text-slate-800 dark:text-white">
                  {r.utilisateur ? `${r.utilisateur.prenom} ${r.utilisateur.nom}` : 'Demandeur'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {new Date(r.dateSouhaitee).toLocaleString('fr-FR', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </p>
                {r.utilisateur?.email && (
                  <p className="text-xs text-slate-400 mt-0.5">{r.utilisateur.email}</p>
                )}
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${STATUT_CLASSES[r.statut]}`}>
                {STATUT_LABELS[r.statut]}
              </span>
            </div>
            {r.message && <p className="text-sm text-slate-600 dark:text-slate-400">{r.message}</p>}
            {r.reponse && (
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                <span className="font-semibold">Ta réponse : </span>{r.reponse}
              </p>
            )}
            {r.statut === 'EN_ATTENTE' || r.statut === 'CONFIRME' ? (
              <ReponseForm
                rdv={r}
                submitting={updateMutation.isPending}
                onSubmit={(statut, reponse) => updateMutation.mutate({ id: r.id, statut, reponse })}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
