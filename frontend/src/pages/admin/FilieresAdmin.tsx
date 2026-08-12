import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { MontantInput } from '../../components/MontantInput';
import { api } from '../../lib/api';
import { formatMontant } from '../../lib/format';
import { DroitInscription, Filiere, FiliereMontant } from '../../lib/types';

function DroitInscriptionCard() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ['admin-droit-inscription'],
    queryFn: async () => (await api.get<DroitInscription>('/droit-inscription')).data,
  });
  const [montant, setMontant] = useState('');

  useEffect(() => {
    if (data) setMontant(data.montant.toString());
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => api.patch('/admin/droit-inscription', { montant: Number(montant) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-droit-inscription'] }),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 mb-6 flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
          Droit d'inscription (Ar)
        </label>
        <MontantInput value={montant} onChange={setMontant} className="field-input w-40" required />
      </div>
      <button type="submit" disabled={mutation.isPending} className="btn-primary px-4 py-2 text-sm">
        Enregistrer
      </button>
      {mutation.isSuccess && <span className="text-sm text-emerald-600 font-medium">Enregistré</span>}
    </form>
  );
}

function MontantsFiliereModal({ filiere, onClose }: { filiere: Filiere; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [montant, setMontant] = useState('');
  const [activerADepot, setActiverADepot] = useState(true);

  const { data: montants, isLoading } = useQuery({
    queryKey: ['admin-filiere-montants', filiere.id],
    queryFn: async () => (await api.get<FiliereMontant[]>(`/admin/filieres/${filiere.id}/montants`)).data,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-filiere-montants', filiere.id] });
    queryClient.invalidateQueries({ queryKey: ['admin-filieres'] });
  }

  const createMutation = useMutation({
    mutationFn: () =>
      api.post(`/admin/filieres/${filiere.id}/montants`, { montant: Number(montant), actif: activerADepot }),
    onSuccess: () => {
      setMontant('');
      invalidate();
    },
  });

  const activerMutation = useMutation({
    mutationFn: (montantId: string) => api.patch(`/admin/filieres/${filiere.id}/montants/${montantId}/activer`),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (montantId: string) => api.delete(`/admin/filieres/${filiere.id}/montants/${montantId}`),
    onSuccess: invalidate,
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createMutation.mutate();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Montants — {filiere.nom}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Nouveau montant (Ar)
              </label>
              <MontantInput value={montant} onChange={setMontant} className="field-input w-40" required />
            </div>
            <label className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 pb-2">
              <input type="checkbox" checked={activerADepot} onChange={(e) => setActiverADepot(e.target.checked)} />
              Activer immédiatement
            </label>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary px-4 py-2 text-sm">
              Ajouter
            </button>
          </form>

          {isLoading && <p className="text-sm text-slate-400">Chargement...</p>}
          {!isLoading && montants?.length === 0 && (
            <p className="text-sm text-slate-400">Aucun montant enregistré.</p>
          )}
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {montants?.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{formatMontant(m.montant)}</span>
                  {m.actif && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">
                      Actif
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {!m.actif && (
                    <button
                      onClick={() => activerMutation.mutate(m.id)}
                      disabled={activerMutation.isPending}
                      className="text-brand-600 dark:text-brand-400 hover:underline text-sm"
                    >
                      Activer
                    </button>
                  )}
                  {!m.actif && (
                    <button
                      onClick={() => removeMutation.mutate(m.id)}
                      disabled={removeMutation.isPending}
                      className="text-red-600 dark:text-red-400 hover:underline text-sm"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function FilieresAdmin() {
  const [filiereMontants, setFiliereMontants] = useState<Filiere | null>(null);

  return (
    <div>
      <DroitInscriptionCard />
      <AdminResourcePage<Filiere>
        title="Filières"
        apiPath="/admin/filieres"
        queryKey="admin-filieres"
        emptyItem={{ nom: '', prix: 0, dateConcours: '', actif: 'true' }}
        columns={[
          { key: 'nom', label: 'Nom' },
          {
            key: 'prix',
            label: 'Prix actif',
            render: (item) => (
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-medium">{formatMontant(item.prix)}</span>
                <button
                  onClick={() => setFiliereMontants(item)}
                  className="text-brand-600 hover:underline text-xs"
                >
                  Historique
                </button>
              </div>
            ),
          },
          {
            key: 'dateConcours',
            label: 'Date de concours',
            render: (item) =>
              item.dateConcours
                ? new Date(item.dateConcours).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—',
          },
          {
            key: 'actif',
            label: 'Statut',
            render: (item) => (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.actif ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                {item.actif ? 'Active' : 'Inactive'}
              </span>
            ),
          },
        ]}
        fields={[
          { name: 'nom', label: 'Nom', type: 'text', required: true },
          { name: 'prix', label: 'Prix (Ar)', type: 'number', required: true },
          { name: 'dateConcours', label: 'Date de concours', type: 'date' },
          {
            name: 'actif',
            label: 'Statut',
            type: 'select',
            options: [
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ],
          },
        ]}
        toFormValues={(item) => ({
          ...item,
          dateConcours: item.dateConcours ? item.dateConcours.slice(0, 10) : '',
          actif: item.actif ? 'true' : 'false',
        })}
        toPayload={(values) => ({
          nom: values.nom,
          prix: values.prix,
          dateConcours: values.dateConcours || null,
          actif: values.actif === 'true',
        })}
      />

      {filiereMontants && (
        <MontantsFiliereModal filiere={filiereMontants} onClose={() => setFiliereMontants(null)} />
      )}
    </div>
  );
}
