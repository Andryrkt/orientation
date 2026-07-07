import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { CentreFormation } from '../../lib/types';

export function CentresFormationAdmin() {
  return (
    <AdminResourcePage<CentreFormation>
      title="Centres de formation"
      apiPath="/centres-formation"
      queryKey="admin-centres-formation"
      emptyItem={{ nom: '', adresse: '', ville: '', region: '', contact: '', siteWeb: '' }}
      columns={[
        { key: 'nom', label: 'Nom' },
        { key: 'ville', label: 'Ville' },
        { key: 'region', label: 'Région' },
        { key: 'contact', label: 'Contact' },
      ]}
      fields={[
        { name: 'nom', label: 'Nom', type: 'text', required: true },
        { name: 'adresse', label: 'Adresse', type: 'text' },
        { name: 'ville', label: 'Ville', type: 'text' },
        { name: 'region', label: 'Région', type: 'text' },
        { name: 'contact', label: 'Contact', type: 'text' },
        { name: 'siteWeb', label: 'Site web', type: 'text' },
      ]}
    />
  );
}
