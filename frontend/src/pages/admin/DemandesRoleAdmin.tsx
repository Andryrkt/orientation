import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { DemandeRole, DemandeRoleStatut, Paginated } from '../../lib/types';

const STATUT_LABELS: Record<DemandeRoleStatut, string> = {
  EN_ATTENTE: 'En attente',
  CLARIFICATION_DEMANDEE: 'Complément demandé',
  APPROUVEE: 'Approuvée',
  REJETEE: 'Refusée',
};

const STATUT_CLASSES: Record<DemandeRoleStatut, string> = {
  EN_ATTENTE: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  CLARIFICATION_DEMANDEE: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
  APPROUVEE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  REJETEE: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
};

const TYPE_LABELS: Record<string, string> = {
  COACH: 'Coach',
  ENSEIGNANT: 'Enseignant',
  ETUDIANT: 'Étudiant',
};

const NIVEAU_ETUDE_LABELS: Record<string, string> = {
  LYCEE: 'Lycée',
  NOUVEAU_BACHELIER: 'Nouveau Bachelier',
  UNIVERSITE: 'Université',
};

function ProfilPropose({ d }: { d: DemandeRole }) {
  const rows: [string, string][] = [];
  if (d.telephone) rows.push(['Téléphone', d.telephone]);
  if (d.disponibilites) rows.push(['Disponibilités', d.disponibilites]);
  if (d.type === 'COACH' && d.specialites.length > 0) rows.push(['Spécialités', d.specialites.join(', ')]);
  if (d.type === 'COACH' && d.experience) rows.push(['Expérience', d.experience]);
  if (d.type === 'ENSEIGNANT' && d.matieres.length > 0) rows.push(['Matières', d.matieres.join(', ')]);
  if (d.type === 'ENSEIGNANT' && d.niveauxEtude.length > 0) rows.push(['Niveaux', d.niveauxEtude.join(', ')]);
  if (d.type === 'ENSEIGNANT' && d.etablissement) rows.push(['Établissement', d.etablissement]);
  if (d.type === 'ETUDIANT' && d.niveauEtude) rows.push(["Niveau d'étude", NIVEAU_ETUDE_LABELS[d.niveauEtude] ?? d.niveauEtude]);

  if (rows.length === 0 && !d.bio) return null;

  return (
    <div className="mt-2 text-sm bg-slate-50 dark:bg-white/5 rounded-lg p-3 space-y-1">
      {d.bio && <p className="text-slate-700 dark:text-slate-300">{d.bio}</p>}
      {rows.map(([label, value]) => (
        <p key={label} className="text-slate-600 dark:text-slate-400">
          <span className="font-semibold">{label} : </span>{value}
        </p>
      ))}
    </div>
  );
}

function ReexaminerToggle({
  onSubmit,
  submitting,
}: {
  onSubmit: (statut: DemandeRoleStatut, reponse: string) => void;
  submitting: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 text-sm font-semibold text-brand-600 dark:text-blue-400 hover:underline"
      >
        Ce refus était une erreur ? Réexaminer la demande →
      </button>
    );
  }

  return <ReponseForm submitting={submitting} onSubmit={onSubmit} />;
}

function RemettreEnAttenteButton({
  onConfirm,
  submitting,
}: {
  onConfirm: () => void;
  submitting: boolean;
}) {
  return (
    <button
      type="button"
      disabled={submitting}
      onClick={() => {
        if (confirm('Remettre cette demande en attente ? Elle pourra ensuite être réapprouvée ou refusée.')) {
          onConfirm();
        }
      }}
      className="mt-3 px-4 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
    >
      Remettre en attente
    </button>
  );
}

function ReponseForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (statut: DemandeRoleStatut, reponse: string) => void;
  submitting: boolean;
}) {
  const [reponse, setReponse] = useState('');

  function handle(e: FormEvent, statut: DemandeRoleStatut) {
    e.preventDefault();
    onSubmit(statut, reponse);
  }

  return (
    <form className="mt-3 space-y-2">
      <textarea
        className="field-input"
        rows={2}
        placeholder="Message pour le demandeur (obligatoire pour demander un complément)..."
        value={reponse}
        onChange={(e) => setReponse(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={submitting}
          onClick={(e) => handle(e, 'APPROUVEE')}
          className="btn-primary text-sm px-4 py-1.5 disabled:opacity-50"
        >
          Approuver
        </button>
        <button
          type="button"
          disabled={submitting || !reponse.trim()}
          onClick={(e) => handle(e, 'CLARIFICATION_DEMANDEE')}
          className="px-4 py-1.5 text-sm rounded-md border border-orange-300 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 disabled:opacity-50"
        >
          Demander un complément
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={(e) => handle(e, 'REJETEE')}
          className="px-4 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
        >
          Refuser
        </button>
      </div>
    </form>
  );
}

export function DemandesRoleAdmin() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-demandes-role'],
    queryFn: async () => (await api.get<Paginated<DemandeRole>>('/admin/demandes-role?limit=100')).data,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, statut, reponse }: { id: string; statut: DemandeRoleStatut; reponse: string }) =>
      api.patch(`/admin/demandes-role/${id}`, { statut, reponse: reponse || undefined }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-demandes-role'] }),
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Demandes de statut</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        Approuve, refuse, ou demande un complément d'information sur les demandes des utilisateurs souhaitant devenir
        coach, enseignant, ou obtenir l'accès étudiant (budget, ressources).
      </p>

      {isLoading && <p className="text-slate-400">Chargement...</p>}
      {!isLoading && data?.items.length === 0 && (
        <p className="text-slate-400">Aucune demande pour le moment.</p>
      )}

      <div className="space-y-3">
        {data?.items.map((d) => (
          <div key={d.id} className="card p-5">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <p className="font-bold text-slate-800 dark:text-white">
                  {d.utilisateur ? `${d.utilisateur.prenom} ${d.utilisateur.nom}` : 'Demandeur'}
                  {' — '}
                  <span className="font-semibold">{TYPE_LABELS[d.type] ?? d.type}</span>
                </p>
                {d.utilisateur?.email && <p className="text-xs text-slate-400 mt-0.5">{d.utilisateur.email}</p>}
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(d.createdAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${STATUT_CLASSES[d.statut]}`}>
                {STATUT_LABELS[d.statut]}
              </span>
            </div>
            {d.message && <p className="text-sm text-slate-600 dark:text-slate-400">{d.message}</p>}
            <ProfilPropose d={d} />
            {d.reponse && (
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                <span className="font-semibold">Réponse : </span>{d.reponse}
              </p>
            )}
            {d.statut === 'EN_ATTENTE' && (
              <ReponseForm
                submitting={updateMutation.isPending}
                onSubmit={(statut, reponse) => updateMutation.mutate({ id: d.id, statut, reponse })}
              />
            )}
            {d.statut === 'REJETEE' && (
              <ReexaminerToggle
                submitting={updateMutation.isPending}
                onSubmit={(statut, reponse) => updateMutation.mutate({ id: d.id, statut, reponse })}
              />
            )}
            {d.statut === 'APPROUVEE' && (
              <RemettreEnAttenteButton
                submitting={updateMutation.isPending}
                onConfirm={() => updateMutation.mutate({ id: d.id, statut: 'EN_ATTENTE', reponse: '' })}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
