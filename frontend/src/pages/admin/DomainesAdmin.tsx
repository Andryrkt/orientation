import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { Domaine } from '../../lib/types';

export function DomainesAdmin() {
  return (
    <AdminResourcePage<Domaine>
      title="Domaines"
      apiPath="/domaines"
      queryKey="admin-domaines"
      emptyItem={{ nom: '', description: '', icone: '', ordre: 0 }}
      columns={[
        { key: 'nom', label: 'Nom' },
        { key: 'slug', label: 'Slug' },
        { key: 'ordre', label: 'Ordre' },
      ]}
      fields={[
        { name: 'nom', label: 'Nom', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'icone', label: 'Icône', type: 'text' },
        { name: 'ordre', label: 'Ordre', type: 'number' },
      ]}
    />
  );
}
