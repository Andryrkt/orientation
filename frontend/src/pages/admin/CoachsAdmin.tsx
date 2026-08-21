import { useQuery } from '@tanstack/react-query';
import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { api } from '../../lib/api';
import { Coach, Paginated, User } from '../../lib/types';

function toPayload(values: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    ...values,
    specialites:
      typeof values.specialites === 'string'
        ? values.specialites.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    visible: values.visible === 'true' || values.visible === true,
  };
  if (payload.utilisateurId === '') delete payload.utilisateurId;
  return payload;
}

export function CoachsAdmin() {
  const { data: users } = useQuery({
    queryKey: ['all-users-coach'],
    queryFn: async () => (await api.get<Paginated<User>>('/admin/users?limit=100')).data,
  });
  const userOptions = (users?.items ?? [])
    .filter((u) => u.role === 'COACH')
    .map((u) => ({ value: u.id, label: `${u.prenom} ${u.nom} (${u.email})` }));

  return (
    <AdminResourcePage<Coach>
      title="Coachs"
      apiPath="/coachs"
      listApiPath="/admin/coachs"
      queryKey="admin-coachs"
      emptyItem={{
        utilisateurId: '',
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
        utilisateurId: item.utilisateurId ?? '',
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
        {
          name: 'utilisateurId',
          label: "Compte utilisateur lié (rôle Coach) — pour l'accès à l'espace \"Rendez-vous à traiter\"",
          type: 'select',
          options: userOptions,
        },
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
