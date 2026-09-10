import { useQuery } from '@tanstack/react-query';
import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { api } from '../../lib/api';
import { Enseignant, Paginated, User } from '../../lib/types';

const VALIDATION_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  APPROUVE: 'Publié',
  REJETE: 'Refusé',
};

function toPayload(values: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    ...values,
    matieres:
      typeof values.matieres === 'string'
        ? values.matieres.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    niveauxEtude:
      typeof values.niveauxEtude === 'string'
        ? values.niveauxEtude.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean)
        : [],
    visible: values.visible === 'true' || values.visible === true,
  };
  if (payload.utilisateurId === '') delete payload.utilisateurId;
  return payload;
}

export function EnseignantsAdmin() {
  const { data: users } = useQuery({
    queryKey: ['all-users-enseignant'],
    queryFn: async () => (await api.get<Paginated<User>>('/admin/users?limit=100')).data,
  });
  // N'importe quel compte peut être lié comme enseignant (indépendamment de son rôle), y compris
  // à plusieurs profils enseignant à la fois (Maths au lycée, Algèbre à l'université...).
  const userOptions = (users?.items ?? []).map((u) => ({ value: u.id, label: `${u.prenom} ${u.nom} (${u.email})` }));

  return (
    <AdminResourcePage<Enseignant>
      title="Enseignants"
      apiPath="/enseignants"
      listApiPath="/admin/enseignants"
      queryKey="admin-enseignants"
      emptyItem={{
        utilisateurId: '',
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        bio: '',
        matieres: '',
        niveauxEtude: '',
        etablissement: '',
        disponibilites: '',
        visible: 'true',
        statutValidation: 'APPROUVE',
      }}
      toFormValues={(item) => ({
        ...item,
        utilisateurId: item.utilisateurId ?? '',
        matieres: (item.matieres ?? []).join(', '),
        niveauxEtude: (item.niveauxEtude ?? []).join(', '),
        visible: String(item.visible),
      })}
      toPayload={toPayload}
      columns={[
        { key: 'nom', label: 'Nom', render: (item) => `${item.prenom} ${item.nom}` },
        { key: 'matieres', label: 'Matières', render: (item) => item.matieres.join(', ') || '—' },
        {
          key: 'niveauxEtude',
          label: 'Niveaux',
          render: (item) => (item.niveauxEtude?.length ? item.niveauxEtude.join(', ') : 'Tous niveaux'),
        },
        { key: 'etablissement', label: 'Établissement', render: (item) => item.etablissement || '—' },
        {
          key: 'noteMoyenne',
          label: 'Note',
          render: (item) => (item.noteMoyenne != null ? `★ ${item.noteMoyenne.toFixed(1)} (${item.avisCount})` : '—'),
        },
        {
          key: 'visible',
          label: 'Visibilité',
          render: (item) => (item.visible ? 'Visible' : 'Masqué'),
        },
        {
          key: 'statutValidation',
          label: 'Validation',
          render: (item) => VALIDATION_LABELS[item.statutValidation ?? 'APPROUVE'] ?? item.statutValidation,
        },
      ]}
      fields={[
        {
          name: 'utilisateurId',
          label: "Compte utilisateur lié (rôle Enseignant) — pour l'accès à l'espace \"Rendez-vous à traiter\"",
          type: 'select',
          options: userOptions,
        },
        { name: 'prenom', label: 'Prénom', type: 'text', required: true },
        { name: 'nom', label: 'Nom', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'text' },
        { name: 'telephone', label: 'Téléphone', type: 'text' },
        { name: 'bio', label: 'Bio', type: 'textarea' },
        { name: 'matieres', label: 'Matières (séparées par des virgules)', type: 'text', required: true },
        {
          name: 'niveauxEtude',
          label: 'Niveaux d\'études (LYCEE, NOUVEAU_BACHELIER, UNIVERSITE — vide = tous niveaux)',
          type: 'text',
        },
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
        {
          name: 'statutValidation',
          label: 'Statut de validation (fiches soumises par l\'enseignant lui-même)',
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
