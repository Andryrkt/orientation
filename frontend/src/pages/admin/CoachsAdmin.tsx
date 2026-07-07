import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { Coach } from '../../lib/types';

function toPayload(values: Record<string, unknown>) {
  return {
    ...values,
    specialites:
      typeof values.specialites === 'string'
        ? values.specialites.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    visible: values.visible === 'true' || values.visible === true,
  };
}

export function CoachsAdmin() {
  return (
    <AdminResourcePage<Coach>
      title="Coachs"
      apiPath="/coachs"
      listApiPath="/admin/coachs"
      queryKey="admin-coachs"
      emptyItem={{
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        bio: '',
        specialites: '',
        experience: '',
        disponibilites: '',
        visible: 'true',
      }}
      toFormValues={(item) => ({
        ...item,
        specialites: (item.specialites ?? []).join(', '),
        visible: String(item.visible),
      })}
      toPayload={toPayload}
      columns={[
        { key: 'nom', label: 'Nom', render: (item) => `${item.prenom} ${item.nom}` },
        { key: 'specialites', label: 'Spécialités', render: (item) => item.specialites.join(', ') || '—' },
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
        { name: 'specialites', label: 'Spécialités (séparées par des virgules)', type: 'text' },
        { name: 'experience', label: 'Expérience', type: 'textarea' },
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
