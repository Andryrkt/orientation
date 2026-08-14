import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { Salle } from '../../lib/types';

export function SallesAdmin() {
  return (
    <AdminResourcePage<Salle>
      title="Salles"
      apiPath="/admin/salles"
      queryKey="admin-salles"
      emptyItem={{ nom: '', capacite: 20 }}
      columns={[
        { key: 'nom', label: 'Nom' },
        { key: 'capacite', label: 'Capacité', render: (item) => `${item.capacite} places` },
      ]}
      fields={[
        { name: 'nom', label: 'Nom', type: 'text', required: true },
        { name: 'capacite', label: 'Capacité (nombre de places)', type: 'number', required: true },
      ]}
    />
  );
}
