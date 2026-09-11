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
  GESTIONNAIRE_ETABLISSEMENT: "Gestionnaire d'établissement",
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

function DemandeDetailModal({ demande, onClose }: { demande: DemandeRole; onClose: () => void }) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ statut, reponse }: { statut: DemandeRoleStatut; reponse: string }) =>
      api.patch(`/admin/demandes-role/${demande.id}`, { statut, reponse: reponse || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-demandes-role'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <p className="font-bold text-slate-800 dark:text-white">
                {demande.utilisateur ? `${demande.utilisateur.prenom} ${demande.utilisateur.nom}` : 'Demandeur'}
                {' — '}
                <span className="font-semibold">{TYPE_LABELS[demande.type] ?? demande.type}</span>
              </p>
              {demande.utilisateur?.email && (
                <p className="text-xs text-slate-400 mt-0.5">{demande.utilisateur.email}</p>
              )}
              <p className="text-xs text-slate-400 mt-0.5">
                {new Date(demande.createdAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}
              </p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${STATUT_CLASSES[demande.statut]}`}>
              {STATUT_LABELS[demande.statut]}
            </span>
          </div>
          {demande.message && <p className="text-sm text-slate-600 dark:text-slate-400">{demande.message}</p>}
          <ProfilPropose d={demande} />
          {demande.reponse && (
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">
              <span className="font-semibold">Réponse : </span>{demande.reponse}
            </p>
          )}
          {demande.statut === 'EN_ATTENTE' && (
            <ReponseForm
              submitting={updateMutation.isPending}
              onSubmit={(statut, reponse) => updateMutation.mutate({ statut, reponse })}
            />
          )}
          {demande.statut === 'REJETEE' && (
            <ReexaminerToggle
              submitting={updateMutation.isPending}
              onSubmit={(statut, reponse) => updateMutation.mutate({ statut, reponse })}
            />
          )}
          {demande.statut === 'APPROUVEE' && (
            <RemettreEnAttenteButton
              submitting={updateMutation.isPending}
              onConfirm={() => updateMutation.mutate({ statut: 'EN_ATTENTE', reponse: '' })}
            />
          )}
          <div className="flex justify-end pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DemandesRoleAdmin() {
  const [selected, setSelected] = useState<DemandeRole | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-demandes-role'],
    queryFn: async () => (await api.get<Paginated<DemandeRole>>('/admin/demandes-role?limit=100')).data,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Demandes de statut</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        Approuve, refuse, ou demande un complément d'information sur les demandes des utilisateurs souhaitant devenir
        coach, enseignant, gestionnaire d'établissement, ou obtenir l'accès étudiant (budget, ressources).
      </p>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Demandeur</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">Chargement...</td>
              </tr>
            )}
            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">Aucune demande pour le moment.</td>
              </tr>
            )}
            {data?.items.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3">
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    {d.utilisateur ? `${d.utilisateur.prenom} ${d.utilisateur.nom}` : 'Demandeur'}
                  </p>
                  {d.utilisateur?.email && <p className="text-xs text-slate-400">{d.utilisateur.email}</p>}
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{TYPE_LABELS[d.type] ?? d.type}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {new Date(d.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${STATUT_CLASSES[d.statut]}`}>
                    {STATUT_LABELS[d.statut]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setSelected(d)}
                    className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
                  >
                    Détail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <DemandeDetailModal demande={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
