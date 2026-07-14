import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { Enseignant } from '../../lib/types';

function toPayload(values: Record<string, unknown>) {
  return {
    ...values,
    matieres:
      typeof values.matieres === 'string'
        ? values.matieres.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    visible: values.visible === 'true' || values.visible === true,
  };
}

export function EnseignantsAdmin() {
  return (
    <AdminResourcePage<Enseignant>
      title="Enseignants"
      apiPath="/enseignants"
      listApiPath="/admin/enseignants"
      queryKey="admin-enseignants"
      emptyItem={{
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        bio: '',
        matieres: '',
        etablissement: '',
        disponibilites: '',
        visible: 'true',
      }}
      toFormValues={(item) => ({
        ...item,
        matieres: (item.matieres ?? []).join(', '),
        visible: String(item.visible),
      })}
      toPayload={toPayload}
      columns={[
        { key: 'nom', label: 'Nom', render: (item) => `${item.prenom} ${item.nom}` },
        { key: 'matieres', label: 'Matières', render: (item) => item.matieres.join(', ') || '—' },
        { key: 'etablissement', label: 'Établissement', render: (item) => item.etablissement || '—' },
        {
          key: 'noteMoyenne',
          label: 'Note',
          render: (item) => (item.noteMoyenne !== null ? `★ ${item.noteMoyenne.toFixed(1)} (${item.avisCount})` : '—'),
        },
        {
          key: 'visible',
          label: 'Visibilité',
          render: (item) => (item.visible ? 'Visible' : 'Masqué'),
        },
      ]}
      fields={[
        { name: 'prenom', label: 'Prénom', type: 'text', required: true },
        { name: 'nom', label: 'Nom', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'text' },
        { name: 'telephone', label: 'Téléphone', type: 'text' },
        { name: 'bio', label: 'Bio', type: 'textarea' },
        { name: 'matieres', label: 'Matières (séparées par des virgules)', type: 'text' },
        { name: 'etablissement', label: 'Établissement de rattachement', type: 'text' },
        { name: 'disponibilites', label: 'Disponibilités', type: 'text' },
        {
          name: 'visible',
          label: 'Visibilité',
          type: 'select',
          options: [
            { value: 'true', label: 'Visible' },
            { value: 'false', label: 'Masqué' },
          ],
        },
      ]}
    />
  );
}
