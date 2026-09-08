import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { CentreFormation } from '../../lib/types';

const VALIDATION_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  APPROUVE: 'Publié',
  REJETE: 'Refusé',
};

export function CentresFormationAdmin() {
  return (
    <AdminResourcePage<CentreFormation>
      title="Formation professionnelle"
      apiPath="/centres-formation"
      listApiPath="/admin/centres-formation"
      queryKey="admin-centres-formation"
      emptyItem={{ nom: '', adresse: '', ville: '', region: '', contact: '', siteWeb: '', statutValidation: 'APPROUVE' }}
      columns={[
        { key: 'nom', label: 'Nom' },
        { key: 'ville', label: 'Ville' },
        { key: 'region', label: 'Région' },
        { key: 'contact', label: 'Contact' },
        {
          key: 'statutValidation',
          label: 'Validation',
          render: (item) => VALIDATION_LABELS[item.statutValidation ?? 'APPROUVE'] ?? item.statutValidation,
        },
        {
          key: 'auteur',
          label: 'Soumis par',
          render: (item) => {
            const auteur = (item as CentreFormation & { auteur?: { nom: string; prenom: string } }).auteur;
            return auteur ? `${auteur.prenom} ${auteur.nom}` : 'Admin';
          },
        },
      ]}
      fields={[
        { name: 'nom', label: 'Nom', type: 'text', required: true },
        { name: 'adresse', label: 'Adresse', type: 'text' },
        { name: 'ville', label: 'Ville', type: 'text' },
        { name: 'region', label: 'Région', type: 'text' },
        { name: 'contact', label: 'Contact', type: 'text' },
        { name: 'siteWeb', label: 'Site web', type: 'text' },
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
