import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { Secteur } from '../../lib/types';

export function SecteursAdmin() {
  return (
    <AdminResourcePage<Secteur>
      title="Secteurs"
      apiPath="/secteurs"
      queryKey="admin-secteurs"
      emptyItem={{ nom: '', description: '', ordre: 0 }}
      columns={[
        { key: 'nom', label: 'Nom' },
        { key: 'slug', label: 'Slug' },
        { key: 'ordre', label: 'Ordre' },
      ]}
      fields={[
        { name: 'nom', label: 'Nom', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'ordre', label: 'Ordre', type: 'number' },
      ]}
    />
  );
}
