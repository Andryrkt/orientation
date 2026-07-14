import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { Ressource } from '../../lib/types';

function toPayload(values: Record<string, unknown>) {
  const payload = { ...values };
  for (const key of ['description', 'fichierUrl', 'dureeLecture']) {
    if (payload[key] === '') delete payload[key];
  }
  return payload;
}

export function RessourcesAdmin() {
  return (
    <AdminResourcePage<Ressource>
      title="Ressources d'Apprentissage"
      apiPath="/ressources"
      queryKey="admin-ressources"
      emptyItem={{
        titre: '',
        description: '',
        contenu: '',
        type: 'COURS',
        niveauEtude: 'LYCEE',
        categorie: '',
        fichierUrl: '',
        dureeLecture: '',
      }}
      toFormValues={(item) => ({
        ...item,
        description: item.description ?? '',
        fichierUrl: item.fichierUrl ?? '',
        dureeLecture: item.dureeLecture ?? '',
      })}
      toPayload={toPayload}
      columns={[
        { key: 'titre', label: 'Titre' },
        {
          key: 'type',
          label: 'Type',
          render: (item) => (item.type === 'COURS' ? '📚 Cours' : '📂 Document'),
        },
        {
          key: 'niveauEtude',
          label: "Niveau d'étude",
          render: (item) => {
            if (item.niveauEtude === 'LYCEE') return 'Lycée';
            if (item.niveauEtude === 'NOUVEAU_BACHELIER') return 'Nouveau Bachelier';
            if (item.niveauEtude === 'UNIVERSITE') return 'Université';
            return item.niveauEtude;
          },
        },
        { key: 'categorie', label: 'Catégorie' },
      ]}
      fields={[
        { name: 'titre', label: 'Titre', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'text' },
        { name: 'contenu', label: 'Contenu (Markdown)', type: 'textarea', required: true },
        {
          name: 'type',
          label: 'Type de ressource',
          type: 'select',
          options: [
            { value: 'COURS', label: 'Cours' },
            { value: 'DOCUMENT', label: 'Document' },
          ],
          required: true,
        },
        {
          name: 'niveauEtude',
          label: "Niveau d'étude ciblé",
          type: 'select',
          options: [
            { value: 'LYCEE', label: 'Lycée' },
            { value: 'NOUVEAU_BACHELIER', label: 'Nouveau Bachelier' },
            { value: 'UNIVERSITE', label: 'Université' },
          ],
          required: true,
        },
        { name: 'categorie', label: 'Catégorie', type: 'text', required: true },
        { name: 'fichierUrl', label: 'Lien du fichier (facultatif)', type: 'text' },
        { name: 'dureeLecture', label: 'Durée estimée (ex: 10 min)', type: 'text' },
      ]}
    />
  );
}
