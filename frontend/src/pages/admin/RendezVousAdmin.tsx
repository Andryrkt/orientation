import { useQuery } from '@tanstack/react-query';
import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { api } from '../../lib/api';
import { Coach, Enseignant, Paginated, RendezVous } from '../../lib/types';

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  CONFIRME: 'Confirmé',
  ANNULE: 'Annulé',
  TERMINE: 'Terminé',
};

export function RendezVousAdmin() {
  const { data: coachs } = useQuery({
    queryKey: ['all-coachs'],
    queryFn: async () => (await api.get<Paginated<Coach>>('/admin/coachs?limit=100')).data,
  });
  const { data: enseignants } = useQuery({
    queryKey: ['all-enseignants'],
    queryFn: async () => (await api.get<Paginated<Enseignant>>('/admin/enseignants?limit=100')).data,
  });

  const coachOptions = (coachs?.items ?? []).map((c) => ({ value: c.id, label: `${c.prenom} ${c.nom}` }));
  const enseignantOptions = (enseignants?.items ?? []).map((e) => ({ value: e.id, label: `${e.prenom} ${e.nom}` }));

  return (
    <AdminResourcePage<RendezVous>
      title="Rendez-vous"
      apiPath="/rendez-vous"
      listApiPath="/admin/rendez-vous"
      queryKey="admin-rendez-vous"
      emptyItem={{
        cible: 'COACH',
        coachId: '',
        enseignantId: '',
        dateSouhaitee: '',
        message: '',
        statut: 'EN_ATTENTE',
        reponse: '',
      }}
      toFormValues={(item) => ({
        ...item,
        dateSouhaitee: item.dateSouhaitee ? item.dateSouhaitee.slice(0, 16) : '',
      })}
      toPayload={(values) => {
        const payload = { ...values };
        if (payload.coachId === '') delete payload.coachId;
        if (payload.enseignantId === '') delete payload.enseignantId;
        if (payload.message === '') delete payload.message;
        if (payload.reponse === '') delete payload.reponse;
        return payload;
      }}
      columns={[
        {
          key: 'demandeur',
          label: 'Demandeur',
          render: (item) => (item.utilisateur ? `${item.utilisateur.prenom} ${item.utilisateur.nom}` : '—'),
        },
        {
          key: 'cible',
          label: 'Avec',
          render: (item) => {
            const cible = item.cible === 'COACH' ? item.coach : item.enseignant;
            return cible ? `${cible.prenom} ${cible.nom}` : '—';
          },
        },
        {
          key: 'dateSouhaitee',
          label: 'Date souhaitée',
          render: (item) => new Date(item.dateSouhaitee).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
        },
        { key: 'statut', label: 'Statut', render: (item) => STATUT_LABELS[item.statut] ?? item.statut },
      ]}
      fields={[
        {
          name: 'cible',
          label: 'Type de rendez-vous',
          type: 'select',
          required: true,
          options: [
            { value: 'COACH', label: 'Coach' },
            { value: 'ENSEIGNANT', label: 'Enseignant' },
          ],
        },
        { name: 'coachId', label: 'Coach (si type = Coach)', type: 'select', options: coachOptions },
        { name: 'enseignantId', label: 'Enseignant (si type = Enseignant)', type: 'select', options: enseignantOptions },
        {
          name: 'dateSouhaitee',
          label: 'Date et heure souhaitées (format AAAA-MM-JJTHH:MM, ex : 2026-09-01T14:30)',
          type: 'text',
          required: true,
        },
        { name: 'message', label: 'Message du demandeur', type: 'textarea' },
        {
          name: 'statut',
          label: 'Statut',
          type: 'select',
          required: true,
          options: [
            { value: 'EN_ATTENTE', label: 'En attente' },
            { value: 'CONFIRME', label: 'Confirmé' },
            { value: 'ANNULE', label: 'Annulé' },
            { value: 'TERMINE', label: 'Terminé' },
          ],
        },
        { name: 'reponse', label: 'Réponse (visible par le demandeur)', type: 'textarea' },
      ]}
    />
  );
}
