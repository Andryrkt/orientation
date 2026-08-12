import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { MontantInput } from '../../components/MontantInput';
import { api } from '../../lib/api';
import { formatMontant } from '../../lib/format';
import { DroitInscription, Filiere } from '../../lib/types';

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

export function FilieresAdmin() {
  return (
    <div>
      <DroitInscriptionCard />
      <AdminResourcePage<Filiere>
        title="Filières"
        apiPath="/admin/filieres"
        queryKey="admin-filieres"
        emptyItem={{ nom: '', prix: 0, actif: 'true' }}
        columns={[
          { key: 'nom', label: 'Nom' },
          {
            key: 'prix',
            label: 'Prix',
            render: (item) => <span className="text-emerald-600 font-medium">{formatMontant(item.prix)}</span>,
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
        toFormValues={(item) => ({ ...item, actif: item.actif ? 'true' : 'false' })}
        toPayload={(values) => ({ ...values, actif: values.actif === 'true' })}
      />
    </div>
  );
}
