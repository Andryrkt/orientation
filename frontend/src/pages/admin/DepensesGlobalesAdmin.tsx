import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { formatMontant } from '../../lib/format';
import { DepenseGlobale } from '../../lib/types';

export function DepensesGlobalesAdmin() {
  return (
    <AdminResourcePage<DepenseGlobale>
      title="Dépenses globales"
      apiPath="/admin/depenses-globales"
      queryKey="admin-depenses-globales"
      emptyItem={{
        date: new Date().toISOString().slice(0, 10),
        categorie: '',
        montant: 0,
        description: '',
      }}
      columns={[
        {
          key: 'date',
          label: 'Date',
          render: (item) => new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        },
        { key: 'categorie', label: 'Catégorie' },
        {
          key: 'montant',
          label: 'Montant',
          render: (item) => <span className="text-red-600 font-medium">{formatMontant(item.montant)}</span>,
        },
        { key: 'description', label: 'Description' },
      ]}
      fields={[
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'categorie', label: 'Catégorie', type: 'text', required: true },
        { name: 'montant', label: 'Montant (Ar)', type: 'number', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]}
      toFormValues={(item) => ({ ...item, date: item.date.slice(0, 10) })}
    />
  );
}
