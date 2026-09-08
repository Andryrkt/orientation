import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { Universite } from '../../lib/types';

const VALIDATION_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  APPROUVE: 'Publié',
  REJETE: 'Refusé',
};

export function UniversitesAdmin() {
  return (
    <AdminResourcePage<Universite>
      title="Universités"
      apiPath="/universites"
      listApiPath="/admin/universites"
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
        statutValidation: 'APPROUVE',
      }}
      columns={[
        { key: 'nom', label: 'Nom' },
        { key: 'ville', label: 'Ville' },
        { key: 'region', label: 'Région' },
        {
          key: 'statutValidation',
          label: 'Validation',
          render: (item) => VALIDATION_LABELS[item.statutValidation ?? 'APPROUVE'] ?? item.statutValidation,
        },
        {
          key: 'auteur',
          label: 'Soumis par',
          render: (item) => {
            const auteur = (item as Universite & { auteur?: { nom: string; prenom: string } }).auteur;
            return auteur ? `${auteur.prenom} ${auteur.nom}` : 'Admin';
          },
        },
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
          label: "Type d'établissement",
          type: 'select',
          options: [
            { value: 'public', label: 'Public' },
            { value: 'prive', label: 'Privé' },
          ],
        },
        {
          name: 'statutValidation',
          label: 'Statut de validation (fiches soumises par un gestionnaire)',
          type: 'select',
          options: [
            { value: 'EN_ATTENTE', label: 'En attente' },
            { value: 'APPROUVE', label: 'Publié' },
            { value: 'REJETE', label: 'Refusé' },
          ],
        },
      ]}
    />
  );
}
