import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { formatMontant } from '../../lib/format';
import { Investissement } from '../../lib/types';

const TYPE_LABELS: Record<string, string> = {
  DON: 'Don',
  PRET: 'Prêt',
  APPORT_CAPITAL: 'Apport en capital',
};

const STATUT_LABELS: Record<string, string> = {
  PROMIS: '🕓 Promis',
  RECU: '✅ Reçu',
};

const STATUT_CLASSES: Record<string, string> = {
  PROMIS: 'bg-amber-500/10 text-amber-600',
  RECU: 'bg-emerald-500/10 text-emerald-600',
};

export function InvestissementsAdmin() {
  return (
    <AdminResourcePage<Investissement>
      title="Investissements / Financements"
      apiPath="/admin/investissements"
      queryKey="admin-investissements"
      emptyItem={{
        date: new Date().toISOString().slice(0, 10),
        bailleur: '',
        montant: 0,
        type: 'APPORT_CAPITAL',
        statut: 'RECU',
        description: '',
      }}
      columns={[
        {
          key: 'date',
          label: 'Date',
          render: (item) => new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        },
        { key: 'bailleur', label: 'Bailleur / Investisseur' },
        { key: 'type', label: 'Type', render: (item) => TYPE_LABELS[item.type] },
        {
          key: 'montant',
          label: 'Montant',
          render: (item) => <span className="text-emerald-600 font-medium">{formatMontant(item.montant)}</span>,
        },
        {
          key: 'statut',
          label: 'Statut',
          render: (item) => (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUT_CLASSES[item.statut]}`}>
              {STATUT_LABELS[item.statut]}
            </span>
          ),
        },
        { key: 'description', label: 'Description' },
      ]}
      fields={[
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'bailleur', label: 'Bailleur / Investisseur', type: 'text', required: true },
        { name: 'montant', label: 'Montant (Ar)', type: 'number', required: true },
        {
          name: 'type',
          label: 'Type',
          type: 'select',
          required: true,
          options: [
            { value: 'DON', label: 'Don' },
            { value: 'PRET', label: 'Prêt' },
            { value: 'APPORT_CAPITAL', label: 'Apport en capital' },
          ],
        },
        {
          name: 'statut',
          label: 'Statut',
          type: 'select',
          required: true,
          options: [
            { value: 'PROMIS', label: '🕓 Promis' },
            { value: 'RECU', label: '✅ Reçu' },
          ],
        },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]}
      toFormValues={(item) => ({ ...item, date: item.date.slice(0, 10) })}
    />
  );
}
