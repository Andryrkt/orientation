import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { Universite } from '../../lib/types';

export function UniversitesAdmin() {
  return (
    <AdminResourcePage<Universite>
      title="Universités"
      apiPath="/universites"
      queryKey="admin-universites"
      emptyItem={{
        nom: '',
        description: '',
        adresse: '',
        ville: '',
        region: '',
        telephone: '',
        email: '',
        siteWeb: '',
        latitude: undefined,
        longitude: undefined,
        statut: 'public',
      }}
      columns={[
        { key: 'nom', label: 'Nom' },
        { key: 'ville', label: 'Ville' },
        { key: 'region', label: 'Région' },
        { key: 'statut', label: 'Statut' },
      ]}
      fields={[
        { name: 'nom', label: 'Nom', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'adresse', label: 'Adresse', type: 'text' },
        { name: 'ville', label: 'Ville', type: 'text' },
        { name: 'region', label: 'Région', type: 'text' },
        { name: 'telephone', label: 'Téléphone', type: 'text' },
        { name: 'email', label: 'Email', type: 'text' },
        { name: 'siteWeb', label: 'Site web', type: 'text' },
        { name: 'latitude', label: 'Latitude', type: 'number' },
        { name: 'longitude', label: 'Longitude', type: 'number' },
        {
          name: 'statut',
          label: 'Statut',
          type: 'select',
          options: [
            { value: 'public', label: 'Public' },
            { value: 'prive', label: 'Privé' },
          ],
        },
      ]}
    />
  );
}
